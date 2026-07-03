import { NextResponse, NextRequest } from "next/server";

function getBackendUrl() {
    let url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    if (url.includes("0.0.0.0")) url = url.replace("0.0.0.0", "127.0.0.1");
    return url;
}

function headers(apiKey: string) {
    return { "Accept": "application/json", "X-API-KEY": apiKey, "Content-Type": "application/json" };
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const backendUrl = getBackendUrl();
        const apiKey = process.env.BACKEND_API_KEY || "";

        const url = `${backendUrl}/super_admin/super_admins/admin-drivers/licenses/${id}`;
        const res = await fetch(url, {
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
        console.error("GET admin license detail error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();
        
        const backendUrl = getBackendUrl();
        const apiKey = process.env.BACKEND_API_KEY || "";

        const url = `${backendUrl}/super_admin/super_admins/admin-drivers/licenses/${id}/review`;
        const res = await fetch(url, {
            method: "POST",
            headers: headers(apiKey),
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const errText = await res.text();
            return NextResponse.json({ error: errText }, { status: res.status });
        }

        return NextResponse.json(await res.json());
    } catch (error: any) {
        console.error("POST admin license review error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
