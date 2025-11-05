"use client";

import { Badge, Card, Skeleton, Stack, Text } from "@chakra-ui/react";
import type { ContributorMetric } from "./useInsightsData";

type UserContributionCardProps = {
  data: ContributorMetric[];
  loading: boolean;
};

const formatRelativeTime = (input?: string) => {
  if (!input) return "Unknown";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.round(diffMs / (1000 * 60));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString();
};

export default function UserContributionCard({ data, loading }: UserContributionCardProps) {
  return (
    <Card.Root h="full" w="full" display="flex" flexDirection="column" variant="outline">
      <Card.Header>
        <Card.Title>User Contributions</Card.Title>
        <Card.Description>Upload volume by user for the chosen period.</Card.Description>
      </Card.Header>

      <Card.Body flex="1" minH={0} overflowY="auto" pr="1">
        {loading ? (
          <Stack gap="2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} h="8" rounded="md" />
            ))}
          </Stack>
        ) : data.length === 0 ? (
          <Text color="gray.500">No uploads have been recorded yet.</Text>
        ) : (
          <Stack gap="3">
            {data.map((contributor) => (
              <Stack key={contributor.user} gap="1" borderWidth="1px" borderRadius="md" padding="3">
                <Text fontWeight="medium">{contributor.user}</Text>
                <Badge colorPalette="green" variant="subtle" w="fit-content">
                  {contributor.uploads} {contributor.uploads === 1 ? "upload" : "uploads"}
                </Badge>
                <Text fontSize="sm" color="gray.500">
                  Last upload {formatRelativeTime(contributor.lastUpload)}
                </Text>
              </Stack>
            ))}
          </Stack>
        )}
      </Card.Body>
    </Card.Root>
  );
}
