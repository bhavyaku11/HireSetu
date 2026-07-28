import React from 'react';
import { Wand2, ShieldCheck, Target, Sparkles, LayoutTemplate, Download } from 'lucide-react';

const FEATURES = [
  { icon: Wand2,         title: 'AI Resume Builder',         description: 'Build a professional resume section by section with real-time live preview.' },
  { icon: ShieldCheck,   title: 'ATS Compatibility Score',   description: 'See exactly how applicant tracking systems will read your resume before applying.' },
  { icon: Target,        title: 'Job Description Matching',  description: 'Paste any job description and see your keyword match percentage and missing skills.' },
  { icon: Sparkles,      title: 'AI Content Suggestions',    description: 'Get smarter bullet points and summaries tailored to your role, not generic filler.' },
  { icon: LayoutTemplate, title: 'Clean, ATS-Safe Templates', description: 'No tables or columns that break when automated parsers read your document.' },
  { icon: Download,      title: 'One-Click Export',          description: 'Download a polished, print-ready resume PDF in seconds.' },
];

export default function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
      {/* Background subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/30 dark:from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-14 relative z-10">

        {/* ── Section Header ──────────────────────── */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
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

        {/* ── 6 Feature Cards Grid ─────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="rounded-2xl border p-7 bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 shadow-soft-xs hover:shadow-soft-md hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all duration-200 group flex flex-col"
              >
                <div className="space-y-4">
                  {/* Icon Box */}
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/70 dark:border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-soft-xs group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 dark:group-hover:bg-indigo-500 dark:group-hover:border-indigo-400 transition-all duration-200">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-2">
                    <h3 className="text-[17px] font-bold font-display text-slate-900 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
                      {feat.title}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-body leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
