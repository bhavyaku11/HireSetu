import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, AlertCircle, CheckCircle2, FileX, Quote, ChevronDown, ChevronUp, Info, Wrench, HelpCircle } from 'lucide-react';
import Button from '../ui/Button';
import Badge, { Pill } from '../ui/Badge';
import { Card } from '../ui/Card';
import ScoreMeter from '../ui/ScoreMeter';

export default function AtsAnalysisResults({ resumeId, initialAnalysis = null, onAnalysisComplete }) {
  const { token } = useAuth();
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [expandedIssues, setExpandedIssues] = useState({});

  const toggleIssue = (issueId) => {
    setExpandedIssues((prev) => ({
      ...prev,
      [issueId]: !prev[issueId],
    }));
  };

  const handleRunAnalysis = async () => {
    if (!resumeId) return;
    setAnalyzing(true);
    setError('');

    try {
      const response = await fetch(`/api/resumes/${resumeId}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      let data = {};
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (jsonErr) {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || `Analysis request failed (${response.status}). Please try again.`);
      }

      setAnalysis(data.analysis);
      if (onAnalysisComplete) {
        onAnalysisComplete(data.analysis);
      }
    } catch (err) {
      console.error('Error running resume analysis:', err);
      setError(err.message || 'Failed to run resume analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const highIssues = analysis?.issues?.filter((i) => i.severity === 'high') || [];
  const mediumIssues = analysis?.issues?.filter((i) => i.severity === 'medium') || [];
  const lowIssues = analysis?.issues?.filter((i) => i.severity === 'low') || [];

  const renderIssueCard = (issue, index, severityKey, borderBgStyles, badgeVariant) => {
    const issueId = `${severityKey}-${index}`;
    const isExpanded = !!expandedIssues[issueId];

    const whyText = issue.whyItMatters || 'This issue negatively impacts ATS parsing indexing or candidate ranking.';
    const fixText = issue.howToFix || issue.recommendation || 'Apply standard section headers and active language to resolve.';

    return (
      <div
        key={issueId}
        className={`rounded-xl border transition-all duration-200 ${borderBgStyles.wrapper} ${
          isExpanded ? 'shadow-soft-md' : 'hover:shadow-soft-xs'
        }`}
      >
        {/* Scannable Header Row (Clickable) */}
        <div
          onClick={() => toggleIssue(issueId)}
          className="p-4 flex items-center justify-between gap-3 cursor-pointer select-none"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={badgeVariant} size="sm">
                {severityKey.toUpperCase()}
              </Badge>
              <span className={`text-xs font-bold font-display ${borderBgStyles.title}`}>
                {issue.category}
              </span>
            </div>
            <p className={`text-xs font-semibold truncate ${borderBgStyles.desc}`}>
              {issue.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hidden sm:inline-block">
              {isExpanded ? 'Hide Reason' : 'Why & How to Fix'}
            </span>
            <button
              type="button"
              className={`p-1 rounded-lg transition-colors ${borderBgStyles.btn}`}
              aria-label={isExpanded ? 'Collapse suggestion' : 'Expand suggestion'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Reasoning & Fix Detail View */}
        {isExpanded && (
          <div className="px-4 pb-4 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 space-y-3 animate-fadeIn">
            {/* Why It Matters Box */}
            <div className="p-3 bg-white/90 rounded-lg border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 text-[11px] font-bold font-display uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>Why This Matters</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-400 leading-relaxed font-medium">
                {whyText}
              </p>
            </div>

            {/* Flagged Instance Quote Box */}
            {issue.instance && (
              <div className="p-2.5 bg-slate-900 dark:bg-slate-100 text-slate-100 dark:text-slate-800 rounded-lg text-xs flex items-start gap-2 font-mono shadow-soft-xs">
                <Quote className="w-3.5 h-3.5 text-indigo-400 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span className="break-all">Flagged text: "{issue.instance}"</span>
              </div>
            )}

            {/* How to Fix Actionable Guide */}
            <div className="p-3 bg-indigo-50/70 dark:bg-indigo-900/20/70 rounded-lg border border-indigo-200/80 dark:border-indigo-700/40/80 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-950 dark:text-indigo-400 text-[11px] font-bold font-display uppercase tracking-wider">
                <Wrench className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>How to Fix</span>
              </div>
              <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-400 leading-relaxed">
                {fixText}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card padding="p-6 md:p-8" className="bg-white border-slate-200 dark:border-[var(--border-glass)] dark:bg-[var(--ink)] shadow-soft-lg space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-700/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <Pill variant="primary" size="sm">
              Resume Intelligence
            </Pill>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">ATS, Grammar & Readability</span>
          </div>
          <h3 className="text-xl font-extrabold font-display text-slate-900 dark:text-[var(--parchment)] tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-[var(--signal)]" />
            Resume Strength & ATS Audit Report
          </h3>
        </div>

        <Button
          variant={analysis ? 'secondary' : 'primary'}
          size="md"
          onClick={handleRunAnalysis}
          isLoading={analyzing}
          leftIcon={<Sparkles className="w-4 h-4" />}
          className="shadow-soft-sm shrink-0 self-start sm:self-auto"
        >
          {analyzing ? 'Analyzing Resume...' : analysis ? 'Re-run Audit' : 'Run Full Audit'}
        </Button>
      </div>

      {error && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3 text-rose-900">
            <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <h5 className="text-xs font-bold font-display uppercase tracking-wider text-rose-950">Audit Request Failed</h5>
              <p className="text-xs font-medium text-rose-800">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunAnalysis}
            className="shrink-0 bg-white border-rose-300 text-rose-800 hover:bg-rose-100 shadow-soft-xs"
          >
            Retry Audit
          </Button>
        </div>
      )}

      {/* Loading state with scan-line (placement #3 of 4) */}
      {analyzing ? (
        <div className="scannable scanning p-10 rounded-2xl bg-indigo-50/70 dark:bg-[var(--signal)]/5 border border-indigo-200 dark:border-[var(--signal)]/20 text-center space-y-4 animate-fadeIn">
          <div className="scan-line" aria-hidden="true" />
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 dark:bg-[var(--signal)] text-white flex items-center justify-center mx-auto shadow-soft-md animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-base font-bold font-display text-indigo-950 dark:text-[var(--parchment)]">Analyzing Your Resume with AI...</h4>
            <p className="text-xs font-medium text-indigo-800 dark:text-[var(--dust)] max-w-md mx-auto">
              Evaluating ATS compatibility, grammar accuracy, weak action verbs, and quantifiable impact metrics. This takes 2–4 seconds.
            </p>
          </div>
        </div>
      ) : analysis ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Visual Circular Score Meter Component */}
          <ScoreMeter score={analysis.score} breakdown={analysis.scoreBreakdown} />

          {/* Executive Summary Banner */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[var(--void)]/50 border border-slate-200 dark:border-[var(--border-glass)] space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[var(--dust)] font-display">
              Executive Overview
            </h4>
            <p className="text-sm font-bold font-display text-slate-900 dark:text-[var(--parchment)] leading-relaxed">
              {analysis.summary}
            </p>
          </div>

          {/* Missing Sections Warning Box */}
          {analysis.missingSections && analysis.missingSections.length > 0 && (
            <div className="p-5 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-rose-900">
                <FileX className="w-5 h-5 text-rose-600 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-display">
                  Missing Standard Sections ({analysis.missingSections.length})
                </h4>
              </div>
              <p className="text-xs text-rose-800">
                ATS bots scan for specific section titles. Missing these standard headings can cause the bot to fail to index your qualifications.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {analysis.missingSections.map((sec, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white border border-rose-300 text-rose-800 rounded-lg text-xs font-bold shadow-soft-xs flex items-center gap-1.5"
                  >
                    <span>⚠️</span>
                    <span>{sec}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Expandable Issues Grouped by Severity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display">
                Detected Issues & Reasoning ({analysis.issues?.length || 0})
              </h4>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">Click any item to expand reason & fix</span>
            </div>

            {(!analysis.issues || analysis.issues.length === 0) ? (
              <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold font-display text-emerald-900">No critical issues detected!</p>
                <p className="text-xs text-emerald-700">Your resume demonstrates strong grammar, readability, and ATS compatibility.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* High Severity Issues */}
                {highIssues.map((issue, i) =>
                  renderIssueCard(
                    issue,
                    i,
                    'high',
                    {
                      wrapper: 'bg-rose-50/50 border-rose-200/80',
                      title: 'text-rose-950',
                      desc: 'text-rose-900',
                      btn: 'text-rose-700 hover:bg-rose-100/70',
                    },
                    'danger'
                  )
                )}

                {/* Medium Severity Issues */}
                {mediumIssues.map((issue, i) =>
                  renderIssueCard(
                    issue,
                    i,
                    'medium',
                    {
                      wrapper: 'bg-amber-50/50 border-amber-200/80',
                      title: 'text-amber-950',
                      desc: 'text-amber-900',
                      btn: 'text-amber-700 hover:bg-amber-100/70',
                    },
                    'warning'
                  )
                )}

                {/* Low Severity Issues */}
                {lowIssues.map((issue, i) =>
                  renderIssueCard(
                    issue,
                    i,
                    'low',
                    {
                      wrapper: 'bg-sky-50/50 border-sky-200/80',
                      title: 'text-sky-950',
                      desc: 'text-sky-900',
                      btn: 'text-sky-700 hover:bg-sky-100/70',
                    },
                    'neutral'
                  )
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-400 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-soft-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold font-display text-slate-900 dark:text-slate-100">
              No Resume Audit Report Available Yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Run a comprehensive audit to evaluate grammar, readability, action verbs, quantifiable metrics, and overall ATS strength score.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleRunAnalysis}
            isLoading={analyzing}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Run Full Audit
          </Button>
        </div>
      )}
    </Card>
  );
}
