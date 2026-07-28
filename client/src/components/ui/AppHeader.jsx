/**
 * AppHeader — shared header for all authenticated app pages.
 *
 * Props:
 *   leftSlot   ReactNode   — content on the left side (back buttons, title, breadcrumb)
 *   rightSlot  ReactNode   — content on the right side (action buttons, extra controls)
 *
 * The toggle and UserDropdown are always rendered — they never need to be passed in.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import SkyToggle from '../ui/sky-toggle';
import UserDropdown from '../ui/UserDropdown';
import logoMark from '../../assets/logo-mark.png';

export default function AppHeader({ leftSlot, rightSlot }) {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#12151F]/90 backdrop-blur-md border-b border-surface-200/80 dark:border-[#262B3A] px-4 md:px-6 py-3 shadow-soft-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

        {/* ── Left: Logo + page-specific slot ─────── */}
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src={logoMark}
              alt="HireSetu Logo"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-[16px] font-extrabold font-display tracking-tight text-surface-900 dark:text-[#F5F6FA] leading-none hidden sm:block">
              Hire<span className="text-brand-500">Setu</span>
            </span>
          </Link>

          {leftSlot && (
            <>
              <div className="h-5 w-px bg-surface-200 dark:bg-[#262B3A] shrink-0" />
              <div className="min-w-0 flex items-center gap-2">
                {leftSlot}
              </div>
            </>
          )}
        </div>

        {/* ── Right: page-specific actions + toggle + avatar ─── */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {rightSlot}
          <SkyToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
          <UserDropdown />
        </div>
      </div>
    </header>
  );
}
