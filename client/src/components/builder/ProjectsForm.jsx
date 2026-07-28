import React, { useState } from 'react';
import BulletListEditor from './BulletListEditor';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';
import { useAuth } from '../../context/AuthContext';
import AchievementPromptsPanel from './AchievementPromptsPanel';

export default function ProjectsForm({ data = { items: [] }, onChange }) {
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
      name: '',
      description: '',
      techStack: '',
      link: '',
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
    const title = item.name || 'Project';

    setPromptsState((prev) => ({
      ...prev,
      [index]: { show: true, questions: [], loading: true },
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
          context: `Project: ${item.name || ''} (${item.techStack || ''})`,
        }),
      });

      const resData = await response.json();

      if (response.ok && Array.isArray(resData.questions)) {
        setPromptsState((prev) => ({
          ...prev,
          [index]: { show: true, questions: resData.questions, loading: false },
        }));
      } else {
        setPromptsState((prev) => ({
          ...prev,
          [index]: { show: true, questions: [], loading: false },
        }));
      }
    } catch (err) {
      console.error('Error fetching project achievement prompts:', err);
      setPromptsState((prev) => ({
        ...prev,
        [index]: { show: true, questions: [], loading: false },
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
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
        <div>
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">Projects</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showcase key personal or professional projects and technical accomplishments.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={handleAdd} leftIcon={<span>+</span>}>
          Add Project
        </Button>
      </div>

      {items.length === 0 ? (
        <Card padding="p-8" className="text-center bg-white/60 border-dashed border-slate-300 dark:border-slate-400 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">No project entries added yet.</p>
          <Button size="sm" variant="ghost" onClick={handleAdd}>
            + Add your first project entry
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
                className="bg-white border-slate-200 dark:border-slate-700 shadow-soft-xs space-y-4 relative"
              >
                {/* Item Header Controls */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" size="sm">
                      Project #{index + 1}
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
                      className="p-1 text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 disabled:opacity-30 text-xs cursor-pointer"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === items.length - 1}
                      title="Move Down"
                      className="p-1 text-slate-400 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200 disabled:opacity-30 text-xs cursor-pointer"
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

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <Input
                      label="Project Name"
                      isRequired
                      value={item.name || ''}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="e.g. AI Resume Builder"
                      error={!item.name?.trim() ? 'Project name required' : ''}
                    />
                  </div>

                  <Input
                    label="Tech Stack (Comma-separated)"
                    value={item.techStack || ''}
                    onChange={(e) => handleItemChange(index, 'techStack', e.target.value)}
                    placeholder="e.g. React, Node.js, Express, MySQL"
                  />

                  <Input
                    label="Project Link / Demo URL"
                    type="url"
                    value={item.link || ''}
                    onChange={(e) => handleItemChange(index, 'link', e.target.value)}
                    placeholder="https://github.com/username/project"
                  />
                </div>

                {/* Optional Reflective Achievement Prompts Panel */}
                {promptState.show && (
                  <AchievementPromptsPanel
                    title={item.name}
                    questions={promptState.questions}
                    loading={promptState.loading}
                    onAddBulletWithFocus={(q) => handleAddBulletFromPrompt(index, q)}
                    onDismiss={() => handleDismissPrompts(index)}
                  />
                )}

                {/* Bullet Points List Editor */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <BulletListEditor
                    bullets={item.bullets || []}
                    onChange={(newBullets) => handleItemChange(index, 'bullets', newBullets)}
                    label="Key Features & Accomplishments"
                    context={{ jobTitle: item.name, company: item.techStack }}
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
