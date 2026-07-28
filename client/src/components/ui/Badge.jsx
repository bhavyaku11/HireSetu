import React from 'react';

const variantStyles = {
  primary: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-700/40/80',
  secondary: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/80',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/80',
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700',
  outline: 'bg-white text-slate-700 dark:text-slate-400 border-slate-300 dark:border-slate-400 shadow-soft-xs',
};

const dotColors = {
  primary: 'bg-indigo-500 dark:bg-indigo-400',
  secondary: 'bg-indigo-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  neutral: 'bg-slate-400 dark:bg-slate-400',
  outline: 'bg-slate-500 dark:bg-slate-400',
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
