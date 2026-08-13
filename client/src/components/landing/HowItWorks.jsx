import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useGSAP, gsap } from '../../lib/gsap';
import { AnimatedPenIcon, AnimatedShieldCheckIcon, AnimatedDownloadCloudIcon } from '../icons/AnimatedIcons';

const STEPS = [
  {
    num: '01',
    iconComponent: AnimatedPenIcon,
    title: 'Build or Import',
    desc: "Start fresh with our guided form editor — fill in your experience, education, projects, and skills. Already have a resume? Import it and we'll structure it for you. Everything auto-saves as you go.",
  },
  {
    num: '02',
    iconComponent: AnimatedShieldCheckIcon,
    title: 'Get Instant Feedback',
    desc: 'Our AI scans your resume for ATS compatibility, weak bullet points, missing sections, and formatting issues — and gives you a resume strength score with clear, actionable fixes.',
  },
  {
    num: '03',
    iconComponent: AnimatedDownloadCloudIcon,
    title: 'Match & Export',
    desc: 'Paste any job description and instantly see your keyword match score and the gaps holding you back. Apply AI suggestions, then export a clean, recruiter-ready PDF in one click.',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        gsap.set('.hiw-header, .hiw-step-card, .hiw-step-arrow', { opacity: 1, y: 0 });
        return;
      }

      gsap.fromTo(
        '.hiw-header',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.hiw-header',
            start: 'top 88%',
            once: true,
          },
        }
      );

      gsap.fromTo(
        '.hiw-step-card, .hiw-step-arrow',
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: 'power2.out',
          stagger: 0.1,
          scrollTrigger: {
            trigger: '.hiw-steps-grid',
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
      id="how-it-works"
      className="py-16 md:py-24 bg-white/80 dark:bg-[#0A0A12]/80 backdrop-blur-[1px] relative overflow-hidden"
    >
      <div data-speed="0.85" className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/40 dark:via-indigo-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-14">

        {/* Section Header */}
        <div className="hiw-header text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
            <span className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-400 tracking-tight">How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Three steps from draft to{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">done</span>
          </h2>
          <p className="text-sm sm:text-[15px] text-slate-500 dark:text-slate-400 font-body leading-relaxed">
            No guesswork. No starting from scratch every time.<br className="hidden sm:block" />
            HireSetu takes you from blank page to application-ready.
          </p>
        </div>

        {/* Step Cards Grid */}
        <div className="hiw-steps-grid flex flex-col md:flex-row items-stretch md:items-center justify-between">
          {STEPS.map((step, idx) => {
            const IconComp = step.iconComponent;
            const isHovered = hoveredIndex === idx;

            return (
              <React.Fragment key={step.num}>
                <div
                  className="hiw-step-card flex-1 w-full"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="h-full rounded-2xl border p-7 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-soft-md transition-all duration-200 group flex flex-col justify-between cursor-pointer">
                    <div>
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center shadow-soft-xs group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors duration-200">
                          <IconComp
                            className="w-6 h-6 text-indigo-600 dark:text-indigo-400"
                            isHovered={isHovered}
                          />
                        </div>
                        <span className="text-[13px] font-black font-display tracking-widest text-white bg-indigo-500 dark:bg-indigo-600 px-2.5 py-1 rounded-full leading-none shadow-soft-xs">
                          {step.num}
                        </span>
                      </div>

                      <h3 className="text-[17px] font-bold font-display text-slate-900 dark:text-slate-100 leading-snug mb-2 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors duration-200">
                        {step.title}
                      </h3>
                      <p className="text-[13px] text-slate-500 dark:text-slate-400 font-body leading-[1.65]">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {idx < STEPS.length - 1 && (
                  <div className="hiw-step-arrow flex-shrink-0 flex items-center justify-center my-3 md:my-0 mx-auto md:mx-4 lg:mx-6 transition-transform duration-200">
                    <div className="w-8 h-8 rounded-full bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/70 dark:border-indigo-800/70 flex items-center justify-center shadow-soft-xs rotate-90 md:rotate-0">
                      <svg className="w-4 h-4 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Bottom CTA nudge */}
        <div className="text-center">
          <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
            Takes less than 5 minutes to get started —{' '}
            <Link to="/login" className="text-indigo-500 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline underline-offset-2 transition-colors">
              try it free
            </Link>
          </p>
        </div>
      </div>

      <div data-speed="0.85" className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/40 dark:via-indigo-500/20 to-transparent" />
    </section>
  );
}
