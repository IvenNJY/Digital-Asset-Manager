"use client"

import React, { useMemo } from "react"
import {
  Box,
  Button,
  HStack,
  Input,
  Popover,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react"
import { LuFilter } from "react-icons/lu"

const categories = ["image", "video", "document", "3d", "other"]

const tagOptions = [
  "3d",
  "4k",
  "ai-generated",
  "animation",
  "brand",
  "concept",
  "draft",
  "illustration",
  "logo",
  "marketing",
  "presentation",
  "product",
  "social",
  "template",
]

export interface FilterMenuProps {
  category: string | null
  onCategoryChange: (category: string | null) => void
  selectedTags: Set<string>
  onTagsChange: (tags: Set<string>) => void
  startDate: string
  onStartDateChange: (date: string) => void
  endDate: string
  onEndDateChange: (date: string) => void
  sortKey: "date" | "name" | "size"
  onSortKeyChange: (key: "date" | "name" | "size") => void
  onApplyFilters: () => void
  onResetFilters: () => void
}

export default function FilterMenu({
  category,
  onCategoryChange,
  selectedTags,
  onTagsChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortKey,
  onSortKeyChange,
  onApplyFilters,
  onResetFilters,
}: FilterMenuProps) {

  const tags = useMemo(() => tagOptions, [])

  const toggleTag = (tag: string, checked: boolean) => {
    const next = new Set(selectedTags)
    if (checked) next.add(tag)
    else next.delete(tag)
    onTagsChange(next)
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline" size="sm" gap={2}>
          <LuFilter />
          Filter
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content maxW="sm" w="sm" px={5} py={4} shadow="lg" borderRadius="lg">
            <Stack gap={5} fontSize="sm">
              <Stack gap={2}>
                <Text fontSize="md" fontWeight="semibold">
                  Advanced Filters
                </Text>
              </Stack>

              <Stack gap={2}>
                <Text fontWeight="medium">Asset Type</Text>
                <HStack wrap="wrap" gap={2}>
                  {categories.map((name) => {
                    const isActive = category === name
                    return (
                      <Button
                        key={name}
                        size="xs"
                        variant={isActive ? "solid" : "outline"}
                        borderRadius="full"
                        onClick={() => onCategoryChange(isActive ? null : name)}
                      >
                        {name}
                      </Button>
                    )
                  })}
                </HStack>
              </Stack>

              <Stack gap={2}>
                <Text fontWeight="medium">Tags</Text>
                <Box maxH="160px" overflowY="auto" pr={1}>
                  <Stack gap={2}>
                    {tags.map((tag) => {
                      const checked = selectedTags.has(tag)
                      return (
                        <div
                          key={tag}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "4px 2px",
                          }}
                        >
                          <input
                            id={`tag-${tag}`}
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleTag(tag, e.target.checked)}
                            style={{ width: 16, height: 16, cursor: "pointer" }}
                          />
                          <label htmlFor={`tag-${tag}`} style={{ textTransform: "capitalize", cursor: "pointer", fontSize: 13 }}>
                            {tag}
                          </label>
                        </div>
                      )
                    })}
                  </Stack>
                </Box>
              </Stack>

              <Stack gap={2}>
                <Text fontWeight="medium">Date Range</Text>
                <HStack gap={3}>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(event) => onStartDateChange(event.target.value)}
                    aria-label="Start date"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(event) => onEndDateChange(event.target.value)}
                    aria-label="End date"
                  />
                </HStack>
              </Stack>

              <Stack gap={2}>
                <Text fontWeight="medium">Sort by</Text>

                {/* native select used for compatibility */}
                <div style={{ width: "100%" }}>
                  <select
                    value={sortKey}
                    onChange={(e) => onSortKeyChange(e.target.value as "date" | "name" | "size")}
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "1px solid rgba(255,255,255,0.06)",
                      background: "transparent",
                      color: "inherit",
                    }}
                  >
                    <option value="date">Date (Newest → Oldest)</option>
                    <option value="name">Name (A → Z)</option>
                    <option value="size">Size (Largest → Smallest)</option>
                  </select>
                </div>
              </Stack>

              <HStack justify="space-between">
                <Button variant="ghost" size="sm" onClick={onResetFilters}>
                  Reset
                </Button>
                <Button size="sm" colorScheme="blue" onClick={onApplyFilters}>
                  Apply Filters
                </Button>
              </HStack>
            </Stack>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}