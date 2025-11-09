"use client"

import React, { useMemo, useState } from "react"
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

export default function FilterMenu() {
  const [category, setCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const tags = useMemo(() => tagOptions, [])

  const toggleTag = (tag: string, checked: boolean) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (checked) next.add(tag)
      else next.delete(tag)
      console.log("[FilterMenu] tag toggled:", tag, checked, " -> ", Array.from(next))
      return next
    })
  }

  const resetFilters = () => {
    setCategory(null)
    setSelectedTags(new Set())
    setStartDate("")
    setEndDate("")
    try {
      const url = new URL(window.location.href)
      url.searchParams.delete("category")
      url.searchParams.delete("tags")
      url.searchParams.delete("start_date")
      url.searchParams.delete("end_date")
      window.history.replaceState({}, "", url.pathname + url.search)
    } catch (e) {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("filtersApplied", { detail: { params: "" } }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (category) params.append("category", category)
    if (selectedTags.size) params.append("tags", Array.from(selectedTags).join(","))
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)

    const paramsStr = params.toString()
    console.log("[FilterMenu] applying filters, params:", paramsStr)

    try {
      const url = new URL(window.location.href)
      // clear previous related params
      url.searchParams.delete("category")
      url.searchParams.delete("tags")
      url.searchParams.delete("start_date")
      url.searchParams.delete("end_date")
      // apply new
      if (paramsStr) {
        const newSearch = new URLSearchParams(paramsStr)
        for (const [k, v] of newSearch.entries()) {
          url.searchParams.set(k, v)
        }
      }
      window.history.replaceState({}, "", url.pathname + url.search)
    } catch (e) {
      /* ignore */
    }

    window.dispatchEvent(new CustomEvent("filtersApplied", { detail: { params: paramsStr } }))
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
                        onClick={() => setCategory(isActive ? null : name)}
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
                    onChange={(event) => setStartDate(event.target.value)}
                    aria-label="Start date"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    aria-label="End date"
                  />
                </HStack>
              </Stack>

              <HStack justify="space-between">
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Reset
                </Button>
                <Button size="sm" colorScheme="blue" onClick={applyFilters}>
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
