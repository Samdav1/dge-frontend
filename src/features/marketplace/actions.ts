"use server"

import { auth } from "@/auth"

import { redirect } from "next/navigation";

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

export interface ServiceFilters {
    status?: string;
    type?: string;
    onlyMine?: boolean;
    search?: string;
    categoryId?: string;
    country?: string;
    state?: string;
    city?: string;
    nearMe?: boolean;
    offset?: number;
    limit?: number;
    sortBy?: string;
}

// List Services
export async function listServices(filters: ServiceFilters = {}) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.type && filters.type !== "all") params.append("type", filters.type);
    if (filters.onlyMine !== undefined) params.append("only_mine", String(filters.onlyMine));
    if (filters.search) params.append("search", filters.search);
    if (filters.categoryId && filters.categoryId !== "all") params.append("category_id", filters.categoryId);
    if (filters.country) params.append("country", filters.country);
    if (filters.state) params.append("state", filters.state);
    if (filters.city) params.append("city", filters.city);
    if (filters.nearMe) params.append("near_me", "true");
    if (filters.offset !== undefined) params.append("offset", String(filters.offset));
    if (filters.limit !== undefined) params.append("limit", String(filters.limit));
    if (filters.sortBy) params.append("sort_by", filters.sortBy);

    try {
        const response = await fetch(`${apiUrl}/services/services/?${params.toString()}`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch services" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("List services error:", error);
        return { success: false, error: "Network error" };
    }
}

// Get Single Service
export async function getService(serviceId: string) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const response = await fetch(`${apiUrl}/services/services/${serviceId}`, {
            method: "GET",
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch service" };
        }

        const data = await response.json();

        // Dynamically fetch categories if missing/empty in service
        if (data.service && (!data.service.categories || data.service.categories.length === 0)) {
            try {
                const linksRes = await fetch(`${apiUrl}/service_category/categories/service/${serviceId}/links`, {
                    method: "GET",
                    headers: {
                        "X-API-KEY": process.env.BACKEND_API_KEY || "",
                    },
                });
                if (linksRes.ok) {
                    const links = await linksRes.json();
                    if (links && links.length > 0) {
                        const catsRes = await fetch(`${apiUrl}/service_category/categories/`, {
                            method: "GET",
                            headers: {
                                "X-API-KEY": process.env.BACKEND_API_KEY || "",
                            },
                        });
                        if (catsRes.ok) {
                            const categories = await catsRes.json();
                            const matchedCategories = links.map((link: any) => {
                                const matchedCat = categories.find((c: any) => c.id === link.category_id);
                                return matchedCat ? { id: matchedCat.id, name: matchedCat.name } : null;
                            }).filter(Boolean);
                            data.service.categories = matchedCategories;
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to dynamically fetch categories on frontend:", err);
            }
        }

        return { success: true, data };
    } catch (error) {
        console.error("Get service error:", error);
        return { success: false, error: "Network error" };
    }
}

// Get Single Service (Public)
export async function getPublicService(serviceId: string) {
    try {
        const response = await fetch(`${apiUrl}/services/services/${serviceId}`, {
            method: "GET",
            headers: {
                "X-API-KEY": process.env.BACKEND_API_KEY || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch service" };
        }

        const data = await response.json();

        // Dynamically fetch categories if missing/empty in service
        if (data.service && (!data.service.categories || data.service.categories.length === 0)) {
            try {
                const linksRes = await fetch(`${apiUrl}/service_category/categories/service/${serviceId}/links`, {
                    method: "GET",
                    headers: {
                        "X-API-KEY": process.env.BACKEND_API_KEY || "",
                    },
                });
                if (linksRes.ok) {
                    const links = await linksRes.json();
                    if (links && links.length > 0) {
                        const catsRes = await fetch(`${apiUrl}/service_category/categories/`, {
                            method: "GET",
                            headers: {
                                "X-API-KEY": process.env.BACKEND_API_KEY || "",
                            },
                        });
                        if (catsRes.ok) {
                            const categories = await catsRes.json();
                            const matchedCategories = links.map((link: any) => {
                                const matchedCat = categories.find((c: any) => c.id === link.category_id);
                                return matchedCat ? { id: matchedCat.id, name: matchedCat.name } : null;
                            }).filter(Boolean);
                            data.service.categories = matchedCategories;
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to dynamically fetch categories on frontend:", err);
            }
        }

        return { success: true, data };
    } catch (error) {
        console.error("Get public service error:", error);
        return { success: false, error: "Network error" };
    }
}

// List Services (Public)
export async function listPublicServices(filters: ServiceFilters = {}) {
    const params = new URLSearchParams();
    if (filters.status) params.append("status", filters.status);
    if (filters.type && filters.type !== "all") params.append("type", filters.type);
    if (filters.search) params.append("search", filters.search);
    if (filters.categoryId && filters.categoryId !== "all") params.append("category_id", filters.categoryId);
    if (filters.country) params.append("country", filters.country);
    if (filters.state) params.append("state", filters.state);
    if (filters.city) params.append("city", filters.city);
    if (filters.nearMe) params.append("near_me", "true");
    if (filters.offset !== undefined) params.append("offset", String(filters.offset));
    if (filters.limit !== undefined) params.append("limit", String(filters.limit));
    if (filters.sortBy) params.append("sort_by", filters.sortBy);

    try {
        const response = await fetch(`${apiUrl}/services/services/?${params.toString()}`, {
            method: "GET",
            headers: {
                "X-API-KEY": process.env.BACKEND_API_KEY || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch services" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("List public services error:", error);
        return { success: false, error: "Network error" };
    }
}

// List Categories
export async function listCategories() {
    try {
        const response = await fetch(`${apiUrl}/service_category/categories/`, {
            method: "GET",
            headers: {
                "X-API-KEY": process.env.BACKEND_API_KEY || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch categories" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("List categories error:", error);
        return { success: false, error: "Network error" };
    }
}
