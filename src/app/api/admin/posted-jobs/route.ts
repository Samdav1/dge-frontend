import { NextResponse, NextRequest } from "next/server";

function getBackendUrl() {
    let url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    if (url.includes("0.0.0.0")) url = url.replace("0.0.0.0", "127.0.0.1");
    return url;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const backendUrl = getBackendUrl();
        const apiKey = process.env.BACKEND_API_KEY;

        const params = new URLSearchParams();
        if (searchParams.get("search")) params.set("search", searchParams.get("search")!);
        if (searchParams.get("status")) params.set("status", searchParams.get("status")!);
        if (searchParams.get("page")) params.set("page", searchParams.get("page")!);
        if (searchParams.get("limit")) params.set("limit", searchParams.get("limit")!);

        const query = params.toString() ? `?${params}` : "";

        const res = await fetch(`${backendUrl}/super_admin/super_admins/admin-posted-jobs${query}`, {
            method: "GET",
            headers: { "Accept": "application/json", "X-API-KEY": apiKey || "" },
            cache: "no-store",
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("GET admin-posted-jobs error:", res.status, errText);
            return NextResponse.json({ posted_jobs: [], total: 0, error: errText }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("GET admin-posted-jobs route error:", error);
        return NextResponse.json({ posted_jobs: [], total: 0, error: error.message }, { status: 500 });
    }
}
