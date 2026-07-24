import React from 'react';
import {
  Wand2,
  ShieldCheck,
  Target,
  Sparkles,
  LayoutTemplate,
  Download,
} from 'lucide-react';
import { Card } from '../ui/Card';

const FEATURES = [
  {
    icon: Wand2,
    title: 'AI Resume Builder',
    description:
      'Build a professional resume section by section with real-time live preview.',
  },
  {
    icon: ShieldCheck,
    title: 'ATS Compatibility Score',
    description:
      'See exactly how applicant tracking systems will read your resume before applying.',
  },
  {
    icon: Target,
    title: 'Job Description Matching',
    description:
      'Paste any job description and see your keyword match percentage and missing skills.',
  },
  {
    icon: Sparkles,
    title: 'AI Content Suggestions',
    description:
      'Get smarter bullet points and summaries tailored to your role, not generic filler.',
  },
  {
    icon: LayoutTemplate,
    title: 'Clean, ATS-Safe Templates',
    description:
      'No tables or columns that break when automated parsers read your document.',
  },
  {
    icon: Download,
    title: 'One-Click Export',
    description:
      'Download a polished, print-ready resume PDF in seconds.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-surface-50 relative overflow-hidden">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-brand-canvas opacity-60 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-14 relative z-10">
        {/* ── Section Header ──────────────────────── */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 shadow-soft-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
            <span className="text-[12px] font-semibold text-brand-700 tracking-tight">
              Powerful Features
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-surface-900 tracking-tight leading-tight">
            Everything you need to{' '}
            <span className="text-gradient-brand">get hired</span>
          </h2>
          <p className="text-sm sm:text-[15px] text-surface-500 font-body leading-relaxed">
            Engineered specifically to help job seekers stand out, pass automated screeners, and land interviews.
          </p>
        </div>

        {/* ── 6 Feature Cards Grid (3-col desktop, 2-col tablet, 1-col mobile) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <Card
                key={feat.title}
                hoverable
                padding="p-7"
                className="bg-white/90 border-surface-200/80 shadow-soft-xs hover:shadow-soft-md transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Icon Box */}
                  <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200/70 flex items-center justify-center text-brand-600 shadow-soft-xs group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 transition-all duration-200">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-[17px] font-bold font-display text-surface-900 leading-snug group-hover:text-brand-600 transition-colors duration-200">
                      {feat.title}
                    </h3>

                    <p className="text-[13px] text-surface-500 font-body leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
