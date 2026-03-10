import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-6 transition-colors duration-200">
      <div className="max-w-sm space-y-8 text-center">
        <Image
          src="/mizan-logo.svg"
          alt="Mizan AI"
          width={64}
          height={64}
          priority
          className="mx-auto drop-shadow-[0_0_24px_rgba(16,185,129,0.2)]"
        />
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--text-primary)]">
            Mizan AI Command Center
          </h1>
          <p className="text-[14px] leading-relaxed text-[var(--text-tertiary)]">
            This is our internal operational and investor dashboard.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pitch-deck"
            className="inline-flex items-center justify-center rounded-lg border-2 border-emerald-500 px-6 py-2.5 text-[13px] font-semibold text-emerald-600 bg-transparent transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-400"
          >
            Pitch Deck
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/30"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
