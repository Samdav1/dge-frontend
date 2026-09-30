"use server";

import { revalidatePath } from "next/cache";
import { backendFetch } from "@/lib/backend-api";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PostedJob {
    id: string;
    user_id: string;
    title: string;
    description: string;
    category_id: string;
    min_price_cents: number;
    max_price_cents: number;
    image?: string | null;
    status: "open" | "assigned" | "completed" | "cancelled";
    payment_method: string;
    created_at: string;
    bid_count?: number;
    user?: { id: string; username: string };
    category?: { id: string; name: string; icon?: string | null };
}

export interface PostedJobBid {
    id: string;
    service_id: string;
    initiator_id: string;
    receiver_id: string;
    negotiation_type: string;
    proposed_price_cents: number;
    message?: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    posted_job_id?: string | null;
    services?: any;
    initiator?: any;
    receiver?: any;
}

// No longer need getHeaders helper, backendFetch handles it

export async function listOpenPostedJobs(params?: {
    category_id?: string;
    search?: string;
    country?: string;
    state?: string;
    city?: string;
    near_me?: boolean;
}): Promise<{ success: boolean; data?: PostedJob[]; error?: string }> {
    try {
        const query = new URLSearchParams();
        if (params?.category_id) query.set("category_id", params.category_id);
        if (params?.search) query.set("search", params.search);
        if (params?.country) query.set("country", params.country);
        if (params?.state) query.set("state", params.state);
        if (params?.city) query.set("city", params.city);
        if (params?.near_me) query.set("near_me", "true");

        const res = await backendFetch(
            `/posted_jobs/?${query.toString()}`,
            {
                cache: "no-store",
            }
        );

        if (!res.ok) return { success: false, error: await res.text() };
        return { success: true, data: await res.json() };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getPostedJob(
    id: string
): Promise<{ success: boolean; data?: PostedJob; error?: string }> {
    try {
        const res = await backendFetch(`/posted_jobs/${id}`, {
            cache: "no-store",
        });
        if (!res.ok) return { success: false, error: await res.text() };
        return { success: true, data: await res.json() };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getMyPostedJobs(): Promise<{
    success: boolean;
    data?: PostedJob[];
    error?: string;
}> {
    try {
        const res = await backendFetch(`/posted_jobs/me`, {
            cache: "no-store",
        });
        if (!res.ok) return { success: false, error: await res.text() };
        return { success: true, data: await res.json() };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function createPostedJob(payload: {
    title: string;
    description: string;
    category_id: string;
    min_price_cents: number;
    max_price_cents: number;
    image?: string;
    payment_method?: string;
}): Promise<{ success: boolean; data?: PostedJob; error?: string }> {
    try {
        const res = await backendFetch(`/posted_jobs/`, {
            method: "POST",
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            let errorMessage = "Operation failed.";
            if (typeof err.detail === "string") errorMessage = err.detail;
            else if (Array.isArray(err.detail)) errorMessage = err.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(", ");
            else if (err.message) errorMessage = err.message;
            return { success: false, error: errorMessage };
        }
        revalidatePath("/dashboard/my-jobs");
        revalidatePath("/dashboard/marketplace");
        return { success: true, data: await res.json() };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function cancelPostedJob(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const res = await backendFetch(`/posted_jobs/${id}`, {
            method: "DELETE",
        });
        if (!res.ok) return { success: false, error: await res.text() };
        revalidatePath("/dashboard/my-jobs");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getJobBids(
    jobId: string
): Promise<{ success: boolean; data?: PostedJobBid[]; error?: string }> {
    try {
        const res = await backendFetch(`/posted_jobs/${jobId}/bids`, {
            cache: "no-store",
        });
        if (!res.ok) return { success: false, error: await res.text() };
        return { success: true, data: await res.json() };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function bidOnPostedJob(
    jobId: string,
    payload: { service_id: string; proposed_price_cents: number; message?: string }
): Promise<{ success: boolean; data?: PostedJobBid; error?: string }> {
    try {
        const res = await backendFetch(
            `/price_negotiation/posted_job/${jobId}/bid`,
            {
                method: "POST",
                body: JSON.stringify(payload),
            }
        );
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            let errorMessage = "Operation failed.";
            if (typeof err.detail === "string") errorMessage = err.detail;
            else if (Array.isArray(err.detail)) errorMessage = err.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(", ");
            else if (err.message) errorMessage = err.message;
            return { success: false, error: errorMessage };
        }
        return { success: true, data: await res.json() };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function acceptBid(
    bidId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const res = await backendFetch(`/price_negotiation/${bidId}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "accepted" }),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            let errorMessage = "Operation failed.";
            if (typeof err.detail === "string") errorMessage = err.detail;
            else if (Array.isArray(err.detail)) errorMessage = err.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(", ");
            else if (err.message) errorMessage = err.message;
            return { success: false, error: errorMessage };
        }
        revalidatePath("/dashboard/my-jobs");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function rejectBid(
    bidId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const res = await backendFetch(`/price_negotiation/${bidId}`, {
            method: "PATCH",
            body: JSON.stringify({ status: "rejected" }),
        });
        if (!res.ok) return { success: false, error: await res.text() };
        revalidatePath("/dashboard/my-jobs");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function uploadJobImage(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
        const res = await backendFetch(`/media/upload/job-image`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: res.statusText }));
            let errorMessage = "Operation failed.";
            if (typeof err.detail === "string") errorMessage = err.detail;
            else if (Array.isArray(err.detail)) errorMessage = err.detail.map((e: any) => `${e.loc.join('.')}: ${e.msg}`).join(", ");
            else if (err.message) errorMessage = err.message;
            return { success: false, error: errorMessage };
        }

        const data = await res.json();
        return { success: true, url: data.url };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
