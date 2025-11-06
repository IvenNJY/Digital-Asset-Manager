import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export async function POST(request: NextRequest) {
  const session = request.cookies.get("sessionid")
  const formData = await request.formData()

  const backendResponse = await fetch(`${BACKEND_URL}/api/auth/users/bulk-import/`, {
    method: "POST",
    headers: {
      ...(session ? { Cookie: `sessionid=${session.value}` } : {}),
    },
    cache: "no-store",
    body: formData,
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
