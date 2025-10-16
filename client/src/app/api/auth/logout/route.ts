import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export async function POST(request: NextRequest) {
  const session = request.cookies.get("sessionid")

  const backendResponse = await fetch(`${BACKEND_URL}/api/auth/logout/`, {
    method: "POST",
    headers: {
      ...(session ? { Cookie: `sessionid=${session.value}` } : {}),
    },
    cache: "no-store",
  })

  const data = await backendResponse.json().catch(() => ({}))
  const response = NextResponse.json(data, { status: backendResponse.status })

  const rawSetCookie = backendResponse.headers.get("set-cookie")
  if (rawSetCookie) {
    response.headers.set("set-cookie", rawSetCookie)
  } else {
    response.cookies.set({ name: "sessionid", value: "", path: "/", maxAge: 0 })
  }

  return response
}
