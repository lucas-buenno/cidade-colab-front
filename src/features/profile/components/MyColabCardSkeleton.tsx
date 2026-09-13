export function MyColabCardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Array.from({ length: 4 }, (_, index) => (
        <article
          key={index}
          className="flex flex-col gap-4 border border-feed-hairline bg-white px-3 pt-3 pb-6"
        >
          <div className="h-[179px] w-full animate-pulse bg-muted" />
          <div className="flex min-h-[73px] flex-col gap-2">
            <div className="h-4 w-4/5 animate-pulse rounded-sm bg-muted" />
            <div className="h-3 w-full animate-pulse rounded-sm bg-muted" />
            <div className="h-3 w-2/3 animate-pulse rounded-sm bg-muted" />
          </div>
          <div className="h-3 w-20 animate-pulse rounded-sm bg-muted" />
        </article>
      ))}
    </div>
  );
}
