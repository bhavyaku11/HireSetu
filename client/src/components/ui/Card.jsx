import React from 'react';

export function Card({
  children,
  className = '',
  hoverable = false,
  glass = false,
  padding = 'p-6',
  ...props
}) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 ${
        glass
          ? 'glass-card shadow-soft-sm'
          : 'bg-white dark:bg-[var(--ink)] border-slate-200 dark:border-[var(--border-glass)] shadow-soft-md hover:shadow-soft-lg'
      } ${
        hoverable
          ? 'hover:-translate-y-1 hover:border-indigo-300 dark:hover:border-[var(--signal)]/40 cursor-pointer'
          : ''
      } ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={`space-y-1.5 pb-4 border-b border-slate-200 dark:border-[var(--border-glass)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={`text-lg font-bold font-display text-slate-900 dark:text-[var(--parchment)] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p
      className={`text-xs text-slate-500 dark:text-[var(--dust)] font-body leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`pt-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`pt-4 mt-4 border-t border-slate-200 dark:border-[var(--border-glass)] flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
