"use client";

import { Badge, Card, Flex, Skeleton, Stack, Text } from "@chakra-ui/react";
import type { DailyActivityMetric } from "./useInsightsData";

type DailyActivityCardProps = {
  data: DailyActivityMetric[];
  loading: boolean;
};

const formatDateLabel = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function DailyActivityCard({ data, loading }: DailyActivityCardProps) {
  return (
    <Card.Root w="full" h="full" display="flex" flexDirection="column" variant="outline">
      <Card.Header>
        <Card.Title>Recent Activity</Card.Title>
        <Card.Description>Uploads and updates over the last ten days.</Card.Description>
      </Card.Header>

      <Card.Body flex="1" minH={0} overflowY="auto" pr="1">
        {loading ? (
          <Stack gap="3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} h="7" rounded="md" />
            ))}
          </Stack>
        ) : data.length === 0 ? (
          <Text color="gray.500">No recent activity recorded.</Text>
        ) : (
          <Stack gap="4">
            {data.map((entry) => (
              <Flex key={entry.date} align="center" justify="space-between" gap="3">
                <Text fontWeight="medium">{formatDateLabel(entry.date)}</Text>
                <Stack direction="row" gap="2">
                  <Badge colorPalette="green" variant="subtle">
                    {entry.uploads} new
                  </Badge>
                  <Badge colorPalette="blue" variant="subtle">
                    {entry.updates} updated
                  </Badge>
                </Stack>
              </Flex>
            ))}
          </Stack>
        )}
      </Card.Body>
    </Card.Root>
  );
}
