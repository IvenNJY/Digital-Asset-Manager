"use client"


import { ReactNode } from "react"
import PrivateRoute from "./PrivateRoute"

/**
 * 🧩 UploadPrivateRoute
 * A specialized route guard for asset upload pages.
 * Only allows access to users with roles: "admin" or "editor".
 * Automatically redirects unauthorized users to "/".
 */
interface UploadPrivateRouteProps {
  children: ReactNode
}

export default function UploadPrivateRoute({ children }: UploadPrivateRouteProps) {
  return (
    <PrivateRoute roles={["admin", "editor"]} redirectTo="/">
      {(user)=>children}
    </PrivateRoute>
  )
}
