import React, { useState } from 'react'
import { Popover, Box, Portal } from '@chakra-ui/react'
import AssetCard from '../ui/AssetCard'
import AssetMenu from './AssetMenu'

interface AssetPopoverProps {
  asset: {
    id: number
    name: string
    description: string
    type: string
    url: string
    file_path?: string
    uploaded_by?: string
    uploaded_at?: string
    size_bytes?: number
  }
  view: 'grid' | 'list'
}

function AssetPopover({ asset, view }: AssetPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      positioning={{ strategy: 'fixed', hideWhenDetached: true }}
    >
      <Popover.Trigger>
          <Box
            display="block"
            w="100%"
            p={0}
            bg="transparent"
            border="none"
            cursor="pointer"
          >
          <AssetCard
            view={view}
            url={asset.url}
            name={asset.name}
            description={asset.description}
            asset_type={asset.type}
            uploaded_by={asset.uploaded_by}
            uploaded_at={asset.uploaded_at}
          />
        </Box>
      </Popover.Trigger>

      <Portal>
        {/* Dark overlay when open */}
        {isOpen && (
          <Box
            position="fixed"
            inset={0}
            bg="blackAlpha.700"
            zIndex="overlay"
            transition="opacity 0.2s ease"
          />
        )}

        <Popover.Content
          w="min(96vw, 1100px)"
          minH="60vh"
          maxH="90vh"
          overflowY="auto"
          zIndex="popover"
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          boxShadow="xl"
          p={4}
          borderRadius="md"
          bg={{ base: 'gray.200', _dark: 'gray.900' }}
        >
          <Popover.Arrow />
          <Popover.Body p={0}>
            <AssetMenu asset={asset} />
          </Popover.Body>
        </Popover.Content>
      </Portal>
    </Popover.Root>
  )
}

export default AssetPopover
