"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

const SLIDE_COUNT = 3;
const BG_URL = "/pitch-deck/image.png";

export default function SprintDeckPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const hideUITimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTopHover = useCallback(() => {
    if (!isFullscreen) return;
    if (hideUITimerRef.current) {
      clearTimeout(hideUITimerRef.current);
      hideUITimerRef.current = null;
    }
    setShowUI(true);
  }, [isFullscreen]);

  const handleTopLeave = useCallback(() => {
    if (!isFullscreen) return;
    hideUITimerRef.current = setTimeout(() => setShowUI(false), 1500);
  }, [isFullscreen]);

  useEffect(() => {
    return () => {
      if (hideUITimerRef.current) clearTimeout(hideUITimerRef.current);
    };
  }, []);

  const goToSlide = useCallback((target: number, dir: "next" | "prev") => {
    setDirection(dir);
    setCurrentSlide(target);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToSlide(Math.min(currentSlide + 1, SLIDE_COUNT - 1), "next");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToSlide(Math.max(currentSlide - 1, 0), "prev");
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        void toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, goToSlide, toggleFullscreen]);

  useEffect(() => {
    const onFsChange = () => {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      setShowUI(!fs);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const slides: Record<number, React.ReactNode> = {
    0: <Slide1 />,
    1: <Slide2 />,
    2: <Slide3 />,
  };

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] overflow-x-hidden">
      {isFullscreen ? (
        <div
          className="fixed top-0 left-0 right-0 h-16 z-30"
          onMouseEnter={handleTopHover}
          onMouseLeave={handleTopLeave}
        >
          <header
            className={[
              "absolute inset-x-0 top-0 flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl transition-opacity duration-300",
              showUI ? "opacity-100" : "opacity-0 pointer-events-none",
            ].join(" ")}
          >
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xs font-medium text-white/90 hover:text-white">
                ← Command Center
              </Link>
              <span className="text-xs font-semibold text-white">SPRINT DECK</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/80 font-medium">
                {currentSlide + 1} / {SLIDE_COUNT}
              </span>
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
                aria-label="Exit full screen (F)"
              >
                <Minimize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Exit</span>
                <span className="hidden md:inline text-white/60">(F)</span>
              </button>
            </div>
          </header>
        </div>
      ) : (
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-medium text-white/90 hover:text-white">
              ← Command Center
            </Link>
            <span className="text-xs font-semibold text-white">SPRINT DECK</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/80 font-medium">
              {currentSlide + 1} / {SLIDE_COUNT}
            </span>
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-white/10 transition"
              aria-label="Enter full screen (F)"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Full screen</span>
              <span className="hidden md:inline text-white/60">(F)</span>
            </button>
          </div>
        </header>
      )}

      <main className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-no-repeat bg-center"
            style={{ backgroundImage: `url(${BG_URL})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(6,78,59,0.25) 50%, rgba(15,23,42,0.85) 100%)",
            }}
          />
          <div className="relative z-10 flex flex-col h-full pt-14 pb-20 px-3 sm:px-5 min-w-0 overflow-x-hidden overflow-y-auto">
            <div className="w-full max-w-[min(90rem,100%)] mx-auto my-auto flex items-center justify-center min-w-0 min-h-full py-4">
              {slides[currentSlide]}
            </div>
          </div>
        </div>

        <button
          onClick={() => goToSlide(Math.max(currentSlide - 1, 0), "prev")}
          disabled={currentSlide === 0}
          className="absolute left-4 bottom-6 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/95 hover:bg-white shadow-lg shadow-slate-900/20 border border-slate-200 text-emerald-600 hover:scale-105 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <button
          onClick={() => goToSlide(Math.min(currentSlide + 1, SLIDE_COUNT - 1), "next")}
          disabled={currentSlide === SLIDE_COUNT - 1}
          className="absolute right-4 bottom-6 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/95 hover:bg-white shadow-lg shadow-slate-900/20 border border-slate-200 text-emerald-600 hover:scale-105 disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
        </button>
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {Array.from({ length: SLIDE_COUNT }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i, i > currentSlide ? "next" : "prev")}
              className={`h-2 rounded-full transition-all duration-200 ${i === currentSlide
                ? "w-8 bg-emerald-500"
                : "w-2 bg-white/40 hover:bg-white/60"
                }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-3xl overflow-hidden bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.05)] flex flex-col min-w-0 w-full max-w-full ${className}`}
    >
      {children}
    </div>
  );
}

function Slide1() {
  return (
    <Card className="w-full flex flex-col overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-5 shrink-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-1 w-8 sm:w-12 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight break-words">
            Problem, Market & Why Now
          </h2>
        </div>
      </div>
      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 min-w-0">
        {/* Left column */}
        <div className="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">Problem Statement</h3>
            <p className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed break-words">
              Restaurant managers operate in a highly fragmented environment. They must manage staff scheduling, HR,
              operations, incidents, onboarding, and reporting using multiple disconnected tools or manual processes.
            </p>
            <ul className="list-disc list-inside text-slate-800 text-base sm:text-lg font-medium mt-2 sm:mt-3 space-y-1.5 break-words">
              <li>3–5 hrs/week on manual coordination</li>
              <li>High staff turnover → constant onboarding</li>
              <li>Lack of visibility → labor cost inefficiencies</li>
              <li>Restaurants react instead of manage proactively</li>
            </ul>
          </section>
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">Beachhead Market (ICP)</h3>
            <p className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed break-words">
              Independent & small restaurant groups with <strong className="font-extrabold">10+ employees</strong>, operating on paper or with
              fragmented solutions. <strong className="font-extrabold">Buyer:</strong> Owner / Manager / Ops Manager. They struggle with scheduling,
              accountability, task management, payroll prep, incident reporting.
            </p>
          </section>
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">Why Now</h3>
            <ul className="text-slate-800 text-base sm:text-lg font-medium space-y-1.5 leading-relaxed break-words">
              <li><strong className="font-extrabold">Restaurant crisis:</strong> High turnover, seasonal activity, lower margins</li>
              <li><strong className="font-extrabold">Digital transformation:</strong> POS adopted, ops still manual; Covid accelerated digitization</li>
              <li><strong className="font-extrabold">AI enables insights:</strong> Detect operational patterns & uncover insights. Optimize staff allocation & reduce inefficiencies</li>
            </ul>
          </section>
        </div>
        {/* Right column */}
        <div className="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">TAM / SAM / SOM</h3>
            <p className="text-slate-600 text-xs sm:text-sm font-semibold mb-2 sm:mb-3">ARPU: €100/mo (€1,200/yr). Geographies: US, Europe, MENA, Morocco. Sources: Statista, IBISWorld, Grand View Research.</p>
            <div className="rounded-xl overflow-x-auto overflow-y-hidden border border-slate-200 shadow-sm">
              <table className="w-full min-w-[200px] text-sm sm:text-lg border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-emerald-500 to-teal-500">
                    <th className="text-left py-2 sm:py-4 px-2 sm:px-4 font-bold text-white text-xs sm:text-base">Metric</th>
                    <th className="text-left py-2 sm:py-4 px-2 sm:px-4 font-bold text-white text-xs sm:text-base">Restaurants</th>
                    <th className="text-right py-2 sm:py-4 px-2 sm:px-4 font-bold text-white text-xs sm:text-base">Market Value</th>
                  </tr>
                </thead>
                <tbody className="text-slate-800 font-semibold bg-white">
                  <tr className="border-t border-slate-100 hover:bg-slate-50/50"><td className="py-2 sm:py-4 px-2 sm:px-4 font-extrabold">TAM</td><td className="py-2 sm:py-4 px-2 sm:px-4">~2.9M</td><td className="py-2 sm:py-4 px-2 sm:px-4 text-right font-extrabold text-emerald-600 text-base sm:text-xl">€3.6B</td></tr>
                  <tr className="border-t border-slate-100 hover:bg-slate-50/50"><td className="py-2 sm:py-4 px-2 sm:px-4 font-extrabold">SAM</td><td className="py-2 sm:py-4 px-2 sm:px-4">~1.0M</td><td className="py-2 sm:py-4 px-2 sm:px-4 text-right font-extrabold text-emerald-600 text-base sm:text-xl">€1.2B</td></tr>
                  <tr className="border-t border-slate-100 hover:bg-slate-50/50"><td className="py-2 sm:py-4 px-2 sm:px-4 font-extrabold">SOM</td><td className="py-2 sm:py-4 px-2 sm:px-4">~60,800</td><td className="py-2 sm:py-4 px-2 sm:px-4 text-right font-extrabold text-emerald-600 text-base sm:text-xl">€35.5M</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-slate-600 text-[11px] sm:text-xs mt-2">TAM: US + Europe + MENA + Morocco. SAM: independent/small groups, 10+ employees. Target: 1% of SAM. Market growth: 16% CAGR.</p>
          </section>
          <section className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-sm min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-700 uppercase tracking-widest mb-2 sm:mb-3">Mandatory Clarity Sentence</h3>
            <p className="text-slate-900 text-base sm:text-lg font-semibold leading-relaxed italic break-words">
            Mizan is an AI-powered operational platform designed to centralize the management of restaurant operations. 
            It brings together team coordination, operational workflows, and business data into a single environment, 
            while connecting with existing systems such as POS and reservation platforms into one unified hub.

              <br /><br />
              We are targeting
              restaurants across the US, Europe and MENA ( starting with Morocco) - a TAM of ~€3.6B (2.9M restaurants) and SAM of ~€1.2B
              (1M independent/small groups with 10+ employees). The restaurant management software market grows at ~16%
              annually. Mizan aims to capture 1% of SAM (~€35.5M ARR).
            </p>
          </section>
        </div>
      </div>
    </Card>
  );
}

function Slide2() {
  return (
    <Card className="w-full flex flex-col overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-5 shrink-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-1 w-8 sm:w-12 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight break-words">
            Solution & Why It Wins
          </h2>
        </div>
      </div>
      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 min-w-0">
        <div className="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">Solution</h3>
            <p className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed break-words">
              Mizan is an AI-powered operational platform that centralizes restaurant management. It brings together
              team coordination, operational workflows, and business data into a single environment, connecting with
              POS and reservation platforms. Managers oversee operations, coordinate teams, and make decisions from one
              unified hub.
            </p>
          </section>
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">Core Unique Value Drivers</h3>
            <ul className="text-slate-800 text-base sm:text-lg font-medium space-y-2.5 leading-relaxed break-words">
              <li><strong className="font-extrabold">AI Assistant:</strong> Supports managers in daily decisions, task assignments, team coordination</li>
              <li><strong className="font-extrabold">Operational Control Layer:</strong> Unifies workflows, connects existing tools</li>
              <li><strong className="font-extrabold">Frictionless Staff:</strong> WhatsApp integration — tasks, updates, voice notes</li>
              <li><strong className="font-extrabold">API Connectivity:</strong> Seamless POS, reservation, restaurant software integrations</li>
              <li><strong className="font-extrabold">Execution-Focused:</strong> Manages daily operations, tasks, processes, coordination</li>
            </ul>
          </section>
        </div>
        <div className="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
          <section className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-sm min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-700 uppercase tracking-widest mb-2 sm:mb-3">Initial Validation</h3>
            <p className="text-slate-900 text-xl sm:text-2xl font-extrabold break-words">LOIs from 6 restaurants</p>
            <p className="text-slate-800 text-base sm:text-lg font-semibold mt-2 break-words">Willing to test the solution</p>
          </section>
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">Demo & Roadmap</h3>
            <div className="rounded-lg overflow-hidden bg-slate-200/50 aspect-video max-h-90 w-full">
              <video
                src="/mizan_ad.mp4"
                autoPlay
                playsInline
                muted
                loop
                controls
                className="w-full h-full object-cover"
              />
            </div>
          </section>
        </div>
      </div>
    </Card>
  );
}

function Slide3() {
  return (
    <Card className="w-full flex flex-col overflow-hidden">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-4 sm:pb-5 shrink-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-teal-500/10 border-b border-slate-100">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-1 w-8 sm:w-12 shrink-0 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" />
          <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold text-slate-900 tracking-tight break-words">
            Competition & Defensibility
          </h2>
        </div>
      </div>
      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 min-w-0">
        <div className="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">How Problem is Solved Today</h3>
            <p className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed break-words">
              Fragmented stack: scheduling tools, dozens of WhatsApp groups, spreadsheets/paper checklists, reservation
              platforms, physical attendance devices, POS reports. Systems operate in silos, forcing manual consolidation.
            </p>
          </section>
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">Competitors</h3>
            <ul className="text-slate-800 text-base sm:text-lg font-medium space-y-1.5 leading-relaxed break-words">
              <li><strong className="font-extrabold">7Shifts</strong> (~$70M/yr) — scheduling, labor</li>
              <li><strong className="font-extrabold">Jolt</strong> — checklists, audits, incidents, food safety</li>
              <li><strong className="font-extrabold">Zavo</strong> (YC25) — POS, payments, agents for reservation & marketing</li>
              <li><strong className="font-extrabold">Blent AI</strong> (660k/yr) — hospitality data intelligence platform</li>
              <li><strong className="font-extrabold">5-Out</strong> (~$1M–$3M/yr) — all-in-one: incidents, data, ops, POS, AI</li>
            </ul>
          </section>
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">Why Mizan Wins Today</h3>
            <ul className="text-slate-800 text-base sm:text-lg font-medium space-y-1.5 leading-relaxed break-words">
              <li><strong className="font-extrabold">Operational hub:</strong> Centralizes ops vs isolated solutions</li>
              <li><strong className="font-extrabold">AI assistance:</strong> Professional know-how, tasks, inefficiencies</li>
              <li><strong className="font-extrabold">Frictionless adoption:</strong> WhatsApp, voice notes</li>
              <li><strong className="font-extrabold">Open integrations:</strong> Plugs into POS/reservations vs replacing</li>
            </ul>
          </section>
        </div>
        <div className="space-y-4 sm:space-y-6 min-w-0 overflow-hidden">
          <section className="rounded-2xl p-4 sm:p-5 bg-slate-50/80 border border-slate-100 min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-600 uppercase tracking-widest mb-2 sm:mb-3">Defensibility (5–10 Years)</h3>
            <ul className="text-slate-800 text-base sm:text-lg font-medium space-y-1.5 leading-relaxed break-words">
              <li><strong className="font-extrabold">Operational data layer:</strong> Workflows, staffing, performance</li>
              <li><strong className="font-extrabold">Integration ecosystem:</strong> By becoming the operational layer connecting POS, reservations and staff tools, Mizan becomes the single source of truth for restaurants</li>
              <li><strong className="font-extrabold">AI loop (Stickiness):</strong> More restaurants → more data → better AI Analytics → stronger differentiation</li>
            </ul>
          </section>
          <section className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 shadow-sm min-w-0">
            <h3 className="text-xs sm:text-sm font-extrabold text-emerald-700 uppercase tracking-widest mb-2 sm:mb-3">Defensibility Moat</h3>
            <p className="text-slate-900 text-base sm:text-lg font-semibold leading-relaxed break-words">
              Deep connection to Moroccan restaurant ecosystem → direct access to owners/operators, efficient acquisition.
              Performance comes from operational execution, not from the most advanced POS. Mizan is built around this core belief.
            </p>
            <p className="text-slate-800 text-base sm:text-lg font-semibold mt-3 break-words">
              <strong className="font-extrabold">Moats:</strong> Technology, distribution, data.
            </p>
          </section>
        </div>
      </div>
    </Card>
  );
}
