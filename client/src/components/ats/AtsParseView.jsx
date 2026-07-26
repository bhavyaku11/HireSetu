import React, { useState, useMemo } from 'react';
import { Bot, Eye, Copy, Check, AlertTriangle, Info, FileText, Sparkles } from 'lucide-react';
import Button from '../ui/Button';
import Badge, { Pill } from '../ui/Badge';
import { Card } from '../ui/Card';

export default function AtsParseView({ rawText = '', resumeTitle = 'Resume', sections = [] }) {
  const [activeTab, setActiveTab] = useState('ats'); // 'ats' | 'formatted'
  const [copied, setCopied] = useState(false);

  // Analyze text for potential multi-column / jumbled layout anomalies
  const layoutAnalysis = useMemo(() => {
    if (!rawText) return { hasWarning: false, reasons: [] };

    const lines = rawText.split('\n');
    const reasons = [];

    // Check 1: Multiple wide gaps (indicates multi-column text merged horizontally)
    const wideGapLines = lines.filter((l) => /\s{4,}/.test(l) || /\t/.test(l));
    if (wideGapLines.length >= 3) {
      reasons.push('Detected side-by-side columns or tabbed structures that may merge out of order.');
    }

    // Check 2: Dense inline pipe separators across single lines
    const pipeLines = lines.filter((l) => (l.match(/\|/g) || []).length >= 3);
    if (pipeLines.length >= 2) {
      reasons.push('Dense inline separators detected which can confuse ATS section parsers.');
    }

    // Check 3: Extremely long unformatted lines (>250 chars)
    const longLines = lines.filter((l) => l.trim().length > 250);
    if (longLines.length >= 2) {
      reasons.push('Unusually long un-wrapped lines detected.');
    }

    return {
      hasWarning: reasons.length > 0,
      reasons,
    };
  }, [rawText]);

  // Compute text statistics
  const stats = useMemo(() => {
    if (!rawText) return { characters: 0, words: 0, lines: 0 };
    const clean = rawText.trim();
    return {
      characters: clean.length,
      words: clean ? clean.split(/\s+/).filter(Boolean).length : 0,
      lines: rawText.split('\n').length,
    };
  }, [rawText]);

  const handleCopy = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card padding="p-6 md:p-8" className="bg-white border-surface-200 shadow-soft-lg space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200/80 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <Pill variant="primary" size="sm">
              ATS Audit Mode
            </Pill>
            <span className="text-xs font-semibold text-surface-400">Transparency Inspector</span>
          </div>
          <h3 className="text-xl font-extrabold font-display text-surface-900 tracking-tight flex items-center gap-2">
            How an ATS Sees Your Resume
          </h3>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-surface-100/80 rounded-xl border border-surface-200/70 shrink-0">
          <button
            onClick={() => setActiveTab('ats')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'ats'
                ? 'bg-surface-900 text-white shadow-soft-xs'
                : 'text-surface-600 hover:text-surface-900 hover:bg-surface-200/50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>ATS Parse-Test View</span>
          </button>

          <button
            onClick={() => setActiveTab('formatted')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
              activeTab === 'formatted'
                ? 'bg-brand-600 text-white shadow-soft-xs'
                : 'text-surface-600 hover:text-surface-900 hover:bg-surface-200/50'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Formatted View</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'ats' ? (
        <div className="space-y-5 animate-fadeIn">
          {/* Explanatory Note */}
          <div className="p-4 bg-surface-50 border border-surface-200/80 rounded-xl flex items-start gap-3">
            <Info className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div className="text-xs text-surface-700 space-y-0.5">
              <p className="font-bold font-display text-surface-900">
                What applicant tracking systems actually see
              </p>
              <p className="leading-relaxed">
                This is what ATS bots extract when they scan your resume — no fonts, no colors, no graphic layouts. If something looks jumbled, out of order, or missing here, it may not reach a human reviewer.
              </p>
            </div>
          </div>

          {/* Layout Warning Banner (if anomalies detected) */}
          {layoutAnalysis.hasWarning && (
            <div className="p-4 bg-amber-50 border border-amber-200/90 rounded-xl text-amber-900 text-xs flex items-start gap-3 animate-fadeIn">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold font-display text-amber-950">
                  This resume's layout may cause the ATS to misread the order of information.
                </p>
                <ul className="list-disc list-inside text-amber-800 space-y-0.5 pl-0.5">
                  {layoutAnalysis.reasons.map((reason, idx) => (
                    <li key={idx}>{reason}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Controls & Metrics Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="neutral" size="sm">
                {stats.characters} characters
              </Badge>
              <Badge variant="neutral" size="sm">
                {stats.words} words
              </Badge>
              <Badge variant="neutral" size="sm">
                {stats.lines} lines
              </Badge>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied to Clipboard!' : 'Copy Raw Text'}
            </Button>
          </div>

          {/* Unstyled Monospace Plain Text View */}
          <div className="relative group">
            <div className="absolute top-3 right-3 text-[10px] font-mono uppercase tracking-widest text-surface-400 bg-surface-900 px-2.5 py-1 rounded border border-surface-800 pointer-events-none select-none">
              Plain Text Output
            </div>
            <pre className="p-6 bg-surface-950 text-surface-100 rounded-2xl font-mono text-xs leading-relaxed max-h-[500px] overflow-y-auto whitespace-pre-wrap selection:bg-brand-500 selection:text-white border border-surface-800 shadow-inner">
              {rawText || 'No raw text extracted.'}
            </pre>
          </div>
        </div>
      ) : (
        <div className="space-y-5 animate-fadeIn">
          {/* Formatted View Explanation */}
          <div className="p-4 bg-brand-50/60 border border-brand-200/70 rounded-xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div className="text-xs text-brand-900 space-y-0.5">
              <p className="font-bold font-display">Structured Visual View</p>
              <p className="text-brand-700">
                This is a visual layout preview of your resume content. Toggle back to "ATS Parse-Test View" at any time to verify raw bot extraction accuracy.
              </p>
            </div>
          </div>

          {/* Formatted Content Card */}
          <div className="p-6 bg-surface-50 border border-surface-200 rounded-2xl space-y-6">
            <div className="border-b border-surface-200 pb-4">
              <h4 className="text-lg font-bold font-display text-surface-900">
                {resumeTitle}
              </h4>
              <p className="text-xs text-surface-500">
                Imported document preview
              </p>
            </div>

            {/* Paragraphs formatted representation */}
            <div className="space-y-4">
              {rawText
                .split('\n\n')
                .filter((p) => p.trim())
                .map((paragraph, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white rounded-xl border border-surface-200/80 text-xs text-surface-800 leading-relaxed shadow-soft-xs"
                  >
                    {paragraph}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
