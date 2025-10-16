import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export async function GET(request: NextRequest) {
  const session = request.cookies.get("sessionid")

  const backendResponse = await fetch(`${BACKEND_URL}/api/auth/me/`, {
    method: "GET",
    headers: {
      ...(session ? { Cookie: `sessionid=${session.value}` } : {}),
    },
    cache: "no-store",
  })

  const data = await backendResponse.json().catch(() => ({}))
  return NextResponse.json(data, { status: backendResponse.status })
}
