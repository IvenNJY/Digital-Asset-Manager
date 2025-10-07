"use client"

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { useRouter } from "next/navigation"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

type AuthUser = {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
}

type LoginPayload = {
  username: string
  password: string
}

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<string | null>
}

type ApiError = Error & { status?: number }

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const ACCESS_TOKEN_KEY = "dam_access_token"
const REFRESH_TOKEN_KEY = "dam_refresh_token"

const readStorage = (key: string) => {
  if (typeof window === "undefined") {
    return null
  }
  return window.localStorage.getItem(key)
}

const writeStorage = (key: string, value: string | null) => {
  if (typeof window === "undefined") {
    return
  }
  if (value) {
    window.localStorage.setItem(key, value)
  } else {
    window.localStorage.removeItem(key)
  }
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()
  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function resolveErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const detail = (payload as Record<string, unknown>).detail
    if (typeof detail === "string") {
      return detail
    }

    const message = (payload as Record<string, unknown>).message
    if (typeof message === "string") {
      return message
    }
  }

  if (typeof payload === "string" && payload.trim().length > 0) {
    return payload
  }

  return fallback
}

function extractUser(payload: unknown): AuthUser {
  if (payload && typeof payload === "object") {
    const container = payload as Record<string, unknown>
    const embedded = container.user
    if (embedded && typeof embedded === "object") {
      return embedded as AuthUser
    }
  }

  return payload as AuthUser
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshTokenState, setRefreshTokenState] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const clearAuthState = useCallback(() => {
    setUser(null)
    setAccessToken(null)
    setRefreshTokenState(null)
    writeStorage(ACCESS_TOKEN_KEY, null)
    writeStorage(REFRESH_TOKEN_KEY, null)
  }, [])

  const handleLogout = useCallback(() => {
    clearAuthState()
    router.replace("/login")
  }, [clearAuthState, router])

  const fetchUserWithToken = useCallback(async (token: string) => {
    const response = await fetch(`${API_BASE_URL}/api/private/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const payload = await readResponseBody(response)
    if (!response.ok) {
      const error = new Error(
        resolveErrorMessage(payload, "Unable to fetch user profile"),
      ) as ApiError
      error.status = response.status
      throw error
    }

    const profile = extractUser(payload)
    if (!profile) {
      throw new Error("Failed to resolve user profile")
    }

    return profile
  }, [])

  const performRefresh = useCallback(
    async (overrideToken?: string | null) => {
      const tokenToUse = overrideToken ?? refreshTokenState
      if (!tokenToUse) {
        return null
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: tokenToUse }),
        })

        const payload = await readResponseBody(response)
        if (!response.ok) {
          throw new Error(
            resolveErrorMessage(payload, "Unable to refresh session"),
          )
        }

        const nextAccess =
          payload && typeof payload === "object"
            ? (payload as Record<string, unknown>).access
            : null

        if (typeof nextAccess !== "string" || !nextAccess) {
          throw new Error("Received invalid token response")
        }

        setAccessToken(nextAccess)
        writeStorage(ACCESS_TOKEN_KEY, nextAccess)
        return nextAccess
      } catch {
        handleLogout()
        return null
      }
    },
    [handleLogout, refreshTokenState],
  )

  const refreshAccessToken = useCallback(() => performRefresh(), [performRefresh])

  const initializeFromStorage = useCallback(async () => {
    const storedAccess = readStorage(ACCESS_TOKEN_KEY)
    const storedRefresh = readStorage(REFRESH_TOKEN_KEY)

    if (!storedAccess || !storedRefresh) {
      setLoading(false)
      return
    }

    setAccessToken(storedAccess)
    setRefreshTokenState(storedRefresh)

    try {
      const profile = await fetchUserWithToken(storedAccess)
      setUser(profile)
    } catch (error) {
      const apiError = error as ApiError
      if (apiError.status === 401 || apiError.status === 403) {
        const nextAccess = await performRefresh(storedRefresh)
        if (nextAccess) {
          try {
            const profile = await fetchUserWithToken(nextAccess)
            setUser(profile)
          } catch {
            handleLogout()
          }
        }
      } else {
        handleLogout()
      }
    } finally {
      setLoading(false)
    }
  }, [fetchUserWithToken, handleLogout, performRefresh])

  useEffect(() => {
    initializeFromStorage()
  }, [initializeFromStorage])

  const login = useCallback(
    async ({ username, password }: LoginPayload) => {
      setLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/api/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        })

        const payload = await readResponseBody(response)

        if (!response.ok) {
          const message = resolveErrorMessage(
            payload,
            response.status === 401
              ? "Invalid username or password"
              : "Login failed",
          )
          const error = new Error(message) as ApiError
          error.status = response.status
          throw error
        }

        const access =
          payload && typeof payload === "object"
            ? (payload as Record<string, unknown>).access
            : null
        const refresh =
          payload && typeof payload === "object"
            ? (payload as Record<string, unknown>).refresh
            : null

        if (typeof access !== "string" || typeof refresh !== "string") {
          throw new Error("Unexpected login response")
        }

        setAccessToken(access)
        setRefreshTokenState(refresh)
        writeStorage(ACCESS_TOKEN_KEY, access)
        writeStorage(REFRESH_TOKEN_KEY, refresh)

        const profile = await fetchUserWithToken(access)
        setUser(profile)
        router.replace("/home")
      } catch (error) {
        clearAuthState()
        const message =
          error instanceof Error ? error.message : "Login failed"
        throw new Error(message)
      } finally {
        setLoading(false)
      }
    },
    [clearAuthState, fetchUserWithToken, router],
  )

  const logout = useCallback(() => {
    handleLogout()
  }, [handleLogout])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken: refreshTokenState,
      loading,
      login,
      logout,
      refreshAccessToken,
    }),
    [accessToken, loading, login, logout, refreshAccessToken, refreshTokenState, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
