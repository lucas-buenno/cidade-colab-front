import { useInfiniteQuery, type InfiniteData } from "@tanstack/react-query";
import { fetchFeedPage } from "@/features/feed/api";
import type { AppError } from "@/shared/api/errors";
import type { FeedPage } from "@/shared/types/colab";

const FEED_QUERY_KEY = ["feed"] as const;
const PAGE_SIZE = 20;

export function useFeed() {
  return useInfiniteQuery<
    FeedPage,
    AppError,
    InfiniteData<FeedPage>,
    typeof FEED_QUERY_KEY,
    string | null
  >({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) => fetchFeedPage(pageParam, PAGE_SIZE),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextPageToken,
  });
}
