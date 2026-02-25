import type { ReactNode } from "react";
import { Suspense } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

export const metadata = {
  title: "Mizan Command Center",
  description: "Internal operational and investor dashboard for Mizan AI.",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-200">
      <nav className="sticky top-0 z-50 border-b border-[var(--divider)] bg-[var(--background-nav)] backdrop-blur-xl transition-colors duration-200">
        <div className="mx-auto flex h-[56px] max-w-[1440px] items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <Image
              src="/mizan-logo.svg"
              alt="Mizan AI"
              width={30}
              height={30}
              priority
            />
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">
                Mizan Command Center
              </span>
              <span className="text-[10px] font-medium uppercase tracking-widest text-[var(--text-quaternary)]">
                Analytics Dashboard
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Connected
              </span>
            </div>
            <div className="h-4 w-px bg-[var(--divider)]" />
            <time
              className="text-[11px] tabular-nums text-[var(--text-quaternary)]"
              suppressHydrationWarning
            >
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <div className="h-4 w-px bg-[var(--divider)]" />
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-[1440px] px-8 py-8">
        <Suspense>{children}</Suspense>
      </main>
    </div>
  );
}
