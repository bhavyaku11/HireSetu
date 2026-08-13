import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';

export default function AchievementsForm({ data = { items: [] }, onChange }) {
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
      title: '',
      date: '',
      description: '',
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
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">Achievements</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Highlight awards, hackathon wins, honors, and competitive rankings.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={handleAdd} leftIcon={<span>+</span>}>
          Add Achievement
        </Button>
      </div>

      {items.length === 0 ? (
        <Card padding="p-8" className="text-center bg-white/60 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">No achievement entries added yet.</p>
          <Button size="sm" variant="ghost" onClick={handleAdd}>
            + Add your first achievement
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card
              key={item.id || index}
              padding="p-5"
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-soft-xs space-y-4 relative"
            >
              {/* Item Header Controls */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <Badge variant="secondary" size="sm">
                  Achievement #{index + 1}
                </Badge>

                <div className="flex items-center space-x-1">
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
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Achievement Title"
                    placeholder="e.g. Smart India Hackathon Winner, Gold Medalist in Tennis"
                    value={item.title || ''}
                    onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Date"
                    placeholder="e.g. 2023 or Nov 2022"
                    value={item.date || ''}
                    onChange={(e) => handleItemChange(index, 'date', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Detail
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-y"
                  placeholder="Secured 1st rank out of 500+ participating national teams by building an AI-assisted diagnostic tool."
                  value={item.description || ''}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
