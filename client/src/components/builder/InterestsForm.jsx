import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

export default function InterestsForm({ data = { items: [] }, onChange }) {
  const items = Array.isArray(data.items) ? data.items : [];
  const [newInterestInput, setNewInterestInput] = useState('');

  const updateItems = (newItems) => {
    onChange({
      ...data,
      items: newItems,
    });
  };

  const handleAdd = () => {
    if (!newInterestInput.trim()) return;
    const trimmed = newInterestInput.trim();
    if (!items.includes(trimmed)) {
      updateItems([...items, trimmed]);
    }
    setNewInterestInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    updateItems(newItems);
  };

  const handleItemChange = (index, value) => {
    const newItems = [...items];
    newItems[index] = value;
    updateItems(newItems);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
        <div>
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">Interests & Hobbies</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            List personal interests, tech hobbies, or activities.
          </p>
        </div>
      </div>

      {/* Quick Add Input */}
      <Card padding="p-4" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft-xs">
        <div className="flex items-center space-x-2">
          <div className="flex-1">
            <Input
              placeholder="Type an interest (e.g., Open Source Contributing, UI/UX Design, Travel) and press Enter"
              value={newInterestInput}
              onChange={(e) => setNewInterestInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button size="sm" variant="primary" onClick={handleAdd} disabled={!newInterestInput.trim()}>
            + Add
          </Button>
        </div>
      </Card>

      {/* List of Interest Inputs */}
      {items.length === 0 ? (
        <Card padding="p-8" className="text-center bg-white/60 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">No interests added yet.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-soft-xs"
            >
              <span className="text-xs text-slate-400 font-medium px-2">#{index + 1}</span>
              <input
                type="text"
                className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                value={item}
                onChange={(e) => handleItemChange(index, e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                title="Remove Interest"
                className="p-1.5 text-rose-500 hover:text-rose-700 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
