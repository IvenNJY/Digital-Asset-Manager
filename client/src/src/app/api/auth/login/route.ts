import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export async function POST(request: NextRequest) {
  const payload = await request.json()

  const backendResponse = await fetch(`${BACKEND_URL}/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  })

  const data = await backendResponse.json().catch(() => ({}))
  const response = NextResponse.json(data, { status: backendResponse.status })

  const rawSetCookie = backendResponse.headers.get("set-cookie")
  if (rawSetCookie) {
    response.headers.set("set-cookie", rawSetCookie)
  }

  return response
}
