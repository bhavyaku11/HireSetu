import React, { useState } from 'react';
import Input, { TextArea } from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import AiRewriteModal from './AiRewriteModal';

export default function PersonalInfoForm({ data = {}, onChange }) {
  const { token } = useAuth();
  const [aiModalState, setAiModalState] = useState({
    isOpen: false,
    originalText: '',
    suggestedText: '',
    explanation: '',
    loading: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...data,
      [name]: value,
    });
  };

  const handleOpenAiImprove = async () => {
    const text = data.summary || '';
    if (!text || text.trim().length < 5) return;

    setAiModalState({
      isOpen: true,
      originalText: text,
      suggestedText: '',
      explanation: '',
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
          type: 'summary',
          context: {
            fullName: data.fullName,
          },
        }),
      });

      const resData = await response.json();

      if (response.ok && resData.suggestedText) {
        setAiModalState((prev) => ({
          ...prev,
          suggestedText: resData.suggestedText,
          explanation: resData.explanation || 'Enhanced summary structure, active voice, and impact.',
          loading: false,
        }));
      } else {
        setAiModalState((prev) => ({
          ...prev,
          suggestedText: text,
          explanation: resData.message || 'Unable to improve summary at this time.',
          loading: false,
        }));
      }
    } catch (err) {
      console.error('Error improving summary with AI:', err);
      setAiModalState((prev) => ({
        ...prev,
        suggestedText: text,
        explanation: 'Network error invoking AI rewrite.',
        loading: false,
      }));
    }
  };

  const handleAcceptAiRewrite = (acceptedText) => {
    onChange({
      ...data,
      summary: acceptedText,
    });
    setAiModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleDiscardAiRewrite = () => {
    setAiModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const isEligibleForAi = data.summary && data.summary.trim().length >= 5;

  return (
    <div className="space-y-5 font-body">
      <div className="border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
        <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">Personal Information</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Enter your basic contact details and a professional summary.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          name="fullName"
          isRequired
          placeholder="e.g. Jane Doe"
          value={data.fullName || ''}
          onChange={handleChange}
        />

        <Input
          label="Email Address"
          type="email"
          name="email"
          isRequired
          placeholder="janedoe@example.com"
          value={data.email || ''}
          onChange={handleChange}
        />

        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          placeholder="+1 (555) 000-0000"
          value={data.phone || ''}
          onChange={handleChange}
        />

        <Input
          label="Location"
          name="location"
          placeholder="San Francisco, CA"
          value={data.location || ''}
          onChange={handleChange}
        />

        <Input
          label="LinkedIn URL"
          type="url"
          name="linkedin"
          placeholder="linkedin.com/in/janedoe"
          value={data.linkedin || ''}
          onChange={handleChange}
        />

        <Input
          label="Portfolio / GitHub URL"
          type="url"
          name="github"
          placeholder="github.com/janedoe"
          value={data.github || ''}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 tracking-tight">
            Professional Summary
          </label>
          <button
            type="button"
            onClick={handleOpenAiImprove}
            disabled={!isEligibleForAi}
            title={isEligibleForAi ? 'Improve summary with AI' : 'Type at least 5 characters to improve'}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
              isEligibleForAi
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:bg-indigo-800/30 border border-indigo-200/80 dark:border-indigo-700/40/80 shadow-soft-xs'
                : 'opacity-40 text-slate-400 dark:text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
            }`}
          >
            <span>✨</span>
            <span>Improve Summary with AI</span>
          </button>
        </div>

        <TextArea
          name="summary"
          rows={4}
          placeholder="Passionate Full Stack Engineer with 4+ years of experience building scalable web applications..."
          value={data.summary || ''}
          onChange={handleChange}
          helperText="Keep summary between 2-4 sentences highlighting core tech stack."
        />
      </div>

      {/* Before/After Review Modal */}
      <AiRewriteModal
        isOpen={aiModalState.isOpen}
        originalText={aiModalState.originalText}
        suggestedText={aiModalState.suggestedText}
        explanation={aiModalState.explanation}
        type="summary"
        loading={aiModalState.loading}
        onAccept={handleAcceptAiRewrite}
        onDiscard={handleDiscardAiRewrite}
      />
    </div>
  );
}
