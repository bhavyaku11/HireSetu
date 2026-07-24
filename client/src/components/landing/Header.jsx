import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const NAV_LINKS = [
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
];

export default function Header() {
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
          ? 'bg-white/90 backdrop-blur-lg shadow-soft-sm border-b border-surface-200/70 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between gap-8">

          {/* ── Brand Logo / Wordmark ─────────────────── */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center text-white font-black font-display text-base shadow-soft-sm group-hover:scale-105 transition-transform duration-200">
              H
            </div>
            <span className="text-[17px] font-extrabold font-display tracking-tight text-surface-900 leading-none">
              Hire<span className="text-brand-500">Setu</span>
            </span>
          </Link>

          {/* ── Desktop Nav — centered in remaining space ─ */}
          <nav className="hidden md:flex items-center gap-7 flex-1 justify-center">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] font-semibold text-surface-600 hover:text-brand-600 transition-colors duration-150 relative group"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-brand-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left rounded-full" />
              </a>
            ))}
          </nav>

          {/* ── Desktop CTA Buttons ───────────────────── */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
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
          </div>

          {/* ── Mobile Hamburger ─────────────────────── */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            className="md:hidden p-1.5 rounded-lg text-surface-600 hover:text-surface-900 hover:bg-surface-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile Drawer ────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden mt-1 mx-4 mb-2 rounded-2xl bg-white border border-surface-200/80 shadow-soft-lg overflow-hidden">
          <div className="px-4 py-3 space-y-0.5">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center py-3 text-sm font-semibold text-surface-700 hover:text-brand-600 border-b border-surface-100 last:border-0 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="px-4 py-4 bg-surface-50/80 flex flex-col gap-2.5">
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
        </div>
      )}
    </header>
  );
}
