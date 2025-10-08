import Sidebar from "@/components/Sidebar"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function Home() {
  return (
    <ProtectedRoute>
      <Sidebar />
    </ProtectedRoute>
  )
}
