"use client"

import { useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

import LoginForm, { type LoginFormValues } from "@/components/ui/LoginForm"
import { toaster, Toaster } from "@/components/ui/toaster"

interface LoginResponse {
  user?: {
    username: string
    role: string | null
  }
  detail?: string
}

const LOGIN_ENDPOINT = "/api/auth/login"

export default function LoginView() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (values: LoginFormValues) => {
      setLoading(true)
      setErrorMessage(null)
      setSuccessMessage(null)

      try {
        const response = await fetch(LOGIN_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
          cache: "no-store",
        })

        const data = (await response.json().catch(() => ({}))) as LoginResponse

        if (!response.ok) {
          toaster.create({
            title: "Login failed",
            description: data.detail ?? "Login failed. Please try again.",
            type: "info",
            closable: true,
          })
          
          // setErrorMessage(data.detail ?? "Login failed. Please try again.")
          return
        }

        if (data.user) {
          const roleSuffix = data.user.role ? ` (${data.user.role})` : ""
          toaster.create({
            title: "Login Successful",
            description: data.detail ?? "Login Completed as " + data.user.username + roleSuffix,
            type: "info",
            closable: true,
          })
        } else {
          toaster.create({
            title: "Login Successful",
            description: data.detail ?? "Login Completed",
            type: "success",
            closable: true,
          })
        }

        router.push("/dashboard")
      } catch (error) {
        console.error("Login request failed", error)
        setErrorMessage("Unable to reach the server. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [router]
  )

  const defaultValues = useMemo(
    () => ({
      email: "",
      password: "",
      rememberMe: true,
    }),
    []
  )

  return (
    <><Toaster />
    <LoginForm
      defaultValues={defaultValues}
      loading={loading}
      errorMessage={errorMessage}
      successMessage={successMessage}
      onSubmit={handleSubmit}
    />
    </>
  )
}
