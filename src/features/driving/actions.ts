"use server"

import { redirect } from "next/navigation";
import { auth } from "@/auth"
import { DriverNearbyResponse } from "./types";

// Helper function to get auth headers
async function getAuthHeaders() {
    const session = await auth();
    console.log("ServerAction: getAuthHeaders - Session exists:", !!session);
    console.log("ServerAction: getAuthHeaders - Backend Token exists:", !!session?.backendToken);

    if (!session || !session.backendToken || (session as any).error === "RefreshAccessTokenError") {
        console.error("ServerAction: getAuthHeaders - No session or token found");
        redirect("/login");
    }

    let token = session.backendToken;
    if (typeof token === 'string' && token.startsWith('"') && token.endsWith('"')) {
        token = token.slice(1, -1);
    }

    // Log token length (safe) to verify it's not empty
    console.log("ServerAction: getAuthHeaders - Token length:", token.length);
    console.log("ServerAction: getAuthHeaders - API Key exists:", !!process.env.BACKEND_API_KEY);

    return {
        "Authorization": `Bearer ${token}`,
        "X-API-KEY": process.env.BACKEND_API_KEY || "",
        "Content-Type": "application/json",
    };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

async function apiCall(endpoint: string, method: string = 'GET', body?: any) {
    const headers = await getAuthHeaders();
    if (!headers) return { success: false, error: "Unauthorized" };

    const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}${endpoint}`;
    try {
        const response = await fetch(targetUrl, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Request failed" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error(`API Call error for ${endpoint}:`, error);
        return { success: false, error: "Network error" };
    }
}


export async function getDriversNearby(lat: number, lon: number, radius: number = 5.0): Promise<DriverNearbyResponse[]> {
    console.log(`ServerAction: getDriversNearby called with lat=${lat}, lon=${lon}, radius=${radius}`);

    const headers = await getAuthHeaders();
    if (!headers) {
        console.error("ServerAction: Unauthorized - No session or token");
        throw new Error("Unauthorized");
    }

    // Replace 0.0.0.0 with 127.0.0.1 for server-side fetching if needed
    const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/nearby?latitude=${lat}&longitude=${lon}&radius=${radius}`;
    console.log(`ServerAction: Fetching ${targetUrl}`);

    try {
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            console.error(`ServerAction: API Error ${response.status}: ${response.statusText}`);
            if (response.status === 401) {
                throw new Error("Unauthorized");
            }
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("ServerAction: Success", data);
        return data;
    } catch (error) {
        console.error("ServerAction: Request Failed:", error);
        throw error;
    }
}

export async function searchLocation(query: string) {
    console.log(`ServerAction: searchLocation called with query=${query}`);

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`,
            {
                headers: {
                    'User-Agent': 'DGE_Frontend/1.0', // Nominatim requires a User-Agent
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Nominatim API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("ServerAction: Search Failed:", error);
        return [];
    }
}

export async function reverseGeocode(lat: number, lon: number) {
    console.log(`ServerAction: reverseGeocode called with lat=${lat}, lon=${lon}`);

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            {
                headers: {
                    'User-Agent': 'DGE_Frontend/1.0',
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Nominatim API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.display_name;
    } catch (error) {
        console.error("ServerAction: Reverse Geocode Failed:", error);
        return null;
    }
}

export async function getActiveTrip() {
    return await apiCall('/drivers/trips/active', 'GET');
}

export async function cancelTrip(tripId: string, reason?: string) {
    return await apiCall(`/drivers/trips/${tripId}/cancel`, 'POST', { trip_id: tripId, reason });
}

export async function completeTrip(tripId: string, finalFare?: number) {
    return await apiCall(`/drivers/trips/${tripId}/complete`, 'POST', { trip_id: tripId, final_fare: finalFare });
}

export async function getDriverProfile() {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/me`;
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers,
        });

        if (response.status === 404) {
            return { success: true, data: null };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch driver profile" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get driver profile error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function createDriverProfile(data: { car_name: string; car_model: string; plate_number: string; vehicle_type?: string }) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/`;
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to create driver profile" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Create driver profile error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function updateDriverProfile(data: { car_name?: string; car_model?: string; plate_number?: string; vehicle_type?: string }) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/`;
        const response = await fetch(targetUrl, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to update driver profile" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Update driver profile error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function uploadDriverCarPicture(formData: FormData) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }
    const multipartHeaders = { ...headers };
    delete (multipartHeaders as any)["Content-Type"];

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/car-picture`;
        const response = await fetch(targetUrl, {
            method: 'PATCH',
            headers: multipartHeaders,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to upload vehicle picture" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Upload vehicle picture error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function uploadDriverLicensePicture(formData: FormData) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }
    const multipartHeaders = { ...headers };
    delete (multipartHeaders as any)["Content-Type"];

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/license-picture`;
        const response = await fetch(targetUrl, {
            method: 'PATCH',
            headers: multipartHeaders,
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to upload license picture" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Upload license picture error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function getMyTripsAsRider() {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/trips/my/rider`;
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch rider trips" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get rider trips error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function getMyTripsAsDriver() {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/trips/my/driver`;
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers,
        });

        if (response.status === 404) {
            return { success: true, data: [] };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to fetch driver trips" };
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error("Get driver trips error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function broadcastRideIntent(data: {
    pickup_lat: number;
    pickup_lng: number;
    dropoff_lat: number;
    dropoff_lng: number;
    pickup_address?: string;
    dropoff_address?: string;
    vehicle_type?: string;
}) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/trips/broadcast_intent`;
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to broadcast ride intent" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Broadcast ride intent error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function pingDriverLocation(data: { latitude: number; longitude: number; is_available: boolean }) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/ping`;
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            return { success: false, error: "Failed to ping location" };
        }

        return { success: true };
    } catch (error) {
        console.error("Ping location error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function requestRide(data: {
    pickup_lat: number;
    pickup_lng: number;
    dropoff_lat: number;
    dropoff_lng: number;
    pickup_address?: string;
    dropoff_address?: string;
    driver_id?: string;
    negotiated_fare?: number;
    vehicle_type?: string;
}) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/trips/request`;
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to request ride" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Request ride error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function acceptRide(tripId: string) {
    const headers = await getAuthHeaders();
    if (!headers) {
        return { success: false, error: "Unauthorized" };
    }

    try {
        const targetUrl = `${apiUrl.replace('0.0.0.0', '127.0.0.1')}/drivers/trips/${tripId}/accept`;
        const response = await fetch(targetUrl, {
            method: 'POST',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { success: false, error: errorData.detail || "Failed to accept ride" };
        }

        const result = await response.json();
        return { success: true, data: result };
    } catch (error) {
        console.error("Accept ride error:", error);
        return { success: false, error: "Network error" };
    }
}

export async function arriveAtPickup(tripId: string) {
    return await apiCall(`/drivers/trips/${tripId}/arrive`, 'POST');
}

export async function startTrip(tripId: string) {
    return await apiCall(`/drivers/trips/${tripId}/start`, 'POST');
}

export async function confirmStartTrip(tripId: string) {
    return await apiCall(`/drivers/trips/${tripId}/confirm_start`, 'POST');
}

export async function submitTripReview(tripId: string, rating: number, comment: string) {
    return await apiCall(`/drivers/trips/${tripId}/review`, 'POST', { rating, comment });
}

export async function getDriverPublicProfile(driverId: string) {
    return await apiCall(`/drivers/${driverId}/public-profile`, 'GET');
}

export async function counterRide(tripId: string, counterFare: number) {
    return await apiCall(`/drivers/trips/${tripId}/counter`, 'POST', { counter_fare: counterFare });
}

export async function acceptCounterOffer(tripId: string) {
    return await apiCall(`/drivers/trips/${tripId}/accept_counter`, 'POST');
}
