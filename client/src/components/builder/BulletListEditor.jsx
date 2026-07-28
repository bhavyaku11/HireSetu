import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import AiRewriteModal from './AiRewriteModal';

export default function BulletListEditor({
  bullets = [''],
  onChange,
  label = 'Bullet Points',
  context = {},
}) {
  const { token } = useAuth();
  const [aiModalState, setAiModalState] = useState({
    isOpen: false,
    bulletIndex: null,
    originalText: '',
    suggestedText: '',
    explanation: '',
    errorText: '',
    loading: false,
  });

  const handleBulletChange = (index, value) => {
    const newBullets = [...bullets];
    newBullets[index] = value;
    onChange(newBullets);
  };

  const handleAddBullet = () => {
    onChange([...bullets, '']);
  };

  const handleRemoveBullet = (index) => {
    if (bullets.length === 1) {
      onChange(['']);
      return;
    }
    const newBullets = bullets.filter((_, i) => i !== index);
    onChange(newBullets);
  };

  const handleMoveBullet = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === bullets.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newBullets = [...bullets];
    const [movedBullet] = newBullets.splice(index, 1);
    newBullets.splice(targetIndex, 0, movedBullet);
    onChange(newBullets);
  };

  const handleOpenAiImprove = async (index, text) => {
    if (!text || text.trim().length < 5) return;

    setAiModalState({
      isOpen: true,
      bulletIndex: index,
      originalText: text,
      suggestedText: '',
      explanation: '',
      errorText: '',
      loading: true,
    });

    try {
      const response = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          type: 'bullet',
          context,
        }),
      });

      const data = await response.json();

      if (response.ok && data.suggestedText) {
        setAiModalState((prev) => ({
          ...prev,
          suggestedText: data.suggestedText,
          explanation: data.explanation || 'Enhanced action verb phrasing and metric placeholders.',
          errorText: '',
          loading: false,
        }));
      } else {
        setAiModalState((prev) => ({
          ...prev,
          suggestedText: '',
          errorText: data.message || 'AI rewrite unavailable. Please try again.',
          loading: false,
        }));
      }
    } catch (err) {
      console.error('Error improving bullet with AI:', err);
      setAiModalState((prev) => ({
        ...prev,
        suggestedText: '',
        errorText: 'Network error — could not reach AI service. Please check your connection.',
        loading: false,
      }));
    }
  };

  const handleAcceptAiRewrite = (acceptedText) => {
    if (aiModalState.bulletIndex !== null) {
      handleBulletChange(aiModalState.bulletIndex, acceptedText);
    }
    setAiModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDiscardAiRewrite = () => {
    setAiModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-3 font-body">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={handleAddBullet}
          className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 font-semibold flex items-center space-x-1 cursor-pointer"
        >
          <span>+</span>
          <span>Add Bullet Point</span>
        </button>
      </div>

      <div className="space-y-2">
        {bullets.map((bullet, index) => {
          const isEligibleForAi = bullet && bullet.trim().length >= 5;

          return (
            <div key={index} className="flex items-start space-x-2 group">
              <span className="text-slate-400 dark:text-slate-400 text-xs mt-2.5 shrink-0">•</span>

              <div className="flex-1">
                <Input
                  value={bullet}
                  onChange={(e) => handleBulletChange(index, e.target.value)}
                  placeholder="Describe key achievement, technology used, or impact..."
                />
              </div>

              <div className="flex items-center space-x-1 pt-1.5 shrink-0">
                {/* AI Improve Button */}
                <button
                  type="button"
                  onClick={() => handleOpenAiImprove(index, bullet)}
                  disabled={!isEligibleForAi}
                  title={isEligibleForAi ? 'Improve bullet with AI' : 'Type at least 5 characters to improve'}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 cursor-pointer ${
                    isEligibleForAi
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:bg-indigo-800/30 border border-indigo-200 dark:border-indigo-700/40'
                      : 'opacity-40 text-slate-400 dark:text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>✨</span>
                  <span className="hidden sm:inline">AI Rewriter</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMoveBullet(index, 'up')}
                  disabled={index === 0}
                  title="Move Up"
                  className="p-1 text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 disabled:opacity-30 text-xs cursor-pointer"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveBullet(index, 'down')}
                  disabled={index === bullets.length - 1}
                  title="Move Down"
                  className="p-1 text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 disabled:opacity-30 text-xs cursor-pointer"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveBullet(index)}
                  title="Delete Bullet"
                  className="p-1 text-rose-500 hover:text-rose-700 text-xs ml-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Before/After Review Modal */}
      <AiRewriteModal
        isOpen={aiModalState.isOpen}
        originalText={aiModalState.originalText}
        suggestedText={aiModalState.suggestedText}
        explanation={aiModalState.explanation}
        errorText={aiModalState.errorText}
        type="bullet"
        loading={aiModalState.loading}
        onAccept={handleAcceptAiRewrite}
        onDiscard={handleDiscardAiRewrite}
      />
    </div>
  );
}
