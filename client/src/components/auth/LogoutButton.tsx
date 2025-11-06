"use client"

import { Button } from "@chakra-ui/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Failed to log out", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleLogout} loading={loading} colorPalette="red">
      Sign out
    </Button>
  )
}
