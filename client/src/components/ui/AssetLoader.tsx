import React, { useEffect, useState } from 'react'
import { SimpleGrid, Text } from '@chakra-ui/react'
import AssetPopover from '../AssetModal/AssetPopover'

interface AssetLoaderProps {
  view: 'grid' | 'list'
  searchQuery?: string
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
}

const backendBase = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8000').replace(/\/$/, '')

const buildUrl = (path: string) => {
  if (!path) return ''

  return `${backendBase}/media/${path}`
}

function AssetLoader({ view, searchQuery = '' }: AssetLoaderProps) {
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadAssets = async () => {
      try {
        const response = await fetch('/api/assets/list', {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        })

        if (!response.ok) {
          throw new Error('Failed to load assets')
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

    return () => {
      isMounted = false
    }
  }, [])

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredAssets = normalizedQuery
    ? assets.filter(({ name, description, type }) => {
        const haystack = `${name} ${description} ${type}`.toLowerCase()
        return haystack.includes(normalizedQuery)
      })
    : assets

  if (loading) {
    return <Text fontSize="sm">Loading assets…</Text>
  }

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