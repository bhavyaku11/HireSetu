import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';

const STEPS = [
  {
    num: '01',
    icon: (
      <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
    title: 'Build or Import',
    desc: 'Start fresh with our guided form editor — fill in your experience, education, projects, and skills. Already have a resume? Import it and we\'ll structure it for you. Everything auto-saves as you go.',
    accent: 'from-brand-50 to-white',
    border: 'border-brand-100',
  },
  {
    num: '02',
    icon: (
      <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Get Instant Feedback',
    desc: 'Our AI scans your resume for ATS compatibility, weak bullet points, missing sections, and formatting issues — and gives you a resume strength score with clear, actionable fixes.',
    accent: 'from-violet-50 to-white',
    border: 'border-violet-100',
  },
  {
    num: '03',
    icon: (
      <svg className="w-6 h-6 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
    title: 'Match & Export',
    desc: 'Paste any job description and instantly see your keyword match score and the gaps holding you back. Apply AI suggestions, then export a clean, recruiter-ready PDF in one click.',
    accent: 'from-indigo-50 to-white',
    border: 'border-indigo-100',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white relative overflow-hidden">

      {/* Subtle top divider gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />

      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 space-y-14">

        {/* ── Section Header ──────────────────────── */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          {/* Eyebrow pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
            <span className="text-[12px] font-semibold text-brand-700 tracking-tight">How It Works</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-surface-900 tracking-tight leading-tight">
            Three steps from draft to{' '}
            <span className="text-gradient-brand">done</span>
          </h2>
          <p className="text-sm sm:text-[15px] text-surface-500 font-body leading-relaxed">
            No guesswork. No starting from scratch every time.<br className="hidden sm:block" />
            HireSetu takes you from blank page to application-ready.
          </p>
        </div>

        {/* ── Step Cards Grid ─────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">

          {STEPS.map((step, idx) => (
            <div key={step.num} className="relative">

              {/* Connector arrow — desktop only, between cards */}
              {idx < STEPS.length - 1 && (
                <div className="hidden md:flex absolute -right-4 lg:-right-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-8 h-8">
                  <svg className="w-5 h-5 text-brand-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}

              <Card
                hoverable
                padding="p-7"
                className={`h-full bg-gradient-to-b ${step.accent} border ${step.border} hover:border-brand-300 hover:shadow-soft-md transition-all duration-200 group`}
              >
                {/* Top row: icon box + step number */}
                <div className="flex items-start justify-between mb-5">
                  {/* Icon in a soft violet square */}
                  <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200/60 flex items-center justify-center shadow-soft-xs group-hover:bg-brand-100 transition-colors duration-200">
                    {step.icon}
                  </div>

                  {/* Step number — solid violet, prominent */}
                  <span className="text-[13px] font-black font-display tracking-widest text-white bg-brand-500 px-2.5 py-1 rounded-full leading-none shadow-soft-xs">
                    {step.num}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[17px] font-bold font-display text-surface-900 leading-snug mb-2 group-hover:text-brand-700 transition-colors duration-200">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-surface-500 font-body leading-[1.65]">
                  {step.desc}
                </p>
              </Card>
            </div>
          ))}
        </div>

        {/* ── Bottom CTA nudge ────────────────────── */}
        <div className="text-center">
          <p className="text-[13px] text-surface-400 font-medium">
            Takes less than 5 minutes to get started —{' '}
            <Link to="/login" className="text-brand-500 font-semibold hover:text-brand-700 hover:underline underline-offset-2 transition-colors">
              try it free
            </Link>
          </p>
        </div>
      </div>

      {/* Subtle bottom divider gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-200 to-transparent" />
    </section>
  );
}
