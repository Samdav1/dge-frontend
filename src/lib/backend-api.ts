import { auth } from "@/auth";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://dge-tech-web-cjhe4jg72a-ew.a.run.app";
const API_KEY = process.env.BACKEND_API_KEY || "";

/**
 * Enhanced fetch for backend requests from Server Actions.
 * Handles:
 * 1. Automatic X-API-KEY and Authorization headers.
 * 2. Token cleaning (removing literal quotes).
 * 3. Automatic propagation of refresh_token cookies from backend.
 * 4. Capturing X-New-Access-Token for potential session updates.
 */
export async function backendFetch(endpoint: string, init?: RequestInit) {
    const session = await auth();
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    const headers = new Headers(init?.headers);

    // 1. Add API Key
    if (!headers.has("X-API-KEY")) {
        headers.set("X-API-KEY", API_KEY);
    }

    // Add Content-Type: application/json if body is present and NOT FormData
    if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    // 2. Add Authorization Header if session exists
    if (session?.backendToken && !headers.has("Authorization")) {
        let token = session.backendToken;
        // Clean token if it has literal quotes (fixes "Not enough segments" error)
        if (typeof token === "string" && token.startsWith('"') && token.endsWith('"')) {
            token = token.slice(1, -1);
        }
        headers.set("Authorization", `Bearer ${token}`);
    }

    // 3. Add existing refresh_token cookie to the request so backend can auto-refresh
    if (refreshToken) {
        headers.set("Cookie", `refresh_token=${refreshToken}`);
    }

    const url = endpoint.startsWith("http") ? endpoint : `${BACKEND_URL}${endpoint}`;

    const response = await fetch(url, {
        ...init,
        headers,
    });

    // 4. Handle token rotation from backend
    const setCookieHeader = response.headers.getSetCookie ? response.headers.getSetCookie() : [];
    for (const cookieStr of setCookieHeader) {
        if (cookieStr.includes("refresh_token")) {
            // Propagate new refresh token to browser
            const [nameValue] = cookieStr.split(";");
            const [name, value] = nameValue.split("=");
            if (name.trim() === "refresh_token") {
                cookieStore.set({
                    name: "refresh_token",
                    value: value,
                    httpOnly: true,
                    secure: true,
                    sameSite: "lax",
                    maxAge: 7 * 24 * 60 * 60,
                    path: "/",
                });
                console.log("Debug: Propagated new refresh_token from backend");
            }
        }
    }

    // Capture new access token if provided
    const newAccessToken = response.headers.get("X-New-Access-Token");
    if (newAccessToken) {
        console.log("Debug: Backend provided a new access token via X-New-Access-Token");
        // We can't easily update the session object here as it's read-only in Server Actions,
        // but the next request will use the new refresh_token to get a new session in auth.ts callback.
        // Optionally, we could set a temporary 'rotated_access_token' cookie.
        cookieStore.set({
            name: "rotated_access_token",
            value: newAccessToken,
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            maxAge: 60, // Short lived
            path: "/",
        });
    }

    return response;
}
