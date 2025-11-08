// VersionHistory.tsx
"use client";

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
  Table,
} from "@chakra-ui/react";
import { FiDownload, FiEye } from "react-icons/fi";
import { useState } from "react";
import { toaster } from "@/components/ui/toaster"; 
import VersionPreview from "./VersionPreview";

interface Version {
  version_id: number;
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
  } | null;
}

interface VersionHistoryProps {
  versions: Version[];
}

export default function VersionHistory({ versions }: VersionHistoryProps) {
  const [previewId, setPreviewId] = useState<number | null>(null);

  const handleDownload = async (version: Version) => {
    const fileName = version.file_path.split("/").pop() || `version-${version.version_number}`;
    const fileUrl = `http://localhost:8000/media/${version.file_path}`; // Adjust if needed

    try {
      // Show "Downloading…" toast
      toaster.create({
        title: "Downloading…",
        type: "info",
      });

      const response = await fetch(fileUrl, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // Success toast
      toaster.create({
        title: "Download complete",
        type: "success",
      });
    } catch (err) {
      // Error toast
      toaster.create({
        title: "Download failed",
        description: "Please try again.",
        type: "error",
      });
    }
  };

  return (
    <VStack align="start" w="full" gap={4} minH="300px" maxH="90vh" overflowY="auto">
      <Text fontWeight="semibold" fontSize="lg">
        Version History ({versions.length})
      </Text>

      <VStack w="full" align="stretch" gap={3}>
        {versions.map((ver) => {
          const isPreviewOpen = previewId === ver.version_id;

          const snapshotAsset = ver.snapshot?.asset
            ? {
                name: ver.snapshot.asset.name,
                description: ver.snapshot.asset.description ?? "",
                asset_type: ver.snapshot.asset.asset_type,
                uploaded_by: ver.uploaded_by,
                uploaded_at: ver.uploaded_at,
                size_bytes: ver.size_bytes,
                file_path: ver.file_path,
                tags: ver.snapshot.tags ?? [],
                metadata: ver.snapshot.metadata ?? [],
              }
            : {
                name:
                  ver.file_path.split("/").pop()?.split(".").slice(0, -1).join(".") ||
                  "Untitled",
                description: "",
                asset_type: "unknown",
                uploaded_by: ver.uploaded_by,
                uploaded_at: ver.uploaded_at,
                size_bytes: ver.size_bytes,
                file_path: ver.file_path,
                tags: [] as string[],
                metadata: [] as Array<{ key: string; value: string; data_type: string }>,
              };

          return (
            <Box
              key={ver.version_id}
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
                      {ver.version_id === versions[0].version_id && (
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
                      <Text>
                        {ver.size_bytes
                          ? `${(ver.size_bytes / 1024 / 1024).toFixed(1)} MB`
                          : "—"}
                      </Text>
                    </HStack>

                    <Text fontSize="sm" color="gray.600">
                      {ver.changes_note}
                    </Text>
                  </VStack>
                </HStack>

                <VStack align="end" gap={2}>
                  {/* DOWNLOAD BUTTON */}
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleDownload(ver)}
                  >
                    <Icon as={FiDownload} /> Download
                  </Button>

                  <Button
                    size="xs"
                    variant={isPreviewOpen ? "solid" : "outline"}
                    colorScheme="teal"
                    onClick={() => setPreviewId(isPreviewOpen ? null : ver.version_id)}
                  >
                    <Icon as={FiEye} /> {isPreviewOpen ? "Hide" : "Preview"}
                  </Button>
                </VStack>
              </Flex>

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