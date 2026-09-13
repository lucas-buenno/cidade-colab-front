export function ColabCardSkeleton() {
  return (
    <article className="flex w-full flex-col gap-4 border border-feed-hairline bg-white px-3 pt-3 pb-6">
      <div className="flex items-center gap-[9px]">
        <div className="size-8 animate-pulse rounded-[4px] bg-muted" />
        <div className="h-4 w-24 animate-pulse rounded-sm bg-muted" />
        <div className="ml-auto h-3 w-20 animate-pulse rounded-sm bg-muted" />
      </div>
      <div className="h-[179px] w-full animate-pulse bg-muted" />
      <div className="flex gap-[17px]">
        <div className="h-8 w-28 animate-pulse rounded-[4px] bg-muted" />
        <div className="h-8 w-20 animate-pulse rounded-[4px] bg-muted" />
      </div>
      <div className="h-8 w-2/3 animate-pulse rounded-sm bg-muted" />
      <div className="h-4 w-full animate-pulse rounded-sm bg-muted" />
      <div className="h-8 w-28 animate-pulse rounded-[8px] bg-muted" />
    </article>
  );
}
