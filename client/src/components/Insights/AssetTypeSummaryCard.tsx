"use client";

import { Box, Card, Skeleton, Stack, Text } from "@chakra-ui/react";
import type { AssetTypeMetric } from "./useInsightsData";

type AssetTypeSummaryCardProps = {
  data: AssetTypeMetric[];
  loading: boolean;
};

const numberFormatter = new Intl.NumberFormat();

const formatLabel = (value: string) => {
  const cleaned = value.replace(/[_-]/g, " ").trim();
  if (!cleaned) return "Unknown";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

export default function AssetTypeSummaryCard({ data, loading }: AssetTypeSummaryCardProps) {
  const total = data.reduce((acc, item) => acc + item.count, 0);

  return (
    <Card.Root h="full" w="full" display="flex" flexDirection="column" variant="outline">

      <Card.Body flex="1" minH={0} overflow="hidden">
        {loading ? (
          <Stack gap="2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} h="10" rounded="md" />
            ))}
          </Stack>
        ) : data.length === 0 ? (
          <Text color="gray.500">No assets available for the selected period.</Text>
        ) : (
          <Box overflowX="auto" h="full" paddingBottom="1">
            <Stack
              direction="row"
              gap="3"
              align="stretch"
              minW="max-content"
              pr="1"
            >
              {data.map((stat) => {
                const percent = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                return (
                  <Stack
                    key={stat.type}
                    gap="1"
                    borderWidth="1px"
                    borderRadius="lg"
                    padding="4"
                    minW="220px"
                    bg="gray.50"
                    _dark={{ bg: "gray.800", borderColor: "gray.700" }}
                  >
                    <Text fontSize="xs" textTransform="uppercase" letterSpacing="wide" color="gray.600" _dark={{ color: "gray.300" }}>
                      {formatLabel(stat.type)}
                    </Text>
                    <Text fontSize={{ base: "xl", md: "3xl" }} fontWeight="semibold">
                      {numberFormatter.format(stat.count)}
                    </Text>
                    <Text fontSize="sm" color="gray.500" _dark={{ color: "gray.400" }}>
                      {percent}% of assets this period
                    </Text>
                  </Stack>
                );
              })}
            </Stack>
          </Box>
        )}
      </Card.Body>
    </Card.Root>
  );
}
