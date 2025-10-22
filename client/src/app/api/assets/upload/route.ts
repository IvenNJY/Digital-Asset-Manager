// client/src/app/api/assets/upload/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  // Forward the incoming request (including cookies) to Django
  const cookie = req.headers.get("cookie") || "";
  const contentType = req.headers.get("content-type") || undefined;
    const session = req.cookies.get("sessionid")
  // Extract csrftoken from cookies if present and forward as X-CSRFToken
  const csrfMatch = /(?:^|;\s*)csrftoken=([^;]+)/i.exec(cookie || "");
  const csrfToken = csrfMatch?.[1];

  // Note: Next.js's Request.body is a stream; we forward the raw body by using fetch() with req.body
  const backendResponse = await fetch(`${BACKEND_URL}/api/assets/`, {
    method: "POST",
    headers: {
      // Forward Content-Type with boundary so DRF treats it as multipart/form-data
      "Content-Type": "application/json",
      ...(session ? { Cookie: `sessionid=${session.value}` } : {}),
    },
    // Forward the body stream directly
    body: await req.arrayBuffer(), // convert stream to buffer
    // keep credentials behaviour on the backend side
  });

  const text = await backendResponse.text();
  const res = new NextResponse(text, {
    status: backendResponse.status,
    headers: { "Content-Type": backendResponse.headers.get("content-type") ?? "application/json" },
  });

  // propagate Set-Cookie (sessionid) if backend returned one (e.g., refresh)
  const rawSetCookie = backendResponse.headers.get("set-cookie");
  if (rawSetCookie) res.headers.set("set-cookie", rawSetCookie);

  return res;
}
