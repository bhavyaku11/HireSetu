import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { TextArea } from '../ui/Input';

export default function AiRewriteModal({
  isOpen = false,
  originalText = '',
  suggestedText = '',
  explanation = '',
  errorText = '',
  type = 'bullet',
  loading = false,
  onAccept = () => {},
  onDiscard = () => {},
}) {
  const [editedText, setEditedText] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setEditedText(suggestedText);
    setIsEditing(false);
  }, [suggestedText, isOpen]);

  if (!isOpen) return null;

  const handleAccept = () => {
    onAccept(editedText || suggestedText);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn font-body">
      <div className="bg-white rounded-3xl border border-surface-200 p-6 md:p-8 max-w-2xl w-full shadow-soft-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center text-xl shadow-soft-xs">
              ✨
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold font-display text-surface-900">
                  AI Content Improvement
                </h3>
                <Badge variant="primary" size="sm">
                  {type === 'summary' ? 'Summary' : 'Bullet Point'}
                </Badge>
              </div>
              <p className="text-xs text-surface-500">
                Review, edit, or discard AI phrasing recommendations before saving.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onDiscard}
            className="text-surface-400 hover:text-surface-900 text-lg font-bold w-8 h-8 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-surface-600">
              Analyzing context and crafting stronger action phrasing...
            </p>
          </div>
        ) : errorText ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3">
              <span className="text-rose-500 text-lg shrink-0">⚠️</span>
              <div>
                <p className="text-xs font-bold text-rose-900 font-display">AI Rewrite Unavailable</p>
                <p className="text-xs text-rose-700 mt-0.5">{errorText}</p>
              </div>
            </div>
            <p className="text-[11px] text-surface-400 italic text-center">
              Your original text has not been changed.
            </p>
            <div className="flex justify-end pt-2 border-t border-surface-100">
              <Button variant="outline" size="sm" onClick={onDiscard}>
                Close
              </Button>
            </div>
          </div>

        ) : (
          <div className="space-y-5">
            {/* Explanation Note */}
            {explanation && (
              <div className="p-3.5 rounded-xl bg-brand-50/70 border border-brand-200/80 text-xs text-brand-900 flex items-start space-x-2.5">
                <span className="text-brand-600 font-bold text-sm shrink-0">💡</span>
                <div>
                  <span className="font-bold text-brand-950 font-display block">Why this suggestion is better:</span>
                  <span className="text-brand-800">{explanation}</span>
                </div>
              </div>
            )}

            {/* Before vs After Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Content Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-surface-500 uppercase tracking-wider font-display">
                    Original Text
                  </span>
                  <Badge variant="neutral" size="sm">
                    Before
                  </Badge>
                </div>
                <div className="p-4 bg-surface-50 border border-surface-200 rounded-2xl text-xs text-surface-700 min-h-[120px] font-mono leading-relaxed whitespace-pre-wrap">
                  {originalText}
                </div>
              </div>

              {/* AI Suggested Rewrite Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-700 uppercase tracking-wider font-display flex items-center space-x-1">
                    <span>AI Suggestion</span>
                    {isEditing && <span className="text-[10px] text-brand-500 font-normal">(Editing)</span>}
                  </span>
                  <Badge variant="success" size="sm">
                    After
                  </Badge>
                </div>

                {isEditing ? (
                  <TextArea
                    rows={5}
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="min-h-[120px] font-mono text-xs"
                  />
                ) : (
                  <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 min-h-[120px] leading-relaxed whitespace-pre-wrap shadow-soft-2xs">
                    {editedText || suggestedText}
                  </div>
                )}
              </div>
            </div>

            {/* Strict Notice */}
            <p className="text-[11px] text-surface-400 italic text-center">
              🔒 No AI changes are saved automatically. Click "Accept" to apply this rewrite to your resume.
            </p>

            {/* Action Buttons: Accept / Edit / Discard */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3 border-t border-surface-100">
              <Button variant="ghost" size="sm" onClick={onDiscard}>
                Discard
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? 'Done Editing' : '✏️ Edit Suggestion'}
              </Button>

              <Button variant="primary" size="sm" onClick={handleAccept}>
                ✓ Accept & Save
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
