import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

/* ─── Decorative dot-grid SVG ────────────────────────────────────────── */
function DotGrid({ className = '' }) {
  return (
    <svg
      aria-hidden="true"
      className={`absolute pointer-events-none select-none ${className}`}
      width="280"
      height="280"
      viewBox="0 0 280 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {Array.from({ length: 10 }).map((_, row) =>
        Array.from({ length: 10 }).map((_, col) => (
          <circle
            key={`${row}-${col}`}
            cx={col * 28 + 14}
            cy={row * 28 + 14}
            r="2"
            fill="currentColor"
            className="text-indigo-500 dark:text-indigo-400"
            fillOpacity="0.18"
          />
        ))
      )}
    </svg>
  );
}

/* ─── Resume card mockup (CSS skeleton) ──────────────────────────────── */
function ResumeCard({ className = '', style = {} }) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/90 dark:border-slate-700 shadow-soft-xl overflow-hidden ${className}`}
      style={style}
    >
      {/* Card top accent strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 to-indigo-400 dark:from-indigo-400 dark:to-cyan-400" />

      <div className="px-5 py-5 space-y-4">
        {/* Header: name + contact line */}
        <div className="space-y-1.5 pb-3.5 border-b border-slate-100 dark:border-slate-700/50">
          <div className="h-4 w-36 bg-slate-900 dark:bg-slate-200 rounded-md" />
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-2 w-20 bg-slate-300 dark:bg-slate-600 rounded" />
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="h-2 w-24 bg-slate-300 dark:bg-slate-600 rounded" />
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <div className="h-2 w-16 bg-slate-300 dark:bg-slate-600 rounded" />
          </div>
        </div>

        {/* Section: Summary */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-20 bg-indigo-600 dark:bg-indigo-400 rounded" />
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            {/* "AI Enhanced" chip */}
            <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 text-[9px] font-bold rounded-md tracking-wide">
              AI
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-1.5 w-11/12 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-1.5 w-4/5 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Section: Experience */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 bg-slate-800 dark:bg-slate-300 rounded" />
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex justify-between items-baseline">
            <div className="h-2.5 w-32 bg-slate-700 dark:bg-slate-400 rounded" />
            <div className="h-1.5 w-16 bg-slate-300 dark:bg-slate-600 rounded" />
          </div>
          <div className="pl-2.5 border-l-2 border-indigo-200 dark:border-indigo-500/30 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <div className="h-1.5 w-full bg-indigo-50 dark:bg-indigo-500/20 rounded" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <div className="h-1.5 w-10/12 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
              <div className="h-1.5 w-9/12 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        </div>

        {/* Section: Skills */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 bg-slate-800 dark:bg-slate-300 rounded" />
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['React', 'Node.js', 'SQL', 'TypeScript', 'Git'].map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-500/20 text-[9px] font-semibold rounded-md"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Hero Component ────────────────────────────────────────────── */
export default function Hero() {
  return (
    <section className="relative hero-bg min-h-[calc(100dvh-64px)] flex items-center py-16 md:py-20 overflow-hidden">
      
      {/* ── Soft violet orbs for depth ─────────────── */}
      <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full bg-indigo-200/25 dark:bg-indigo-500/10 blur-[80px] pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-[380px] h-[380px] rounded-full bg-indigo-100/30 dark:bg-indigo-400/5 blur-[64px] pointer-events-none" />

      {/* ── Content wrapper ───────────────────────── */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-12 lg:gap-16 items-center">

          {/* ══════════════════════════════════════════
              LEFT COLUMN — Copy & CTAs
          ══════════════════════════════════════════ */}
          <div className="space-y-8 text-center lg:text-left">

            {/* Pill badge — adds context the headline doesn't */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 shadow-soft-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
              <span className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-400 tracking-tight">
                Free for students &amp; fresh grads
              </span>
            </div>

            {/* Headline — one line, committed */}
            <h1 className="text-[42px] sm:text-[54px] lg:text-[60px] font-extrabold font-display text-slate-900 dark:text-slate-100 tracking-[-0.03em] leading-[1.06]">
              Your resume,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">done right</span>
              {' '}— in minutes.
            </h1>

            {/* Supporting line — peer tone, no jargon */}
            <p className="text-[16px] sm:text-[17px] text-slate-500 dark:text-slate-400 font-body leading-[1.7] max-w-lg mx-auto lg:mx-0">
              Tell us where you've been. HireSetu writes the resume
              that gets you where you're going.
            </p>

            {/* CTA buttons — exactly two */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full sm:w-auto shadow-soft-md px-7"
                  rightIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  }
                >
                  Build Resume with AI
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-7"
                >
                  Check Resume Score
                </Button>
              </Link>
            </div>

            {/* Trust micro-badges — earn their space here */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
              {[
                { dot: 'bg-emerald-400', text: 'Free to start' },
                { dot: 'bg-indigo-500 dark:bg-indigo-400', text: 'ATS-compatible layouts' },
                { dot: 'bg-cyan-400', text: 'Auto-saves as you type' },
              ].map(({ dot, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* ══════════════════════════════════════════
              RIGHT COLUMN — Layered resume mockup
          ══════════════════════════════════════════ */}
          <div className="relative flex justify-center lg:justify-end">

            {/* Dot-grid decoration — behind both cards */}
            <DotGrid className="bottom-0 right-0 translate-x-6 translate-y-6 z-0" />

            {/* ── Back card (offset, rotated slightly) ─ */}
            <ResumeCard
              className="absolute top-6 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-0 w-[300px] opacity-80 z-10"
              style={{ transform: 'rotate(3deg) translateY(20px) scale(0.92)' }}
            />

            {/* ── Front card (main, centered) ────────── */}
            <div className="relative z-20 w-[300px] lg:w-[320px]">
              <ResumeCard style={{ transform: 'rotate(-1.5deg)' }} />

              {/* Floating badge: ATS score — top-right */}
              <div className="absolute -top-4 -right-5 z-30">
                <div className="bg-white dark:bg-slate-800 border border-emerald-200/90 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 shadow-soft-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-bold font-display whitespace-nowrap">
                  <span className="relative flex w-2 h-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-500 dark:bg-emerald-400" />
                  </span>
                  94% ATS Match
                </div>
              </div>

              {/* Floating badge: auto-save — bottom-left */}
              <div className="absolute -bottom-4 -left-5 z-30 hidden sm:flex">
                <div className="bg-slate-900 dark:bg-slate-700 text-white shadow-soft-md px-3 py-1.5 rounded-full flex items-center gap-1.5 text-[11px] font-medium font-body whitespace-nowrap border dark:border-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  ⚡ Saved automatically
                </div>
              </div>
            </div>

            {/* ── Floating rocket icon — top-right of visual area ── */}
            <div
              className="animate-float absolute -top-8 right-0 lg:-right-4 z-30 text-3xl pointer-events-none"
              aria-hidden="true"
            >
              🚀
            </div>

            {/* Ambient glow behind all cards */}
            <div className="absolute inset-4 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-3xl blur-2xl -z-10" />
          </div>

        </div>
      </div>
    </section>
  );
}
