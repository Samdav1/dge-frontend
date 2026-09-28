import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace("0.0.0.0", "127.0.0.1");
const API_KEY = process.env.BACKEND_API_KEY || "";

function buildHeaders(req?: NextRequest) {
    const auth = req?.headers.get("authorization") || "";
    return {
        "Content-Type": "application/json",
        "Authorization": auth,
        "X-API-KEY": API_KEY,
    };
}

/** GET /api/admin/points-settings */
export async function GET(req: NextRequest) {
    const res = await fetch(`${BACKEND}/super_admin/super_admins/points-settings`, {
        method: "GET",
        headers: buildHeaders(req),
        cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}

/** PUT /api/admin/points-settings */
export async function PUT(req: NextRequest) {
    let body: any = null;
    try { body = await req.json(); } catch { /* */ }
    const res = await fetch(`${BACKEND}/super_admin/super_admins/points-settings`, {
        method: "PUT",
        headers: buildHeaders(req),
        body: JSON.stringify(body),
        cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
}
