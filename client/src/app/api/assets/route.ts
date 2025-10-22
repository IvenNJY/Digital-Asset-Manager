// client/src/app/api/assets/route.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

// 🧩 Handle POST — for uploading new assets
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Forward form data to Django backend
    const backendRes = await fetch(`${BACKEND_URL}/api/assets/`, {
      method: "POST",
      body: formData,
      // Important: pass cookies for authentication
      credentials: "include",
    });

    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: backendRes.headers,
    });
  } catch (error) {
    console.error("Error proxying upload:", error);
    return NextResponse.json(
      { detail: "Server error forwarding upload." },
      { status: 500 }
    );
  }
}

// 🧩 Handle GET — to list assets (optional)
export async function GET() {
  try {
    const backendRes = await fetch(`${BACKEND_URL}/api/assets/`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: backendRes.headers,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json(
      { detail: "Failed to load assets." },
      { status: 500 }
    );
  }
}
