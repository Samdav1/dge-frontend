"use server"

import { redirect } from "next/navigation";
import { auth } from "@/auth"

// Helper function to get auth headers
async function getAuthHeaders() {
    const session = await auth();

    if (!session || !session.backendToken || (session as any).error === "RefreshAccessTokenError") {
        redirect("/login");
    }

    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    return {
        "Authorization": `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY || "",
    };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

// Create Negotiation
export async function createNegotiation(data: {
    service_id: string;
    receiver_id: string;
    proposed_price_cents: number;
    message?: string;
    payment_method?: string;
}) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/price_negotiation/`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to create negotiation" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Create negotiation error:", error);
        return { success: false, error: "Network error" };
    }
}

// Get My Negotiations
export async function getMyNegotiations() {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/price_negotiation/`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch negotiations" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get negotiations error:", error);
        return { success: false, error: "Network error" };
    }
}

// Update Negotiation (Accept/Reject/Counter)
export async function updateNegotiation(negotiationId: string, data: {
    proposed_price_cents?: number;
    message?: string;
    status?: "pending" | "accepted" | "rejected" | "countered";
    payment_method?: string;
}) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/price_negotiation/${negotiationId}`, {
            method: "PATCH",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to update negotiation" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Update negotiation error:", error);
        return { success: false, error: "Network error" };
    }
}

// Accept Negotiation
export async function acceptNegotiation(negotiationId: string, paymentMethod?: string) {
    return updateNegotiation(negotiationId, { status: "accepted", payment_method: paymentMethod });
}

// Reject Negotiation
export async function rejectNegotiation(negotiationId: string) {
    return updateNegotiation(negotiationId, { status: "rejected" });
}

// Counter Negotiation
export async function counterNegotiation(negotiationId: string, newPrice: number, message?: string) {
    return updateNegotiation(negotiationId, {
        status: "countered",
        proposed_price_cents: newPrice,
        message,
    });
}
