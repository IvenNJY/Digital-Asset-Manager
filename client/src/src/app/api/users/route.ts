import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export async function GET(request: NextRequest) {
  const session = request.cookies.get("sessionid")

  const backendResponse = await fetch(`${BACKEND_URL}/api/auth/users/`, {
    method: "GET",
    headers: {
      ...(session ? { Cookie: `sessionid=${session.value}` } : {}),
    },
    cache: "no-store",
  })

  const data = await backendResponse.json().catch(() => ({}))
  return NextResponse.json(data, { status: backendResponse.status })
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get("sessionid")
  const body = await request.text()

  const backendResponse = await fetch(`${BACKEND_URL}/api/auth/create-user/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Cookie: `sessionid=${session.value}` } : {}),
    },
    cache: "no-store",
    body,
  })

  const text = await backendResponse.text()
  let data: Record<string, unknown>

  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    data = { detail: text || "Unexpected response from server." }
  }

  return NextResponse.json(data, { status: backendResponse.status })
}
