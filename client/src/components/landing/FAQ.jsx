import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '../ui/Card';

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
    question: 'Can I import my existing resume?',
    answer:
      'Resume file import is coming soon in an upcoming update! Right now, you can quickly build your resume section by section using our intuitive form editor with real-time auto-saving.',
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
    <section id="faq" className="py-16 md:py-24 bg-surface-50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 space-y-12 relative z-10">
        
        {/* ── Section Header ──────────────────────── */}
        <div className="text-center space-y-4 max-w-xl mx-auto">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 shadow-soft-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
            <span className="text-[12px] font-semibold text-brand-700 tracking-tight">
              Got Questions?
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-surface-900 tracking-tight leading-tight">
            Frequently Asked <span className="text-gradient-brand">Questions</span>
          </h2>
          <p className="text-sm sm:text-[15px] text-surface-500 font-body leading-relaxed">
            Everything you need to know about HireSetu and how our ATS resume builder works.
          </p>
        </div>

        {/* ── Accordion List ─────────────────────── */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Card
                key={faq.question}
                padding="p-0"
                className={`overflow-hidden transition-all duration-200 bg-white border ${
                  isOpen
                    ? 'border-brand-200 shadow-soft-md ring-1 ring-brand-500/10'
                    : 'border-surface-200/80 shadow-soft-xs hover:border-brand-200/60 hover:shadow-soft-sm'
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
                    isOpen ? 'text-brand-600' : 'text-surface-900'
                  }`}>
                    {faq.question}
                  </span>

                  <span className={`ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isOpen ? 'bg-brand-50 text-brand-600 rotate-180' : 'bg-surface-100 text-surface-500'
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
                    <div className="px-6 pb-6 pt-1 border-t border-surface-100 text-xs sm:text-sm text-surface-600 font-body leading-relaxed">
                      {faq.answer}
                    </div>
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
