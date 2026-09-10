export function ColabCardSkeleton() {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="size-10 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
        </div>
      </div>

      <div className="mt-3 aspect-video w-full animate-pulse rounded-lg bg-muted" />

      <div className="mt-3 h-5 w-2/3 animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-full animate-pulse rounded bg-muted" />
      <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-muted" />

      <div className="mt-3 flex gap-2">
        <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
      </div>
    </article>
  );
}
