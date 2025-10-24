"use client"

import { useState } from "react"

import PrivateRoute from "@/components/auth/PrivateRoute"
import AssetLoader from "@/components/ui/AssetLoader"
import Header from "@/components/ui/Header"
import Sidebar from "@/components/ui/Sidebar"
import ViewType from "@/components/AssetFiltering/ViewType"
import SearchBar from "@/components/AssetFiltering/SearchBar"

import { Stack } from "@chakra-ui/react"

export default function DashboardPage() {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")

  return (
    <PrivateRoute>
      {(user) => (
        <Sidebar user={user}>
          <Stack>
            <Header
              title="Dashboard"
              description="Your personalized asset overview will appear here soon."
            />
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={() => setSearchQuery(searchInput)}
            />
            <ViewType onChange={setView} />
            <AssetLoader view={view} searchQuery={searchQuery} />
          </Stack>
        </Sidebar>
      )}
    </PrivateRoute>
  )
}
