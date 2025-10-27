import React, { useState } from 'react'
import {
  Card,
  Image,
  HStack,
  Button,
  Flex,
  Box,
} from '@chakra-ui/react'
import { FiDownload, FiTrash } from 'react-icons/fi'
import SwitchView from './SwitchView' // relative path
import VersionHistory from './VersionHistory' // relative path
import AssetPreview from './AssetPreview' // relative path
import AssetMetadata from './AssetMetadata'

type Asset = {
  id: number
  name: string
  description: string
  type: string
  url: string
  file_path?: string
  uploaded_by?: string
  uploaded_at?: string
  size_bytes?: number
  metadata: Array<{
    key: string
    value: string
    data_type: string
  }>
  tags: string[]
}

type Action = 'preview' | 'metadata' | 'versions'

interface Props {
  asset: Asset
  onClose?: () => void
}

export default function AssetMenu({ asset, onClose }: Props) {
  const { url, name } = asset
  const [active, setActive] = useState<Action>('preview')
  const muted = { base: 'gray.600', _dark: 'gray.400' }

const versions = [
  {
    id: 2,
    label: "Version 2",
    editor: "Mike Editor",
    date: "October 17th, 2025 5:30 PM",
    size: "1.9 MB",
    note: "Updated based on feedback",
    isCurrent: true,
  },
  {
    id: 1,
    label: "Version 1",
    editor: "Mike Editor",
    date: "October 15th, 2025 5:30 PM",
    size: "9.9 MB",
    note: "Initial upload",
    isCurrent: false,
  },
];

  return (
    <Card.Root
      w="full"
      maxW="1100px"
      mx={0}
      h="auto"
      variant="outline"
      overflow="hidden"
      display="flex"
      alignItems="stretch"
      flexDirection={{ base: 'column', md: 'row' }}
    >
      <Image
        src={url}
        alt={name}
        objectFit="cover"
        w={{ base: '100%', md: '280px' }}
        maxH={{ base: '100%', md: '400px' }}
        flexShrink={0}
        alignSelf="stretch"
      />

      <Card.Body gap="2" flex="1" px={{ base: 3, md: 4 }} py={{ base: 3, md: 4 }}>
        <Flex w="full" align="center" justify="space-between" gap={3}>
          <HStack gap={3} align="center">
            <Box>
              <Card.Title>{name}</Card.Title>
              <Box color={muted} fontSize="sm">
                Company Asset
              </Box>
            </Box>
          </HStack>


          <HStack gap={2} align="center">
            <Box w="full" bg={{base: "gray.300", _dark: "gray.800"}} p={1} borderRadius="full">
              <SwitchView
                active={active}
                versionsCount={versions.length}
                onChange={(a) => setActive(a)}
              />
            </Box>

            <HStack gap={2}>
              <Button
                size="sm"
                color={{base: "black", _dark: "white"}}
                bg={{ base: 'whiteAlpha.200', _dark: 'whiteAlpha.400' }}
                borderColor={{ base: 'blackAlpha.500', _dark: 'whiteAlpha.600' }}
                _hover={{ bg: { base: 'gray.200', _dark: 'gray.500' } }}
                onClick={() => {
                  /* download action */
                  onClose?.()
                }}
              >
                <FiDownload />
              </Button>

              <Button
                size="sm"
                color={{base: "black", _dark: "white"}}
                bg= 'red.600'
                borderColor={{ base: 'blackAlpha.500', _dark: 'redAlpha.900' }}
                _hover={{ bg: { base: 'red.500', _dark: 'red.500' } }}
                onClick={() => {
                  /* delete action */
                  onClose?.()
                }}
              >
                <FiTrash />
              </Button>
            </HStack>
          </HStack>
        </Flex>

        <Box mt={4} w="full">
          {active === 'preview' && (
            <AssetPreview asset={asset}/>
          )}

          {active === 'metadata' && (
            <AssetMetadata metadata={asset.metadata} />
          )}

          {active === 'versions' && (
            <VersionHistory versions={versions} />
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  )
}