"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ArrowRight, FileSpreadsheet, MessageCircle, ClipboardList, Smartphone, Monitor, Mic, LayoutGrid, Sparkles } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const SLIDE_COUNT = 17;

// XchangeBox-style: background position per layout for better image visibility
const SLIDE_BG_POSITION: Record<string, string> = {
  hero: "center",
  "split-right": "left center",
  "split-left": "right center",
  "bottom-panel": "center top",
  "card-center": "center",
  vignette: "center",
};

// Layout types: hero | split-right | split-left | bottom-panel | card-center | vignette
const SLIDE_LAYOUTS: Record<number, string> = {
  0: "hero",
  1: "split-left",
  2: "vignette",
  3: "split-left",
  4: "bottom-panel",
  5: "split-right",
  6: "split-right",
  7: "split-left",
  8: "split-left",
  9: "vignette",
  10: "split-left", // Competitive Differentiation
  11: "split-right",
  12: "bottom-panel",
  13: "card-center",
  14: "split-left",
  15: "vignette",
  16: "hero",
};

// Beautiful restaurant/hospitality background images (Unsplash)
const SLIDE_BACKGROUNDS: Record<number, string> = {
  0: "/pitch-deck/hero-bg.png",
  1: "/pitch-deck/problem-bg.png",
  2: "/pitch-deck/moroccan-restaurant.png",
  3: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1920&q=80",
  4: "/pitch-deck/moroccan-restaurant.png",
  5: "/pitch-deck/platform-demo-bg.png",
  6: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&q=80",
  7: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1920&q=80",
  8: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=1920&q=80",
  9: "/pitch-deck/competitive-landscape.png",
  10: "/pitch-deck/differentiation-bg.png",
  11: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1920&q=80",
  12: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1920&q=80",
  13: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80",
  14: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80",
  15: "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=1920&q=80",
  16: "/pitch-deck/hero-bg.png",
};

function SlideLayout({
  children,
  title,
  className = "",
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-4xl mx-auto w-full ${className}`}>
      {title && (
        <h2 className="text-xl md:text-2xl font-bold text-[var(--text-primary)] mb-6 uppercase tracking-wide drop-shadow-sm">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

function SlideWithBackground({
  children,
  slideIndex,
  isDark,
  layout,
  direction,
}: {
  children: React.ReactNode;
  slideIndex: number;
  isDark: boolean;
  layout: string;
  direction: "next" | "prev" | null;
}) {
  const bgUrl = SLIDE_BACKGROUNDS[slideIndex];
  const overlay = getOverlayForLayout(layout, isDark, slideIndex);
  const contentClass = getContentClassForLayout(layout);
  const bgPosition = SLIDE_BG_POSITION[layout] ?? "center";
  const animClass =
    direction === "next"
      ? "pitch-slide-enter-next"
      : direction === "prev"
        ? "pitch-slide-enter-prev"
        : "pitch-slide-enter-none";

  return (
    <div
      key={slideIndex}
      className={`absolute inset-0 bg-cover bg-no-repeat ${animClass}`}
      style={{
        backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
        backgroundPosition: bgPosition,
      }}
    >
      <div className="absolute inset-0" style={{ background: overlay }} />
      <div className={`relative z-10 flex flex-col min-h-full py-10 px-6 ${contentClass}`}>
        <ContentWrapper layout={layout} slideIndex={slideIndex}>
          {children}
        </ContentWrapper>
      </div>
    </div>
  );
}

function getOverlayForLayout(layout: string, isDark: boolean, slideIndex?: number): string {
  // Slide 1 (Problem): subtle gradient - darken left for text, keep right fully visible
  if (slideIndex === 1) {
    return "linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.25) 38%, transparent 58%)";
  }
  // Slide 2 (Root and Magnitude): light vignette so Moroccan restaurant image is prominent
  if (slideIndex === 2) {
    return "radial-gradient(ellipse at center, transparent 0%, transparent 45%, rgba(0,0,0,0.25) 100%)";
  }
  // Slide 4 (How It Works): light gradient from bottom so image shows, content readable
  if (slideIndex === 4) {
    return "linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.2) 35%, transparent 65%)";
  }
  // Slide 5 (Platform Demo): split-right - darken right for content, image visible on left
  if (slideIndex === 5) {
    return "linear-gradient(to left, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 40%, transparent 60%)";
  }
  // Slide 7 (Traction): split-left - darken left for content, image visible on right
  if (slideIndex === 7) {
    return "linear-gradient(to right, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, transparent 60%)";
  }
  // Slide 9 (Competitive Landscape): center darken for table readability
  if (slideIndex === 9) {
    return "linear-gradient(135deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.55) 100%)";
  }
  // Slide 10 (Competitive Differentiation): split-left - darken left for content
  if (slideIndex === 10) {
    return "linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 45%, transparent 65%)";
  }
  const light = {
    hero: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 20%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.4) 80%, rgba(0,0,0,0.55) 100%)",
    "split-right":
      "linear-gradient(to left, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.12) 35%, transparent 55%)",
    "split-left":
      "linear-gradient(to right, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.7) 35%, transparent 60%)",
    "bottom-panel":
      "linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.35) 30%, transparent 50%)",
    "card-center":
      "linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.35) 100%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.12) 100%)",
  };
  const dark = {
    hero: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.45) 20%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0.65) 100%)",
    "split-right":
      "linear-gradient(to left, rgba(15,17,23,0.88) 0%, rgba(15,17,23,0.12) 35%, transparent 55%)",
    "split-left":
      "linear-gradient(to right, rgba(15,17,23,0.96) 0%, rgba(15,17,23,0.7) 35%, transparent 60%)",
    "bottom-panel":
      "linear-gradient(to top, rgba(15,17,23,0.9) 0%, rgba(15,17,23,0.35) 30%, transparent 50%)",
    "card-center":
      "linear-gradient(135deg, rgba(15,17,23,0.35) 0%, rgba(15,17,23,0.15) 50%, rgba(15,17,23,0.35) 100%)",
    vignette:
      "radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.35) 100%)",
  };
  return (isDark ? dark : light)[layout as keyof typeof light] || light.hero;
}

function getContentClassForLayout(layout: string): string {
  const classes: Record<string, string> = {
    hero: "items-center justify-center text-center",
    "split-right": "items-center justify-end",
    "split-left": "items-center justify-start",
    "bottom-panel": "items-center justify-end",
    "card-center": "items-center justify-center",
    vignette: "items-center justify-center",
  };
  return classes[layout] || classes.hero;
}

function ContentWrapper({
  layout,
  children,
  slideIndex,
}: {
  layout: string;
  children: React.ReactNode;
  slideIndex?: number;
}) {
  // Slide 1 (Problem): fully transparent, no panel
  if (slideIndex === 1) {
    return (
      <div className="w-full max-w-2xl mr-auto ml-6 lg:ml-10">
        {children}
      </div>
    );
  }
  // Slide 4 (How It Works): transparent wrapper, positioned left
  if (slideIndex === 4) {
    return (
      <div className="w-full max-w-4xl mr-auto ml-6 lg:ml-10 mb-6 lg:mb-10 self-start">
        {children}
      </div>
    );
  }
  // Slide 5 (Platform Demo): content panel on right, no opaque wrapper
  if (slideIndex === 5) {
    return (
      <div className="w-full max-w-xl ml-auto mr-6 lg:mr-10">
        {children}
      </div>
    );
  }
  // Slide 7 (Traction): content far left
  if (slideIndex === 7) {
    return (
      <div className="w-full max-w-xl mr-auto ml-6 lg:ml-10 self-start">
        {children}
      </div>
    );
  }
  // Slide 9 (Competitive Landscape): wider for larger table and logos
  if (slideIndex === 9) {
    return (
      <div className="w-full max-w-5xl mx-auto px-2">
        {children}
      </div>
    );
  }
  // Slide 10 (Competitive Differentiation): content on left, split-left layout
  if (slideIndex === 10) {
    return (
      <div className="w-full max-w-2xl mr-auto ml-6 lg:ml-10 self-start">
        {children}
      </div>
    );
  }
  const isPanel = ["split-right", "split-left", "bottom-panel", "card-center"].includes(layout);
  if (!isPanel) return <>{children}</>;
  const panelBase =
    "p-6 md:p-8 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl";
  return (
    <div
      className={
        layout === "split-right"
          ? `w-full max-w-xl ml-auto mr-6 lg:mr-10 ${panelBase}`
          : layout === "split-left"
            ? `w-full max-w-xl mr-auto ml-6 lg:ml-10 ${panelBase}`
            : layout === "bottom-panel"
              ? `w-full max-w-4xl mx-auto mb-6 lg:mb-10 ${panelBase}`
              : `w-full max-w-2xl mx-auto p-6 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xl`
      }
    >
      {children}
    </div>
  );
}

export default function PitchDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const goToSlide = (target: number, dir: "next" | "prev") => {
    setDirection(dir);
    setCurrentSlide(target);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToSlide(Math.min(currentSlide + 1, SLIDE_COUNT - 1), "next");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide(Math.max(currentSlide - 1, 0), "prev");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const slides: Record<number, React.ReactNode> = {
    0: (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-8 py-10">
        <div className="max-w-xl mx-auto px-8 py-10 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
          <Image src="/mizan-logo.svg" alt="Mizan AI" width={72} height={72} className="mb-6 mx-auto drop-shadow-lg" />
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 drop-shadow-md">Mizan AI</h1>
          <p className="text-xl text-emerald-300 font-semibold mb-6 drop-shadow-md">
            Manage. Predict. Grow.
          </p>
          <p className="text-gray-200 max-w-lg mx-auto text-base leading-relaxed drop-shadow-sm">
            AI-powered all-in-one assistant manager for restaurants. Centralizes planning, HR, incidents,
            checklists & reports in one intuitive platform.
          </p>
        </div>
      </div>
    ),
    1: (
      <div className="flex flex-col w-full max-w-xl">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-4 uppercase tracking-wide [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
          The Problem
        </h2>
        <div className="mb-5 p-4 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 shadow-xl">
          <span className="text-xs font-semibold text-gray-200 uppercase tracking-wider block mb-2">
            Scattered tools managers juggle
          </span>
          <div className="flex flex-nowrap gap-1.5">
            {[
              { icon: FileSpreadsheet, label: "Excel", className: "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/25" },
              { icon: MessageCircle, label: "WhatsApp", className: "bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-md shadow-emerald-500/25" },
              { icon: ClipboardList, label: "Paper schedules", className: "bg-gradient-to-br from-slate-600 to-slate-700 text-white shadow-md shadow-slate-500/25" },
              { icon: Monitor, label: "POS", className: "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25" },
              { icon: Smartphone, label: "Multiple apps", className: "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25" },
            ].map(({ icon: Icon, label, className }) => (
              <span
                key={label}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold ${className}`}
              >
                <Icon className="h-3 w-3" strokeWidth={2.5} />
                {label}
              </span>
            ))}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-black/55 backdrop-blur-sm border border-white/10">
          <p className="text-lg font-bold text-white mb-4 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
            There is a broken restaurant operations cycle
          </p>
          <ul className="space-y-2.5 text-gray-100 text-sm md:text-base leading-relaxed [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
            <li>
              <strong className="text-white">700,000+</strong> restaurants in the US, <strong className="text-white">180,000</strong> in France alone—most lack
              unified operational tools beyond basic POS.
            </li>
            <li>
              <strong className="text-white">75%+ staff turnover</strong> in hospitality—poor communication, last-minute changes, and
              fragmented tools drive people away.
            </li>
            <li>
              <strong className="text-white">4–6 hours/week</strong> wasted on manual scheduling—managers juggle Excel, WhatsApp groups,
              and scattered systems.
            </li>
            <li>
              Decision-making is <strong className="text-white">reactive, not data-driven</strong>—incidents repeat, inefficiencies grow.
            </li>
          </ul>
          <blockquote className="mt-5 border-l-4 border-emerald-400 pl-4 italic text-gray-200 text-sm [text-shadow:0_1px_4px_rgba(0,0,0,0.7)]">
            &ldquo;We have one WhatsApp group per kind of problem&rdquo; — Florian Poirson, Restaurant Manager
          </blockquote>
        </div>
      </div>
    ),
    2: (
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 uppercase tracking-wide [text-shadow:0_2px_12px_rgba(0,0,0,0.9)] text-center">
          Root and Magnitude of the Issues
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 shadow-xl text-center">
            <p className="font-bold text-white mb-2 text-lg">Managers</p>
            <p className="text-sm text-gray-200 leading-relaxed">
              No unified visibility → Manual follow-up → Wasted time
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 shadow-xl text-center">
            <p className="font-bold text-white mb-2 text-lg">Staff</p>
            <p className="text-sm text-gray-200 leading-relaxed">
              Poor onboarding → Last-minute changes → High turnover
            </p>
          </div>
          <div className="p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 shadow-xl text-center">
            <p className="font-bold text-white mb-2 text-lg">Operations</p>
            <p className="text-sm text-gray-200 leading-relaxed">
              Scattered tools → Reactive decisions → Incidents repeat
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-100 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
          Global restaurant management software market: <strong className="text-white">USD 5.79B (2024)</strong> →{" "}
          <strong className="text-white">USD 14.7B by 2030</strong>
        </p>
      </div>
    ),
    3: (
      <SlideLayout title="The Solution">
        <p className="text-[var(--text-secondary)] mb-6">
          One platform aligning managers, staff, and operations into a structured, intelligent ecosystem.
        </p>
        <ul className="space-y-4 text-[var(--text-secondary)] text-sm">
          <li>
            <strong>Managers</strong> get real-time visibility on schedules, tasks, incidents, and labor costs—AI
            suggests optimal staff allocation.
          </li>
          <li>
            <strong>Staff</strong> receive schedules, tasks, and checklists directly via WhatsApp—no app
            downloads, voice notes for illiterate workers.
          </li>
          <li>
            <strong>Restaurants</strong> transform from manual and reactive to automated and predictive—better
            retention, lower costs.
          </li>
        </ul>
      </SlideLayout>
    ),
    4: (
      <div className="flex flex-col items-start w-full">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 uppercase tracking-wide [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
          How It Works
        </h2>
        <div className="w-full p-6 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 shadow-xl">
          <div className="flex flex-nowrap items-center gap-2 md:gap-2.5 text-xs md:text-sm overflow-x-auto pb-1">
            <div className="px-3 py-2 rounded-lg bg-emerald-500/90 text-white font-semibold shadow-lg shadow-emerald-500/30 shrink-0">
              Manager creates schedule
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="px-3 py-2 rounded-lg bg-white/15 text-white font-medium border border-white/20 backdrop-blur-sm shrink-0">
              AI optimizes
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="px-3 py-2 rounded-lg bg-white/15 text-white font-medium border border-white/20 backdrop-blur-sm shrink-0">
              Staff receives via WhatsApp
            </div>
            <ArrowRight className="h-4 w-4 text-emerald-400 shrink-0" />
            <div className="px-3 py-2 rounded-lg bg-emerald-500/90 text-white font-semibold shadow-lg shadow-emerald-500/30 shrink-0">
              Tasks executed & tracked
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row items-stretch gap-4">
            <div className="relative flex-1 min-w-0 aspect-video rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/15 shadow-lg">
              <Image
                src="/pitch-deck/dashboard-preview.png"
                alt="Digital Staff Schedule"
                fill
                className="object-contain"
              />
            </div>
            <div className="flex items-center shrink-0 text-emerald-400">
              <ArrowRight className="h-8 w-8" strokeWidth={2.5} />
            </div>
            <div className="relative w-full sm:w-44 sm:max-w-[180px] aspect-[3/4] rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm border border-white/15 shadow-lg shrink-0">
              <Image
                src="/pitch-deck/whatsapp_v2.png"
                alt="WhatsApp"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    ),
    5: (
      <div className="flex flex-col items-start w-full">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-1 uppercase tracking-wide [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
          Platform Demo
        </h2>
        <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wider mb-1">
          Platform Walkthrough
        </p>
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/55 backdrop-blur-md border border-white/20 shadow-2xl">
          <Image
            src="/pitch-deck/dashboard-preview.png"
            alt="Mizan AI Platform"
            fill
            className="object-contain"
          />
        </div>
        <p className="text-gray-200 text-sm mt-4 [text-shadow:0_1px_6px_rgba(0,0,0,0.8)]">
          From concept to working product—ready to scale across Morocco, MENA & Europe.
        </p>
      </div>
    ),
    6: (
      <SlideLayout title="Mizan's Business Model">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="font-bold text-[var(--text-primary)] text-sm mb-2">For Restaurants</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Monthly subscription per location. Scheduling, tasks, incidents, reports—all in one platform.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--card)]/95 backdrop-blur-sm border border-[var(--border)] shadow-sm">
            <p className="font-bold text-[var(--text-primary)] text-sm mb-2">For Staff</p>
            <p className="text-xs text-[var(--text-secondary)]">
              Free. Receive schedules & tasks via WhatsApp. Voice notes for easy interaction. No app download.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="font-bold text-[var(--text-primary)] text-sm mb-2">For Mizan</p>
            <p className="text-xs text-[var(--text-secondary)]">
              30% platform revenue from SaaS subscriptions. Premium: AI insights, multi-location dashboards.
            </p>
          </div>
        </div>
        <p className="mt-6 text-xs text-[var(--text-tertiary)] text-center">
          Pricing: Starter ~€90/mo (≤25 staff) • Pro ~€150/mo (25–45 staff) • Enterprise: custom
        </p>
      </SlideLayout>
    ),
    7: (
      <div className="flex flex-col items-start w-full">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 uppercase tracking-wide [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
          Traction
        </h2>
        <div className="w-full p-6 rounded-2xl bg-black/50 backdrop-blur-md border border-white/15 shadow-xl">
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="p-5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-center">
              <p className="text-3xl font-bold text-emerald-300">10+</p>
              <p className="text-sm text-gray-200 mt-1">Restaurants using Mizan</p>
            </div>
            <div className="p-5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-center">
              <p className="text-3xl font-bold text-emerald-300">70%</p>
              <p className="text-sm text-gray-200 mt-1">Reduction in scheduling time</p>
            </div>
            <div className="p-5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-center">
              <p className="text-3xl font-bold text-emerald-300">35%</p>
              <p className="text-sm text-gray-200 mt-1">Decrease in staff turnover</p>
            </div>
            <div className="p-5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-center">
              <p className="text-3xl font-bold text-emerald-300">99%</p>
              <p className="text-sm text-gray-200 mt-1">WhatsApp delivery rate</p>
            </div>
          </div>
          <p className="text-sm text-gray-200 text-center [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
            Validated with pilot restaurants. Geoclocking, AI scheduling, task management live.
          </p>
        </div>
      </div>
    ),
    8: (
      <SlideLayout title="Go-to-Market Strategy">
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-bold text-[var(--text-primary)] mb-2">Restaurant Acquisition</p>
            <ul className="text-[var(--text-secondary)] space-y-1">
              <li>• Direct sales to owners & managers</li>
              <li>• Partnerships with hospitality groups & consultants</li>
              <li>• Founder-led network in restaurant industry</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-[var(--text-primary)] mb-2">Distribution Channels</p>
            <ul className="text-[var(--text-secondary)] space-y-1">
              <li>• Direct SaaS sales (website + demos)</li>
              <li>• Industry events & hospitality networks</li>
              <li>• Partnerships with POS providers</li>
            </ul>
          </div>
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="font-bold text-emerald-600 dark:text-emerald-400">Key Advantage</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Co-founder is VP of restaurant association of Marrakech, connected to national federation.
            </p>
          </div>
        </div>
      </SlideLayout>
    ),
    9: (
      <div className="flex flex-col items-start w-full">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-10 uppercase tracking-wide [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
          Competitive Landscape
        </h2>
        <div className="w-full overflow-x-auto rounded-2xl bg-black/55 backdrop-blur-md border border-white/20 shadow-xl">
          <table className="w-full text-lg border-collapse">
            <thead>
              <tr className="border-b border-white/25">
                <th className="text-left py-5 px-6 font-bold text-white text-xl">Competitor</th>
                <th className="text-left py-5 px-6 font-bold text-white text-xl">Offers</th>
                <th className="text-left py-5 px-6 font-bold text-white text-xl">Active in MENA</th>
              </tr>
            </thead>
            <tbody className="text-gray-200">
              <tr className="border-b border-white/10">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://logo.clearbit.com/7shifts.com" alt="" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = "https://icons.duckduckgo.com/ip3/7shifts.com.ico"; e.currentTarget.onerror = () => { e.currentTarget.style.display = "none"; }; }} />
                    </div>
                    <span className="font-medium">7Shifts / Deputy</span>
                  </div>
                </td>
                <td className="py-5 px-6">Scheduling only</td>
                <td className="py-5 px-6">Limited</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://logo.clearbit.com/toast.com" alt="" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = "https://icons.duckduckgo.com/ip3/toast.com.ico"; e.currentTarget.onerror = () => { e.currentTarget.style.display = "none"; }; }} />
                    </div>
                    <span className="font-medium">Toast / Square</span>
                  </div>
                </td>
                <td className="py-5 px-6">POS + basic scheduling</td>
                <td className="py-5 px-6">US-focused</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center shrink-0 gap-0.5 p-1.5">
                      <FileSpreadsheet className="w-7 h-7 text-gray-400" />
                      <MessageCircle className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="font-medium">Excel + WhatsApp</span>
                  </div>
                </td>
                <td className="py-5 px-6">Manual, fragmented</td>
                <td className="py-5 px-6">Everywhere</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://logo.clearbit.com/aioapp.com" alt="" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = "https://icons.duckduckgo.com/ip3/aioapp.com.ico"; e.currentTarget.onerror = () => { e.currentTarget.style.display = "none"; }; }} />
                    </div>
                    <span className="font-medium">AIO</span>
                  </div>
                </td>
                <td className="py-5 px-6">All-in-one AI: POS, staff, inventory, marketing, analytics</td>
                <td className="py-5 px-6">US-focused</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center overflow-hidden shrink-0 p-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src="https://logo.clearbit.com/5out.io" alt="" className="w-full h-full object-contain" onError={(e) => { e.currentTarget.src = "https://icons.duckduckgo.com/ip3/5out.io.ico"; e.currentTarget.onerror = () => { e.currentTarget.style.display = "none"; }; }} />
                    </div>
                    <span className="font-medium">5-Out</span>
                  </div>
                </td>
                <td className="py-5 px-6">Revenue forecasting, labor scheduling, prep automation</td>
                <td className="py-5 px-6">US-focused</td>
              </tr>
              <tr className="bg-emerald-500/20 border-b border-emerald-400/30">
                <td className="py-5 px-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-xl bg-emerald-500/30 flex items-center justify-center overflow-hidden shrink-0 p-2">
                      <Image src="/mizan-logo.svg" alt="" width={44} height={44} className="object-contain" />
                    </div>
                    <span className="font-bold text-emerald-300 text-xl">Mizan</span>
                  </div>
                </td>
                <td className="py-5 px-6">All-in-one: scheduling, tasks, incidents, AI, WhatsApp</td>
                <td className="py-5 px-6 font-semibold text-emerald-300">Morocco, MENA, Europe</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    ),
    10: (
      <div className="flex flex-col items-start w-full">
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 uppercase tracking-wide [text-shadow:0_2px_12px_rgba(0,0,0,0.9)]">
          Competitive Differentiation
        </h2>
        <div className="w-full space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 shadow-lg hover:bg-black/60 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0 p-1">
              <Image src="/pitch-deck/miya-avatar.png" alt="Miya" width={48} height={48} className="object-contain rounded-lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white text-base mb-0.5">AI Agent</p>
              <p className="text-gray-200 text-sm leading-relaxed">Virtual assistant manager. Schedules with constraints. Suggests actions.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 shadow-lg hover:bg-black/60 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 p-1">
              <Mic className="w-7 h-7 text-emerald-400" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white text-base mb-0.5">Voice notes</p>
              <p className="text-gray-200 text-sm leading-relaxed">Illiterate staff interact via voice messages.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 shadow-lg hover:bg-black/60 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0 p-1">
              <Image src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" width={40} height={40} className="object-contain" unoptimized />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white text-base mb-0.5">WhatsApp</p>
              <p className="text-gray-200 text-sm leading-relaxed">Clock-in, tasks, onboarding—no app download.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 shadow-lg hover:bg-black/60 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 p-1">
              <LayoutGrid className="w-7 h-7 text-emerald-400" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white text-base mb-0.5">All-in-one hub</p>
              <p className="text-gray-200 text-sm leading-relaxed">Planning, tasks, incidents, reports in one platform.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-black/50 backdrop-blur-md border border-white/15 shadow-lg hover:bg-black/60 transition-colors">
            <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center shrink-0 p-1">
              <Sparkles className="w-7 h-7 text-emerald-400" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-white text-base mb-0.5">Simple for SMEs</p>
              <p className="text-gray-200 text-sm leading-relaxed">Mobile-first, easy to use, no heavy setup.</p>
            </div>
          </div>
        </div>
      </div>
    ),
    11: (
      <SlideLayout title="3-Year Financial Forecast">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-2 font-bold">Year</th>
                <th className="text-left py-2 px-2 font-bold">Restaurants</th>
                <th className="text-left py-2 px-2 font-bold">Calculation</th>
                <th className="text-left py-2 px-2 font-bold">ARR</th>
              </tr>
            </thead>
            <tbody className="text-[var(--text-secondary)]">
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 px-2">1</td>
                <td>80</td>
                <td>80 × €100/mo</td>
                <td className="font-bold text-emerald-600">€96,000</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 px-2">2</td>
                <td>240</td>
                <td>240 × €100/mo</td>
                <td className="font-bold text-emerald-600">€288,000</td>
              </tr>
              <tr className="border-b border-[var(--border)]">
                <td className="py-2 px-2">3</td>
                <td>600</td>
                <td>600 × €100/mo</td>
                <td className="font-bold text-emerald-600">€720,000</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-[var(--text-tertiary)] text-center">
          Pre-seed stage. Product development & MVP validation. Long-term: leader in Morocco, scale across MENA & Europe.
        </p>
      </SlideLayout>
    ),
    12: (
      <SlideLayout title="Technology & Integrations">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--card)] border border-[var(--border)] shadow-md">
            <Image
              src="/pitch-deck/ops_hub_v2.png"
              alt="Operations Hub"
              fill
              className="object-contain p-3"
            />
          </div>
          <div className="relative aspect-video rounded-lg overflow-hidden bg-[var(--card)] border border-[var(--border)] shadow-md">
            <Image
              src="/pitch-deck/analytics_v2.png"
              alt="Analytics"
              fill
              className="object-contain p-3"
            />
          </div>
        </div>
        <ul className="mt-4 text-sm text-[var(--text-secondary)] space-y-1">
          <li>• Geolocation clock-in • AI assistant • Voice notes • WhatsApp • Cloud platform</li>
        </ul>
      </SlideLayout>
    ),
    13: (
      <SlideLayout title="Funding Ask">
        <div className="text-center mb-6">
          <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Seeking investment</p>
          <p className="text-[var(--text-tertiary)] text-sm mt-2">Pre-seed / Seed round</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {[
            { label: "Product & Technology", desc: "AI, integrations, features" },
            { label: "Business Development", desc: "Sales, hiring" },
            { label: "Marketing", desc: "Restaurant acquisition" },
            { label: "Operations", desc: "Scale, support" },
          ].map(({ label, desc }) => (
            <div key={label} className="p-3 rounded-lg bg-[var(--card)] border border-[var(--border)]">
              <p className="font-semibold text-[var(--text-primary)]">{label}</p>
              <p className="text-xs text-[var(--text-tertiary)]">{desc}</p>
            </div>
          ))}
        </div>
      </SlideLayout>
    ),
    14: (
      <SlideLayout title="Human Capital">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex gap-4 rounded-lg bg-[var(--card)] border border-[var(--border)] p-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-[var(--surface)]">
              <Image src="/pitch-deck/hamza.png" alt="Hamza Hadni" fill className="object-cover" sizes="80px" />
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">Hamza Hadni</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">C.E.O</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Restaurant operator with 10+ years management experience. Managed restaurants and events.
              </p>
            </div>
          </div>
          <div className="flex gap-4 rounded-lg bg-[var(--card)] border border-[var(--border)] p-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              A
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">Adama Jarju</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">C.T.O</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-1">
                Engineer & CTO. Fintech background. Built fintech solutions.
              </p>
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-[var(--text-secondary)] mt-4">
          Bringing together business & tech expertise.
        </p>
      </SlideLayout>
    ),
    15: (
      <SlideLayout title="Why Now?">
        <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
          <li>• Labor shortage & high turnover → need for automation</li>
          <li>• Rising costs → restaurants must optimise to survive</li>
          <li>• Fragmented tech (POS, Excel, WhatsApp) → inefficient</li>
          <li>• AI cost & capability → accessible now</li>
          <li>• Younger operators expect modern tools</li>
          <li>• Regulation & compliance → digital traceability required</li>
          <li>• Post-COVID digitisation → automation mandatory</li>
        </ul>
      </SlideLayout>
    ),
    16: (
      <div className="flex flex-col items-center justify-center min-h-[65vh] text-center px-6">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Thank You</h1>
        <p className="text-emerald-600 dark:text-emerald-400 font-semibold mb-2">Mizan.ai — Manage. Predict. Grow.</p>
        <p className="text-sm text-[var(--text-tertiary)] mb-6">https://mizan.ai</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href="mailto:hello@mizan.ai"
            className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-600 transition-all"
          >
            Get in touch
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--card)] transition-all"
          >
            Back to Command Center
          </Link>
        </div>
      </div>
    ),
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--background)]/98 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs font-medium text-[var(--text-tertiary)] hover:text-[var(--text-primary)]">
            ← Command Center
          </Link>
          <span className="text-xs font-semibold text-[var(--text-primary)] hidden sm:inline tracking-wide">
            PITCH DECK | 2026
          </span>
          <span className="text-xs text-[var(--text-tertiary)] hidden md:inline">
            AI-powered restaurant operations
          </span>
        </div>
        <span className="text-xs text-[var(--text-tertiary)] font-medium">
          — {currentSlide + 1} of {SLIDE_COUNT} —
        </span>
      </header>

      <main className="flex-1 relative min-h-0">
        <SlideWithBackground
          slideIndex={currentSlide}
          isDark={isDark}
          layout={SLIDE_LAYOUTS[currentSlide] ?? "hero"}
          direction={direction}
        >
          {slides[currentSlide]}
        </SlideWithBackground>

        {/* Floating navigation buttons */}
        <button
          onClick={() => goToSlide(Math.max(currentSlide - 1, 0), "prev")}
          disabled={currentSlide === 0}
          className="absolute left-4 bottom-6 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10 transition-all duration-200 shadow-lg"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => goToSlide(Math.min(currentSlide + 1, SLIDE_COUNT - 1), "next")}
          disabled={currentSlide === SLIDE_COUNT - 1}
          className="absolute right-4 bottom-6 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-white/10 transition-all duration-200 shadow-lg"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
        </button>
      </main>
    </div>
  );
}
