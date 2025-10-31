// VersionHistory.tsx
import {
  VStack,
  Box,
  Text,
  Flex,
  HStack,
  Avatar,
  Button,
  Badge,
  Icon,
  Collapsible,
} from "@chakra-ui/react";
import { FiDownload, FiEye } from "react-icons/fi";
import { useState } from "react";
import VersionPreview from "./VersionPreview";

interface Version {
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
}

interface VersionHistoryProps {
  versions: Version[];
}

export default function VersionHistory({ versions }: VersionHistoryProps) {
  const [previewId, setPreviewId] = useState<number | null>(null);

  return (
    <VStack align="start" w="full" gap={4}>
      <Text fontWeight="semibold" fontSize="lg">
        Version History ({versions.length})
      </Text>

      <VStack w="full" align="stretch" gap={3}>
        {versions.map((ver) => {
          const isPreviewOpen = previewId === ver.id;

          const snapshotAsset = ver.snapshot?.asset
            ? {
              // ── Real snapshot ──
              name: ver.snapshot.asset.name,
              description: ver.snapshot.asset.description ?? "",
              asset_type: ver.snapshot.asset.asset_type,

              uploaded_by: ver.uploaded_by,
              uploaded_at: ver.uploaded_at,
              size_bytes: ver.size_bytes,
              file_path: ver.file_path,

              tags: ver.snapshot.tags ?? [],
            }
            : {
              // ── Fallback when snapshot is null (uses file name) ──
              name: ver.file_path.split("/").pop()?.split(".").slice(0, -1).join(".") || "Untitled",
              description: "",
              asset_type: "unknown",
              uploaded_by: ver.uploaded_by,
              uploaded_at: ver.uploaded_at,
              size_bytes: ver.size_bytes,
              file_path: ver.file_path,
              tags: [] as string[],
            };

          return (
            <Box
              key={ver.id}
              w="full"
              p={4}
              bg={{ base: "gray.100", _dark: "gray.800" }}
              borderRadius="xl"
              boxShadow="sm"
            >
              <Flex justify="space-between" align="start" w="full">
                <HStack align="start" gap={4}>
                  <Avatar.Icon name={ver.uploaded_by} />

                  <VStack align="start" gap={1}>
                    <HStack>
                      <Text fontWeight="semibold">v{ver.version_number}</Text>
                      {ver.id === versions[0].id && (
                        <Badge colorScheme="blue" fontSize="xs">
                          Current
                        </Badge>
                      )}
                    </HStack>

                    <HStack gap={2} fontSize="sm" color="gray.500">
                      <Text>{ver.uploaded_by}</Text>
                      <Text>•</Text>
                      <Text>{new Date(ver.uploaded_at).toLocaleString()}</Text>
                      <Text>•</Text>
                      <Text>{ver.size_bytes ? `${(ver.size_bytes / 1024 / 1024).toFixed(1)} MB` : "—"}</Text>
                    </HStack>

                    <Text fontSize="sm" color="gray.600">
                      {ver.changes_note}
                    </Text>
                  </VStack>
                </HStack>

                <VStack align="end" gap={2}>
                  <Button size="sm" colorScheme="blue" >
                    <Icon as={FiDownload} /> Download
                  </Button>

                  <Button
                    size="xs"
                    variant={isPreviewOpen ? "solid" : "outline"}
                    colorScheme="teal"
                    onClick={() => setPreviewId(isPreviewOpen ? null : ver.id)}
                  >
                    <Icon as={FiEye} /> {isPreviewOpen ? "Hide" : "Preview"}
                  </Button>
                </VStack>
              </Flex>

              {/* Preview Collapse */}
              <Collapsible.Root open={isPreviewOpen}>
                <Collapsible.Content>
                  <Box mt={4} p={4} bg="white" _dark={{ bg: "gray.700" }} borderRadius="md">
                    <VersionPreview asset={snapshotAsset} />
                  </Box>
                </Collapsible.Content>
              </Collapsible.Root>
            </Box>
          );
        })}
      </VStack>
    </VStack>
  );
}