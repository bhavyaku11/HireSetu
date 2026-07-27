import React, { useState } from 'react';
import Badge from '../ui/Badge';

export default function JdQualitativeGapsCard({
  skillGaps = [],
  experienceGaps = [],
}) {
  const [expandedMap, setExpandedMap] = useState({});

  const toggleGap = (id) => {
    setExpandedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const totalGaps = skillGaps.length + experienceGaps.length;

  return (
    <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-soft-sm space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-lg shadow-soft-xs">
            🔍
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold font-display text-surface-900">
                Qualitative AI Gap Analysis
              </h3>
              <Badge variant="neutral" size="sm">
                {totalGaps} {totalGaps === 1 ? 'Gap' : 'Gaps'} Identified
              </Badge>
            </div>
            <p className="text-xs text-surface-500">
              Evaluates skill depth & experience relevance requirements beyond basic keyword matching
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100/70 text-indigo-800 border border-indigo-200/80 shrink-0">
          ✨ AI-Judged Analysis
        </span>
      </div>

      {totalGaps === 0 ? (
        <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg mx-auto font-bold">
            ✓
          </div>
          <h4 className="text-sm font-bold text-emerald-900 font-display">
            No Critical Qualitative Gaps Detected
          </h4>
          <p className="text-xs text-emerald-700 max-w-md mx-auto">
            Your experience and technical skillset closely align with the qualitative expectations of this position.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Skill Gaps Section */}
          {skillGaps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-surface-800 uppercase tracking-wider font-display flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Skill & Expertise Gaps</span>
                </h4>
                <Badge variant="warning" size="sm">
                  {skillGaps.length}
                </Badge>
              </div>

              <div className="space-y-2.5">
                {skillGaps.map((item, index) => {
                  const gapId = `skill-${index}`;
                  const isExpanded = !!expandedMap[gapId];

                  return (
                    <div
                      key={gapId}
                      className={`rounded-xl border transition-all duration-200 bg-white ${
                        isExpanded
                          ? 'border-amber-300 shadow-soft-md'
                          : 'border-surface-200 hover:border-amber-200 hover:shadow-soft-xs'
                      }`}
                    >
                      {/* Scannable Header Row */}
                      <div
                        onClick={() => toggleGap(gapId)}
                        className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
                          <Badge variant="warning" size="sm">
                            SKILL GAP
                          </Badge>
                          <h5 className="text-xs font-bold text-surface-900 font-display truncate">
                            {item.gap}
                          </h5>
                        </div>

                        <div className="flex items-center space-x-2 text-xs font-semibold text-amber-700 shrink-0">
                          <span>{isExpanded ? 'Hide Reason' : 'Why This Matters'}</span>
                          <span className="transform transition-transform duration-200">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Why This Matters Drawer */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-amber-100 bg-amber-50/40 rounded-b-xl space-y-2 text-xs animate-fadeIn">
                          <div className="flex items-start space-x-2.5 text-amber-900">
                            <span className="text-amber-600 font-bold text-sm shrink-0">💡</span>
                            <div>
                              <span className="font-bold text-amber-950 font-display block mb-0.5">
                                Why This Matters to Recruiters:
                              </span>
                              <p className="text-surface-700 leading-relaxed">{item.why}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Experience Relevance Gaps Section */}
          {experienceGaps.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-surface-800 uppercase tracking-wider font-display flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>Experience Relevance Gaps</span>
                </h4>
                <Badge variant="danger" size="sm">
                  {experienceGaps.length}
                </Badge>
              </div>

              <div className="space-y-2.5">
                {experienceGaps.map((item, index) => {
                  const gapId = `exp-${index}`;
                  const isExpanded = !!expandedMap[gapId];

                  return (
                    <div
                      key={gapId}
                      className={`rounded-xl border transition-all duration-200 bg-white ${
                        isExpanded
                          ? 'border-rose-300 shadow-soft-md'
                          : 'border-surface-200 hover:border-rose-200 hover:shadow-soft-xs'
                      }`}
                    >
                      {/* Scannable Header Row */}
                      <div
                        onClick={() => toggleGap(gapId)}
                        className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 min-w-0">
                          <Badge variant="danger" size="sm">
                            EXPERIENCE GAP
                          </Badge>
                          <h5 className="text-xs font-bold text-surface-900 font-display truncate">
                            {item.gap}
                          </h5>
                        </div>

                        <div className="flex items-center space-x-2 text-xs font-semibold text-rose-700 shrink-0">
                          <span>{isExpanded ? 'Hide Reason' : 'Why This Matters'}</span>
                          <span className="transform transition-transform duration-200">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Why This Matters Drawer */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-rose-100 bg-rose-50/40 rounded-b-xl space-y-2 text-xs animate-fadeIn">
                          <div className="flex items-start space-x-2.5 text-rose-900">
                            <span className="text-rose-600 font-bold text-sm shrink-0">💡</span>
                            <div>
                              <span className="font-bold text-rose-950 font-display block mb-0.5">
                                Why This Matters to Recruiters:
                              </span>
                              <p className="text-surface-700 leading-relaxed">{item.why}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
