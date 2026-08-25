"use server"

import { signIn, auth } from "@/auth"
import { RegisterInput } from "@/lib/validation"
import { cookies } from "next/headers"

export async function googleSignIn() {
    await signIn("google")
}

export async function registerUser(data: RegisterInput) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dge-tech-web-cjhe4jg72a-ew.a.run.app";
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/auth/user-signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey || "",
            },
            body: JSON.stringify({
                username: data.username,
                email: data.email,
                password: data.password,
                referral_code: data.referralCode || "",
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Registration failed:", response.status, response.statusText, errorData);
            return { success: false, error: errorData.detail || "Registration failed" };
        }

        // Handle Refresh Token Cookie
        const setCookieHeader = response.headers.getSetCookie ? response.headers.getSetCookie() : (response.headers.get("set-cookie") ? [response.headers.get("set-cookie")!] : []);

        const cookieStore = await cookies();

        for (const cookieStr of setCookieHeader) {
            if (cookieStr.includes("refresh_token")) {
                const [nameValue] = cookieStr.split(';');
                const [name, value] = nameValue.split('=');
                if (name.trim() === 'refresh_token') {
                    cookieStore.set({
                        name: 'refresh_token',
                        value: value,
                        httpOnly: true,
                        secure: true,
                        sameSite: 'lax',
                        maxAge: 7 * 24 * 60 * 60,
                        path: '/',
                    });
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Registration error:", error);
        return { success: false, error: "Network error or backend unreachable" };
    }
}

export async function sendPasswordResetLink(email: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dge-tech-web-cjhe4jg72a-ew.a.run.app";
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/auth/change_password_email?email=${encodeURIComponent(email)}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Password reset request failed:", response.status, response.statusText, errorData);
            return { success: false, error: errorData.detail || "Failed to send reset link" };
        }

        return { success: true };
    } catch (error) {
        console.error("Password reset error:", error);
        return { success: false, error: "Network error or backend unreachable" };
    }
}

export async function createUserKyc(formData: FormData) {
    console.log("=== createUserKyc ACTION CALLED ===");
    console.log("Debug: FormData received:", formData ? "Yes" : "No");

    const session = await auth();
    console.log("Debug: createUserKyc session:", session ? "Session exists" : "No session");
    console.log("Debug: createUserKyc backendToken:", session?.backendToken ? "Token exists (" + session.backendToken.substring(0, 20) + "...)" : "NO TOKEN");

    if (!session) {
        console.log("Debug: RETURNING EARLY - No session");
        return { success: false, error: "Unauthorized: No session found. Please log in again." };
    }

    if (!session.backendToken) {
        console.log("Debug: RETURNING EARLY - No backend token");
        return { success: false, error: "Unauthorized: No backend token found in session. Please log out and log in again." };
    }

    // Sanitize token: remove leading/trailing quotes if present
    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dge-tech-web-cjhe4jg72a-ew.a.run.app";
    const apiKey = process.env.BACKEND_API_KEY;

    console.log("Debug: createUserKyc - API URL:", apiUrl);
    console.log("Debug: createUserKyc - Full URL:", `${apiUrl}/kyc/create_user_kyc`);
    console.log("Debug: createUserKyc - Token (first 20 chars):", token.substring(0, 20));
    console.log("Debug: createUserKyc - Token length:", token.length);
    console.log("Debug: createUserKyc - API Key exists:", !!apiKey);
    console.log("Debug: createUserKyc - API Key (first 10 chars):", apiKey?.substring(0, 10));

    // Log form data contents
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`Debug: FormData - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
            console.log(`Debug: FormData - ${key}: ${value}`);
        }
    }

    try {
        const response = await fetch(`${apiUrl}/kyc/create_user_kyc`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-API-KEY": apiKey || "",
            },
            body: formData,
        });

        const responseText = await response.text();
        console.log("Debug: createUserKyc - Response Status:", response.status);
        console.log("Debug: createUserKyc - Response Text:", responseText);

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch {
                errorData = { detail: responseText };
            }
            console.error("KYC creation failed:", response.status, response.statusText, errorData);
            return { success: false, error: errorData.detail || `KYC submission failed: ${response.status}` };
        }

        return { success: true };
    } catch (error) {
        console.error("KYC error:", error);
        return { success: false, error: "Network error or backend unreachable" };
    }
}

export async function changePassword(data: { password: string; token: string }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dge-tech-web-cjhe4jg72a-ew.a.run.app";
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/auth/change_password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey || "",
            },
            body: JSON.stringify({
                password: data.password,
                token: data.token,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Password reset failed:", response.status, response.statusText, errorData);
            return { success: false, error: errorData.detail || "Failed to reset password. The link may have expired or is invalid." };
        }

        return { success: true };
    } catch (error) {
        console.error("Password reset error:", error);
        return { success: false, error: "Network error or backend unreachable" };
    }
}

export async function getCurrentUserInfo() {
    const session = await auth();
    if (!session || !session.backendToken) {
        return { success: false, error: "Unauthorized" };
    }
    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dge-tech-web-cjhe4jg72a-ew.a.run.app";
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/users/me`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-API-KEY": apiKey || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch user info" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get user info error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function resendEmailVerification() {
    const session = await auth();
    if (!session || !session.backendToken) {
        return { success: false, error: "Unauthorized" };
    }
    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dge-tech-web-cjhe4jg72a-ew.a.run.app";
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/users/send_email_token`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-API-KEY": apiKey || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to send verification email" };
        }

        const data = await response.json();
        return { success: true, message: data.message || "Verification email sent!" };
    } catch (error) {
        console.error("Resend verification error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function verifyEmailToken(token: string) {
    if (!token) {
        return { success: false, error: "Invalid or missing token" };
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://dge-tech-web-cjhe4jg72a-ew.a.run.app";
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/users/verify_email_token?token=${encodeURIComponent(token)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Email verification failed" };
        }

        const data = await response.json();
        return { success: true, message: data.message || "Email verified successfully" };
    } catch (error) {
        console.error("Verify email token error:", error);
        return { success: false, error: "Network error or backend unreachable" };
    }
}

