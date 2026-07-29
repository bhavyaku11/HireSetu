import React from 'react';

/**
 * DocumentSurface
 * 
 * A fixed light, paper-like surface meant ONLY for representing actual 
 * exported document content (e.g. live resume preview, raw ATS parsed output).
 * This component deliberately ignores the app's dark mode theme to maintain 
 * a realistic "paper" appearance regardless of the surrounding chrome.
 */
export function DocumentSurface({ children, className = '', ...props }) {
  return (
    <div 
      className={`bg-white text-slate-900 border border-slate-200 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default DocumentSurface;
