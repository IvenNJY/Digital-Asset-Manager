import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export async function GET(request: NextRequest) {
  const session = request.cookies.get("sessionid")

  const backendResponse = await fetch(`${BACKEND_URL}/api/auth/users/sample/`, {
    method: "GET",
    headers: {
      ...(session ? { Cookie: `sessionid=${session.value}` } : {}),
    },
    cache: "no-store",
  })

  const arrayBuffer = await backendResponse.arrayBuffer()

  const headers = new Headers()
  headers.set("Content-Type", backendResponse.headers.get("content-type") ?? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
  const disposition = backendResponse.headers.get("content-disposition")
  if (disposition) {
    headers.set("Content-Disposition", disposition)
  }

  return new NextResponse(arrayBuffer, {
    status: backendResponse.status,
    headers,
  })
}
