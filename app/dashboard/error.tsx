"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-rose-500">
          Dashboard Error
        </p>
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          Something went wrong loading the dashboard.
        </h2>
        <p className="max-w-md text-sm text-[var(--text-tertiary)]">
          {error.message || "An unexpected error occurred while fetching metrics."}
        </p>
        {error.digest && (
          <p className="font-mono text-xs text-[var(--text-quaternary)]">
            Digest: {error.digest}
          </p>
        )}
      </div>
      <button
        onClick={reset}
        className="rounded-full border border-[var(--card-border)] bg-[var(--card)] px-5 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--card-border-hover)] hover:bg-[var(--card-hover)]"
      >
        Retry
      </button>
    </div>
  );
}
