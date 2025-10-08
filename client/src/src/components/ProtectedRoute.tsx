"use client"

import { ReactNode, useEffect } from "react"
import { Center, Spinner } from "@chakra-ui/react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/context/AuthContext"

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login")
    }
  }, [loading, router, user])

  if (loading || (!user && typeof window !== "undefined")) {
    return (
      <Center minH="100vh">
        <Spinner size="xl" />
      </Center>
    )
  }

  return <>{children}</>
}
