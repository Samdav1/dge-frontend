"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function getAuthHeaders() {
    const session = await auth();

    if (!session || !session.backendToken || (session as any).error === "RefreshAccessTokenError") {
        redirect("/login");
    }

    let token = session.backendToken;
    if (typeof token === "string" && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY || "",
    };
}

export interface PointsSummary {
    balance: number;
    total_earned: number;
    total_spent: number;
    rate_per_point: number;
    signup_bonus_points: number;
    min_purchase_points: number;
    equivalent_naira: number;
    wallet_balance_naira: number;
    updated_at: string | null;
    transactions: PointsTransactionItem[];
}

export interface PointsTransactionItem {
    id: string;
    points: number;
    naira_amount: number;
    rate_at_time: number;
    type: "signup_bonus" | "purchase_wallet" | "purchase_gateway" | "spend" | "admin_adjustment";
    status: "successful" | "pending" | "failed";
    reference: string;
    description: string;
    payment_link?: string;
    created_at: string | null;
}

export async function getPointsData(): Promise<{ success: boolean; data?: PointsSummary; error?: string }> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${apiUrl}/points/me`, {
            method: "GET",
            headers,
            cache: "no-store",
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return { success: false, error: err.detail || "Failed to load points data" };
        }

        const data: PointsSummary = await res.json();
        return { success: true, data };
    } catch (e: any) {
        console.error("getPointsData error:", e);
        return { success: false, error: e.message || "Network error fetching points" };
    }
}

export async function buyPointsWithWallet(points: number): Promise<{ success: boolean; message?: string; error?: string; data?: any }> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${apiUrl}/points/buy/wallet`, {
            method: "POST",
            headers,
            body: JSON.stringify({ points }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return { success: false, error: data.detail || "Failed to purchase points with wallet" };
        }

        return { success: true, message: data.message, data };
    } catch (e: any) {
        console.error("buyPointsWithWallet error:", e);
        return { success: false, error: e.message || "Error processing wallet purchase" };
    }
}

export async function initiatePointsGatewayPurchase(points: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${apiUrl}/points/buy/initiate`, {
            method: "POST",
            headers,
            body: JSON.stringify({ points }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return { success: false, error: data.detail || "Failed to initiate payment gateway purchase" };
        }

        return { success: true, data };
    } catch (e: any) {
        console.error("initiatePointsGatewayPurchase error:", e);
        return { success: false, error: e.message || "Error initiating gateway purchase" };
    }
}

export async function verifyPointsGatewayPurchase(reference: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${apiUrl}/points/buy/verify/${reference}`, {
            method: "POST",
            headers,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return { success: false, error: data.detail || "Verification failed" };
        }

        return { success: data.success ?? false, data };
    } catch (e: any) {
        console.error("verifyPointsGatewayPurchase error:", e);
        return { success: false, error: e.message || "Error verifying gateway payment" };
    }
}
