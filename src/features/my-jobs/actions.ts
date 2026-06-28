"use server"

import { auth } from "@/auth"

export interface CreateServiceInput {
    name: string;
    description: string;
    price: number;
    discount?: boolean;
    discount_percent?: number;
    service_type: string;
    meta_tags?: string;
    keywords?: string;
    category_ids?: string;
}

export async function createService(formData: FormData) {
    console.log("=== createService ACTION CALLED ===");

    const session = await auth();
    console.log("Debug: createService session:", session ? "Session exists" : "No session");

    if (!session) {
        return { success: false, error: "Unauthorized: No session found. Please log in again." };
    }

    if (!session.backendToken) {
        return { success: false, error: "Unauthorized: No backend token found in session. Please log out and log in again." };
    }

    // Sanitize token
    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;

    console.log("Debug: createService - API URL:", `${apiUrl}/services/services/`);

    // Log form data contents
    for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
            console.log(`Debug: FormData - ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
        } else {
            console.log(`Debug: FormData - ${key}: ${value}`);
        }
    }

    try {
        const response = await fetch(`${apiUrl}/services/services/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-API-KEY": apiKey || "",
            },
            body: formData,
        });

        const responseText = await response.text();
        console.log("Debug: createService - Response Status:", response.status);
        console.log("Debug: createService - Response Text:", responseText);

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch {
                errorData = { detail: responseText };
            }
            console.error("Service creation failed:", response.status, response.statusText, errorData);

            let errorMessage = `Service creation failed: ${response.status}`;
            if (errorData.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
                } else {
                    errorMessage = JSON.stringify(errorData.detail);
                }
            }

            return { success: false, error: errorMessage };
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch {
            data = responseText;
        }

        return { success: true, data };
    } catch (error) {
        console.error("Service creation error:", error);
        return { success: false, error: "Network error or backend unreachable" };
    }
}

export async function listServices(onlyMine: boolean = false) {
    console.log("=== listServices ACTION CALLED ===");

    const session = await auth();

    if (!session) {
        return { success: false, error: "Unauthorized: No session found." };
    }

    if (!session.backendToken) {
        return { success: false, error: "Unauthorized: No backend token found in session." };
    }

    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/services/services/?only_mine=${onlyMine}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-API-KEY": apiKey || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            let errorMessage = `Failed to fetch services: ${response.status}`;
            if (errorData.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
                } else {
                    errorMessage = JSON.stringify(errorData.detail);
                }
            }

            return { success: false, error: errorMessage };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("List services error:", error);
        return { success: false, error: "Network error or backend unreachable" };
    }
}

// Get single service
export async function getService(serviceId: string) {
    const session = await auth();

    if (!session || !session.backendToken) {
        return { success: false, error: "Unauthorized" };
    }

    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/services/services/${serviceId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-API-KEY": apiKey || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            let errorMessage = `Failed to fetch service: ${response.status}`;
            if (errorData.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
                } else {
                    errorMessage = JSON.stringify(errorData.detail);
                }
            }

            return { success: false, error: errorMessage };
        }

        const data = await response.json();

        // Dynamically fetch categories if missing/empty in service
        if (data.service && (!data.service.categories || data.service.categories.length === 0)) {
            try {
                const linksRes = await fetch(`${apiUrl}/service_category/categories/service/${serviceId}/links`, {
                    method: "GET",
                    headers: {
                        "X-API-KEY": apiKey || "",
                    },
                });
                if (linksRes.ok) {
                    const links = await linksRes.json();
                    if (links && links.length > 0) {
                        const catsRes = await fetch(`${apiUrl}/service_category/categories/`, {
                            method: "GET",
                            headers: {
                                "X-API-KEY": apiKey || "",
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
        return { success: false, error: "Network error or backend unreachable" };
    }
}

// Update service
export async function updateService(serviceId: string, formData: FormData) {
    const session = await auth();

    if (!session || !session.backendToken) {
        return { success: false, error: "Unauthorized" };
    }

    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/services/services/${serviceId}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-API-KEY": apiKey || "",
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            let errorMessage = `Failed to update service: ${response.status}`;
            if (errorData.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
                } else {
                    errorMessage = JSON.stringify(errorData.detail);
                }
            }

            return { success: false, error: errorMessage };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Update service error:", error);
        return { success: false, error: "Network error or backend unreachable" };
    }
}

// Delete service
export async function deleteService(serviceId: string) {
    const session = await auth();

    if (!session || !session.backendToken) {
        return { success: false, error: "Unauthorized" };
    }

    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/services/services/${serviceId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-API-KEY": apiKey || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            let errorMessage = `Failed to delete service: ${response.status}`;
            if (errorData.detail) {
                if (typeof errorData.detail === 'string') {
                    errorMessage = errorData.detail;
                } else if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map((err: any) => err.msg || JSON.stringify(err)).join(', ');
                } else {
                    errorMessage = JSON.stringify(errorData.detail);
                }
            }

            return { success: false, error: errorMessage };
        }

        return { success: true };
    } catch (error) {
        console.error("Delete service error:", error);
        return { success: false, error: "Network error or backend unreachable" };
    }
}

// List service categories
export async function listCategories() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/service_category/categories/`, {
            method: "GET",
            headers: {
                "X-API-KEY": apiKey || "",
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
// List work submissions
export async function listWorkSubmissions() {
    const session = await auth();

    if (!session || !session.backendToken) {
        return { success: false, error: "Unauthorized" };
    }

    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/work_submissions/work_submissions/`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-API-KEY": apiKey || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch submissions" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("List submissions error:", error);
        return { success: false, error: "Network error" };
    }
}
// Get single work submission
export async function getWorkSubmission(id: string) {
    const session = await auth();

    if (!session || !session.backendToken) {
        return { success: false, error: "Unauthorized" };
    }

    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;

    try {
        const response = await fetch(`${apiUrl}/work_submissions/work_submissions/${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "X-API-KEY": apiKey || "",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch submission" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get submission error:", error);
        return { success: false, error: "Network error" };
    }
}
