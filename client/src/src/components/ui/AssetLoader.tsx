import React, { useMemo } from 'react'
import { SimpleGrid, Text } from '@chakra-ui/react'
import AssetPopover from '../AssetModal/AssetPopover'

interface AssetLoaderProps {
  view: 'grid' | 'list'
  searchQuery?: string
}

function AssetLoader({ view, searchQuery = '' }: AssetLoaderProps) {
  const assets = useMemo(
    () => [
      { id: 1, name: 'Asset 1', description: 'Description for Asset 1', type: 'image', url: 'https://picsum.photos/seed/picsum/200/300' },
      { id: 2, name: 'Asset 2', description: 'Description for Asset 2', type: 'video', url: 'https://picsum.photos/seed/picsum/200/300' },
      { id: 3, name: 'Asset 3', description: 'Description for Asset 3', type: 'document', url: 'https://picsum.photos/seed/picsum/200/300' },
      { id: 4, name: 'Asset 4', description: 'Description for Asset 4', type: 'image', url: 'https://picsum.photos/seed/picsum/200/300' },
      { id: 5, name: 'Asset 5', description: 'Description for Asset 5', type: 'video', url: 'https://picsum.photos/seed/picsum/200/300' },
      { id: 6, name: 'Asset 6', description: 'Description for Asset 6', type: 'document', url: 'https://picsum.photos/seed/picsum/200/300' },
    ],
    []
  )

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredAssets = normalizedQuery
    ? assets.filter(({ name, description, type }) => {
        const haystack = `${name} ${description} ${type}`.toLowerCase()
        return haystack.includes(normalizedQuery)
      })
    : assets

  if (filteredAssets.length === 0) {
    return <Text fontSize="sm">No assets match your search.</Text>
  }

  return (
    <SimpleGrid
      columns={view === 'list' ? { base: 1 } : { base: 1, sm: 2, lg: 3, xl: 5 }}
      gap={{ base: 4, md: 3 }}
      w="full"
    >
      {filteredAssets.map((asset) => (
        <AssetPopover key={asset.id} asset={asset} view={view} />
      ))}
    </SimpleGrid>
  )
}

export default AssetLoader