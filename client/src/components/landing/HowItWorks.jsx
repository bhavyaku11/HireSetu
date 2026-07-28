import React from 'react';
import { Link } from 'react-router-dom';

const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-6 h-6 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: 'Build or Import',
    desc: 'Start fresh with our guided form editor — fill in your experience, education, projects, and skills. Already have a resume? Import it and we\'ll structure it for you. Everything auto-saves as you go.',
  },
  {
    num: '02',
    icon: (
      <svg className="w-6 h-6 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Get Instant Feedback',
    desc: 'Our AI scans your resume for ATS compatibility, weak bullet points, missing sections, and formatting issues — and gives you a resume strength score with clear, actionable fixes.',
  },
  {
    num: '03',
    icon: (
      <svg className="w-6 h-6 text-indigo-500 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: 'Match & Export',
    desc: 'Paste any job description and instantly see your keyword match score and the gaps holding you back. Apply AI suggestions, then export a clean, recruiter-ready PDF in one click.',
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-16 md:py-24 bg-white dark:bg-slate-900 relative overflow-hidden"
    >
      {/* Subtle top divider */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/40 dark:via-indigo-500/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-14">

        {/* ── Section Header ──────────────────────── */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
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

        {/* ── Step Cards Grid ─────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {STEPS.map((step, idx) => (
            <div key={step.num} className="relative">
              {/* Connector arrow — desktop only */}
              {idx < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8">
                  <svg className="w-5 h-5 text-indigo-300 dark:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}

              <div className="h-full rounded-2xl border p-7 bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:shadow-soft-md transition-all duration-200 group">
                {/* Top row: icon box + step number */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/60 dark:border-indigo-500/20 flex items-center justify-center shadow-soft-xs group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors duration-200">
                    {step.icon}
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
          ))}
        </div>

        {/* ── Bottom CTA nudge ────────────────────── */}
        <div className="text-center">
          <p className="text-[13px] text-slate-400 dark:text-slate-500 font-medium">
            Takes less than 5 minutes to get started —{' '}
            <Link to="/login" className="text-indigo-500 dark:text-indigo-400 font-semibold hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline underline-offset-2 transition-colors">
              try it free
            </Link>
          </p>
        </div>
      </div>

      {/* Subtle bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/40 dark:via-indigo-500/20 to-transparent" />
    </section>
  );
}
