import { NextResponse, NextRequest } from "next/server";

function getBackendUrl() {
    let url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    if (url.includes("0.0.0.0")) url = url.replace("0.0.0.0", "127.0.0.1");
    return url;
}

function headers(apiKey: string) {
    return { "Accept": "application/json", "X-API-KEY": apiKey };
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        const search = searchParams.get("search");
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "50";

        const backendUrl = getBackendUrl();
        const apiKey = process.env.BACKEND_API_KEY || "";

        const url = new URL(`${backendUrl}/super_admin/super_admins/admin-escrows`);
        if (status) url.searchParams.append("status", status);
        if (search) url.searchParams.append("search", search);
        url.searchParams.append("page", page);
        url.searchParams.append("limit", limit);

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: headers(apiKey),
            cache: "no-store",
        });

        if (!res.ok) {
            const errText = await res.text();
            return NextResponse.json({ error: errText }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
