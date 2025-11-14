"use client";

import { useState } from "react";

import PrivateRoute from "@/components/auth/PrivateRoute";
import AssetLoader from "@/components/ui/AssetLoader";
import Header from "@/components/ui/Header";
import Sidebar from "@/components/ui/Sidebar";
import ViewType from "@/components/AssetFiltering/ViewType";
import SearchBar from "@/components/AssetFiltering/SearchBar";
import { FilterMenuProps } from "@/components/AssetFiltering/FilterMenu";

import { Stack } from "@chakra-ui/react";

// define the category type
type Category = "all" | "images" | "videos" | "documents" | "glb" | "others";

export default function DashboardPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  //add this state to track sidebar category
  const [selectedCategory, setSelectedCategory] = useState<Category>("all");

  // Filter menu state
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortKey, setSortKey] = useState<"date" | "name" | "size">("date");

  const handleResetFilters = () => {
    setFilterCategory(null);
    setSelectedTags(new Set());
    setStartDate("");
    setEndDate("");
    setSortKey("date");
  };

  const handleApplyFilters = () => {
    // Filters are applied immediately as state changes
    // No additional action needed here
  };

  const filterMenuProps: FilterMenuProps = {
    category: filterCategory,
    onCategoryChange: setFilterCategory,
    selectedTags,
    onTagsChange: setSelectedTags,
    startDate,
    onStartDateChange: setStartDate,
    endDate,
    onEndDateChange: setEndDate,
    sortKey,
    onSortKeyChange: setSortKey,
    onApplyFilters: handleApplyFilters,
    onResetFilters: handleResetFilters,
  };

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
              filterProps={filterMenuProps}
            />

            <ViewType onChange={setView} />

            {/*Pass selectedCategory to AssetLoader */}
            <AssetLoader
              view={view}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
              filterCategory={filterCategory}
              selectedTags={selectedTags}
              startDate={startDate}
              endDate={endDate}
              sortKey={sortKey}
            />
          </Stack>
        </Sidebar>
      )}
    </PrivateRoute>
  );
}
