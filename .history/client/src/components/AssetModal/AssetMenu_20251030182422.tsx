import React, { useState, useEffect } from 'react'
import {
  Card,
  Image,
  HStack,
  Button,
  Flex,
  Box,
  Spinner,
  Center,
  Text,
} from '@chakra-ui/react'
import { FiDownload, FiTrash } from 'react-icons/fi'
import SwitchView from './SwitchView' // relative path
import VersionHistory from './VersionHistory' // relative path
import AssetPreview from './AssetPreview' // relative path
import AssetMetadata from './AssetMetadata'

type Asset = {
  id: number;
  name: string;
  description?: string;
  type?: string;
  asset_type?: string;
  url: string;
  file_path?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  size_bytes?: number;
  metadata: Array<{
    key: string;
    value: string;
    data_type: string;
  }>;
  tags: string[];
  versions?: Array<{
    id: number;
    version_number: number;
    uploaded_by: string;
    uploaded_at: string;
    changes_note: string;
    file_path: string;
    size_bytes?: number;
    snapshot: {
      asset: {
        name: string;
        description?: string;
        asset_type: string;
      };
      metadata: Array<{ key: string; value: string; data_type: string }>;
      tags: string[];
    };
  }>;
};

type Action = 'preview' | 'metadata' | 'versions'

interface Props {
  asset: Asset
  onClose?: () => void
}

export default function AssetMenu({ asset, onClose }: Props) {
  const { url, name } = asset
  const [active, setActive] = useState<Action>('preview')
  const [versions, setVersions] = useState<Asset['versions']>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);
  const muted = { base: 'gray.600', _dark: 'gray.400' }

  // Fetch versions from Django
  useEffect(() => {
    const fetchVersions = async () => {
      try {
        setIsLoadingVersions(true);
        const res = await fetch(`http://localhost:8000/api/assets/${asset.id}/versions/`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setVersions(data.versions || []);
        } else {
          console.error('Failed to load versions:', res.status);
        }
      } catch (err) {
        console.error('Error fetching versions:', err);
      } finally {
        setIsLoadingVersions(false);
      }
    };

    if (active === 'versions') {
      fetchVersions();
    }
  }, [asset.id, active]);

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
            <Box w="full" bg={{ base: "gray.300", _dark: "gray.800" }} p={1} borderRadius="full">
              <SwitchView
                active={active}
                versionsCount={versions.length}
                onChange={(a) => setActive(a)}
              />
            </Box>

            <HStack gap={2}>
              <Button
                size="sm"
                color={{ base: "black", _dark: "white" }}
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
                color={{ base: "black", _dark: "white" }}
                bg='red.600'
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
            <AssetPreview asset={asset} />
          )}

          {active === 'metadata' && (
            <AssetMetadata assetId={asset.id} />
          )}

          {active === 'versions' && (
            <>
              {isLoadingVersions ? (
                <Center p={8}>
                  <Spinner size="lg" />
                </Center>
              ) : versions.length === 0 ? (
                <Center p={8}>
                  <Text color="gray.500">No version history yet.</Text>
                </Center>
              ) : (
                <VersionHistory versions={versions} />
              )}
            </>
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  )
}