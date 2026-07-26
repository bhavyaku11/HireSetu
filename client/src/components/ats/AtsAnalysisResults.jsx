import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, AlertCircle, AlertTriangle, Info, CheckCircle2, ShieldAlert, FileX } from 'lucide-react';
import Button from '../ui/Button';
import Badge, { Pill } from '../ui/Badge';
import { Card } from '../ui/Card';

export default function AtsAnalysisResults({ resumeId, initialAnalysis = null, onAnalysisComplete }) {
  const { token } = useAuth();
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

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

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'ATS analysis request failed');
      }

      setAnalysis(data.analysis);
      if (onAnalysisComplete) {
        onAnalysisComplete(data.analysis);
      }
    } catch (err) {
      console.error('Error running ATS analysis:', err);
      setError(err.message || 'Failed to run ATS analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'success';
    if (score >= 50) return 'warning';
    return 'danger';
  };

  const highIssues = analysis?.issues?.filter((i) => i.severity === 'high') || [];
  const mediumIssues = analysis?.issues?.filter((i) => i.severity === 'medium') || [];
  const lowIssues = analysis?.issues?.filter((i) => i.severity === 'low') || [];

  return (
    <Card padding="p-6 md:p-8" className="bg-white border-surface-200 shadow-soft-lg space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <Pill variant="primary" size="sm">
              ATS Compatibility
            </Pill>
            <span className="text-xs font-semibold text-surface-400">Formatting Audit</span>
          </div>
          <h3 className="text-xl font-extrabold font-display text-surface-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-600" />
            ATS Audit & Formatting Report
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
          {analyzing ? 'Analyzing Resume...' : analysis ? 'Re-run Audit' : 'Run ATS Audit'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Analysis Display */}
      {analysis ? (
        <div className="space-y-6 animate-fadeIn">
          {/* Executive Summary Box */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-surface-50 border border-surface-200">
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-2">
                <Badge variant={getScoreBadgeVariant(analysis.score)} size="sm">
                  Score: {analysis.score}/100
                </Badge>
                <span className="text-xs font-semibold text-surface-500 font-display">
                  {analysis.score >= 80 ? 'ATS Optimized' : analysis.score >= 50 ? 'Needs Improvement' : 'Action Required'}
                </span>
              </div>
              <p className="text-sm font-bold font-display text-surface-900">
                {analysis.summary}
              </p>
            </div>

            {/* Score Ring Dial */}
            <div className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 shadow-soft-xs ${getScoreColor(analysis.score)}`}>
              <span className="text-2xl font-black font-display tracking-tight">{analysis.score}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Score</span>
            </div>
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

          {/* Issues Grouped by Severity */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500 font-display">
              Detected Compatibility Issues ({analysis.issues?.length || 0})
            </h4>

            {(!analysis.issues || analysis.issues.length === 0) ? (
              <div className="p-6 bg-emerald-50/60 border border-emerald-200 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold font-display text-emerald-900">No formatting issues detected!</p>
                <p className="text-xs text-emerald-700">Your resume layout follows standard ATS parsing best practices.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* High Severity */}
                {highIssues.map((issue, i) => (
                  <div key={`high-${i}`} className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="danger" size="sm">High Severity</Badge>
                        <span className="text-xs font-bold text-rose-950 font-display">{issue.category}</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-rose-900">{issue.description}</p>
                    {issue.recommendation && (
                      <p className="text-xs text-rose-700 bg-white/80 p-2.5 rounded-lg border border-rose-200/80 font-medium">
                        💡 <span className="font-bold">Recommendation:</span> {issue.recommendation}
                      </p>
                    )}
                  </div>
                ))}

                {/* Medium Severity */}
                {mediumIssues.map((issue, i) => (
                  <div key={`med-${i}`} className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="warning" size="sm">Medium Severity</Badge>
                        <span className="text-xs font-bold text-amber-950 font-display">{issue.category}</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-amber-900">{issue.description}</p>
                    {issue.recommendation && (
                      <p className="text-xs text-amber-800 bg-white/80 p-2.5 rounded-lg border border-amber-200/80 font-medium">
                        💡 <span className="font-bold">Recommendation:</span> {issue.recommendation}
                      </p>
                    )}
                  </div>
                ))}

                {/* Low Severity */}
                {lowIssues.map((issue, i) => (
                  <div key={`low-${i}`} className="p-4 bg-sky-50/60 border border-sky-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" size="sm">Low Severity</Badge>
                        <span className="text-xs font-bold text-sky-950 font-display">{issue.category}</span>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-sky-900">{issue.description}</p>
                    {issue.recommendation && (
                      <p className="text-xs text-sky-800 bg-white/80 p-2.5 rounded-lg border border-sky-200/80 font-medium">
                        💡 <span className="font-bold">Recommendation:</span> {issue.recommendation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-8 bg-surface-50 border border-dashed border-surface-300 rounded-2xl text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 text-brand-600 flex items-center justify-center mx-auto shadow-soft-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold font-display text-surface-900">
              No ATS Audit Report Available Yet
            </h4>
            <p className="text-xs text-surface-500 max-w-md mx-auto">
              Run an ATS audit to evaluate section headers, contact completeness, symbol formatting, and overall bot readability.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={handleRunAnalysis}
            isLoading={analyzing}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Run ATS Compatibility Audit
          </Button>
        </div>
      )}
    </Card>
  );
}
