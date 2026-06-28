import { NextResponse, NextRequest } from "next/server";

function getBackendUrl() {
    let url = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    if (url.includes("0.0.0.0")) url = url.replace("0.0.0.0", "127.0.0.1");
    return url;
}

function headers(apiKey: string) {
    return { "Accept": "application/json", "X-API-KEY": apiKey };
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const backendUrl = getBackendUrl();
        const apiKey = process.env.BACKEND_API_KEY || "";

        const res = await fetch(`${backendUrl}/v1/services/services/${id}`, {
            method: "GET",
            headers: headers(apiKey),
            cache: "no-store",
        });

        if (!res.ok) {
            const errText = await res.text();
            return NextResponse.json({ error: errText }, { status: res.status });
        }

        const data = await res.json();

        // Dynamically fetch categories if missing/empty in service
        if (data.service && (!data.service.categories || data.service.categories.length === 0)) {
            try {
                const linksRes = await fetch(`${backendUrl}/v1/service_category/categories/service/${id}/links`, {
                    method: "GET",
                    headers: headers(apiKey),
                });
                if (linksRes.ok) {
                    const links = await linksRes.json();
                    if (links && links.length > 0) {
                        const catsRes = await fetch(`${backendUrl}/v1/service_category/categories/`, {
                            method: "GET",
                            headers: headers(apiKey),
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
                console.error("Failed to dynamically fetch categories on admin API proxy:", err);
            }
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
