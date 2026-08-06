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

export async function getProfile() {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/profile/get_profile`, {
            method: "GET",
            headers,
        });

        if (response.status === 404) {
            return { success: true, data: null };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch profile" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get profile error:", error);
        return { success: false, error: "Network error" };
    }
}

// Create Profile
export async function createProfile(formData: FormData) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/profile/create_profile`, {
            method: "POST",
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to create profile" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Create profile error:", error);
        return { success: false, error: "Network error" };
    }
}

// Update Profile
export async function updateProfile(formData: FormData) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/profile/update_profile`, {
            method: "PATCH",
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to update profile" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Update profile error:", error);
        return { success: false, error: "Network error" };
    }
}

// Create Portfolio
export async function createPortfolio(data: {
    title: string;
    description?: string;
    category?: string;
    visibility?: "public" | "private";
}) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/portfolio/create_user_portfolio`, {
            method: "POST",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to create portfolio" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Create portfolio error:", error);
        return { success: false, error: "Network error" };
    }
}

// Update Portfolio
export async function updatePortfolio(data: {
    title?: string;
    description?: string;
    category?: string;
    visibility?: "public" | "private";
}) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/portfolio/update_user_portfolio`, {
            method: "PATCH",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to update portfolio" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Update portfolio error:", error);
        return { success: false, error: "Network error" };
    }
}

// Upload Portfolio Media
export async function uploadPortfolioMedia(portfolioId: string, formData: FormData) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/portfolio/create_portfolio_media?portfolio_id=${portfolioId}`, {
            method: "POST",
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to upload media" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Upload media error:", error);
        return { success: false, error: "Network error" };
    }
}

// Get User KYC
export async function getUserKyc() {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/kyc/get_user_kyc`, {
            method: "GET",
            headers,
        });

        if (response.status === 404) {
            return { success: true, data: null };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch KYC" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get KYC error:", error);
        return { success: false, error: "Network error" };
    }
}

// Submit User KYC
export async function submitUserKyc(formData: FormData) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/kyc/create_user_kyc`, {
            method: "POST",
            headers,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to submit KYC" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Submit KYC error:", error);
        return { success: false, error: "Network error" };
    }
}

// Get Active KYC Config
export async function getKycConfig() {
    try {
        const response = await fetch(`${apiUrl}/kyc/config`, {
            method: "GET",
            cache: "no-store",
        });

        if (!response.ok) {
            return { success: false, active_provider: "sumsub" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get KYC Config error:", error);
        return { success: false, active_provider: "sumsub" };
    }
}

// Get Sumsub Access Token for current user
export async function getSumsubToken() {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/kyc/sumsub-token`, {
            method: "POST",
            headers,
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to generate Sumsub token" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get Sumsub token error:", error);
        return { success: false, error: "Network error" };
    }
}

// Admin: Get KYC Settings
export async function getAdminKycSettings() {
    try {
        const response = await fetch(`${apiUrl}/superadmin/kyc-settings`, {
            method: "GET",
            cache: "no-store",
        });

        if (!response.ok) {
            return { success: false, active_provider: "sumsub" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get Admin KYC Settings error:", error);
        return { success: false, active_provider: "sumsub" };
    }
}

// Admin: Update KYC Settings
export async function updateAdminKycSettings(activeProvider: string) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/superadmin/kyc-settings`, {
            method: "PUT",
            headers: {
                ...headers,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ active_provider: activeProvider }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to update KYC provider" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Update Admin KYC Settings error:", error);
        return { success: false, error: "Network error" };
    }
}

