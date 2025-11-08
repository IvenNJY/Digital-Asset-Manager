import React, { useEffect, useState } from 'react'
import { SimpleGrid, Text, Box } from '@chakra-ui/react'
import AssetPopover from '../AssetModal/AssetPopover'
import ViewType from '../AssetFiltering/ViewType'
import { ViewMode } from '../AssetFiltering/ViewType'

interface AssetLoaderProps {
  view: 'grid' | 'list';
  searchQuery?: string;
  selectedCategory?: 'all' | 'images' | 'videos' | 'documents' | 'glb' | 'others'; // 👈 add this
  folderId?: number; // optional filter by folder
}

type ApiAsset = {
  asset_id: number
  name: string
  asset_type: string
  file_path: string
  description: string
  uploaded_by?: string
  uploaded_at?: string
  size_bytes?: number
  current_version_info?: {
    file_path?: string
    uploaded_by?: string
    uploaded_at?: string
    size_bytes?: number
  }
  metadata?: Array<{
    field_name?: string
    data_type?: string
    value?: string
  }>
  tags?: string[]
  // comes from AssetSerializer.folder_mappings
  folders?: Array<{
    folder: number
    folder_name?: string
  }>
}

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
  folderIds?: number[]
}

const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')

const buildUrl = (path: string) => {
  if (!path) return ''
  return `${backendBase}/media/${path}`
}

function AssetLoader({ view, searchQuery = '', selectedCategory = 'all', folderId }: AssetLoaderProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  // preview is handled inside AssetMenu; no preview state needed here
  const [currentView, setCurrentView] = useState<'grid' | 'list'>(view)
  
  useEffect(() => {
    let isMounted = true

    const loadAssets = async () => {
      try {
        const response = await fetch('/api/assets/list', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          throw Error('Failed to load assets')
        }

        const data = (await response.json()) as { assets?: ApiAsset[] }
        if (!isMounted) return

        const parsed = (data.assets ?? []).map<Asset>((item) => {
          const versionInfo = item.current_version_info
          const source = versionInfo?.file_path ?? item.file_path ?? ''
          return {
            id: item.asset_id,
            name: item.name || 'Untitled asset',
            description: item.description || '',
            type: item.asset_type || 'unknown',
            url: buildUrl(source),
            file_path: source || undefined,
            uploaded_by: versionInfo?.uploaded_by ?? item.uploaded_by,
            uploaded_at: versionInfo?.uploaded_at ?? item.uploaded_at,
            size_bytes: versionInfo?.size_bytes ?? item.size_bytes,
            metadata: (item.metadata ?? []).map((meta) => ({
              key: meta.field_name ?? '',
              value: meta.value ?? '',
              data_type: meta.data_type ?? 'string',
            })),
            tags: item.tags ?? [],
            folderIds: (item.folders ?? []).map((f) => f.folder),
          }
        })

        setAssets(parsed)
      } catch (error) {
        console.error('Asset load failed:', error)
        if (isMounted) {
          setAssets([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadAssets()
    return () => { isMounted = false }
  }, [])

  const normalizedQuery = searchQuery.trim().toLowerCase()

  const filteredAssets = assets.filter(asset => {
    // Filter by search query
    const matchesQuery = normalizedQuery
      ? `${asset.name} ${asset.description} ${asset.type} ${asset.tags.join(' ')}`.toLowerCase().includes(normalizedQuery)
      : true

    // Filter by selected category from sidebar
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'images' && asset.type === 'image') ||
      (selectedCategory === 'videos' && asset.type === 'video') ||
      (selectedCategory === 'documents' && asset.type === 'document') ||
      (selectedCategory === 'glb' && asset.type === 'glb') ||
      (selectedCategory === 'others' && !['image', 'video', 'document', 'glb'].includes(asset.type))

    // Filter by folder if provided
    const matchesFolder =
      typeof folderId === 'number'
        ? (asset.folderIds ?? []).includes(folderId)
        : true

    return matchesQuery && matchesCategory && matchesFolder
  })

  if (loading) return <Text fontSize="sm">Loading assets…</Text>
  if (filteredAssets.length === 0) return <Text fontSize="sm">No assets match your search.</Text>

  return (
    <Box>
      {filteredAssets.length > 0 && (
        <Box mb={4}>
          <ViewType
            assetCount={filteredAssets.length}
            totalAssetCount={assets.length}
            initialView={currentView}
            onChange={(view: ViewMode) => setCurrentView(view)}
          />
        </Box>
      )}

      <SimpleGrid
        columns={currentView === 'list' ? { base: 1 } : { base: 1, sm: 2, lg: 3, xl: 5 }}
        gap={{ base: 4, md: 3 }}
        w="full"
      >
        {filteredAssets.map((asset) => (
          <AssetPopover
            key={asset.id}
            asset={asset}
            view={currentView}
            onPreview={() => {}}
          />
        ))}
      </SimpleGrid>
    </Box>
  )
}

export default AssetLoader
