import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';

export default function UserDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!user) return null;

  const getInitials = (nameStr) => {
    if (!nameStr || typeof nameStr !== 'string') return 'U';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  const initials = getInitials(user.name);
  const avatarUrl = user.profile_image_url;

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="flex items-center space-x-2 rounded-full p-1 hover:bg-slate-100/80 dark:hover:bg-[var(--ink-glass-bg)] transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-[var(--signal)]/30"
        aria-label="User account menu"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-[var(--border-glass)] bg-indigo-500 dark:bg-[var(--signal)] text-white font-bold text-xs flex items-center justify-center ring-2 ring-indigo-500/20 dark:ring-[var(--signal)]/20">
          {avatarUrl && !imgError ? (
            <img
              src={avatarUrl}
              alt={user.name || 'User avatar'}
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-500 dark:text-[var(--dust)] transition-transform duration-200 hidden sm:block ${
            isOpen ? 'rotate-180 text-indigo-600 dark:text-[var(--signal)]' : ''
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white dark:bg-[var(--ink)] dark:backdrop-blur-md border border-slate-200/90 dark:border-[var(--border-glass)] shadow-soft-xl z-50 overflow-hidden animate-fadeIn py-1 font-body">
          {/* User info */}
          <div className="px-4 py-3 border-b border-slate-200/80 dark:border-[var(--border-glass)]">
            <p className="text-xs font-bold text-slate-900 dark:text-[var(--parchment)] truncate font-display">
              {user.name || 'HireSetu User'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-[var(--dust)] truncate mt-0.5">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <button
              type="button"
              onClick={() => { setIsOpen(false); navigate('/profile'); }}
              className={`w-full px-4 py-2.5 text-xs font-semibold text-left flex items-center space-x-2.5 transition-colors ${
                location.pathname === '/profile'
                  ? 'bg-indigo-50/80 dark:bg-[var(--signal)]/10 text-indigo-700 dark:text-[var(--signal)] font-bold'
                  : 'text-slate-700 dark:text-[var(--dust)] hover:bg-slate-50 dark:hover:bg-[var(--ink-glass-bg)] hover:text-slate-900 dark:hover:text-[var(--parchment)]'
              }`}
            >
              <User className="w-4 h-4 text-slate-500 dark:text-[var(--dust)]" />
              <span>Profile</span>
            </button>

            <button
              type="button"
              onClick={() => { setIsOpen(false); navigate('/dashboard'); }}
              className={`w-full px-4 py-2.5 text-xs font-semibold text-left flex items-center space-x-2.5 transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-indigo-50/80 dark:bg-[var(--signal)]/10 text-indigo-700 dark:text-[var(--signal)] font-bold'
                  : 'text-slate-700 dark:text-[var(--dust)] hover:bg-slate-50 dark:hover:bg-[var(--ink-glass-bg)] hover:text-slate-900 dark:hover:text-[var(--parchment)]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-slate-500 dark:text-[var(--dust)]" />
              <span>Dashboard</span>
            </button>

            <div className="my-1 border-t border-slate-200/80 dark:border-[var(--border-glass)]" />

            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-xs font-semibold text-left text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-[var(--ink-glass-bg)] flex items-center space-x-2.5 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
