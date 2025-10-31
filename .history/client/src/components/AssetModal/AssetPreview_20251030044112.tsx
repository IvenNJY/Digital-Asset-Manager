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
} from "@chakra-ui/react";

type AssetType = {
  name: string;
  description?: string;
  asset_type?: string;
  type?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  size_bytes?: number;
  folder?: string;
  file_path?: string;
  url?: string; // Added for fetching size
};


export default function AssetPreview({ asset }: { asset: AssetType }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAsset, setEditedAsset] = useState(asset);
  const [size, setSize] = useState<number | undefined>(asset.size_bytes);

  const muted = { base: "gray.600", _dark: "gray.400" };
  const mutedBg = { base: "gray.200", _dark: "whiteAlpha.200" };

  useEffect(() => {
    if (size !== undefined) return;

    const url = asset.url ?? (asset.file_path ? `/media/${asset.file_path}` : '');
    if (!url) return;

    const fetchSize = async () => {
      try {
        // Use HEAD request to get headers without downloading the file
        const res = await fetch(url, { method: 'HEAD', credentials: 'omit' });
        if (res.ok) {
          const contentLength = res.headers.get('Content-Length');
          if (contentLength) {
            setSize(Number(contentLength));
          }
        }
      } catch (error) {
        console.error("Failed to fetch asset size:", error);
      }
    };

    fetchSize();
  }, [asset.url, asset.file_path, size]);

  // Format size
  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "Loading...";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format date
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString();

  const handleSave = () => {
    console.log("Saved:", editedAsset);
    setIsEditing(false);
  };

  const displayType = asset.asset_type ?? asset.type ?? "Unknown";
  const editableType = editedAsset.asset_type ?? editedAsset.type ?? "other";

  return (
    <VStack align="start" w="full" gap={4}>
      {/* Description */}
      {asset.description && !isEditing && (
        <Box w="full" bg={mutedBg} p={3} borderRadius="md">
          <Text color={muted}>{asset.description}</Text>
        </Box>
      )}

      {/* Main Info Box */}
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
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
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
              <Text color={muted}>{formatDate(asset.uploaded_at ?? "")}</Text>
            </HStack>
            {asset.file_path && (
              <HStack>
                <Text fontWeight="medium">File Path:</Text>
                <Text color={muted}>{asset.file_path}</Text>
              </HStack>
            )}
          </VStack>
        ) : (
          <VStack align="start" gap={3}>
            <Box w="full">
              <Text fontWeight="medium">Name</Text>
              <Input
                size="sm"
                borderColor="gray.600"
                value={editedAsset.name}
                onChange={(e) =>
                  setEditedAsset({ ...editedAsset, name: e.target.value })
                }
              />
            </Box>
            <Box w="full">
              <Text fontWeight="medium">Description</Text>
              <Textarea
                size="sm"
                borderColor="gray.600"
                value={editedAsset.description || ""}
                onChange={(e) =>
                  setEditedAsset({
                    ...editedAsset,
                    description: e.target.value,
                  })
                }
              />
            </Box>
            <Box w="full">
                <Text fontWeight="medium">Type</Text>
                <select
                name="asset_type"
        value={editableType}
                onChange={(e) =>
                    setEditedAsset({
                    ...editedAsset,
                    asset_type: e.target.value,
          type: e.target.value,
                    })
                }
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
          </VStack>
        )}
      </Box>
    </VStack>
  );
}
