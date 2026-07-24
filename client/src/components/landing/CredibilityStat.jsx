import React from 'react';
import { Card } from '../ui/Card';

export default function CredibilityStat() {
  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6 relative z-10">
        
        {/* Container Card */}
        <Card
          padding="p-8 sm:p-12"
          className="bg-gradient-to-b from-brand-50/60 to-white border-brand-100 shadow-soft-sm hover:shadow-soft-md transition-shadow"
        >
          {/* Eyebrow / Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100/60 text-brand-700 text-xs font-semibold uppercase tracking-wider mb-4">
            <span>The Hiring Reality</span>
          </div>

          {/* Large Stat Number */}
          <div className="text-6xl sm:text-7xl lg:text-8xl font-extrabold font-display text-gradient-brand tracking-tight leading-none">
            88%
          </div>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg lg:text-xl font-bold font-display text-surface-900 max-w-2xl mx-auto leading-snug pt-2">
            of employers acknowledge that automated hiring systems filter out qualified candidates over minor keyword or formatting mismatches.
          </p>

          {/* Impact Statement */}
          <p className="text-xs sm:text-sm text-surface-500 font-body max-w-lg mx-auto leading-relaxed pt-1">
            HireSetu ensures your resume is formatted and keyword-optimized so your real experience actually reaches human recruiters.
          </p>

          {/* Real Verifiable Source Citation */}
          <div className="pt-6 border-t border-brand-100/80 mt-6">
            <p className="text-[11px] text-surface-400 font-medium tracking-wide uppercase">
              Source: <span className="text-surface-600 font-semibold">Harvard Business School &amp; Accenture Study</span> — <span className="italic">"Hidden Workers: Untapped Talent"</span>
            </p>
          </div>
        </Card>

      </div>
    </section>
  );
}
