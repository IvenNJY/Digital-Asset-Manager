// VersionPreview.tsx
import {
  VStack,
  Box,
  Text,
  HStack,
  Badge,
  Tag,
  Wrap,
  Table,
} from "@chakra-ui/react";

interface VersionAsset {
  name: string;
  description?: string;
  asset_type: string;
  uploaded_by: string;
  uploaded_at: string;
  size_bytes?: number;
  file_path: string;
  tags: string[];
  metadata: Array<{ key: string; value: string; data_type: string }>;
}

export default function VersionPreview({ asset }: { asset: VersionAsset }) {
  const muted = { base: "gray.600", _dark: "gray.400" };
  const mutedBg = { base: "gray.200", _dark: "whiteAlpha.200" };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <VStack align="start" w="full" gap={4} minH="300px" maxH="90vh" overflowY="auto">
      {asset.description && (
        <Box w="full" bg={mutedBg} p={3} borderRadius="md">
          <Text color={muted}>{asset.description}</Text>
        </Box>
      )}

      <Box w="full" bg={mutedBg} p={4} borderRadius="md">
        <Text fontWeight="semibold" mb={2}>
          Asset Details
        </Text>

        <VStack align="start" gap={2}>
          <HStack>
            <Text fontWeight="medium">Name:</Text>
            <Text color={muted}>{asset.name}</Text>
          </HStack>

          <HStack>
            <Text fontWeight="medium">Type:</Text>
            <Badge colorScheme="blue" borderRadius="full" px={2}>
              {asset.asset_type}
            </Badge>
          </HStack>

          <HStack>
            <Text fontWeight="medium">Size:</Text>
            <Text color={muted}>{formatSize(asset.size_bytes)}</Text>
          </HStack>

          <HStack>
            <Text fontWeight="medium">Uploaded By:</Text>
            <Text color={muted}>{asset.uploaded_by}</Text>
          </HStack>

          <HStack>
            <Text fontWeight="medium">Uploaded At:</Text>
            <Text color={muted}>
              {new Date(asset.uploaded_at).toLocaleString()}
            </Text>
          </HStack>

          <Box w="full">
            <Text fontWeight="medium">Tags:</Text>
            <Wrap mt={1}>
              {asset.tags.length > 0 ? (
                asset.tags.map((tag) => (
                  <Tag.Root key={tag} size="sm" colorScheme="green" borderRadius="full">
                    <Tag.Label>{tag}</Tag.Label>
                  </Tag.Root>
                ))
              ) : (
                <Text color={muted}>No tags</Text>
              )}
            </Wrap>
          </Box>
        </VStack>
      </Box>

      {/* Metadata Table */}
      {asset.metadata.length > 0 && (
        <Box w="full" bg={mutedBg} p={4} borderRadius="md">
          <Text fontWeight="semibold" mb={2}>
            Metadata
          </Text>

          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Key</Table.ColumnHeader>
                <Table.ColumnHeader>Value</Table.ColumnHeader>
                <Table.ColumnHeader>Type</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {asset.metadata.map((item, index) => (
                <Table.Row key={index}>
                  <Table.Cell>{item.key}</Table.Cell>
                  <Table.Cell>{item.value}</Table.Cell>
                  <Table.Cell>{item.data_type}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      )}
    </VStack>
  );
}