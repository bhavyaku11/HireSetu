import React, { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import Badge, { Pill } from '../ui/Badge';

export default function SkillsForm({ data = { categories: [] }, onChange }) {
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const [skillInputs, setSkillInputs] = useState({});

  const updateCategories = (newCategories) => {
    onChange({
      ...data,
      categories: newCategories,
    });
  };

  const handleAddCategory = () => {
    const newCategory = {
      id: Date.now().toString(),
      name: 'Technical Skills',
      skills: [],
    };
    updateCategories([...categories, newCategory]);
  };

  const handleRemoveCategory = (index) => {
    const newCategories = categories.filter((_, i) => i !== index);
    updateCategories(newCategories);
  };

  const handleCategoryNameChange = (index, newName) => {
    const newCategories = categories.map((cat, i) => {
      if (i === index) {
        return { ...cat, name: newName };
      }
      return cat;
    });
    updateCategories(newCategories);
  };

  const handleAddSkill = (catIndex) => {
    const text = (skillInputs[catIndex] || '').trim();
    if (!text) return;

    const newCategories = categories.map((cat, i) => {
      if (i === catIndex) {
        const existingSkills = Array.isArray(cat.skills) ? cat.skills : [];
        if (!existingSkills.includes(text)) {
          return { ...cat, skills: [...existingSkills, text] };
        }
      }
      return cat;
    });

    updateCategories(newCategories);
    setSkillInputs((prev) => ({ ...prev, [catIndex]: '' }));
  };

  const handleRemoveSkill = (catIndex, skillToRemove) => {
    const newCategories = categories.map((cat, i) => {
      if (i === catIndex) {
        const existingSkills = Array.isArray(cat.skills) ? cat.skills : [];
        return {
          ...cat,
          skills: existingSkills.filter((s) => s !== skillToRemove),
        };
      }
      return cat;
    });
    updateCategories(newCategories);
  };

  const handleKeyDown = (e, catIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill(catIndex);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-700/80 pb-3">
        <div>
          <h3 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">Skills & Competencies</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Organize your technical, domain, and soft skills into categorized tag groups.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={handleAddCategory} leftIcon={<span>+</span>}>
          Add Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card padding="p-8" className="text-center bg-white/60 border-dashed border-slate-300 dark:border-slate-400 space-y-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">No skill categories added yet.</p>
          <Button size="sm" variant="ghost" onClick={handleAddCategory}>
            + Add your first skill category
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map((cat, catIndex) => {
            const currentSkills = Array.isArray(cat.skills) ? cat.skills : [];
            return (
              <Card
                key={cat.id || catIndex}
                padding="p-5"
                className="bg-white border-slate-200 dark:border-slate-700 shadow-soft-xs space-y-4 relative"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <Input
                      value={cat.name || ''}
                      onChange={(e) => handleCategoryNameChange(catIndex, e.target.value)}
                      placeholder="Category Name (e.g. Technical Skills)"
                      className="font-bold text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(catIndex)}
                    title="Remove Category"
                    className="p-2 text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer shrink-0"
                  >
                    ✕ Remove
                  </button>
                </div>

                {/* Skill Tag Pills Display */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {currentSkills.map((skill, sIdx) => (
                    <Pill key={sIdx} variant="primary" size="md">
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(catIndex, skill)}
                        className="ml-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:text-indigo-400 font-bold"
                      >
                        ×
                      </button>
                    </Pill>
                  ))}

                  {currentSkills.length === 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-400 italic">No skills added in this category yet.</span>
                  )}
                </div>

                {/* Tag Input */}
                <div className="flex items-center space-x-2 pt-1">
                  <div className="flex-1">
                    <Input
                      value={skillInputs[catIndex] || ''}
                      onChange={(e) =>
                        setSkillInputs((prev) => ({ ...prev, [catIndex]: e.target.value }))
                      }
                      onKeyDown={(e) => handleKeyDown(e, catIndex)}
                      placeholder="Type a skill and press Enter..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => handleAddSkill(catIndex)}
                  >
                    Add
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
