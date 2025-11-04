import { HStack, Text, Box, Flex, IconButton, Icon ,  Portal, Select, createListCollection} from '@chakra-ui/react'
import { FiGrid, FiList, FiArrowUp } from "react-icons/fi";    
import React, { useState } from 'react'

export type ViewMode = "grid" | "list";  // export it so other files can use it

type ViewTypeProps = {
  onChange?: (view: ViewMode) => void
  assetCount?: number
  totalAssetCount?: number
  initialView?: ViewMode
}
function ViewType({ onChange, assetCount, totalAssetCount, initialView = "grid" }: ViewTypeProps) {
  // internal view state, synced with parent via onChange
  const [view, setViewMode] = useState<ViewMode>(initialView);

  // Hide component if no assets
  if (assetCount === undefined || assetCount === 0) return null;

  const viewOptions = createListCollection({
    items: [
      { label: "Date", value: "date" },
      { label: "Name", value: "name" },
      { label: "Size", value: "size" },
    ],
  })

  // function to handle view change
  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView);
    onChange?.(newView);
  }

  return (
    <HStack w="full">
      <Box w="full">  
        <Flex align="center" justify="space-between">
          <HStack w="full" justify="space-between">
            {/* Left side: asset count */}
            <Text fontSize="sm" color="gray.600">
              Showing {assetCount} of {totalAssetCount ?? assetCount} asset{(totalAssetCount ?? assetCount) === 1 ? '' : 's'}
            </Text>

            {/* Right Side: sort + view toggle */}
            <HStack gap={2}>

              {/* Sort dropdown */}
              <Flex
                align="center"
                bg="gray.50"
                _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                borderWidth="1px"
                borderColor="gray.200"
                rounded="md"
                px={2}
                py={1}
              >
                <FiArrowUp size={14} style={{ marginRight: "6px" }} />
                <Box fontSize="sm" bg="transparent" border="none" outline="none" cursor="pointer">
                  <Select.Root collection={viewOptions} size="sm" width="10vw">
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Select framework" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {viewOptions.items.map((viewOption) => (
                            <Select.Item item={viewOption} key={viewOption.value}>
                              {viewOption.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </Box>
              </Flex>

              {/* View toggle buttons */}
              <HStack
                bg="gray.50"
                _dark={{ bg: "gray.800", borderColor: "gray.700"}}
                borderWidth="1px"
                borderColor="gray.200"
                rounded="md"
                gap={0}
                overflow="hidden"
              >
                <IconButton
                  aria-label="Grid view"
                  variant="ghost"
                  size="sm"
                  borderRadius="none"
                  bg={view === "grid" ? "gray.200" : "transparent"}
                  _dark={{ bg: view === "grid" ? "gray.700" : "transparent" }}
                  onClick={() => handleViewChange("grid")}
                >
                  <Icon as={FiGrid} />
                </IconButton>

                <IconButton
                  aria-label="List view"
                  variant="ghost"
                  size="sm"
                  borderRadius="none"
                  bg={view === "list" ? "gray.200" : "transparent"}
                  _dark={{ bg: view === "list" ? "gray.700" : "transparent" }}
                  onClick={() => handleViewChange("list")}
                >
                  <Icon as={FiList} />
                </IconButton>
              </HStack>

            </HStack>
          </HStack>
        </Flex>  
      </Box>
    </HStack>
  )
}

export default ViewType
