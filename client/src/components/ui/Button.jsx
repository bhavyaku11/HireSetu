import React from 'react';

const variantStyles = {
  primary:
    'bg-indigo-600 hover:bg-indigo-700 dark:bg-[var(--signal)] dark:hover:bg-[var(--signal-hover)] text-white shadow-soft-sm hover:shadow-soft-md border border-indigo-500/30 dark:border-[var(--signal)]/30 active:scale-[0.98]',
  secondary:
    'bg-indigo-50 dark:bg-[var(--signal)]/10 hover:bg-indigo-100 dark:hover:bg-[var(--signal)]/20 text-indigo-700 dark:text-[var(--signal-hover)] border border-indigo-200/60 dark:border-[var(--signal)]/25 active:scale-[0.98]',
  outline:
    'bg-white dark:bg-[var(--ink-glass-bg)] dark:backdrop-blur-md hover:bg-slate-50 dark:hover:bg-[var(--signal)]/5 text-slate-700 dark:text-[var(--parchment)] hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-[var(--border-glass)] hover:border-slate-300 dark:hover:border-[var(--signal)]/30 shadow-soft-xs active:scale-[0.98]',
  ghost:
    'bg-transparent hover:bg-indigo-50/70 dark:hover:bg-[var(--signal)]/8 text-slate-600 dark:text-[var(--dust)] hover:text-indigo-600 dark:hover:text-[var(--parchment)] active:scale-[0.98]',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white shadow-soft-sm border border-rose-500/30 active:scale-[0.98]',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
  lg: 'px-6 py-3 text-base font-bold rounded-2xl gap-2.5',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  isDisabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  type = 'button',
  onClick,
  ...props
}) {
  const disabled = isDisabled || isLoading;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-body tracking-tight transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none select-none ${
        variantStyles[variant] || variantStyles.primary
      } ${sizeStyles[size] || sizeStyles.md} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin -ml-0.5 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}

      <span>{children}</span>

      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
}
