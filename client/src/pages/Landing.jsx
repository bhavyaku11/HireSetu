import React, { useRef } from 'react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import CredibilityStat from '../components/landing/CredibilityStat';
import AtsEducation from '../components/landing/AtsEducation';
import FAQ from '../components/landing/FAQ';
import Footer from '../components/landing/Footer';
import HexagonBackground from '../components/ui/HexagonBackground';
import { useGSAP, ScrollSmoother } from '../lib/gsap';

export default function Landing() {
  const landingRef = useRef(null);

  useGSAP(
    () => {
      // Respect prefers-reduced-motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      // Initialize ScrollSmoother for landing page route only
      const smoother = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.2,
        smoothTouch: 0.1,
        // effects: true enables reading data-speed attributes on decorative
        // elements for tasteful parallax depth — only active when
        // prefers-reduced-motion is NOT set (checked above).
        effects: true,
      });

      return () => {
        if (smoother) smoother.kill();
      };
    },
    { scope: landingRef }
  );

  return (
    <div
      ref={landingRef}
      className="min-h-screen bg-slate-50 dark:bg-[var(--void)] font-body text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-400 flex flex-col relative"
    >
      {/* ── Fixed Full-Page Hexagon Backdrop (OUTSIDE smooth-content so fixed positioning stays pinned) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-80 dark:opacity-60">
        <HexagonBackground hexagonSize={54} hexagonMargin={2} />
      </div>

      {/* ── Fixed Header Bar (OUTSIDE smooth-content so sticky header behaves predictably) ── */}
      <Header />

      {/* ── GSAP ScrollSmoother Container Structure ── */}
      <div id="smooth-wrapper" className="w-full relative z-10">
        <div id="smooth-content" className="w-full">
          {/* Main Content */}
          <main className="flex-1">
            <Hero />
            <HowItWorks />
            <Features />
            <AtsEducation />
            <CredibilityStat />
            <FAQ />
          </main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}
