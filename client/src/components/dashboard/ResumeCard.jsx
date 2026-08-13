import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ArrowRight, Sparkles, FileText } from 'lucide-react';

/**
 * ATSRing — tiny circular progress indicator.
 * score: 0–100. Defaults to 100 (ATS Ready) for all builder resumes.
 */
function ATSRing({ score = 100 }) {
  const r = 12;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;

  return (
    <span title={`ATS Score: ${score}%`} className="inline-flex items-center gap-1.5 shrink-0">
      <svg width="30" height="30" viewBox="0 0 30 30" className="-rotate-90">
        {/* Track */}
        <circle
          cx="15" cy="15" r={r}
          strokeWidth="3"
          fill="none"
          className="stroke-slate-200 dark:stroke-[var(--border-glass)]"
        />
        {/* Fill — scanline color: this is the ATS "read" indicator */}
        <circle
          cx="15" cy="15" r={r}
          strokeWidth="3"
          fill="none"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          className="stroke-emerald-500 dark:stroke-[var(--scanline)] transition-all duration-700"
        />
      </svg>
      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-[var(--scanline)] tabular-nums">
        {score}%
      </span>
    </span>
  );
}

/**
 * ResumeCard — single resume card for the dashboard grid.
 *
 * SCAN LINE: Applied here (placement #1 of 4).
 * The scan line sweeps across the card once on hover in dark mode,
 * reinforcing the "machine reading your resume" concept.
 *
 * Props:
 *   resume        — resume object from API
 *   index         — position in grid (for stagger delay)
 *   onDeleteClick — callback(id, title) when trash icon clicked
 */
export default function ResumeCard({ resume, index = 0, onDeleteClick }) {
  const isTailored = !!(resume.tailored_for_jd_title || resume.tailoredForJdTitle);
  const jdTitle = resume.tailored_for_jd_title || resume.tailoredForJdTitle;

  const formattedDate = (() => {
    const d = new Date(resume.updated_at);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return 'Updated today';
    if (diffDays === 1) return 'Updated yesterday';
    if (diffDays < 7) return `Updated ${diffDays}d ago`;
    return `Updated ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  })();

  return (
    <div
      className="animate-card-enter"
      style={{ '--card-index': index }}
    >
      {/*
        scannable: the CSS class that enables the scan-line sweep on hover in dark mode.
        The .scan-line child element is the actual animated line.
      */}
      <div
        className={`
          scannable
          group relative flex flex-col h-full rounded-2xl border
          bg-white dark:bg-[var(--ink-glass-bg)] dark:backdrop-blur-md
          shadow-soft-sm hover:shadow-soft-lg
          transition-all duration-200
          hover:-translate-y-1
          overflow-hidden
          ${isTailored
            ? 'border-violet-200 dark:border-[var(--border-glass)] hover:border-violet-400 dark:hover:border-[var(--signal)]/40'
            : 'border-slate-200 dark:border-[var(--border-glass)] hover:border-indigo-300 dark:hover:border-[var(--signal)]/40'
          }
          dark:hover:shadow-[0_0_20px_var(--signal-glow)]
        `}
      >
        {/* The scan line (placement #1) — sweeps once on hover in dark mode */}
        <div className="scan-line" aria-hidden="true" />

        {/* Colored left-border accent */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl transition-all duration-200
            ${isTailored
              ? 'bg-gradient-to-b from-violet-400 to-purple-500'
              : 'bg-gradient-to-b from-[var(--signal)] to-indigo-600'
            }
          `}
        />

        {/* Card body */}
        <div className="flex flex-col flex-1 pl-5 pr-4 pt-5 pb-4 space-y-3">

          {/* Top row: type badge + delete */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* ID pill — IBM Plex Mono: signals machine-read identifier */}
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-mono font-bold tracking-wide bg-slate-100 dark:bg-[var(--ink)] text-slate-500 dark:text-[var(--dust)] border-slate-200 dark:border-[var(--border-glass)] select-none">
                #{resume.id}
              </span>

              {isTailored ? (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide bg-violet-50 dark:bg-[var(--signal)]/8 text-violet-700 dark:text-[var(--signal-hover)] border-violet-200 dark:border-[var(--signal)]/20 select-none">
                  <Sparkles className="w-2.5 h-2.5" />
                  Tailored
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide bg-indigo-50 dark:bg-[var(--signal)]/6 text-indigo-600 dark:text-[var(--signal)] border-indigo-200 dark:border-[var(--signal)]/15 select-none">
                  <FileText className="w-2.5 h-2.5" />
                  Base
                </span>
              )}
            </div>

            {/* Delete button — appears on hover only */}
            <button
              onClick={() => onDeleteClick(resume.id, resume.title)}
              className="shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1.5 rounded-lg text-slate-400 dark:text-[var(--dust)] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-150"
              title="Delete resume"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Title */}
          <div className="space-y-0.5 min-w-0">
            <h3
              className="text-[15px] font-bold font-display text-slate-900 dark:text-[var(--parchment)] tracking-tight leading-snug line-clamp-2"
              title={resume.title}
            >
              {resume.title}
            </h3>
            {isTailored && jdTitle && (
              <p className="text-[10px] text-violet-600 dark:text-[var(--signal-hover)] font-semibold truncate">
                → {jdTitle}
              </p>
            )}
          </div>

          {/* Metadata */}
          <p className="text-[11px] text-slate-400 dark:text-[var(--dust)] font-medium flex-1">
            {formattedDate}
          </p>
        </div>

        {/* Card footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-[var(--border-glass)] bg-slate-50/60 dark:bg-[var(--void)]/30">
          {/* ATS ring — scanline color in dark: "the system sees this as ATS-ready" */}
          <ATSRing score={100} />

          {/* Continue editing */}
          <Link
            to={`/builder/${resume.id}`}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold
              transition-all duration-150 active:scale-[0.98]
              ${isTailored
                ? 'bg-violet-50 dark:bg-[var(--signal)]/8 text-violet-700 dark:text-[var(--signal-hover)] hover:bg-violet-100 dark:hover:bg-[var(--signal)]/15 border border-violet-200 dark:border-[var(--signal)]/20'
                : 'bg-indigo-50 dark:bg-[var(--signal)]/8 text-indigo-700 dark:text-[var(--signal)] hover:bg-indigo-100 dark:hover:bg-[var(--signal)]/15 border border-indigo-200 dark:border-[var(--signal)]/20'
              }
            `}
          >
            Edit
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
