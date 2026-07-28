import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(null);

/** Returns the OS-level preference: 'dark' or 'light' */
function getOsPreference() {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

/** Read persisted choice, falling back to OS preference */
function getInitialTheme() {
  try {
    const stored = localStorage.getItem('hiresetu-theme');
    if (stored === 'dark' || stored === 'light') return stored;
  } catch (_) {
    // localStorage may be blocked in some environments
  }
  return getOsPreference();
}

/** Apply the theme class to the html element immediately (called once on load) */
function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Apply the theme synchronously before first React render to avoid flash
applyTheme(getInitialTheme());

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('hiresetu-theme', theme);
    } catch (_) {
      // ignore
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const isDarkMode = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
