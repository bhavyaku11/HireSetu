import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';

const PROFICIENCY_OPTIONS = [
  'Native / Bilingual',
  'Full Professional',
  'Professional Working',
  'Limited Working',
  'Elementary',
];

export default function LanguagesForm({ data = { items: [] }, onChange }) {
  const items = Array.isArray(data.items) ? data.items : [];

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
      proficiency: 'Professional Working',
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
        <div>
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">Languages</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Specify languages you speak and your level of proficiency.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={handleAdd} leftIcon={<span>+</span>}>
          Add Language
        </Button>
      </div>

      {items.length === 0 ? (
        <Card padding="p-8" className="text-center bg-white/60 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">No language entries added yet.</p>
          <Button size="sm" variant="ghost" onClick={handleAdd}>
            + Add your first language
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card
              key={item.id || index}
              padding="p-4"
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Language Name"
                  placeholder="e.g. English, Spanish, Hindi, German"
                  value={item.name || ''}
                  onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proficiency Level
                  </label>
                  <select
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    value={item.proficiency || 'Professional Working'}
                    onChange={(e) => handleItemChange(index, 'proficiency', e.target.value)}
                  >
                    {PROFICIENCY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-1 self-end sm:self-center">
                <button
                  type="button"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  title="Move Up"
                  className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 text-xs cursor-pointer"
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === items.length - 1}
                  title="Move Down"
                  className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 text-xs cursor-pointer"
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  title="Remove"
                  className="p-1 text-rose-500 hover:text-rose-700 text-xs ml-2 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
