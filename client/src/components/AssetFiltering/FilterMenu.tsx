"use client"

import { useMemo, useState } from "react"
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

function buildQuery(params: {
  category?: string | null
  tags?: string[]
  startDate?: string
  endDate?: string
}) {
  const search = new URLSearchParams()
  if (params.category) search.set("category", params.category)
  if (params.tags && params.tags.length) search.set("tags", params.tags.join(","))
  if (params.startDate) search.set("start_date", params.startDate)
  if (params.endDate) search.set("end_date", params.endDate)
  return search.toString()
}

function FilterMenu() {
  const [category, setCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const tags = useMemo(() => tagOptions, [])

  const toggleTag = (tag: string, checked: boolean) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(tag)
      } else {
        next.delete(tag)
      }
      return next
    })
  }

  const resetFilters = () => {
    setCategory(null)
    setSelectedTags(new Set())
    setStartDate("")
    setEndDate("")

    // also clear URL params
    try {
      const url = new URL(window.location.href)
      url.searchParams.delete("category")
      url.searchParams.delete("tags")
      url.searchParams.delete("start_date")
      url.searchParams.delete("end_date")
      window.history.replaceState({}, "", url.pathname + url.search)
      // notify listeners that filters were cleared
      window.dispatchEvent(new CustomEvent("filtersApplied", { detail: { params: "" } }))
      console.log("[FilterMenu] filters reset and event dispatched (empty params)")
    } catch (e) {
      // ignore in SSR or if window not present
    }
  }

  const applyFilters = () => {
    const tagsArray = Array.from(selectedTags)
    const paramsStr = buildQuery({
      category: category ?? undefined,
      tags: tagsArray.length ? tagsArray : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })

    // update URL (no reload) and dispatch event with params
    try {
      const url = new URL(window.location.href)
      // remove previous related params
      url.searchParams.delete("category")
      url.searchParams.delete("tags")
      url.searchParams.delete("start_date")
      url.searchParams.delete("end_date")

      if (paramsStr) {
        const newSearch = new URLSearchParams(paramsStr)
        for (const [k, v] of newSearch.entries()) {
          url.searchParams.set(k, v)
        }
      }
      window.history.replaceState({}, "", url.pathname + url.search)

      // debugging log so you can see in console
      console.log("[FilterMenu] applying filters, params:", paramsStr)

      // emit the event so other components can listen
      window.dispatchEvent(new CustomEvent("filtersApplied", { detail: { params: paramsStr } }))
    } catch (e) {
      console.error("[FilterMenu] applyFilters error:", e)
    }
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
                <Stack gap={1}>
                  <Text fontWeight="medium">Category</Text>
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
              </Stack>

              <Stack gap={2}>
                <Text fontWeight="medium">Tags</Text>
                <Box maxH="160px" overflowY="auto" pr={1}>
                  <Stack gap={2}>
                    {tags.map((tag) => {
                      const checked = selectedTags.has(tag)
                      return (
                        // keep your Checkbox components as they are; just ensure
                        // onCheckedChange calls toggleTag correctly
                        <div key={tag} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {/* replace Checkbox.Root with your checkbox component if needed */}
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => toggleTag(tag, e.target.checked)}
                            id={`tag-${tag}`}
                          />
                          <label htmlFor={`tag-${tag}`} style={{ textTransform: "capitalize", fontSize: 13 }}>
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

export default FilterMenu
