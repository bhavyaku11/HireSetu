import React, { useMemo } from 'react';
import JdMatchScoreMeter from './JdMatchScoreMeter';
import JdQualitativeGapsCard from './JdQualitativeGapsCard';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

// Helper synonym map for regex matching against JD text
const SYNONYMS = {
  'javascript': ['js', 'es6'],
  'js': ['javascript', 'es6'],
  'typescript': ['ts'],
  'ts': ['typescript'],
  'react': ['react.js', 'reactjs'],
  'react.js': ['react', 'reactjs'],
  'node': ['node.js', 'nodejs'],
  'node.js': ['node', 'nodejs'],
  'next.js': ['next', 'nextjs'],
  'postgres': ['postgresql'],
  'postgresql': ['postgres'],
  'mongo': ['mongodb'],
  'mongodb': ['mongo'],
  'aws': ['amazon web services'],
  'amazon web services': ['aws'],
  'k8s': ['kubernetes'],
  'kubernetes': ['k8s'],
  'ci/cd': ['continuous integration', 'continuous deployment'],
  'rest': ['rest api', 'restful'],
};

/**
 * Highlights actual job description text inline (green for matched keywords, red for missing keywords)
 */
function renderHighlightedJd(rawText = '', matchedKeywords = [], missingKeywords = []) {
  if (!rawText) return null;

  const matchedSet = new Set(matchedKeywords.map((k) => k.toLowerCase().trim()));
  const missingSet = new Set(missingKeywords.map((k) => k.toLowerCase().trim()));

  // Map each target keyword & its synonyms to its classification ('matched' | 'missing')
  const termMap = new Map();

  const registerTerm = (term, status) => {
    if (!term || term.length < 2) return;
    const lower = term.toLowerCase().trim();
    if (!termMap.has(lower)) {
      termMap.set(lower, status);
    }
    const syns = SYNONYMS[lower] || [];
    syns.forEach((syn) => {
      if (!termMap.has(syn.toLowerCase())) {
        termMap.set(syn.toLowerCase(), status);
      }
    });
  };

  matchedKeywords.forEach((k) => registerTerm(k, 'matched'));
  missingKeywords.forEach((k) => registerTerm(k, 'missing'));

  // Sort terms by length descending so longer phrases match first (e.g. "React.js" before "React")
  const sortedTerms = Array.from(termMap.keys()).sort((a, b) => b.length - a.length);

  if (sortedTerms.length === 0) {
    return <span className="whitespace-pre-wrap">{rawText}</span>;
  }

  // Create regex pattern matching word boundaries where possible
  const escapedTerms = sortedTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`(\\b(?:${escapedTerms.join('|')})\\b)`, 'gi');

  const parts = rawText.split(pattern);

  return (
    <div className="whitespace-pre-wrap font-sans text-xs md:text-sm text-surface-800 leading-relaxed space-y-2">
      {parts.map((part, index) => {
        if (!part) return null;
        const lowerPart = part.toLowerCase().trim();
        const status = termMap.get(lowerPart);

        if (status === 'matched') {
          return (
            <mark
              key={index}
              className="bg-emerald-100 text-emerald-900 border-b-2 border-emerald-500 font-semibold px-1 rounded shadow-soft-2xs inline-block my-0.5 cursor-help"
              title="Matched in your resume"
            >
              {part}
            </mark>
          );
        }

        if (status === 'missing') {
          return (
            <mark
              key={index}
              className="bg-rose-100 text-rose-900 border-b-2 border-rose-500 font-semibold px-1 rounded shadow-soft-2xs inline-block my-0.5 cursor-help"
              title="Missing from your resume"
            >
              {part}
            </mark>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}

export default function JdMatchDiffView({
  savedJds = [],
  currentJd = null,
  onSelectJd = () => {},
  onAddJdClick = () => {},
  onSaveTailoredVersion = () => {},
  matchData = null,
  loading = false,
}) {
  const { matchPercentage = 0, matchedKeywords = [], missingKeywords = [], totalKeywordsFound = 0 } = matchData || {};

  const highlightedText = useMemo(() => {
    return renderHighlightedJd(currentJd?.raw_text || '', matchedKeywords, missingKeywords);
  }, [currentJd?.raw_text, matchedKeywords, missingKeywords]);

  return (
    <div className="space-y-6 font-body">
      {/* Top Bar: Selector Dropdown & Action Controls */}
      <div className="bg-white border border-surface-200 rounded-2xl p-4 md:p-6 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-brand text-white flex items-center justify-center text-xl shadow-soft-xs">
            🎯
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-surface-900">
              Side-by-Side Job Match Analysis
            </h2>
            <p className="text-xs text-surface-500">
              Comparing your resume against saved target job descriptions
            </p>
          </div>
        </div>

        {/* JD Dropdown Selector */}
        <div className="flex items-center space-x-3">
          {savedJds.length > 0 ? (
            <div className="flex items-center space-x-2">
              <label htmlFor="jd-selector" className="text-xs font-semibold text-surface-600 whitespace-nowrap">
                Select Job:
              </label>
              <select
                id="jd-selector"
                value={currentJd?.id || ''}
                onChange={(e) => {
                  const targetId = parseInt(e.target.value, 10);
                  const found = savedJds.find((j) => j.id === targetId);
                  if (found) onSelectJd(found);
                }}
                className="px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-xs font-semibold text-surface-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"
              >
                {savedJds.map((jd) => (
                  <option key={jd.id} value={jd.id}>
                    {jd.title || `Job Description #${jd.id}`}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Badge variant="warning" size="sm">
              No saved JDs found
            </Badge>
          )}

          {currentJd && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onSaveTailoredVersion(currentJd)}
              leftIcon={<span>💾</span>}
              title="Duplicate resume as an independent tailored copy for this job description"
            >
              Save as new version for this job
            </Button>
          )}

          <Button size="sm" variant="outline" onClick={onAddJdClick}>
            + Add New JD
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-surface-200 shadow-soft-sm space-y-3">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-surface-600">Calculating deterministic match score...</p>
        </div>
      ) : !currentJd ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-surface-300 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center text-2xl mx-auto">
            📋
          </div>
          <h3 className="text-base font-bold font-display text-surface-900">No Job Description Selected</h3>
          <p className="text-xs text-surface-500 max-w-sm mx-auto">
            Save or select a job description above to view the inline side-by-side keyword match analysis.
          </p>
          <Button variant="primary" size="sm" onClick={onAddJdClick}>
            Add Job Description
          </Button>
        </div>
      ) : (
        /* Side-by-Side Two Panel Container */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel: Actual Job Description with Inline Highlights */}
          <div className="lg:col-span-7 bg-white border border-surface-200 rounded-2xl shadow-soft-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-surface-100 bg-surface-50/60 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-surface-900 uppercase tracking-wider font-display">
                  Actual Job Description
                </h3>
                <p className="text-[11px] text-surface-500 truncate max-w-xs md:max-w-md">
                  {currentJd.title || 'Untitled Position'}
                </p>
              </div>

              {/* Highlight Legend */}
              <div className="flex items-center space-x-3 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-300 border border-emerald-500"></span>
                  <span className="text-emerald-900 font-semibold">Matched</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-2.5 h-2.5 rounded bg-rose-300 border border-rose-500"></span>
                  <span className="text-rose-900 font-semibold">Missing</span>
                </span>
              </div>
            </div>

            <div className="p-5 md:p-6 overflow-y-auto max-h-[600px] bg-white">
              {highlightedText}
            </div>
          </div>

          {/* Right Panel: Match Percentage Gauge & Keyword Lists */}
          <div className="lg:col-span-5 space-y-6">
            {/* Prominent Score Gauge */}
            <JdMatchScoreMeter
              matchPercentage={matchPercentage}
              matchedCount={matchedKeywords.length}
              missingCount={missingKeywords.length}
              totalKeywords={totalKeywordsFound}
            />

            {/* Keywords You Have Card */}
            <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-soft-sm space-y-3">
              <div className="flex items-center justify-between border-b border-surface-100 pb-2">
                <h4 className="text-xs font-bold text-emerald-800 font-display flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-black">
                    ✓
                  </span>
                  <span>Keywords You Have</span>
                </h4>
                <Badge variant="success" size="sm">
                  {matchedKeywords.length}
                </Badge>
              </div>

              <div className="max-h-56 overflow-y-auto pr-1">
                {matchedKeywords.length === 0 ? (
                  <p className="text-xs text-surface-400 py-2">No matching keywords found.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {matchedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-soft-2xs"
                      >
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{kw}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Keywords You're Missing Card */}
            <div className="bg-white border border-surface-200 rounded-2xl p-5 shadow-soft-sm space-y-3">
              <div className="flex items-center justify-between border-b border-surface-100 pb-2">
                <h4 className="text-xs font-bold text-rose-800 font-display flex items-center space-x-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-black">
                    ✕
                  </span>
                  <span>Keywords You're Missing</span>
                </h4>
                <Badge variant="danger" size="sm">
                  {missingKeywords.length}
                </Badge>
              </div>

              <div className="max-h-56 overflow-y-auto pr-1">
                {missingKeywords.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-semibold py-2">
                    🎉 Excellent! You have matched all extracted keywords from this job description.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/80 shadow-soft-2xs"
                      >
                        <span className="text-rose-500 font-bold">✕</span>
                        <span>{kw}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full-width Qualitative AI Gap Analysis Component */}
          <div className="lg:col-span-12">
            <JdQualitativeGapsCard
              skillGaps={matchData?.skillGaps}
              experienceGaps={matchData?.experienceGaps}
            />
          </div>
        </div>
      )}
    </div>
  );
}
