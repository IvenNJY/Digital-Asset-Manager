import { cookies } from "next/headers"

import type { CurrentUser } from "@/lib/auth"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000"

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("sessionid")

  if (!sessionCookie) {
    return null
  }

  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/me/`, {
      method: "GET",
      headers: {
        Cookie: `sessionid=${sessionCookie.value}`,
      },
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json().catch(() => null)) as { user?: CurrentUser } | null
    return data?.user ?? null
  } catch (error) {
    console.error("Failed to resolve current user on server", error)
    return null
  }
}
