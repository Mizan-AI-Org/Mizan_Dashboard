import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 transition-colors duration-200">
      {/* Blurred background image */}
      <div className="absolute inset-0">
        <Image
          src="/pitch-deck/image.png"
          alt=""
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-slate-900/50" />
      </div>
      <div className="relative z-10 max-w-sm space-y-8 text-center">
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/mizan-logo.svg"
            alt=""
            width={64}
            height={64}
            priority
            className="drop-shadow-[0_0_24px_rgba(16,185,129,0.2)]"
          />
          <span className="text-[28px] font-bold tracking-tight text-white">Mizan AI</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold tracking-tight text-white">
            Command Center
          </h1>
          <p className="text-[14px] leading-relaxed text-white/90">
            This is our internal operational and investor dashboard.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/pitch-deck"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/80 px-6 py-2.5 text-[13px] font-semibold text-white bg-white/10 transition-all hover:bg-white/20 hover:border-white"
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
          <Link
            href="/sprint-deck"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-teal-700 hover:shadow-xl hover:shadow-emerald-500/30 hover:-translate-y-0.5"
          >
            Sprint Deck
          </Link>
        </div>
      </div>
    </div>
  );
}
