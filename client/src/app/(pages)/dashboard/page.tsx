"use client";

import { useState } from "react";

import PrivateRoute from "@/components/auth/PrivateRoute";
import AssetLoader from "@/components/ui/AssetLoader";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ViewType from "@/components/AssetFiltering/ViewType";
import SearchBar from "@/components/AssetFiltering/SearchBar";

import { Stack } from "@chakra-ui/react";

// define the category type
type Category = "all" | "images" | "videos" | "documents" | "glb" | "others";

export default function DashboardPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  //add this state to track sidebar category
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  return (
    <PrivateRoute>
      {(user) => (
        <Sidebar
          user={user}
          //this lets Sidebar notify when a category is clicked
          onCategoryChange={(category) => setSelectedCategory(category)}
        >
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

            {/*Pass selectedCategory to AssetLoader */}
            <AssetLoader
              view={view}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
          </Stack>
        </Sidebar>
      )}
    </PrivateRoute>
  );
}
