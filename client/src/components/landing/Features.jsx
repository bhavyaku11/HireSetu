import React, { useRef, useState } from 'react';
import { useGSAP, gsap } from '../../lib/gsap';
import {
  AnimatedSparklesIcon,
  AnimatedShieldCheckIcon,
  AnimatedTargetIcon,
  AnimatedLayoutGridIcon,
  AnimatedDownloadCloudIcon,
} from '../icons/AnimatedIcons';

const FEATURES = [
  {
    iconComponent: AnimatedSparklesIcon,
    title: 'AI Resume Builder',
    description: 'Build a professional resume section by section with real-time live preview.',
  },
  {
    iconComponent: AnimatedShieldCheckIcon,
    title: 'ATS Compatibility Score',
    description: 'See exactly how applicant tracking systems will read your resume before applying.',
  },
  {
    iconComponent: AnimatedTargetIcon,
    title: 'Job Description Matching',
    description: 'Paste any job description and see your keyword match percentage and missing skills.',
  },
  {
    iconComponent: AnimatedSparklesIcon,
    title: 'AI Content Suggestions',
    description: 'Get smarter bullet points and summaries tailored to your role, not generic filler.',
  },
  {
    iconComponent: AnimatedLayoutGridIcon,
    title: 'Clean, ATS-Safe Templates',
    description: 'No tables or columns that break when automated parsers read your document.',
  },
  {
    iconComponent: AnimatedDownloadCloudIcon,
    title: 'One-Click Export',
    description: 'Download a polished, print-ready resume PDF in seconds.',
  },
];

export default function Features() {
  const sectionRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set('.features-header, .feature-card', { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        '.features-header',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.features-header',
            start: 'top 88%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        '.feature-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.features-grid',
            start: 'top 85%',
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-16 md:py-24 bg-slate-50/75 dark:bg-[var(--void)]/75 backdrop-blur-[1px] relative overflow-hidden"
    >
      <div data-speed="0.8" className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 dark:from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-14 relative z-10">

        {/* Section Header */}
        <div className="features-header text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 shadow-soft-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
            <span className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-400 tracking-tight">
              Powerful Features
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">get hired</span>
          </h2>
          <p className="text-sm sm:text-[15px] text-slate-500 dark:text-slate-400 font-body leading-relaxed">
            Engineered specifically to help job seekers stand out, pass automated screeners, and land interviews.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="features-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, index) => {
            const IconComp = feature.iconComponent;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={index}
                className="feature-card bg-white dark:bg-[var(--ink)] p-7 rounded-2xl border border-slate-200/80 dark:border-[var(--border-glass)] shadow-soft-xs hover:shadow-soft-md hover:border-indigo-300 dark:hover:border-[var(--signal)]/30 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center shadow-soft-xs group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors duration-200">
                    <IconComp
                      className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                      isHovered={isHovered}
                    />
                  </div>
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-[var(--parchment)] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-[var(--dust)] font-body leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
