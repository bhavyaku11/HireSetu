import React from 'react';
import Badge from './Badge';

export default function ScoreMeter({ score = 0, breakdown = null }) {
  const safeScore = Math.max(0, Math.min(100, score));

  // Circular SVG dimensions
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  // Score tier color mapping
  const getTierDetails = (val) => {
    if (val >= 85) {
      return {
        label: 'Excellent',
        variant: 'success',
        color: '#10b981', // emerald-500
        gradientId: 'scoreGradGreen',
        gradFrom: '#059669',
        gradTo: '#34d399',
        textClass: 'text-emerald-600',
        bgClass: 'bg-emerald-50 border-emerald-200',
      };
    }
    if (val >= 70) {
      return {
        label: 'Strong',
        variant: 'primary',
        color: '#0284c7', // brand-600
        gradientId: 'scoreGradBrand',
        gradFrom: '#0284c7',
        gradTo: '#38bdf8',
        textClass: 'text-brand-600',
        bgClass: 'bg-brand-50 border-brand-200',
      };
    }
    if (val >= 50) {
      return {
        label: 'Needs Work',
        variant: 'warning',
        color: '#f59e0b', // amber-500
        gradientId: 'scoreGradAmber',
        gradFrom: '#d97706',
        gradTo: '#fbbf24',
        textClass: 'text-amber-600',
        bgClass: 'bg-amber-50 border-amber-200',
      };
    }
    return {
      label: 'Action Required',
      variant: 'danger',
      color: '#f43f5e', // rose-500
      gradientId: 'scoreGradRose',
      gradFrom: '#e11d48',
      gradTo: '#fb7185',
      textClass: 'text-rose-600',
      bgClass: 'bg-rose-50 border-rose-200',
    };
  };

  const tier = getTierDetails(safeScore);

  const atsScore = breakdown?.atsScore ?? safeScore;
  const contentScore = breakdown?.contentScore ?? safeScore;
  const grammarScore = breakdown?.grammarScore ?? safeScore;

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 p-6 md:p-8 rounded-2xl bg-surface-50/90 border border-surface-200 shadow-soft-sm">
      {/* Circular Progress Ring */}
      <div className="relative flex flex-col items-center justify-center shrink-0">
        <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
          <defs>
            <linearGradient id={tier.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={tier.gradFrom} />
              <stop offset="100%" stopColor={tier.gradTo} />
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="10"
            fill="transparent"
            className="text-surface-200"
          />

          {/* Animated Progress Circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={`url(#${tier.gradientId})`}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-0.5">
          <span className="text-3xl font-black font-display tracking-tight text-surface-900 leading-none">
            {safeScore}
          </span>
          <span className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">
            out of 100
          </span>
        </div>
      </div>

      {/* Score Description & Sub-Metrics Bars */}
      <div className="flex-1 w-full space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-200/70 pb-3">
          <div>
            <div className="inline-flex items-center gap-2">
              <Badge variant={tier.variant} size="sm">
                {tier.label}
              </Badge>
              <span className="text-xs font-semibold text-surface-500">Overall Strength Rating</span>
            </div>
            <h4 className="text-lg font-bold font-display text-surface-900 mt-1">
              Resume Strength Index
            </h4>
          </div>
        </div>

        {/* Sub-Metrics Progress Bars with Category Weights */}
        <div className="space-y-3.5 pt-1">
          {/* 1. ATS Parsability (40% Weight, Rule-Based) */}
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold font-display">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-surface-800">ATS Parsability & Structure</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-brand-100 text-brand-700">40% Weight</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-200 text-surface-600">Rule-Based</span>
              </div>
              <span className="text-surface-900">{atsScore}/100</span>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-brand-500 h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${atsScore}%` }}
              ></div>
            </div>
          </div>

          {/* 2. Content Quality (35% Weight, Rule-Based) */}
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold font-display">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-surface-800">Content Quality & Metrics</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-700">35% Weight</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-200 text-surface-600">Rule-Based</span>
              </div>
              <span className="text-surface-900">{contentScore}/100</span>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${contentScore}%` }}
              ></div>
            </div>
          </div>

          {/* 3. Grammar & Readability (25% Weight, AI-Judged) */}
          <div className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold font-display">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-surface-800">Grammar & Readability</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-sky-100 text-sky-700">25% Weight</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-700">AI-Judged</span>
              </div>
              <span className="text-surface-900">{grammarScore}/100</span>
            </div>
            <div className="w-full bg-surface-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-2 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${grammarScore}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
