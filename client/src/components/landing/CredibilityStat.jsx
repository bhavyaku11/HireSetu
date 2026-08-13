import React, { useRef } from 'react';
import { useGSAP, gsap } from '../../lib/gsap';

export default function CredibilityStat() {
  const sectionRef = useRef(null);
  // countRef points at the text node we'll write the animated number into
  const countRef = useRef(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // For reduced-motion users: skip all animation and show the final state immediately.
      if (prefersReducedMotion) {
        if (countRef.current) countRef.current.textContent = '88%';
        gsap.set('.credibility-card', { opacity: 1, y: 0 });
        return;
      }

      // ── Card entrance: gentle fade + tiny slide-up when the section enters view.
      gsap.fromTo(
        '.credibility-card',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.credibility-card',
            start: 'top 86%',
            once: true,
          },
        }
      );

      // ── Animated counter: tween a plain object's numeric property and write the
      //    rounded integer to the DOM on every tick. "once: true" ensures this fires
      //    exactly once — even if the user scrolls back past the section, it stays
      //    at 88% and does not reset.
      const counter = { val: 0 };
      gsap.to(counter, {
        val: 88,
        duration: 1.6,
        ease: 'power2.out',
        onUpdate() {
          if (countRef.current) {
            countRef.current.textContent = `${Math.round(counter.val)}%`;
          }
        },
        scrollTrigger: {
          trigger: '.credibility-card',
          start: 'top 80%',
          once: true,   // never re-runs on scroll-back; counter stays at 88%
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-24 bg-slate-50/75 dark:bg-[var(--void)]/75 backdrop-blur-[1px] relative overflow-hidden"
    >
      {/* ── Decorative atmospheric orbs — data-speed parallax (decorative only, never text/interactive)
           0.82 → lags behind scroll (feels distant, like background atmosphere)
           0.9  → lags slightly less (middle depth layer) */}
      <div
        data-speed="0.82"
        className="absolute -top-20 -left-20 w-[360px] h-[360px] rounded-full bg-indigo-200/20 dark:bg-indigo-500/8 blur-[90px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        data-speed="0.9"
        className="absolute -bottom-16 -right-16 w-[280px] h-[280px] rounded-full bg-cyan-200/20 dark:bg-cyan-500/6 blur-[70px] pointer-events-none"
        aria-hidden="true"
      />
      <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center space-y-6 relative z-10">

        {/* credibility-card class is the GSAP target for both the entrance tween
            and the counter ScrollTrigger. */}
        <div className="credibility-card rounded-2xl border p-8 sm:p-12 bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/50 shadow-soft-sm hover:shadow-soft-md transition-shadow">

          {/* Eyebrow / Label */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4 border border-indigo-200/60 dark:border-indigo-500/20">
            <span>The Hiring Reality</span>
          </div>

          {/* Large Stat Number — driven by GSAP counter tween via countRef.
              Starts at "0%" (the initial textContent) and counts up to "88%"
              when the ScrollTrigger fires. Gradient text is preserved because
              the className stays on the wrapper div. */}
          <div className="text-6xl sm:text-7xl lg:text-8xl font-extrabold font-display bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300 tracking-tight leading-none">
            <span ref={countRef}>0%</span>
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
              Source: <span className="text-slate-600 dark:text-slate-300 font-semibold">Harvard Business School &amp; Accenture Study</span> — <span className="italic">&quot;Hidden Workers: Untapped Talent&quot;</span>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
