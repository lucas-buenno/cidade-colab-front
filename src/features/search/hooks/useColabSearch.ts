import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import {
  searchColabs,
  searchHasRequiredFilter,
  type ColabSearchParams,
} from "@/features/search/api";
import type { AppError } from "@/shared/api/errors";
import type { FeedPage } from "@/shared/types/colab";

const PAGE_SIZE = 20;

export const SEARCH_QUERY_KEY_PREFIX = ["colabs", "search"] as const;

export type SearchQueryFilters = {
  q: string;
  lat: number | null;
  lng: number | null;
  categories: string[];
};

export function searchQueryKey(filters: SearchQueryFilters) {
  return [...SEARCH_QUERY_KEY_PREFIX, filters] as const;
}

export function useColabSearch(filters: SearchQueryFilters, enabled: boolean) {
  const params: ColabSearchParams = {
    q: filters.q,
    categories: filters.categories,
    size: PAGE_SIZE,
    ...(filters.lat != null && filters.lng != null
      ? { lat: filters.lat, lng: filters.lng }
      : {}),
  };

  return useInfiniteQuery<
    FeedPage,
    AppError,
    InfiniteData<FeedPage>,
    ReturnType<typeof searchQueryKey>,
    string | null
  >({
    queryKey: searchQueryKey(filters),
    queryFn: ({ pageParam }) =>
      searchColabs({ ...params, pageToken: pageParam }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
    enabled: enabled && searchHasRequiredFilter(params),
  });
}
