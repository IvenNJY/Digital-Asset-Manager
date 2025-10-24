import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const session = request.cookies.get("sessionid");
  const contentType = request.headers.get("content-type") || "multipart/form-data";

  // 🔄 Forward request to Django's new upload endpoint
  const backendResponse = await fetch(`${BACKEND_URL}/api/assets/upload/`, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
      ...(session ? { Cookie: `sessionid=${session.value}` } : {}),
    },
    cache: "no-store",
    body: await request.arrayBuffer(), // forward file upload bytes directly
  });

  // 🧩 Handle the response safely
  const text = await backendResponse.text();
  let data: Record<string, unknown>;

  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    data = { detail: text || "Unexpected response from server." };
  }

  const res = NextResponse.json(data, {
    status: backendResponse.status,
    headers: {
      "Content-Type": backendResponse.headers.get("content-type") ?? "application/json",
    },
  });

  // 🔁 Pass Set-Cookie header (for session updates)
  const rawSetCookie = backendResponse.headers.get("set-cookie");
  if (rawSetCookie) res.headers.set("set-cookie", rawSetCookie);

  return res;
}
