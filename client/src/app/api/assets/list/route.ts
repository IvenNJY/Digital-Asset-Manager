import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

/**
 * 🗂️ This route proxies folder listing requests to Django
 * Example: GET /api/assets/folders → http://localhost:8000/api/assets/folders/
 */
export async function GET(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || "";
    const backendRes = await fetch(`${BACKEND_URL}/api/assets/list`, {
      method: "GET",
      headers: cookie ? { Cookie: cookie } : undefined,
      cache: "no-store",
    });

    const data = await backendRes.text();
    return new NextResponse(data, {
      status: backendRes.status,
      headers: backendRes.headers,
    });
  } catch (err) {
    console.error("Folder proxy error:", err);
    return NextResponse.json({ error: "Failed to load asset list." }, { status: 500 });
  }
}
