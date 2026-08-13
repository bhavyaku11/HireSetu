import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import SkyToggle from '../ui/sky-toggle';
import Button from '../ui/Button';
import UserDropdown from '../ui/UserDropdown';
import logoMark from '../../assets/logo-mark.png';

export default function Header() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 dark:bg-[var(--void)]/95 backdrop-blur-lg shadow-soft-sm border-b border-slate-200 dark:border-[var(--border-glass)] py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">

          {/* ── Brand Logo / Wordmark ─────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src={logoMark}
              alt="HireSetu Logo"
              className="w-8 h-8 object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-[17px] font-extrabold font-display tracking-tight text-slate-900 dark:text-[var(--parchment)] leading-none">
              Hire<span className="text-indigo-500 dark:text-[var(--signal)]">Setu</span>
            </span>
          </Link>

          {/* ── Desktop CTA / Profile Avatar ─────────── */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            {/* Theme toggle — left of auth controls */}
            <SkyToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="text-[13px]">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="text-[13px] shadow-soft-sm">
                    Get Started →
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ─────────────────────── */}
          <div className="md:hidden flex items-center gap-2">
            {/* Theme toggle on mobile too */}
            <SkyToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
            {isAuthenticated ? (
              <UserDropdown />
            ) : (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle navigation menu"
                aria-expanded={mobileOpen}
                className="p-2 rounded-xl text-slate-700 dark:text-[var(--dust)] hover:text-slate-900 dark:hover:text-[var(--parchment)] hover:bg-slate-100 dark:hover:bg-[var(--ink)] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Drawer (Logged Out) ────────────────────────── */}
      {mobileOpen && !isAuthenticated && (
        <div className="md:hidden mt-2 mx-4 mb-2 rounded-2xl bg-white dark:bg-[var(--ink)] border border-slate-200 dark:border-[var(--border-glass)] shadow-soft-xl overflow-hidden p-4 space-y-2.5">
          <Link to="/login" onClick={() => setMobileOpen(false)}>
            <Button variant="outline" size="md" className="w-full justify-center">
              Log in
            </Button>
          </Link>
          <Link to="/register" onClick={() => setMobileOpen(false)}>
            <Button variant="primary" size="md" className="w-full justify-center">
              Get Started Free →
            </Button>
          </Link>
        </div>
      )}
    </header>
  );
}
