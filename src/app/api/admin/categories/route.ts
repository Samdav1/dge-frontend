import { NextResponse } from "next/server";

export async function GET() {
    try {
        let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        if (backendUrl.includes("0.0.0.0")) {
            backendUrl = backendUrl.replace("0.0.0.0", "127.0.0.1");
        }
        const apiKey = process.env.BACKEND_API_KEY;

        const res = await fetch(`${backendUrl}/v1/super_admins/categories`, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "X-API-KEY": apiKey || ""
            },
            cache: "no-store"
        });

        if (!res.ok) {
            const errText = await res.text();
            return NextResponse.json({ error: errText || "Failed to fetch categories" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Fetch categories route error:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, icon } = body;

        let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        if (backendUrl.includes("0.0.0.0")) {
            backendUrl = backendUrl.replace("0.0.0.0", "127.0.0.1");
        }
        const apiKey = process.env.BACKEND_API_KEY;

        const res = await fetch(`${backendUrl}/v1/super_admins/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey || ""
            },
            body: JSON.stringify({ name, icon })
        });

        if (!res.ok) {
            const errText = await res.text();
            return NextResponse.json({ error: errText || "Failed to create category" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Create category route error:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category_id = searchParams.get("category_id");
        if (!category_id) {
            return NextResponse.json({ error: "Missing category_id" }, { status: 400 });
        }

        const body = await req.json();
        const { name, icon } = body;

        let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        if (backendUrl.includes("0.0.0.0")) {
            backendUrl = backendUrl.replace("0.0.0.0", "127.0.0.1");
        }
        const apiKey = process.env.BACKEND_API_KEY;

        const res = await fetch(`${backendUrl}/v1/super_admins/categories/${category_id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-API-KEY": apiKey || ""
            },
            body: JSON.stringify({ name, icon })
        });

        if (!res.ok) {
            const errText = await res.text();
            return NextResponse.json({ error: errText || "Failed to update category" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Update category route error:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const category_id = searchParams.get("category_id");

        if (!category_id) {
            return NextResponse.json({ error: "Missing category_id search param" }, { status: 400 });
        }

        let backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        if (backendUrl.includes("0.0.0.0")) {
            backendUrl = backendUrl.replace("0.0.0.0", "127.0.0.1");
        }
        const apiKey = process.env.BACKEND_API_KEY;

        const res = await fetch(`${backendUrl}/v1/super_admins/categories/${category_id}`, {
            method: "DELETE",
            headers: {
                "Accept": "application/json",
                "X-API-KEY": apiKey || ""
            }
        });

        if (!res.ok) {
            const errText = await res.text();
            return NextResponse.json({ error: errText || "Failed to delete category" }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Delete category route error:", error);
        return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
    }
}
