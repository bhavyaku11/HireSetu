import React from 'react';

export default function CredibilityStat() {
  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6 relative z-10">

        {/* Container Card */}
        <div className="rounded-2xl border p-8 sm:p-12 bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/50 shadow-soft-sm hover:shadow-soft-md transition-shadow">

          {/* Eyebrow / Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-200/60 dark:border-indigo-500/20">
            <span>The Hiring Reality</span>
          </div>

          {/* Large Stat Number — indigo gradient, readable in both modes */}
          <div className="text-6xl sm:text-7xl lg:text-8xl font-extrabold font-display bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300 tracking-tight leading-none">
            88%
          </div>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl font-bold font-display text-slate-900 dark:text-slate-100 max-w-2xl mx-auto leading-snug pt-2">
            of employers acknowledge that automated hiring systems filter out qualified candidates over minor keyword or formatting mismatches.
          </p>

          {/* Impact Statement */}
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-body max-w-lg mx-auto leading-relaxed pt-1">
            HireSetu ensures your resume is formatted and keyword-optimized so your real experience actually reaches human recruiters.
          </p>

          {/* Source Citation */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase">
              Source: <span className="text-slate-600 dark:text-slate-300 font-semibold">Harvard Business School & Accenture Study</span> — <span className="italic">"Hidden Workers: Untapped Talent"</span>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
