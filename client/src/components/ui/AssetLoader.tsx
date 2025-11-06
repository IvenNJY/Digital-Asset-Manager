"use client"

import React, { useEffect, useState } from "react"
import { SimpleGrid, Text } from "@chakra-ui/react"
import AssetPopover from "../AssetModal/AssetPopover"

interface AssetLoaderProps {
  view: "grid" | "list"
  searchQuery?: string
}

type ApiAsset = {
  asset_id?: number
  id?: number
  name?: string
  asset_type?: string
  uploaded_at?: string
  description?: string
  tags?: string[]           // case: ["nature","product"]
  asset_tags?: any[]        // case: [{tag:{name:"..."}}, ...]
  [k: string]: any
}

export default function AssetLoader({ view, searchQuery = "" }: AssetLoaderProps) {
  const [allAssets, setAllAssets] = useState<ApiAsset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<ApiAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterParams, setFilterParams] = useState<{ category?: string[]; categories?: string[]; tags: string[]; start?: string; end?: string }>({
    tags: [],
  })

  // parse query string produced by FilterMenu. Accept both "category" and "categories"
  const parseParams = (q: string) => {
    const p = new URLSearchParams(q)
    const catSingle = p.get("category")
    const catMulti = (p.get("categories") || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
    const categories = catSingle ? [catSingle, ...catMulti].filter(Boolean) : catMulti
    const tags = (p.get("tags") || "")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.toLowerCase())
    const start = p.get("start_date") || undefined
    const end = p.get("end_date") || undefined
    return { categories, tags, start, end }
  }

  // fetch all assets once
  useEffect(() => {
    let cancelled = false
    const fetchAssets = async () => {
      setLoading(true)
      setError(null)
      try {
        console.log("[AssetLoader] fetching /api/assets/list/ ...")
        const res = await fetch("/api/assets/list/", {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "include",
        })
        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
        }
        const data = await res.json()
        const items = (data && data.assets) ? data.assets : (Array.isArray(data) ? data : [])
        // normalize tags to lowercase strings
        const normalized = items.map((it: any) => {
          let tags: string[] = []
          if (Array.isArray(it.tags)) {
            tags = it.tags.flatMap((t: any) => (typeof t === "string" ? [t] : t?.name ? [t.name] : []))
          } else if (Array.isArray(it.asset_tags)) {
            tags = it.asset_tags.flatMap((at: any) => (at?.tag?.name ? [at.tag.name] : typeof at === "string" ? [at] : []))
          }
          tags = Array.from(new Set(tags.map((t) => String(t).toLowerCase())))
          const asset_type = it.asset_type ?? it.type ?? it.kind ?? ""
          return { ...it, tags, asset_type: String(asset_type).toLowerCase() }
        })
        if (!cancelled) {
          console.log(`[AssetLoader] loaded ${normalized.length} assets (first sample):`, normalized.slice(0,1))
          setAllAssets(normalized)
          setFilteredAssets(normalized)
        }
      } catch (err: any) {
        console.error("[AssetLoader] fetch error:", err)
        if (!cancelled) setError(err.message ?? "Failed to load assets")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAssets()
    return () => {
      cancelled = true
    }
  }, [])

  // main filter application (searchQuery + filterParams)
  useEffect(() => {
    const q = (searchQuery || "").trim().toLowerCase()
    const result = allAssets.filter((a) => {
      // 1) search
      if (q) {
        const hay = ((a.name ?? "") + " " + (a.description ?? "")).toLowerCase()
        if (!hay.includes(q)) return false
      }
      // 2) category/categories
      const paramCats = (filterParams.categories ?? filterParams.category ?? []).map(String).map(s => s.toLowerCase()).filter(Boolean)
      if (paramCats.length) {
        const atype = (a.asset_type ?? "").toLowerCase()
        if (!paramCats.includes(atype)) return false
      }
      // 3) tags (ANY match)
      if (filterParams.tags && filterParams.tags.length) {
        const aset = (a.tags || []).map(String).map(s => s.toLowerCase())
        const hasAny = filterParams.tags.some(t => aset.includes(t))
        if (!hasAny) return false
      }
      // 4) date range
      if (filterParams.start || filterParams.end) {
        if (!a.uploaded_at) return false
        const uploaded = new Date(a.uploaded_at)
        if (filterParams.start) {
          const s = new Date(filterParams.start)
          if (uploaded < s) return false
        }
        if (filterParams.end) {
          const e = new Date(filterParams.end)
          e.setHours(23,59,59,999)
          if (uploaded > e) return false
        }
      }
      return true
    })
    console.log("[AssetLoader] applying filters", filterParams, "-> matched:", result.length)
    setFilteredAssets(result)
  }, [allAssets, searchQuery, filterParams])

  // listen for filtersApplied event
  useEffect(() => {
    const handler = (e: Event) => {
      // ts-ignore for detail
      // @ts-ignore
      const params = (e as any)?.detail?.params ?? ""
      console.log("[AssetLoader] received filtersApplied event with params:", params)
      const parsed = parseParams(params)
      console.log("[AssetLoader] parsed params:", parsed)
      setFilterParams({
        categories: parsed.categories,
        tags: parsed.tags,
        start: parsed.start,
        end: parsed.end,
      })
    }
    window.addEventListener("filtersApplied", handler as EventListener)
    return () => window.removeEventListener("filtersApplied", handler as EventListener)
  }, [])

  // apply initial URL params if present
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const q = url.searchParams.toString()
      if (q) {
        console.log("[AssetLoader] found initial URL params:", q)
        const parsed = parseParams(q)
        setFilterParams({
          categories: parsed.categories,
          tags: parsed.tags,
          start: parsed.start,
          end: parsed.end,
        })
      }
    } catch (e) {
      /* ignore */
    }
  }, [])

  if (loading) return <Text>Loading assets…</Text>
  if (error) return <Text color="red.500">Error: {error}</Text>
  if (!filteredAssets.length) return <Text color="gray.500">No assets found.</Text>

  return (
    <SimpleGrid
      columns={view === "list" ? { base: 1 } : { base: 1, sm: 2, lg: 3, xl: 5 }}
      gap={{ base: 4, md: 3 }}
      w="full"
    >
      {filteredAssets.map((asset) => (
        <AssetPopover key={asset.asset_id ?? asset.id} asset={asset as any} view={view} />
      ))}
    </SimpleGrid>
  )
}
