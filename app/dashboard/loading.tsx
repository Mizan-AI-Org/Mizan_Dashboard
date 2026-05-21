export default function DashboardLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-6 w-40 animate-pulse rounded bg-[var(--skeleton)]" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--skeleton)]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="relative h-[120px] animate-pulse overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]"
          >
            <div className="absolute left-0 top-0 h-full w-[3px] rounded-l bg-[var(--skeleton)]" />
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 h-4 w-48 animate-pulse rounded bg-[var(--skeleton)]" />
        <div className="h-[120px] animate-pulse rounded-xl border border-[var(--card-border)] bg-[var(--card)]" />
      </div>

      <div>
        <div className="mb-4 h-4 w-40 animate-pulse rounded bg-[var(--skeleton)]" />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="h-80 animate-pulse rounded-xl border border-[var(--card-border)] bg-[var(--card)]" />
          <div className="h-80 animate-pulse rounded-xl border border-[var(--card-border)] bg-[var(--card)]" />
        </div>
      </div>
    </div>
  );
}
