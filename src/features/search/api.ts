import { apiClient } from "@/shared/api/client";
import type { FeedPage } from "@/shared/types/colab";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;
const MAX_QUERY_LENGTH = 200;

export type ColabSearchParams = {
  q?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  categories?: string[];
  pageToken?: string | null;
  size?: number;
};

export function searchHasRequiredFilter(params: ColabSearchParams): boolean {
  const q = params.q?.trim() ?? "";
  const hasGeo =
    typeof params.lat === "number" &&
    Number.isFinite(params.lat) &&
    typeof params.lng === "number" &&
    Number.isFinite(params.lng);
  return Boolean(q || hasGeo || (params.categories && params.categories.length > 0));
}

export async function searchColabs(
  params: ColabSearchParams,
): Promise<FeedPage> {
  const search = new URLSearchParams();
  const safeSize = Math.min(
    Math.max(params.size ?? DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  search.set("size", String(safeSize));

  const q = params.q?.trim() ?? "";
  if (q) {
    search.set("q", q.slice(0, MAX_QUERY_LENGTH));
  }

  const hasGeo =
    typeof params.lat === "number" &&
    Number.isFinite(params.lat) &&
    typeof params.lng === "number" &&
    Number.isFinite(params.lng);

  if (hasGeo) {
    search.set("lat", String(params.lat));
    search.set("lng", String(params.lng));
    if (typeof params.radiusKm === "number") {
      search.set("radiusKm", String(params.radiusKm));
    }
  }

  for (const slug of params.categories ?? []) {
    if (slug) search.append("category", slug);
  }

  if (params.pageToken) {
    search.set("pageToken", params.pageToken);
  }

  const { data } = await apiClient.get<FeedPage>(
    `/v1/colabs/search?${search.toString()}`,
  );
  return data;
}
