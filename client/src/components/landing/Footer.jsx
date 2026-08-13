import React from 'react';
import { Link } from 'react-router-dom';
import logoMark from '../../assets/logo-mark.png';

export default function Footer() {
  return (
    <footer className="bg-slate-900/90 dark:bg-[var(--void)]/90 backdrop-blur-[1px] text-slate-300 dark:text-[var(--dust)] font-body border-t border-slate-800 dark:border-[var(--border-glass)] py-10 md:py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-2.5">
            <img
              src={logoMark}
              alt="HireSetu Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-extrabold font-display tracking-tight text-white">
              Hire<span className="text-indigo-400 dark:text-[var(--signal)]">Setu</span>
            </span>
          </Link>

          {/* Action Links */}
          <div className="flex items-center gap-6 text-xs text-slate-400 font-medium">
            <Link to="/login" className="hover:text-white transition-colors">
              Log in
            </Link>
            <Link to="/register" className="hover:text-white transition-colors">
              Get Started
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} HireSetu. Built for job seekers and software engineers.</p>
          <p className="text-[11px] text-slate-600">
            Sprint 1 Production Release • 100% ATS Parser Compatible
          </p>
        </div>
      </div>
    </footer>
  );
}
