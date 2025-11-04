"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export type AssetRecord = {
  asset_id: number;
  name: string;
  asset_type: string;
  uploaded_by?: string | null;
  uploaded_at?: string | null;
  current_version_info?: {
    version_number?: number | null;
    uploaded_at?: string | null;
  } | null;
};

export type ContributorMetric = {
  user: string;
  uploads: number;
  lastUpload?: string;
};

export type AssetTypeMetric = {
  type: string;
  count: number;
};

export type DailyActivityMetric = {
  date: string;
  uploads: number;
  updates: number;
};

export type VersionEvent = {
  assetId: number;
  assetName: string;
  versionNumber: number;
  uploadedBy?: string | null;
  uploadedAt?: string | null;
  changesNote?: string | null;
};

export type AssetUpdateDetail = VersionEvent;

type VersionResponse = {
  version_number?: number | null;
  uploaded_by?: string | null;
  uploaded_at?: string | null;
  changes_note?: string | null;
};

export type InsightsDateRange = "7d" | "30d" | "90d" | "all";

export const INSIGHTS_RANGE_OPTIONS: Array<{ value: InsightsDateRange; label: string }> = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

type InsightState = {
  loading: boolean;
  error?: string;
  refreshedAt?: Date;
  contributors: ContributorMetric[];
  assetTypeStats: AssetTypeMetric[];
  dailyActivity: DailyActivityMetric[];
  assetUpdates: AssetUpdateDetail[];
  refresh: () => Promise<void>;
};

type AssetListResponse = {
  assets?: AssetRecord[];
} | AssetRecord[];

const normaliseDate = (input?: string | null) => {
  if (!input) return undefined;
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
};

const getRangeStart = (range: InsightsDateRange) => {
  if (range === "all") return undefined;
  const now = new Date();
  const start = new Date(now);
  const offsets: Record<Exclude<InsightsDateRange, "all">, number> = {
    "7d": 6,
    "30d": 29,
    "90d": 89,
  };
  start.setDate(now.getDate() - offsets[range]);
  start.setHours(0, 0, 0, 0);
  return start;
};

const parseAssetList = (payload: AssetListResponse): AssetRecord[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.assets)) return payload.assets;
  return [];
};

const withinRange = (iso?: string | null, start?: Date) => {
  if (!start) return true;
  if (!iso) return false;
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return false;
  return parsed >= start;
};

export function useInsightsData(range: InsightsDateRange): InsightState {
  const [assets, setAssets] = useState<AssetRecord[]>([]);
  const [versionEvents, setVersionEvents] = useState<VersionEvent[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [error, setError] = useState<string>();
  const [refreshedAt, setRefreshedAt] = useState<Date>();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchAssets = useCallback(async (signal?: AbortSignal) => {
    if (isMounted.current) {
      setLoadingAssets(true);
      setError(undefined);
      setVersionEvents([]);
    }

    try {
      const response = await fetch(`${BACKEND_URL}/api/assets/list/`, {
        credentials: "include",
        headers: { Accept: "application/json" },
        signal,
      });
      if (!response.ok) {
        throw new Error(`Failed to load assets (status ${response.status})`);
      }

      const payload: AssetListResponse = await response.json();
      if (!signal?.aborted && isMounted.current) {
        setAssets(parseAssetList(payload));
        setRefreshedAt(new Date());
      }
    } catch (err) {
      const domError = err as DOMException;
      if (domError?.name === "AbortError" || signal?.aborted) {
        return;
      }
      if (isMounted.current) {
        setError((err as Error)?.message ?? "Unable to load insights data.");
        setAssets([]);
        setVersionEvents([]);
      }
    } finally {
      if (!signal?.aborted && isMounted.current) {
        setLoadingAssets(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAssets(controller.signal);
    return () => controller.abort();
  }, [fetchAssets]);

  useEffect(() => {
    if (!assets.length) {
      setVersionEvents([]);
      return;
    }

    const controller = new AbortController();

    const loadVersions = async () => {
      if (isMounted.current) {
        setLoadingVersions(true);
      }

      const versionRequests = assets.map(async (asset) => {
        try {
          const res = await fetch(`${BACKEND_URL}/api/assets/${asset.asset_id}/versions/`, {
            credentials: "include",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          });
          if (!res.ok) return [] as VersionEvent[];
          const payload = await res.json();
          const versions: VersionResponse[] = Array.isArray(payload?.versions)
            ? payload.versions
            : [];
          return versions.map((version) => ({
            assetId: asset.asset_id,
            assetName: asset.name,
            versionNumber: version?.version_number ?? 0,
            uploadedBy: version?.uploaded_by ?? null,
            uploadedAt: version?.uploaded_at ?? null,
            changesNote: version?.changes_note ?? null,
          }));
        } catch (err) {
          const domError = err as DOMException;
          if (domError?.name === "AbortError" || controller.signal.aborted) {
            return [];
          }
          console.error("Failed to load versions for asset", asset.asset_id, err);
          return [];
        }
      });

      const aggregated = (await Promise.all(versionRequests)).flat();

      if (!controller.signal.aborted && isMounted.current) {
        setVersionEvents(aggregated);
      }

      if (isMounted.current) {
        setLoadingVersions(false);
      }
    };

    loadVersions();

    return () => {
      controller.abort();
    };
  }, [assets]);

  const rangeStart = useMemo(() => getRangeStart(range), [range]);

  const metrics = useMemo(() => {
    const contributorMap = new Map<string, { uploads: number; lastUpload?: string }>();
    const typeMap = new Map<string, number>();
    const dailyMap = new Map<string, { uploads: number; updates: number }>();

    const filteredAssets = assets.filter((asset) => withinRange(asset.uploaded_at, rangeStart));
    const filteredVersionEvents = versionEvents.filter((event) => withinRange(event.uploadedAt, rangeStart));

    filteredAssets.forEach((asset) => {
      const uploader = asset.uploaded_by?.trim() || "Unknown";
      const uploadDateKey = normaliseDate(asset.uploaded_at);

      const contributor = contributorMap.get(uploader) ?? { uploads: 0 };
      contributor.uploads += 1;
      if (asset.uploaded_at) {
        if (!contributor.lastUpload || new Date(asset.uploaded_at) > new Date(contributor.lastUpload)) {
          contributor.lastUpload = asset.uploaded_at;
        }
      }
      contributorMap.set(uploader, contributor);

      const type = asset.asset_type || "unknown";
      typeMap.set(type, (typeMap.get(type) ?? 0) + 1);

      if (uploadDateKey) {
        const daily = dailyMap.get(uploadDateKey) ?? { uploads: 0, updates: 0 };
        daily.uploads += 1;
        dailyMap.set(uploadDateKey, daily);
      }
    });

    filteredVersionEvents.forEach((event) => {
      if (!event.uploadedAt) return;
      if (event.versionNumber <= 1) return;
      const dateKey = normaliseDate(event.uploadedAt);
      if (!dateKey) return;
      const daily = dailyMap.get(dateKey) ?? { uploads: 0, updates: 0 };
      daily.updates += 1;
      dailyMap.set(dateKey, daily);
    });

    const contributors: ContributorMetric[] = Array.from(contributorMap.entries())
      .map(([user, value]) => ({ user, uploads: value.uploads, lastUpload: value.lastUpload }))
      .sort((a, b) => {
        if (b.uploads !== a.uploads) return b.uploads - a.uploads;
        const aTime = a.lastUpload ? new Date(a.lastUpload).getTime() : 0;
        const bTime = b.lastUpload ? new Date(b.lastUpload).getTime() : 0;
        return bTime - aTime;
      });

    const assetTypeStats: AssetTypeMetric[] = Array.from(typeMap.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const dailyActivity: DailyActivityMetric[] = Array.from(dailyMap.entries())
      .map(([date, payload]) => ({ date, uploads: payload.uploads, updates: payload.updates }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14)
      .reverse();

    const assetUpdates: AssetUpdateDetail[] = filteredVersionEvents
      .filter((event) => event.versionNumber > 1)
      .sort((a, b) => {
        const aTime = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const bTime = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return bTime - aTime;
      });

    return { contributors, assetTypeStats, dailyActivity, assetUpdates };
  }, [assets, versionEvents, rangeStart]);

  return {
    loading: loadingAssets || loadingVersions,
    error,
    refreshedAt,
    contributors: metrics.contributors,
    assetTypeStats: metrics.assetTypeStats,
    dailyActivity: metrics.dailyActivity,
    assetUpdates: metrics.assetUpdates,
    refresh: () => fetchAssets(),
  };
}
