export function GameCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="aspect-[3/4] animate-pulse bg-secondary" />
      <div className="space-y-2 p-3">
        <div className="h-3.5 w-4/5 animate-pulse rounded bg-secondary" />
        <div className="h-3 w-3/5 animate-pulse rounded bg-secondary" />
        <div className="h-4 w-12 animate-pulse rounded-full bg-secondary" />
      </div>
    </div>
  );
}
