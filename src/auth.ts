import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { cookies } from "next/headers"

import Credentials from "next-auth/providers/credentials"

export const { handlers, signIn, signOut, auth } = NextAuth({
    trustHost: true,
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
                isAdmin: { label: "IsAdmin", type: "text" },
                isTeam: { label: "IsTeam", type: "text" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                try {
                    const isAdmin = credentials.isAdmin === "true";
                    const isTeam = credentials.isTeam === "true";
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL;
                    const apiKey = process.env.BACKEND_API_KEY;
                    console.log("Debug: Login Attempt - Backend URL:", backendUrl);
                    console.log("Debug: Login Attempt - API Key exists:", !!apiKey);
                    console.log("Debug: Login Attempt - IsAdmin:", isAdmin, "IsTeam:", isTeam);

                    let endpoint = "/auth/token";
                    if (isAdmin) endpoint = "/super_admin/super_admins/login";
                    else if (isTeam) endpoint = "/auth/team-login";

                    const res = await fetch(`${backendUrl}${endpoint}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            'accept': 'application/json',
                            'X-API-KEY': apiKey || ""
                        },
                        body: new URLSearchParams({
                            'username': credentials.username as string,
                            'password': credentials.password as string,
                        })
                    });

                    if (!res.ok) {
                        console.error("Login failed:", res.status, res.statusText);
                        return null;
                    }

                    // Handle Refresh Token Cookie
                    const setCookieHeader = res.headers.getSetCookie ? res.headers.getSetCookie() : (res.headers.get("set-cookie") ? [res.headers.get("set-cookie")!] : []);

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

                    let user;
                    const text = await res.text();
                    try {
                        user = JSON.parse(text);
                    } catch {
                        // If response is not JSON, assume it's the token string itself
                        console.log("Debug: Response is not JSON, assuming token string");
                        user = { backendToken: text, id: "user_" + Date.now() };
                    }

                    console.error("CRITICAL_DEBUG: Full Backend Response:", JSON.stringify(user, null, 2));

                    // Map various token fields to backendToken
                    if (typeof user === 'object' && user !== null && !user.backendToken) {
                        if (user.access_token) user.backendToken = user.access_token;
                        else if (user.token) user.backendToken = user.token;
                        else if (user.accessToken) user.backendToken = user.accessToken;
                        else if (user.data?.token) user.backendToken = user.data.token;
                        else if (user.data?.access_token) user.backendToken = user.data.access_token;
                    }

                    // Map nested user or admin object to backendUser
                    if (typeof user === 'object' && user !== null && (user.user || user.admin)) {
                        user.backendUser = user.user || user.admin;
                        // Use the ID from the nested user/admin object if available
                        if (user.backendUser.id) user.id = user.backendUser.id;
                    }

                    // Explicitly set role
                    if (isAdmin && user && typeof user === 'object') {
                        (user as any).role = "admin";
                    } else if (isTeam && user && typeof user === 'object') {
                        (user as any).role = "team_member";
                    } else if (user && typeof user === 'object') {
                        (user as any).role = "user";
                    }

                    // Ensure user has an id (fallback)
                    if (typeof user === 'object' && user !== null) {
                        if (!user.id && user.user_id) user.id = user.user_id;
                        if (!user.id) user.id = "user_" + Date.now(); // Fallback ID
                    }

                    return user;
                } catch (error) {
                    console.error("Login error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    // TODO: Update this URL to your actual backend endpoint
                    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dge-tech-web-cjhe4jg72a-ew.a.run.app';
                    const apiKey = process.env.BACKEND_API_KEY;

                    if (!apiKey) {
                        console.warn("Debug: BACKEND_API_KEY is missing in environment variables!");
                    }
                    if (!account.id_token) {
                        console.error("Debug: Google account is missing id_token!");
                        return false;
                    }

                    const cookieStore = await cookies();
                    const intent = cookieStore.get("auth_intent")?.value;
                    const endpoint = intent === "signup" ? "/auth/signup/google/callback" : "/auth/login/google/callback";

                    console.log("Debug: Auth Intent:", intent);
                    console.log("Debug: Backend URL:", backendUrl);
                    const targetUrl = `${backendUrl}${endpoint}`;
                    console.log("Debug: Fetching:", targetUrl);

                    let response;
                    try {
                        response = await fetch(targetUrl, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-API-KEY": apiKey || "",
                            },
                            body: JSON.stringify({
                                id_token: account.id_token,
                            }),
                        });
                    } catch (fetchError) {
                        console.error("Debug: Fetch failed:", fetchError);
                        return false;
                    }

                    if (!response.ok) {
                        console.error("Backend authentication failed:", response.status, response.statusText);
                        const errorText = await response.text();
                        console.error("Backend error response:", errorText);
                        return false;
                    }

                    const data = await response.json();
                    console.log("=== GOOGLE AUTH CALLBACK ===");
                    console.log("Debug: Google Auth - Backend response keys:", Object.keys(data));
                    console.log("Debug: Google Auth - Full response:", JSON.stringify(data, null, 2));

                    // Map various token fields to backendToken (same logic as credentials)
                    let backendToken = data.token || data.access_token || data.accessToken || data.data?.token || data.data?.access_token;

                    console.log("Debug: Google Auth - backendToken:", backendToken ? "exists (" + String(backendToken).substring(0, 20) + "...)" : "MISSING");

                    // Attach backend data to the user object so it's available in the JWT callback
                    user.backendToken = backendToken;
                    user.backendUser = data.user || data.data?.user;

                    return true;
                } catch (error) {
                    console.error("Error connecting to backend auth:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user }) {
            // Initial sign in
            if (user) {
                token.backendToken = user.backendToken;
                token.backendUser = user.backendUser;
                token.role = (user as any).role;
                token.id = user.id;
            }

            // Check for rotated token from backend-api utility
            const cookieStore = await cookies();
            const rotatedToken = cookieStore.get("rotated_access_token")?.value;
            if (rotatedToken) {
                console.log("Debug: JWT Callback - Picking up rotated access token from cookie");
                token.backendToken = rotatedToken;
                // Clear the temporary cookie
                cookieStore.set({
                    name: "rotated_access_token",
                    value: "",
                    expires: new Date(0),
                    path: "/",
                });
            }

            // Check if token is expired or about to expire
            if (token.backendToken) {
                try {
                    let tokenStr = token.backendToken as string;
                    if (tokenStr.startsWith('"') && tokenStr.endsWith('"')) {
                        tokenStr = tokenStr.slice(1, -1);
                    }
                    const parts = tokenStr.split('.');
                    if (parts.length === 3) {
                        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
                        const isExpired = Date.now() >= (payload.exp * 1000) - 10000; // 10 seconds buffer

                        if (isExpired) {
                            console.log("Debug: JWT Callback - Token expired or about to expire, refreshing...");
                            const cookieStore = await cookies();
                            const refreshToken = cookieStore.get("refresh_token")?.value;
                            if (refreshToken) {
                                const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://dge-tech-web-cjhe4jg72a-ew.a.run.app';
                                const apiKey = process.env.BACKEND_API_KEY;
                                const refreshRes = await fetch(`${backendUrl}/auth/refresh?refresh_token=${refreshToken}`, {
                                    method: 'POST',
                                    headers: {
                                        'X-API-KEY': apiKey || '',
                                        'accept': 'application/json'
                                    }
                                });

                                if (refreshRes.ok) {
                                    const refreshData = await refreshRes.json();
                                    console.log("Debug: JWT Callback - Token refresh successful");
                                    token.backendToken = refreshData.access_token;

                                    if (refreshData.refresh_token) {
                                        cookieStore.set({
                                            name: 'refresh_token',
                                            value: refreshData.refresh_token,
                                            httpOnly: true,
                                            secure: true,
                                            sameSite: 'lax',
                                            maxAge: 7 * 24 * 60 * 60,
                                            path: '/',
                                        });
                                    }
                                } else {
                                    console.error("Debug: JWT Callback - Token refresh failed:", refreshRes.status);
                                    token.backendToken = undefined;
                                    token.error = "RefreshAccessTokenError";
                                    cookieStore.set({
                                        name: 'refresh_token',
                                        value: '',
                                        expires: new Date(0),
                                        path: '/',
                                    });
                                }
                            } else {
                                console.warn("Debug: JWT Callback - No refresh token in cookies.");
                                token.backendToken = undefined;
                            }
                        }
                    }
                } catch (e) {
                    console.error("Error checking or refreshing token in JWT callback:", e);
                }
            }

            console.log("Debug: JWT Callback - token.backendToken after:", token.backendToken ? "exists" : "MISSING");
            return token;
        },
        async session({ session, token }) {
            // Send properties to the client
            console.log("=== SESSION CALLBACK ===");
            console.log("Debug: Session Callback - token.backendToken:", token.backendToken ? "exists (" + String(token.backendToken).substring(0, 20) + "...)" : "MISSING");
            session.backendToken = token.backendToken as string | undefined;
            // Merge backend user data if available, or just attach it
            if (token.backendUser) {
                session.user = { ...session.user, ...token.backendUser };
            }
            if (token.role) {
                (session.user as any).role = token.role;
            }
            if (token.error) {
                (session as any).error = token.error;
            }
            console.log("Debug: Session Callback - session.backendToken after:", !!session.backendToken);
            return session;
        }
    }
})
