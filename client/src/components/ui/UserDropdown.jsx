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

  // Close on click outside or Escape press
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
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

  // Extract initials (e.g. "Jane Doe" -> "JD")
  const getInitials = (nameStr) => {
    if (!nameStr || typeof nameStr !== 'string') return 'U';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
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
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center space-x-2 rounded-full p-1 hover:bg-surface-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        aria-label="User account menu"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-surface-200 shadow-soft-xs bg-brand-500 text-white font-bold text-xs flex items-center justify-center ring-2 ring-brand-500/20">
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
          className={`w-3.5 h-3.5 text-surface-500 transition-transform duration-200 hidden sm:block ${
            isOpen ? 'rotate-180 text-brand-600' : ''
          }`}
        />
      </button>

      {/* Animated Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-white border border-surface-200/90 shadow-soft-xl z-50 overflow-hidden animate-fadeIn py-1 font-body">
          {/* User Information Header */}
          <div className="px-4 py-3 border-b border-surface-200/80 bg-surface-50/60">
            <p className="text-xs font-bold text-surface-900 truncate font-display">
              {user.name || 'HireSetu User'}
            </p>
            <p className="text-[11px] text-surface-500 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="py-1">
            {/* Profile Route Link */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/profile');
              }}
              className={`w-full px-4 py-2.5 text-xs font-semibold text-left flex items-center space-x-2.5 transition-colors ${
                location.pathname === '/profile'
                  ? 'bg-brand-50/80 text-brand-700 font-bold'
                  : 'text-surface-700 hover:bg-surface-50 hover:text-surface-900'
              }`}
            >
              <User className="w-4 h-4 text-surface-500" />
              <span>Profile</span>
            </button>

            {/* Dashboard Link */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate('/dashboard');
              }}
              className={`w-full px-4 py-2.5 text-xs font-semibold text-left flex items-center space-x-2.5 transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-brand-50/80 text-brand-700 font-bold'
                  : 'text-surface-700 hover:bg-surface-50 hover:text-surface-900'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-surface-500" />
              <span>Dashboard</span>
            </button>

            <div className="my-1 border-t border-surface-200/80" />

            {/* Logout Action */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-xs font-semibold text-left text-rose-600 hover:bg-rose-50 flex items-center space-x-2.5 transition-colors"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
