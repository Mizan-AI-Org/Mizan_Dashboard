"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface InvestorToggleProps {
  mode: "default" | "investor";
}

export function InvestorToggle({ mode }: InvestorToggleProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isInvestor = mode === "investor";

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (isInvestor) {
      params.delete("mode");
    } else {
      params.set("mode", "investor");
    }
    const q = params.toString();
    router.replace(q ? `${pathname}?${q}` : pathname, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--surface)] p-0.5 text-[11px] font-medium"
      >
        <span
          className={`rounded-md px-3 py-1.5 transition-all ${
            !isInvestor
              ? "bg-[var(--card)] text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-quaternary)] hover:text-[var(--text-tertiary)]"
          }`}
        >
          Operations
        </span>
        <span
          className={`rounded-md px-3 py-1.5 transition-all ${
            isInvestor
              ? "bg-emerald-500/15 text-emerald-600 shadow-sm"
              : "text-[var(--text-quaternary)] hover:text-[var(--text-tertiary)]"
          }`}
        >
          Investor
        </span>
      </button>
    </div>
  );
}
