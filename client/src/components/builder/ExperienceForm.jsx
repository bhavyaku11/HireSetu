import React, { useState } from 'react';
import BulletListEditor from './BulletListEditor';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import AchievementPromptsPanel from './AchievementPromptsPanel';

export default function ExperienceForm({ data = { items: [] }, onChange }) {
  const { token } = useAuth();
  const items = Array.isArray(data.items) ? data.items : [];

  const [promptsState, setPromptsState] = useState({});

  const updateItems = (newItems) => {
    onChange({
      ...data,
      items: newItems,
    });
  };

  const handleAdd = () => {
    const newItem = {
      id: Date.now().toString(),
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    };
    updateItems([...items, newItem]);
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    updateItems(newItems);
  };

  const handleMove = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newItems = [...items];
    const [movedItem] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, movedItem);
    updateItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = items.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    });
    updateItems(newItems);
  };

  const handleFetchPrompts = async (index, item) => {
    const title = item.role || item.company || 'Work Experience';

    setPromptsState((prev) => ({
      ...prev,
      [index]: { show: true, questions: [], loading: true, errorText: '' },
    }));

    try {
      const response = await fetch('/api/ai/suggest-achievements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          bullets: item.bullets || [],
          context: `${item.role || ''} at ${item.company || ''}`,
        }),
      });

      const resData = await response.json();

      if (response.ok && Array.isArray(resData.questions)) {
        setPromptsState((prev) => ({
          ...prev,
          [index]: { show: true, questions: resData.questions, loading: false, errorText: '' },
        }));
      } else {
        setPromptsState((prev) => ({
          ...prev,
          [index]: { show: true, questions: [], loading: false, errorText: resData.message || 'Could not generate prompts.' },
        }));
      }
    } catch (err) {
      console.error('Error fetching achievement prompts:', err);
      setPromptsState((prev) => ({
        ...prev,
        [index]: { show: true, questions: [], loading: false, errorText: 'Network error — could not reach AI service.' },
      }));
    }
  };

  const handleAddBulletFromPrompt = (index, questionText) => {
    const item = items[index];
    const currentBullets = item?.bullets || [];
    const newBullets = [...currentBullets, ''];
    handleItemChange(index, 'bullets', newBullets);
  };

  const handleDismissPrompts = (index) => {
    setPromptsState((prev) => ({
      ...prev,
      [index]: { ...prev[index], show: false },
    }));
  };

  return (
    <div className="space-y-6 font-body">
      <div className="flex items-center justify-between border-b border-surface-200/80 pb-3">
        <div>
          <h3 className="text-base font-bold font-display text-surface-900">Work Experience</h3>
          <p className="text-xs text-surface-500">
            Detail your professional roles, responsibilities, and achievements.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={handleAdd} leftIcon={<span>+</span>}>
          Add Experience
        </Button>
      </div>

      {items.length === 0 ? (
        <Card padding="p-8" className="text-center bg-white/60 border-dashed border-surface-300 space-y-2">
          <p className="text-xs text-surface-500">No work experience entries added yet.</p>
          <Button size="sm" variant="ghost" onClick={handleAdd}>
            + Add your first work experience entry
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const promptState = promptsState[index] || { show: false, questions: [], loading: false };

            return (
              <Card
                key={item.id || index}
                padding="p-5"
                className="bg-white border-surface-200 shadow-soft-xs space-y-4 relative"
              >
                {/* Item Header Controls */}
                <div className="flex items-center justify-between border-b border-surface-100 pb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" size="sm">
                      Experience #{index + 1}
                    </Badge>

                    {/* AI Suggest Achievements Button */}
                    <button
                      type="button"
                      onClick={() => handleFetchPrompts(index, item)}
                      className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80 transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <span>💡</span>
                      <span>Suggest achievements to add</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      title="Move Up"
                      className="p-1 text-surface-400 hover:text-surface-800 disabled:opacity-30 text-xs cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === items.length - 1}
                      title="Move Down"
                      className="p-1 text-surface-400 hover:text-surface-800 disabled:opacity-30 text-xs cursor-pointer"
                    >
                      ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      title="Delete Entry"
                      className="p-1 text-rose-500 hover:text-rose-700 text-xs ml-2 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Form Input Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Company Name"
                    isRequired
                    value={item.company || ''}
                    onChange={(e) => handleItemChange(index, 'company', e.target.value)}
                    placeholder="e.g. Google"
                    error={!item.company?.trim() ? 'Company name required' : ''}
                  />

                  <Input
                    label="Job Title"
                    value={item.role || ''}
                    onChange={(e) => handleItemChange(index, 'role', e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                  />

                  <Input
                    label="Location"
                    value={item.location || ''}
                    onChange={(e) => handleItemChange(index, 'location', e.target.value)}
                    placeholder="e.g. Mountain View, CA (or Remote)"
                  />

                  <Input
                    label="Start Date"
                    value={item.startDate || ''}
                    onChange={(e) => handleItemChange(index, 'startDate', e.target.value)}
                    placeholder="e.g. Jan 2022"
                  />

                  <Input
                    label="End Date"
                    value={item.current ? 'Present' : item.endDate || ''}
                    isDisabled={item.current}
                    onChange={(e) => handleItemChange(index, 'endDate', e.target.value)}
                    placeholder="e.g. Present"
                  />

                  <div className="sm:col-span-2 flex items-center space-x-2 pt-1">
                    <input
                      type="checkbox"
                      id={`exp-current-${index}`}
                      checked={item.current || false}
                      onChange={(e) => handleItemChange(index, 'current', e.target.checked)}
                      className="w-4 h-4 rounded bg-white border-surface-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <label htmlFor={`exp-current-${index}`} className="text-xs text-surface-600 font-medium cursor-pointer">
                      I am currently working here
                    </label>
                  </div>
                </div>

                {/* Optional Reflective Achievement Prompts Panel */}
                {promptState.show && (
                  <AchievementPromptsPanel
                    title={item.role || item.company}
                    questions={promptState.questions}
                    loading={promptState.loading}
                    errorText={promptState.errorText || ''}
                    onAddBulletWithFocus={(q) => handleAddBulletFromPrompt(index, q)}
                    onDismiss={() => handleDismissPrompts(index)}
                  />
                )}

                {/* Bullet Points List Editor */}
                <div className="pt-2 border-t border-surface-100">
                  <BulletListEditor
                    bullets={item.bullets || []}
                    onChange={(newBullets) => handleItemChange(index, 'bullets', newBullets)}
                    label="Key Achievements & Responsibilities"
                    context={{ jobTitle: item.role, company: item.company }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
