import React from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function AchievementPromptsPanel({
  title = '',
  questions = [],
  loading = false,
  errorText = '',
  onAddBulletWithFocus = () => {},
  onDismiss = () => {},
}) {
  return (
    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 shadow-soft-xs space-y-3.5 animate-fadeIn font-body my-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
        <div className="flex items-center space-x-2">
          <span className="text-amber-600 font-bold text-sm">💡</span>
          <h4 className="text-xs font-bold text-amber-950 font-display">
            Reflection Prompts: {title || 'Entry'}
          </h4>
          <Badge variant="warning" size="sm">
            AI Prompts
          </Badge>
        </div>

        <button
          type="button"
          onClick={onDismiss}
          className="text-amber-700 hover:text-amber-950 text-xs font-bold px-2 py-0.5 rounded hover:bg-amber-100/70 transition-colors"
        >
          Dismiss ×
        </button>
      </div>

      {/* Info note */}
      <p className="text-[11px] text-amber-800/90 italic">
        These questions prompt your memory for real numbers and impact. Type your own answer into your bullet points below!
      </p>

      {loading ? (
        <div className="p-4 text-center text-xs text-amber-800 space-x-2 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Generating reflective questions...</span>
        </div>
      ) : errorText ? (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start space-x-2">
          <span className="shrink-0">⚠️</span>
          <span>{errorText}</span>
        </div>
      ) : questions.length === 0 ? (
        <p className="text-xs text-amber-800 italic">No prompts generated.</p>
      ) : (
        <div className="space-y-2">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className="p-3 bg-white rounded-xl border border-amber-200/80 shadow-soft-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
            >
              <div className="flex items-start space-x-2 text-xs text-slate-800 dark:text-slate-200">
                <span className="font-bold text-amber-600 shrink-0">{idx + 1}.</span>
                <span className="font-medium leading-relaxed">{q}</span>
              </div>

              <button
                type="button"
                onClick={() => onAddBulletWithFocus(q)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors shrink-0 self-end sm:self-center"
              >
                + Add Bullet to Answer
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
