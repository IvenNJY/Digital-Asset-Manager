"use client"

import UploadPrivateRoute from "@/components/auth/UploadPrivateRoute"
import AssetUpload from "@/components/AssetUpload/AssetUpload"
import { useAuthUser } from "@/components/auth/PrivateRoute"
import { Center, Spinner } from "@chakra-ui/react"

/**
 * 🧩 AssetUploadPage
 * This page uses UploadPrivateRoute to allow only Admins and Editors
 * to upload assets. It automatically checks the current user’s role.
 */
export default function AssetUploadPage() {
  const user = useAuthUser()

  // ⏳ Wait for user info to load (avoid flashing unauthorized content)
  if (!user) {
    return (
      <Center minH="100vh">
        <Spinner size="lg" />
      </Center>
    )
  }

  // ✅ Only render upload page for authorized roles
  return (
    <UploadPrivateRoute>
      <AssetUpload user={user} />
    </UploadPrivateRoute>
  )
}
