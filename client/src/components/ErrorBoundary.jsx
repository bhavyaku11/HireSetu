import React, { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-4 font-body"
          style={{ background: 'linear-gradient(135deg, #F6F4FF 0%, #FAF8FF 40%, #FFFFFF 100%)' }}
        >
          {/* Background Dot Grid Pattern */}
          <div
            className="fixed inset-0 pointer-events-none opacity-30"
            style={{
              backgroundImage: 'radial-gradient(#d4ccff 1.2px, transparent 1.2px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10 bg-white border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-10 max-w-md w-full text-center space-y-5 shadow-soft-xl">
            {/* Error Icon */}
            <div className="w-14 h-14 bg-rose-50 border border-rose-200/80 text-2xl rounded-2xl flex items-center justify-center mx-auto shadow-soft-xs">
              💥
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100 tracking-tight">
                Something Went Wrong
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                An unexpected error occurred. Your saved resume data is safe — try reloading or going back to the dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-bold font-body rounded-2xl text-white border border-indigo-400/30 dark:border-indigo-400/30 shadow-soft-sm transition-all duration-200 active:scale-[0.98] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #6D5EF0 0%, #5542E2 100%)' }}
              >
                Reload Application
              </button>
              <a
                href="/dashboard"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold font-body rounded-2xl bg-white text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:border-slate-400 hover:bg-slate-50 dark:bg-slate-900 shadow-soft-xs transition-all duration-200 active:scale-[0.98] cursor-pointer"
              >
                Go to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
