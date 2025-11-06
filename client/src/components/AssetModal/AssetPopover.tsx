import React, { useEffect, useMemo, useState } from "react"
import { Popover, Box, Portal } from "@chakra-ui/react"
import AssetCard from "../ui/AssetCard"
import AssetMenu from "./AssetMenu"

interface AssetPopoverProps {
  asset: {
    id: number
    name: string
    description: string
    type: string
    url?: string
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
  view: "grid" | "list"
}

/**
 * Helper inside this file to provide a safe image src for assets.
 * - Prefers asset.url if present.
 * - Otherwise constructs from file_path using NEXT_PUBLIC_API_URL or localhost.
 * - If cross-origin or protected, fetches with credentials and creates a blob URL.
 * - Falls back to /placeholder.png on failure.
 */
function useAssetThumbnail(asset: AssetPopoverProps["asset"]) {
  const [src, setSrc] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const builtUrl = useMemo(() => {
    // Prefer absolute url from API if present
    if (asset.url) return asset.url
    if (asset.file_path) {
      const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "")
      return `${base}/media/${asset.file_path.replace(/^\/+/, "")}`
    }
    return null
  }, [asset.url, asset.file_path])

  useEffect(() => {
    let cancelled = false
    let objectUrl: string | null = null

    const load = async () => {
      if (!builtUrl) {
        setSrc("/placeholder.png")
        return
      }

      // If URL likely same-origin, just use it directly (faster)
      let isSameOrigin = false
      try {
        const u = new URL(builtUrl, typeof window !== "undefined" ? window.location.origin : undefined)
        if (typeof window !== "undefined" && u.host === window.location.host) isSameOrigin = true
      } catch (e) {
        // if URL construction fails, fallback to using it directly
        isSameOrigin = true
      }

      if (isSameOrigin) {
        setSrc(builtUrl)
        return
      }

      // cross-origin: attempt authenticated fetch (include cookies)
      setLoading(true)
      try {
        const res = await fetch(builtUrl, { credentials: "include" })
        if (!res.ok) {
          console.warn("Asset thumbnail fetch failed:", res.status, builtUrl)
          if (!cancelled) setSrc("/placeholder.png")
          return
        }
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        if (!cancelled) setSrc(objectUrl)
      } catch (err) {
        console.error("Error fetching asset thumbnail:", err)
        if (!cancelled) setSrc("/placeholder.png")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl)
        } catch (e) {
          /* ignore */
        }
      }
    }
  }, [builtUrl])

  return { src: src ?? "/placeholder.png", loading }
}

function AssetPopover({ asset, view }: AssetPopoverProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { src: thumbnailSrc } = useAssetThumbnail(asset)

  return (
    <Popover.Root
      open={isOpen}
      onOpenChange={(e) => setIsOpen(e.open)}
      positioning={{ strategy: "fixed", hideWhenDetached: true }}
    >
      <Popover.Trigger>
        <Box display="block" w="100%" p={0} bg="transparent" border="none" cursor="pointer">
          <AssetCard
            view={view}
            url={thumbnailSrc}
            name={asset.name}
            description={asset.description}
            asset_type={asset.type}
            uploaded_by={asset.uploaded_by}
            uploaded_at={asset.uploaded_at}
            tags={asset.tags}
          />
        </Box>
      </Popover.Trigger>

      <Portal>
        {/* Dark overlay when open */}
        {isOpen && <Box position="fixed" inset={0} bg="blackAlpha.700" zIndex="overlay" transition="opacity 0.2s ease" />}

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
          bg={{ base: "gray.200", _dark: "gray.900" }}
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
