import React, { useId } from 'react';

export default function Input({
  label = '',
  error = '',
  helperText = '',
  isRequired = false,
  isDisabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  id,
  type = 'text',
  placeholder = '',
  value,
  onChange,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full space-y-1.5 font-body">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-400 tracking-tight"
        >
          {label} {isRequired && <span className="text-indigo-500 dark:text-indigo-400 font-bold">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3.5 pointer-events-none text-slate-400 dark:text-slate-400 flex items-center justify-center">
            {leftIcon}
          </div>
        )}

        <input
          id={inputId}
          type={type}
          disabled={isDisabled}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`w-full px-3.5 py-2.5 bg-white border text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 rounded-xl transition-all duration-200 focus:outline-none ${
            leftIcon ? 'pl-10' : ''
          } ${rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15'
              : 'border-slate-200/90 dark:border-slate-700/90 focus:border-indigo-500 dark:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 dark:ring-indigo-400/15 hover:border-slate-300 dark:border-slate-400'
          } ${
            isDisabled ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700' : ''
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <div className="absolute right-3.5 text-slate-400 dark:text-slate-400 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      ) : (
        helperText && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}

export function TextArea({
  label = '',
  error = '',
  helperText = '',
  isRequired = false,
  isDisabled = false,
  className = '',
  id,
  rows = 4,
  placeholder = '',
  value,
  onChange,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="w-full space-y-1.5 font-body">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-400 tracking-tight"
        >
          {label} {isRequired && <span className="text-indigo-500 dark:text-indigo-400 font-bold">*</span>}
        </label>
      )}

      <textarea
        id={inputId}
        disabled={isDisabled}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3.5 py-2.5 bg-white border text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 rounded-xl transition-all duration-200 focus:outline-none resize-y ${
          error
            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15'
            : 'border-slate-200/90 dark:border-slate-700/90 focus:border-indigo-500 dark:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 dark:ring-indigo-400/15 hover:border-slate-300 dark:border-slate-400'
        } ${
          isDisabled ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-700' : ''
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
          <span>⚠️</span>
          <span>{error}</span>
        </p>
      ) : (
        helperText && <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
      )}
    </div>
  );
}
