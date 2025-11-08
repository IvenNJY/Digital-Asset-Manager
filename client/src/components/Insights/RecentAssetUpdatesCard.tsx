"use client";

import { Badge, Card, Skeleton, Stack, Text } from "@chakra-ui/react";
import type { AssetUpdateDetail } from "./useInsightsData";

const formatTimestamp = (value?: string | null) => {
  if (!value) return "Unknown";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
};

type RecentAssetUpdatesCardProps = {
  data: AssetUpdateDetail[];
  loading: boolean;
};

export default function RecentAssetUpdatesCard({ data, loading }: RecentAssetUpdatesCardProps) {
  return (
    <Card.Root h="full" w="full" display="flex" flexDirection="column" variant="outline">
      <Card.Header>
        <Card.Title>Recent Version Updates</Card.Title>
        <Card.Description>Latest edits and new versions across the selected period.</Card.Description>
      </Card.Header>

      <Card.Body flex="1" minH={0} overflowY="auto" pr="1">
        {loading ? (
          <Stack gap="3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} h="10" rounded="md" />
            ))}
          </Stack>
        ) : data.length === 0 ? (
          <Text color="gray.500">No version updates recorded for this timeframe.</Text>
        ) : (
          <Stack gap="4">
            {data.map((update) => (
              <Stack key={`${update.assetId}-${update.versionNumber}-${update.uploadedAt}`} gap="1">
                <Text fontWeight="medium">{update.assetName}</Text>
                <Text fontSize="sm" color="gray.600">
                  Version {update.versionNumber} · {update.uploadedBy || "Unknown user"}
                </Text>
                {update.changesNote ? (
                  <Badge colorPalette="gray" variant="subtle" w="fit-content">
                    {update.changesNote}
                  </Badge>
                ) : (
                  <Text fontSize="sm" color="gray.500">
                    No change note provided.
                  </Text>
                )}
                <Text fontSize="xs" color="gray.500">
                  {formatTimestamp(update.uploadedAt)}
                </Text>
              </Stack>
            ))}
          </Stack>
        )}
      </Card.Body>
    </Card.Root>
  );
}
