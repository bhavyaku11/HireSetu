import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    question: 'Is HireSetu free to use?',
    answer:
      'Yes, HireSetu is 100% free to use while in active development. You can build, format, and export ATS-optimized resumes with full access to all builder features without any credit card or hidden fees.',
  },
  {
    question: 'What makes a resume ATS-friendly?',
    answer:
      'An ATS-friendly resume uses a clean single-column layout, standard section titles (such as Experience, Education, and Skills), standard readable typography, and avoids complex tables, multi-column designs, or embedded graphics that cause applicant tracking system parsers to fail.',
  },
  {
    question: 'Do I really need to tailor my resume for every job?',
    answer:
      "Yes, but you don't need to rewrite it from scratch. The best approach is to maintain a 'base' resume, then duplicate and tweak the summary and key bullets to match the specific keywords in the job description you're applying for. HireSetu's job matching tool makes this exact workflow easy.",
  },
  {
    question: 'Should I include a photo on my resume?',
    answer:
      "In the US, UK, Canada, and Australia, you should almost never include a photo unless you're an actor or model. It can introduce unconscious bias, and some companies will auto-reject resumes with photos to avoid discrimination liabilities. For some European and Asian countries, it's expected, so tailor this based on your region.",
  },
  {
    question: 'What if I have employment gaps?',
    answer:
      "Be honest but concise. If it's a gap of a few months, simply list years instead of months for your roles (e.g., 2022-2023). If it's a longer gap, you can add a brief one-line note (e.g., 'Sabbatical for family care' or 'Career break for travel') so the recruiter doesn't have to guess.",
  },
  {
    question: 'How does the AI improve my resume?',
    answer:
      'HireSetu AI analyzes your experience bullets to suggest stronger action verbs, highlight quantifiable achievements, recommend role-relevant technical keywords, and score your overall ATS readiness.',
  },
  {
    question: 'Is my resume data private?',
    answer:
      'Yes. Your personal information and resume data are stored securely in your private account. We do not sell your personal data or share your resume with recruiters without your explicit permission.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // Default open first question

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section id="faq" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-12 relative z-10">
        
        {/* ── Section Header ──────────────────────── */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 shadow-soft-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" />
            <span className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-400 tracking-tight">
              Got Questions?
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            Frequently Asked <span className="bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">Questions</span>
          </h2>
          <p className="text-sm sm:text-[15px] text-slate-500 dark:text-slate-400 font-body leading-relaxed">
            Everything you need to know about HireSetu and how our ATS resume builder works.
          </p>
        </div>

        {/* ── Accordion List ─────────────────────── */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className={`overflow-hidden transition-all duration-200 bg-white dark:bg-slate-800/60 rounded-2xl border ${
                  isOpen
                    ? 'border-indigo-200 dark:border-indigo-500/50 shadow-soft-md ring-1 ring-indigo-500/10 dark:ring-indigo-500/20'
                    : 'border-slate-200 dark:border-slate-700/50 shadow-soft-xs hover:border-indigo-200/60 dark:hover:border-indigo-500/30 hover:shadow-soft-sm'
                }`}
              >
                {/* Accordion Trigger Header */}
                <button
                  type="button"
                  onClick={() => toggleFAQ(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className={`text-[15px] sm:text-base font-bold font-display tracking-tight transition-colors ${
                    isOpen ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-slate-100'
                  }`}>
                    {faq.question}
                  </span>

                  <span className={`ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isOpen ? 'bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rotate-180' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'
                  }`}>
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </button>

                {/* Accordion Content Panel with Smooth Animation */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pt-1 border-t border-slate-100 dark:border-slate-700/50 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-body leading-relaxed">
                      {faq.answer}
                    </div>
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
