import { HStack, Text, Box, Flex, IconButton, Icon } from '@chakra-ui/react'
import { FiGrid, FiList } from "react-icons/fi";
import React, { useState } from 'react'

export type ViewMode = "grid" | "list";

type ViewTypeProps = {
  onChange?: (view: ViewMode) => void
  assetCount?: number
  totalAssetCount?: number
  initialView?: ViewMode
}

function ViewType({ onChange, assetCount, totalAssetCount, initialView = "grid" }: ViewTypeProps) {
  const [view, setViewMode] = useState<ViewMode>(initialView);

  if (assetCount === undefined || assetCount === 0) return null;

  const handleViewChange = (newView: ViewMode) => {
    setViewMode(newView);
    onChange?.(newView);
  }

  return (
    <HStack w="full">
      <Box w="full">  
        <Flex align="center" justify="space-between">
          <HStack w="full" justify="space-between">
            <Text fontSize="sm" color="gray.600">
              Showing {assetCount} of {totalAssetCount ?? assetCount} asset{(totalAssetCount ?? assetCount) === 1 ? '' : 's'}
            </Text>

            <HStack gap={2}>
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
