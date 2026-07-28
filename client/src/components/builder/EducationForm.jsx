import React from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import Badge from '../ui/Badge';

export default function EducationForm({ data = { items: [] }, onChange }) {
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
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      coursework: '',
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
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">Education</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add degrees, certifications, and academic background.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={handleAdd} leftIcon={<span>+</span>}>
          Add Education
        </Button>
      </div>

      {items.length === 0 ? (
        <Card padding="p-8" className="text-center bg-white/60 border-dashed border-slate-300 dark:border-slate-400 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">No education entries added yet.</p>
          <Button size="sm" variant="ghost" onClick={handleAdd}>
            + Add your first education entry
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <Card
              key={item.id || index}
              padding="p-5"
              className="bg-white border-slate-200 dark:border-slate-700 shadow-soft-xs space-y-4 relative"
            >
              {/* Item Header Controls */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <Badge variant="secondary" size="sm">
                  Education #{index + 1}
                </Badge>

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
                    label="Institution Name"
                    isRequired
                    value={item.institution || ''}
                    onChange={(e) => handleItemChange(index, 'institution', e.target.value)}
                    placeholder="e.g. Stanford University"
                    error={!item.institution?.trim() ? 'Institution name required to save entry' : ''}
                  />
                </div>

                <Input
                  label="Degree"
                  value={item.degree || ''}
                  onChange={(e) => handleItemChange(index, 'degree', e.target.value)}
                  placeholder="e.g. Bachelor of Science"
                />

                <Input
                  label="Field of Study"
                  value={item.fieldOfStudy || ''}
                  onChange={(e) => handleItemChange(index, 'fieldOfStudy', e.target.value)}
                  placeholder="e.g. Computer Science"
                />

                <Input
                  label="Start Date"
                  value={item.startDate || ''}
                  onChange={(e) => handleItemChange(index, 'startDate', e.target.value)}
                  placeholder="e.g. Sep 2020"
                />

                <Input
                  label="End Date"
                  value={item.current ? 'Present' : item.endDate || ''}
                  isDisabled={item.current}
                  onChange={(e) => handleItemChange(index, 'endDate', e.target.value)}
                  placeholder="e.g. May 2024"
                />

                <div className="sm:col-span-2 flex items-center space-x-2 pt-1">
                  <input
                    type="checkbox"
                    id={`current-${index}`}
                    checked={item.current || false}
                    onChange={(e) => handleItemChange(index, 'current', e.target.checked)}
                    className="w-4 h-4 rounded bg-white border-slate-300 dark:border-slate-400 text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 dark:ring-indigo-400 cursor-pointer"
                  />
                  <label htmlFor={`current-${index}`} className="text-xs text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
                    I am currently studying here
                  </label>
                </div>

                <Input
                  label="GPA / Score (Optional)"
                  value={item.gpa || ''}
                  onChange={(e) => handleItemChange(index, 'gpa', e.target.value)}
                  placeholder="e.g. 3.9 / 4.0"
                />

                <Input
                  label="Relevant Coursework (Optional)"
                  value={item.coursework || ''}
                  onChange={(e) => handleItemChange(index, 'coursework', e.target.value)}
                  placeholder="e.g. Data Structures, Algorithms"
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
