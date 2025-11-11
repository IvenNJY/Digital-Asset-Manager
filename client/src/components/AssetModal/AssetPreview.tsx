"use client";

import { useState, useEffect } from "react";
import {
  VStack,
  Box,
  Text,
  HStack,
  Badge,
  Button,
  Input,
  Textarea,
  Wrap,
} from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return match ? match.pop() : null;
}

type AssetType = {
  id?: number;
  asset_id?: number;
  name: string;
  description?: string;
  asset_type?: string;
  type?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  size_bytes?: number;
  folder?: string;
  file_path?: string;
  url?: string;
  tags?: string[];
};

export default function AssetPreview({ asset }: { asset: AssetType }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState<AssetType>(asset);
  const [size, setSize] = useState<number | undefined>(asset.size_bytes);
  const [newTag, setNewTag] = useState("");
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const muted = { base: "gray.600", _dark: "gray.400" };
  const mutedBg = { base: "gray.200", _dark: "whiteAlpha.200" };

  // Build canonical media URL (prefer asset.url, else construct from file_path)
  const buildMediaUrl = (a: AssetType) => {
    if (a.url) return a.url;
    if (a.file_path) {
      const base = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
      return `${base}/media/${a.file_path.replace(/^\/+/, "")}`;
    }
    return null;
  };

  // Determine whether item looks like a video by asset_type or extension
  const isVideoAsset = (a: AssetType, url?: string | null) => {
    const t = (a.asset_type ?? a.type ?? "").toString().toLowerCase();
    if (t.includes("video") || t.includes("mp4") || t.includes("mov") || t.includes("webm")) return true;
    if (typeof url === "string") {
      const ext = url.split(".").pop()?.toLowerCase() ?? "";
      if (["mp4", "webm", "ogg", "mov"].includes(ext)) return true;
    }
    return false;
  };

  // Robust media loader: same-origin -> use URL directly; cross-origin/protected -> fetch blob with credentials
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const loadPreview = async () => {
      const url = buildMediaUrl(asset);
      if (!url) {
        setPreviewSrc("/placeholder.png");
        return;
      }

      // detect same-origin (safe to use directly)
      let isSameOrigin = false;
      try {
        const u = new URL(url, typeof window !== "undefined" ? window.location.origin : undefined);
        if (typeof window !== "undefined" && u.host === window.location.host) isSameOrigin = true;
      } catch (e) {
        // if URL parse fails, assume same origin fallback
        isSameOrigin = true;
      }

      if (isSameOrigin) {
        if (!cancelled) setPreviewSrc(url);
        return;
      }

      // cross-origin: try fetching with credentials (for protected media)
      setPreviewLoading(true);
      try {
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) {
          console.warn("Asset preview fetch failed:", res.status, url);
          if (!cancelled) setPreviewSrc("/placeholder.png");
          return;
        }
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);
        if (!cancelled) setPreviewSrc(objectUrl);
      } catch (err) {
        console.error("Error fetching protected media:", err);
        if (!cancelled) setPreviewSrc("/placeholder.png");
      } finally {
        if (!cancelled) setPreviewLoading(false);
      }
    };

    loadPreview();

    return () => {
      cancelled = true;
      if (objectUrl) {
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (e) {
          /* ignore */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asset.asset_id, asset.id, asset.url, asset.file_path]);

  // Fetch tags (GET with credentials) — keep existing behavior
  useEffect(() => {
    const fetchAssetTags = async () => {
      const assetId = asset.asset_id ?? asset.id;
      if (!assetId) return;

      try {
        const res = await fetch(`http://localhost:8000/api/assets/${assetId}/tags/`, {
          method: "GET",
          headers: { Accept: "application/json" },
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setEditedAsset((prev) => ({ ...prev, tags: data.tags || [] }));
        } else if (res.status === 401) {
          console.error("Failed to fetch asset tags: 401 — Not authenticated. Please log in.");
        } else {
          console.error("Failed to fetch asset tags:", res.status);
        }
      } catch (err) {
        console.error("Error fetching asset tags:", err);
      }
    };
    fetchAssetTags();
  }, [asset.asset_id, asset.id]);

  // Fetch file size (unauthenticated HEAD)
  useEffect(() => {
    if (size !== undefined) return;
    const url = asset.url ?? (asset.file_path ? `/media/${asset.file_path}` : "");
    if (!url) return;

    const fetchSize = async () => {
      try {
        const res = await fetch(url, { method: "HEAD", credentials: "omit" });
        if (res.ok) {
          const contentLength = res.headers.get("Content-Length");
          if (contentLength) setSize(Number(contentLength));
        }
      } catch (error) {
        console.error("Failed to fetch asset size:", error);
      }
    };
    fetchSize();
  }, [asset.url, asset.file_path, size]);

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "Loading...";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) => (dateString ? new Date(dateString).toLocaleString() : "—");

  // Save handler + TOAST (PATCH with CSRF)
  const handleSave = async () => {
    try {
      const id = editedAsset.asset_id ?? editedAsset.id;
      if (!id) throw new Error("Asset ID is missing.");

      const csrftoken = getCookie("csrftoken");

      const res = await fetch(`http://localhost:8000/api/assets/${id}/`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrftoken ?? "",
        },
        body: JSON.stringify({
          name: editedAsset.name,
          description: editedAsset.description,
          asset_type: editedAsset.asset_type,
          tags: editedAsset.tags,
        }),
      });

      if (!res.ok) throw new Error("Failed to update asset");

      const updated = await res.json();
      setEditedAsset(updated);
      setIsEditing(false);

      toaster.success({
        title: "Edit saved",
        description: "Click refresh to see the latest data.",
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        },
      });
    } catch (err) {
      console.error("Error saving asset:", err);
      toaster.error({
        title: "Save failed",
        description: "Something went wrong. Check the console.",
      });
    }
  };

  // Tag helpers
  const handleAddTag = () => {
    const trimmed = newTag.trim();
    if (trimmed && !editedAsset.tags?.includes(trimmed)) {
      setEditedAsset({
        ...editedAsset,
        tags: [...(editedAsset.tags ?? []), trimmed],
      });
    }
    setNewTag("");
  };

  const handleRemoveTag = (tag: string) => {
    setEditedAsset({
      ...editedAsset,
      tags: editedAsset.tags?.filter((t) => t !== tag),
    });
  };

  const displayType = asset.asset_type ?? asset.type ?? "Unknown";
  const editableType = editedAsset.asset_type ?? editedAsset.type ?? "other";

  // Render
  return (
    <VStack align="start" w="full" gap={4}>
      {/* Preview area */}
      <Box w="full" bg={mutedBg} borderRadius="md" p={3} display="flex" justifyContent="center" alignItems="center">
        {previewLoading ? (
          <Text>Loading preview…</Text>
        ) : isVideoAsset(asset, previewSrc) ? (
          <video
            src={previewSrc ?? undefined}
            controls
            style={{ maxWidth: "100%", maxHeight: "60vh", borderRadius: 8 }}
          />
        ) : (
          <img
            src={previewSrc ?? "/placeholder.png"}
            alt={asset.name ?? "asset preview"}
            style={{ maxWidth: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: 8 }}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/placeholder.png";
            }}
          />
        )}
      </Box>

      {/* Description box */}
      {asset.description && !isEditing && (
        <Box w="full" bg={mutedBg} p={3} borderRadius="md">
          <Text color={muted}>{asset.description}</Text>
        </Box>
      )}

      {/* Main info */}
      <Box w="full" bg={mutedBg} p={4} borderRadius="md">
        <HStack justify="space-between" w="full" mb={2}>
          <Text fontWeight="semibold">Asset Information</Text>
          {!isEditing ? (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          ) : (
            <HStack>
              <Button size="sm" colorScheme="blue" onClick={handleSave}>
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditedAsset(asset);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </HStack>
          )}
        </HStack>

        <Box borderBottom="1px solid" borderColor="gray.300" my={2} w="full" />

        {!isEditing ? (
          <VStack align="start" gap={2}>
            <HStack>
              <Text fontWeight="medium">Type:</Text>
              <Badge colorScheme="blue" borderRadius="full" px={2}>
                {displayType}
              </Badge>
            </HStack>

            <HStack>
              <Text fontWeight="medium">File Name:</Text>
              <Text color={muted}>{asset.name}</Text>
            </HStack>

            {asset.folder && (
              <HStack>
                <Text fontWeight="medium">Folder:</Text>
                <Text color={muted}>{asset.folder}</Text>
              </HStack>
            )}

            <HStack>
              <Text fontWeight="medium">Size:</Text>
              <Text color={muted}>{formatSize(size)}</Text>
            </HStack>

            <HStack>
              <Text fontWeight="medium">Uploaded By:</Text>
              <Text color={muted}>{asset.uploaded_by}</Text>
            </HStack>

            <HStack>
              <Text fontWeight="medium">Uploaded At:</Text>
              <Text color={muted}>{formatDate(asset.uploaded_at)}</Text>
            </HStack>

            {asset.file_path && (
              <HStack>
                <Text fontWeight="medium">File Path:</Text>
                <Text color={muted}>{asset.file_path}</Text>
              </HStack>
            )}

            {/* Tags (read-only) */}
            <Box w="full">
              <Text fontWeight="medium">Tags:</Text>
              <Wrap mt={1}>
                {editedAsset.tags && editedAsset.tags.length ? (
                  editedAsset.tags.map((tag) => (
                    <Box key={tag} as="span" px={2} py={1} borderRadius="full" bg="green.100" fontSize="0.8rem" mr={2} mb={1}>
                      {tag}
                    </Box>
                  ))
                ) : (
                  <Text color={muted}>No tags</Text>
                )}
              </Wrap>
            </Box>
          </VStack>
        ) : (
          // EDIT VIEW
          <VStack align="start" gap={3}>
            <Box w="full">
              <Text fontWeight="medium">Name</Text>
              <Input size="sm" borderColor="gray.600" value={editedAsset.name} onChange={(e) => setEditedAsset({ ...editedAsset, name: e.target.value })} />
            </Box>

            <Box w="full">
              <Text fontWeight="medium">Description</Text>
              <Textarea size="sm" borderColor="gray.600" value={editedAsset.description ?? ""} onChange={(e) => setEditedAsset({ ...editedAsset, description: e.target.value })} />
            </Box>

            <Box w="full">
              <Text fontWeight="medium">Type</Text>
              <select
                name="asset_type"
                value={editableType}
                onChange={(e) => setEditedAsset({ ...editedAsset, asset_type: e.target.value, type: e.target.value })}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  border: "1px solid var(--chakra-colors-gray-600)",
                  color: "inherit",
                }}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="glb">3D Model (GLB)</option>
                <option value="other">Other</option>
              </select>
            </Box>

            {/* Tag editing box */}
            <Box w="full">
              <Text fontWeight="medium">Tags</Text>
              <Wrap mt={2}>
                {editedAsset.tags && editedAsset.tags.length ? (
                  editedAsset.tags.map((tag) => (
                    <Box key={tag} as="span" px={2} py={1} borderRadius="full" bg="green.100" display="inline-flex" alignItems="center" gap={2} mr={2} mb={1}>
                      <Text fontSize="0.85rem">{tag}</Text>
                      <Button size="xs" ml={2} onClick={() => handleRemoveTag(tag)}>x</Button>
                    </Box>
                  ))
                ) : (
                  <Text color={muted}>No tags</Text>
                )}
              </Wrap>
              <HStack mt={2}>
                <Input size="sm" placeholder="Add a tag" borderColor="gray.600" value={newTag} onChange={(e) => setNewTag(e.target.value)} />
                <Button size="sm" colorScheme="green" onClick={handleAddTag}>Add</Button>
              </HStack>
            </Box>
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
