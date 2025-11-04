"use client";

import { Box, Button, Flex, Grid, GridItem, Portal, Select, Stack, Text, createListCollection } from "@chakra-ui/react";
import { useState } from "react";

import PrivateRoute from "@/components/auth/PrivateRoute";
import Sidebar from "@/components/ui/Sidebar";
import Header from "@/components/ui/Header";
import AssetTypeSummaryCard from "@/components/Insights/AssetTypeSummaryCard";
import UserContributionCard from "@/components/Insights/UserContributionCard";
import DailyActivityCard from "@/components/Insights/DailyActivityCard";
import RecentAssetUpdatesCard from "@/components/Insights/RecentAssetUpdatesCard";
import {
  INSIGHTS_RANGE_OPTIONS,
  InsightsDateRange,
  useInsightsData,
} from "@/components/Insights/useInsightsData";

const RANGE_COLLECTION = createListCollection({
  items: INSIGHTS_RANGE_OPTIONS.map((option) => ({
    label: option.label,
    value: option.value,
  })),
});

function InsightsPage() {
  const [range, setRange] = useState<InsightsDateRange>("30d");
  const { loading, error, contributors, assetTypeStats, dailyActivity, assetUpdates, refresh } =
    useInsightsData(range);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <PrivateRoute roles={["admin"]} redirectTo="/dashboard">
      {(user) => (
        <Sidebar user={user}>
          <Stack
            gap={6}
            h={{ base: "auto", xl: "88vh" }}
            maxH={{ base: "none", xl: "full" }}
            overflow={{ base: "visible", xl: "hidden" }}
          >
            <Header title="Insights" description="View and analyze application data." />

            <Flex
              direction={{ base: "column", md: "row" }}
              align={{ base: "flex-start", md: "center" }}
              justify="space-between"
              gap={3}
            >
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                loading={isRefreshing}
                loadingText="Refreshing"
              >
                Refresh data
              </Button>
              <Stack direction={{ base: "column", md: "row" }} gap={2} align="flex-start" w={{ base: "full", md: "auto" }}>
                <Text fontSize="sm" color="gray.600">
                  Period
                </Text>
                <Select.Root
                  size="sm"
                  variant="outline"
                  collection={RANGE_COLLECTION}
                  value={[range]}
                  onValueChange={({ value }) => {
                    const [selected] = value;
                    if (selected) {
                      setRange(selected as InsightsDateRange);
                    }
                  }}
                  width={{ base: "full", md: "220px" }}
                  positioning={{ placement: "bottom-start", strategy: "fixed", gutter: 4 }}
                >
                  <Select.HiddenSelect aria-label="Select period" />
                  <Select.Control>
                    <Select.Trigger bg="transparent" _dark={{ borderColor: "gray.600" }}>
                      <Select.ValueText placeholder="Select period" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                      <Select.Indicator />
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Portal>
                    <Select.Positioner width="220px" zIndex={2000}>
                      <Select.Content>
                        {RANGE_COLLECTION.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            <Select.ItemText>{item.label}</Select.ItemText>
                            <Select.ItemIndicator />
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Positioner>
                  </Portal>
                </Select.Root>
              </Stack>
            </Flex>

            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}

            <Box
              flex="1"
              minH={0}
              maxH={{ base: "none", xl: "calc(100vh - 240px)" }}
              overflow="hidden"
            >
              <Grid
                h="100%"
                minH={0}
                gap={3}
                templateAreas={{
                  base: `"types" "updates" "activity" "contributions"`,
                  xl: `"types types updates" "activity contributions updates"`,
                }}
                templateColumns={{ base: "1fr", xl: "2fr 2fr 2fr" }}
                templateRows={{ base: "auto", xl: "auto 3fr" }}
              >
                <GridItem area="types" minH={0} display="flex">
                  <AssetTypeSummaryCard
                    data={assetTypeStats}
                    loading={loading && assetTypeStats.length === 0}
                  />
                </GridItem>
                <GridItem area="updates" minH={0} display="flex">
                  <RecentAssetUpdatesCard
                    data={assetUpdates}
                    loading={loading && assetUpdates.length === 0}
                  />
                </GridItem>
                <GridItem area="activity" minH={0} display="flex">
                  <DailyActivityCard
                    data={dailyActivity}
                    loading={loading && dailyActivity.length === 0}
                  />
                </GridItem>
                <GridItem area="contributions" minH={0} display="flex">
                  <UserContributionCard
                    data={contributors}
                    loading={loading && contributors.length === 0}
                  />
                </GridItem>
              </Grid>
            </Box>
          </Stack>
        </Sidebar>
      )}
    </PrivateRoute>
  );
}

export default InsightsPage;
