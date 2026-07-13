import { NextRequest, NextResponse } from "next/server";

const BACKEND = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000").replace("0.0.0.0", "127.0.0.1");
const API_KEY = process.env.BACKEND_API_KEY || "";

export async function POST(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const portfolioId = searchParams.get("portfolio_id");
        if (!portfolioId) {
            return NextResponse.json({ error: "Missing portfolio_id" }, { status: 400 });
        }

        const authHeader = req.headers.get("authorization") || "";

        // Get the formData from the incoming request
        const formData = await req.formData();
        const file = formData.get("file") as File;
        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Build backend formData
        const backendFormData = new FormData();
        backendFormData.append("file", file);

        const url = new URL(`${BACKEND}/portfolio/create_portfolio_media`);
        url.searchParams.append("portfolio_id", portfolioId);

        const response = await fetch(url.toString(), {
            method: "POST",
            headers: {
                "Authorization": authHeader,
                "X-API-KEY": API_KEY,
            },
            body: backendFormData,
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("Backend upload failed:", response.status, errText);
            return NextResponse.json({ error: `Backend upload failed: ${errText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error in portfolio upload handler:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
