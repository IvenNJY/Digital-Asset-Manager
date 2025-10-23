"use client"

import AssetUpload from "@/components/AssetUpload/AssetUpload"
import PrivateRoute from "@/components/auth/PrivateRoute"
import { useAuthUser } from "@/components/auth/PrivateRoute"
import { Center, Spinner } from "@chakra-ui/react"
import Sidebar from "@/components/ui/Sidebar"
import Header from "@/components/ui/Header"

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
    <PrivateRoute roles={['admin', 'editor']} redirectTo="/dashboard">
      {(user) => (
        <Sidebar user={user}>
          <Header
            title="Asset Upload"
            description="Upload new assets to the library."
          />
          <AssetUpload />
        </Sidebar>
      )}
    </PrivateRoute>
  )
}
