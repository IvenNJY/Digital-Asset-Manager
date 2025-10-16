import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

async function forwardBackendRequest(
  request: NextRequest,
  userId: string,
  backendPath: "update" | "delete"
) {
  const session = request.cookies.get("sessionid")
  const endpoint =
    backendPath === "update" // decide path based on action 
      ? `${BACKEND_URL}/api/auth/update-user/${userId}/`
      : `${BACKEND_URL}/api/auth/delete-user/${userId}/`

  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Cookie: `sessionid=${session.value}` } : {}),
    },
    cache: "no-store",
  }

  if (backendPath === "update") {
    const body = await request.text()
    init.body = body
  }

  const backendResponse = await fetch(endpoint, init)
  const text = await backendResponse.text()
  let data: Record<string, unknown>

  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    data = { detail: text || "Unexpected response from server." }
  }

  return NextResponse.json(data, { status: backendResponse.status })
}

export async function PATCH(request: NextRequest, { params }: { params: { userId: string } }) {
  return forwardBackendRequest(request, params.userId, "update")
}

export async function DELETE(request: NextRequest, { params }: { params: { userId: string } }) {
  return forwardBackendRequest(request, params.userId, "delete")
}
