import { useMemo, useState } from "react"
import {
  Box,
  Button,
  Checkbox,
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
                        <Checkbox.Root
                          key={tag}
                          checked={checked}
                          onCheckedChange={(details) => toggleTag(tag, details.checked === true)}
                          display="flex"
                          alignItems="center"
                          gap={2}
                        >
                          <Checkbox.Control />
                          <Checkbox.Label textTransform="capitalize">{tag}</Checkbox.Label>
                        </Checkbox.Root>
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
                <Button size="sm" colorPalette="blue">
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
