import React from 'react';

const variantStyles = {
  primary:  'bg-indigo-50 dark:bg-[var(--signal)]/10 text-indigo-700 dark:text-[var(--signal-hover)] border-indigo-200/80 dark:border-[var(--signal)]/25',
  secondary:'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  success:  'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning:  'bg-amber-50 dark:bg-[var(--flag)]/10 text-amber-700 dark:text-[var(--flag)] border-amber-200/80 dark:border-[var(--flag)]/25',
  danger:   'bg-rose-50 text-rose-700 border-rose-200/80',
  neutral:  'bg-slate-100 dark:bg-[var(--ink)] text-slate-700 dark:text-[var(--dust)] border-slate-200 dark:border-[var(--border-glass)]',
  outline:  'bg-white dark:bg-transparent text-slate-700 dark:text-[var(--dust)] border-slate-300 dark:border-[var(--border-glass)] shadow-soft-xs',
};

const dotColors = {
  primary:  'bg-indigo-500 dark:bg-[var(--signal)]',
  secondary:'bg-indigo-500',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500 dark:bg-[var(--flag)]',
  danger:   'bg-rose-500',
  neutral:  'bg-slate-400 dark:bg-[var(--dust)]',
  outline:  'bg-slate-500 dark:bg-[var(--dust)]',
};

const sizeStyles = {
  sm: 'px-2.5 py-0.5 text-[11px] font-semibold gap-1.5',
  md: 'px-3 py-1 text-xs font-semibold gap-2',
};

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border transition-colors select-none font-body tracking-tight ${
        variantStyles[variant] || variantStyles.primary
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColors[variant] || dotColors.primary
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  );
}

export const Pill = Badge;
