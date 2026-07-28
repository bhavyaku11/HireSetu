import React from 'react';
import Badge from '../ui/Badge';

export default function JdMatchScoreMeter({
  matchPercentage = 0,
  matchedCount = 0,
  missingCount = 0,
  totalKeywords = 0,
}) {
  const safeScore = Math.max(0, Math.min(100, Math.round(matchPercentage)));

  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const getTierDetails = (val) => {
    if (val >= 80) {
      return {
        label: 'Strong Match',
        variant: 'success',
        gradFrom: '#059669',
        gradTo: '#34d399',
        gradientId: 'jdGradGreen',
        textColor: 'text-emerald-700',
        bgPill: 'bg-emerald-100 text-emerald-800',
      };
    }
    if (val >= 60) {
      return {
        label: 'Good Match',
        variant: 'primary',
        gradFrom: '#0284c7',
        gradTo: '#38bdf8',
        gradientId: 'jdGradBrand',
        textColor: 'text-indigo-700 dark:text-indigo-300',
        bgPill: 'bg-indigo-100 dark:bg-indigo-800/30 text-indigo-800 dark:text-indigo-400',
      };
    }
    if (val >= 40) {
      return {
        label: 'Moderate Match',
        variant: 'warning',
        gradFrom: '#d97706',
        gradTo: '#fbbf24',
        gradientId: 'jdGradAmber',
        textColor: 'text-amber-700',
        bgPill: 'bg-amber-100 text-amber-800',
      };
    }
    return {
      label: 'Low Keyword Match',
      variant: 'danger',
      gradFrom: '#e11d48',
      gradTo: '#fb7185',
      gradientId: 'jdGradRose',
      textColor: 'text-rose-700',
      bgPill: 'bg-rose-100 text-rose-800',
    };
  };

  const tier = getTierDetails(safeScore);

  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200 dark:border-slate-700 shadow-soft-sm space-y-6">
      {/* Top Header Label */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <div className="inline-flex items-center gap-2">
            <Badge variant={tier.variant} size="sm">
              {tier.label}
            </Badge>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Keyword Alignment</span>
          </div>
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Job Description Match Score
          </h3>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
          100% Deterministic
        </span>
      </div>

      {/* Circle Gauge & Stats Summary */}
      <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
        {/* SVG Circular Gauge */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
            <defs>
              <linearGradient id={tier.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={tier.gradFrom} />
                <stop offset="100%" stopColor={tier.gradTo} />
              </linearGradient>
            </defs>

            <circle
              cx="60"
              cy="60"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="10"
              fill="transparent"
            />

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

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-0.5">
            <span className="text-3xl font-black font-display text-slate-900 dark:text-slate-100 leading-none">
              {safeScore}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Keyword Match
            </span>
          </div>
        </div>

        {/* Stats Column */}
        <div className="space-y-3 w-full sm:w-auto flex-1">
          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-emerald-900">Keywords You Have</span>
            </div>
            <span className="text-xs font-bold font-display text-emerald-800">
              {matchedCount} / {totalKeywords}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span className="text-xs font-semibold text-rose-900">Keywords Missing</span>
            </div>
            <span className="text-xs font-bold font-display text-rose-800">
              {missingCount} / {totalKeywords}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
