export interface CurrentUser {
  id: number
  username: string
  email: string
  role: string | null
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  try {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = (await response.json().catch(() => null)) as { user?: CurrentUser } | null
    return data?.user ?? null
  } catch (error) {
    console.error("Failed to fetch current user", error)
    return null
  }
}

export type ManagedUser = CurrentUser

export async function fetchUsers(): Promise<ManagedUser[]> {
  try {
    const response = await fetch("/api/users", {
      method: "GET",
      cache: "no-store",
    })

    if (!response.ok) {
      return []
    }

    const data = (await response.json().catch(() => null)) as { users?: ManagedUser[] } | null
    if (!data?.users) {
      return []
    }

    return data.users
  } catch (error) {
    console.error("Failed to fetch users", error)
    return []
  }
}

export type UpdateUserInput = {
  username: string
  email: string
  password?: string
  role: "admin" | "editor" | "viewer"
}

export type CreateUserInput = {
  username: string
  email: string
  password: string
  role: "admin" | "editor" | "viewer"
}

export async function updateUser(userId: number, payload: UpdateUserInput): Promise<ManagedUser> {
  const response = await fetch(`/api/users/${userId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as { user?: ManagedUser; detail?: string } | null

  if (!response.ok || !data?.user) {
    throw new Error(data?.detail || "Failed to update user.")
  }

  return data.user
}

export async function deleteUser(userId: number): Promise<void> {
  const response = await fetch(`/api/users/${userId}`, {
    method: "DELETE",
  })

  const data = (await response.json().catch(() => null)) as { success?: boolean; detail?: string } | null

  if (!response.ok || data?.success !== true) {
    throw new Error(data?.detail || "Failed to delete user.")
  }
}

export async function createUser(payload: CreateUserInput): Promise<ManagedUser> {
  const response = await fetch(`/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as { user?: ManagedUser; detail?: string } | null

  if (!response.ok || !data?.user) {
    throw new Error(data?.detail || "Failed to create user.")
  }

  return data.user
}
