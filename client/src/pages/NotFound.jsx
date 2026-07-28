import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-body selection:bg-indigo-500/20 dark:bg-indigo-400/20 selection:text-indigo-700 dark:text-indigo-300 flex flex-col items-center justify-center p-4">
      {/* Background Dot Grid Pattern */}
      <div className="fixed inset-0 bg-[radial-gradient(#d4ccff_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="relative z-10 bg-white border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-10 max-w-md w-full text-center space-y-5 shadow-soft-xl">
        {/* 404 Number */}
        <div className="text-7xl font-extrabold font-display tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300 leading-none">
          404
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link to="/dashboard">
            <Button variant="primary" size="md">
              Back to Dashboard
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="md">
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
