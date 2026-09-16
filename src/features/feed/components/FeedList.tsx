import { useEffect, useState } from "react";
import { RequestErrorBanner } from "@/shared/components/RequestErrorBanner";
import { useInView } from "@/shared/hooks/useInView";
import { messages } from "@/shared/i18n/pt-BR";
import { useFeed } from "@/features/feed/hooks/useFeed";
import { searchHasRequiredFilter } from "@/features/search/api";
import type { ColabSearchValue } from "@/features/search/components/ColabSearchBar";
import { useColabSearch } from "@/features/search/hooks/useColabSearch";
import { flattenFeedItems } from "@/shared/utils/feedPage";
import { ColabCard } from "./ColabCard";
import { ColabCardSkeleton } from "./ColabCardSkeleton";
import { ColabEmptyState } from "./ColabEmptyState";

type Props = {
  search: ColabSearchValue;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export function FeedList({ search }: Props) {
  const debouncedQ = useDebouncedValue(search.q.trim(), 300);
  const nearMeReady =
    search.nearMe && search.lat != null && search.lng != null;
  const filters = {
    q: debouncedQ,
    lat: nearMeReady ? search.lat : null,
    lng: nearMeReady ? search.lng : null,
    categories: search.categories,
  };
  const searching = searchHasRequiredFilter({
    q: filters.q,
    lat: filters.lat ?? undefined,
    lng: filters.lng ?? undefined,
    categories: filters.categories,
  });
  const waitingForGeo = search.nearMe && !nearMeReady;
  const qPending = search.q.trim() !== debouncedQ;

  const feed = useFeed(!searching && !waitingForGeo);
  const results = useColabSearch(filters, searching);

  const query = searching ? results : feed;
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
  } = query;

  const searchRefreshing =
    searching && isFetching && !isFetchingNextPage;
  const showSkeletons =
    waitingForGeo ||
    isLoading ||
    searchRefreshing ||
    (qPending && search.q.trim().length > 0);
  const items = flattenFeedItems(data?.pages);
  const emptyTitle = searching ? messages.feed.search.empty : messages.feed.empty;
  const emptyHint = searching
    ? messages.feed.search.emptyHint
    : messages.feed.emptyHint;
  const endLabel = searching
    ? messages.feed.search.endOfList
    : messages.feed.endOfList;

  const sentinelRef = useInView<HTMLDivElement>(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return (
    <div
      className="motion-stagger flex flex-col gap-4"
      aria-busy={showSkeletons}
      aria-live="polite"
    >
      {showSkeletons ? (
        <div
          className="flex flex-col gap-4"
          aria-label={messages.feed.search.loading}
          role="status"
        >
          <ColabCardSkeleton />
          <ColabCardSkeleton />
          <ColabCardSkeleton />
        </div>
      ) : null}

      {!showSkeletons && items.length === 0 ? (
        <ColabEmptyState title={emptyTitle} hint={emptyHint} />
      ) : null}

      {!showSkeletons
        ? items.map((colab) => <ColabCard key={colab.id} colab={colab} />)
        : null}

      {isFetchingNextPage ? <ColabCardSkeleton /> : null}

      {isError ? (
        <RequestErrorBanner
          error={error}
          onRetry={() => fetchNextPage()}
          testId="feed-error-banner"
        />
      ) : null}

      {!showSkeletons && !hasNextPage && items.length > 0 ? (
        <p className="py-6 text-center text-sm font-bold text-foreground">
          {endLabel}
        </p>
      ) : null}

      <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />
    </div>
  );
}
