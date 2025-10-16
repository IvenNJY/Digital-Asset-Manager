import { HStack, Text, Box, Flex, IconButton, Icon ,  Portal, Select, createListCollection} from '@chakra-ui/react'
import { FiGrid, FiList, FiArrowUp } from "react-icons/fi";    
import React, { useState } from 'react'

type ViewMode = "grid" | "list"

type ViewTypeProps = {
  onChange?: (view: ViewMode) => void
}

function ViewType({ onChange }: ViewTypeProps) {
  const [view, setViewMode] = useState<"grid" | "list">("grid");
  const viewOptions = createListCollection({
  items: [
    { label: "Date", value: "date" },
    { label: "Name", value: "name" },
    { label: "Size", value: "size" },
  ],
})

  return (
    <HStack w="full">
        
        <Box w="full">  
            <Flex align="center" justify="space-between">
            <HStack w="full" justify="space-between">
              {/* Left side */}
              <Text fontSize="sm" color="gray.600">
                Showing 6 of 6 assets
              </Text>

              {/* Right Side */}
              <HStack gap={2}>
              {/* Sort icon + dropdown */}
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

                  <Box 
                    defaultValue="date"
                    fontSize="sm"
                    bg="transparent"
                    border="none"
                    outline="none"
                    cursor="pointer"
                  >

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
                _dark={{
                  bg: view === "grid" ? "gray.700" : "transparent",
                }}
                onClick={() => {
                  setViewMode("grid")
                  onChange?.("grid")
                }}
              >
                <Icon as={FiGrid} />
              </IconButton>

              <IconButton
                aria-label="List view"
                variant="ghost"
                size="sm"
                borderRadius="none"
                bg={view === "list" ? "gray.200" : "transparent"}
                _dark={{
                  bg: view === "list" ? "gray.700" : "transparent",
                }}
                onClick={() => {
                  setViewMode("list")
                  onChange?.("list")
                }}
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
