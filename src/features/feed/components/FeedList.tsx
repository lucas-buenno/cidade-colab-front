import { RequestErrorBanner } from "@/shared/components/RequestErrorBanner";
import { useInView } from "@/shared/hooks/useInView";
import { messages } from "@/shared/i18n/pt-BR";
import { useFeed } from "@/features/feed/hooks/useFeed";
import { ColabCard } from "./ColabCard";
import { ColabCardSkeleton } from "./ColabCardSkeleton";

export function FeedList() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
  } = useFeed();

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  const sentinelRef = useInView<HTMLDivElement>(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  });

  return (
    <div className="flex flex-col gap-6">
      {isLoading ? (
        <>
          <ColabCardSkeleton />
          <ColabCardSkeleton />
          <ColabCardSkeleton />
        </>
      ) : null}

      {!isLoading && items.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-6 text-center text-muted-foreground">
          {messages.feed.empty}
        </p>
      ) : null}

      {items.map((colab) => (
        <ColabCard key={colab.id} colab={colab} />
      ))}

      {isFetchingNextPage ? <ColabCardSkeleton /> : null}

      {isError ? (
        <RequestErrorBanner
          error={error}
          onRetry={() => fetchNextPage()}
          testId="feed-error-banner"
        />
      ) : null}

      {!isLoading && !hasNextPage && items.length > 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">
          {messages.feed.endOfList}
        </p>
      ) : null}

      <div ref={sentinelRef} className="h-4 w-full" aria-hidden="true" />
    </div>
  );
}
