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

type VersionAsset = {
  name: string;
  description?: string;
  asset_type?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  size_bytes?: number;
  file_path?: string;
  tags?: string[];
};

export default function VersionPreview({ asset }: { asset: VersionAsset }) {
  const muted = { base: "gray.600", _dark: "gray.400" };
  const mutedBg = { base: "gray.200", _dark: "whiteAlpha.200" };

  const formatSize = (bytes?: number) => {
    if (bytes === undefined) return "Unknown";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString?: string) =>
    dateString ? new Date(dateString).toLocaleString() : "—";

  const displayType = asset.asset_type ?? "Unknown";

  return (
    <VStack align="start" w="full" gap={4}>
      {/* Description */}
      {asset.description && (
        <Box w="full" bg={mutedBg} p={3} borderRadius="md">
          <Text color={muted}>{asset.description}</Text>
        </Box>
      )}

      {/* Main Info */}
      <Box w="full" bg={mutedBg} p={4} borderRadius="md">
        <Text fontWeight="semibold" mb={2}>
          Asset Information (Version Snapshot)
        </Text>

        <Box borderBottom="1px solid" borderColor="gray.300" my={2} w="full" />

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

          <HStack>
            <Text fontWeight="medium">Size:</Text>
            <Text color={muted}>{formatSize(asset.size_bytes)}</Text>
          </HStack>

          {asset.uploaded_by && (
            <HStack>
              <Text fontWeight="medium">Uploaded By:</Text>
              <Text color={muted}>{asset.uploaded_by}</Text>
            </HStack>
          )}

          {asset.uploaded_at && (
            <HStack>
              <Text fontWeight="medium">Uploaded At:</Text>
              <Text color={muted}>{formatDate(asset.uploaded_at)}</Text>
            </HStack>
          )}

          {asset.file_path && (
            <HStack>
              <Text fontWeight="medium">File Path:</Text>
              <Text color={muted}>{asset.file_path}</Text>
            </HStack>
          )}

          {/* Tags */}
          <Box w="full">
            <Text fontWeight="medium">Tags:</Text>
            <Wrap mt={1}>
              {asset.tags?.length ? (
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