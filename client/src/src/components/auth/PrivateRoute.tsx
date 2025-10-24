"use client"

import { Center, Spinner, Stack, Text } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect, useMemo, useState } from "react"

import { fetchCurrentUser, type CurrentUser } from "@/lib/auth"

interface PrivateRouteProps {
  children: (user: CurrentUser) => ReactNode
  roles?: string[]
  redirectTo?: string
  fallback?: ReactNode
}

type AuthState =
  | { status: "loading" }
  | { status: "authorized"; user: CurrentUser }
  | { status: "redirect" }
  | { status: "error" }

export default function PrivateRoute({
  children,
  roles,
  redirectTo = "/",
  fallback,
}: PrivateRouteProps) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({ status: "loading" })

  useEffect(() => {
    let isMounted = true

    const load = async () => {
      setState({ status: "loading" })
      const user = await fetchCurrentUser()

      if (!isMounted) return

      if (!user) {
        setState({ status: "redirect" })
        router.replace(redirectTo)
        return
      }

      const allowedRoles = roles?.map((role) => role.toLowerCase())
      const userRole = user.role?.toLowerCase() ?? null

      if (allowedRoles && allowedRoles.length > 0 && (!userRole || !allowedRoles.includes(userRole))) {
        setState({ status: "redirect" })
        router.replace(redirectTo)
        return
      }

      setState({ status: "authorized", user })
    }

    load().catch((error) => {
      console.error("PrivateRoute failed to load user", error)
      if (!isMounted) return
      setState({ status: "error" })
    })

    return () => {
      isMounted = false
    }
  }, [redirectTo, roles, router])

  const loadingView = useMemo(
    () =>
      fallback ?? (
        <Center minH="100vh">
          <Spinner size="lg" />
        </Center>
      ),
    [fallback]
  )

  if (state.status === "loading") {
    return loadingView
  }

  if (state.status === "authorized") {
    return <>{children(state.user)}</>
  }

  if (state.status === "redirect") {
    return loadingView
  }

  return (
    <Center minH="100vh">
      <Stack gap={3} textAlign="center">
        <Text fontWeight="medium">We had an error retrieving the account.</Text>
        <Text color="red.500" fontSize="sm">
          Please refresh the page or sign in again.
        </Text>
      </Stack>
    </Center>
  )
}

/* ✅ NEW HOOK: Allows any component to easily get the authenticated user */
export function useAuthUser() {
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const load = async () => {
      const fetchedUser = await fetchCurrentUser()
      setUser(fetchedUser)
    }
    load()
  }, [])

  return user
}
