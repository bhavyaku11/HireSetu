import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Upload, Trash2, Search, SlidersHorizontal,
  FileText, Sparkles, LayoutDashboard, Clock, ChevronDown,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import ImportModal from '../components/dashboard/ImportModal';
import AppHeader from '../components/ui/AppHeader';
import {
  AnimatedFolderIcon,
  AnimatedFileTextIcon,
  AnimatedSparklesIcon,
  AnimatedClockIcon,
} from '../components/icons/AnimatedIcons';
import ResumeCard from '../components/dashboard/ResumeCard';

/* ─── Skeleton card (matches ResumeCard shape) ────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[var(--border-glass)] bg-white dark:bg-[var(--ink)] overflow-hidden shadow-soft-sm">
      <div className="flex flex-col pl-5 pr-4 pt-5 pb-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-4 w-8 rounded-full skeleton-shimmer" />
          <div className="h-4 w-14 rounded-full skeleton-shimmer" />
        </div>
        <div className="space-y-1.5">
          <div className="h-4 w-4/5 rounded-md skeleton-shimmer" />
          <div className="h-3 w-1/2 rounded-md skeleton-shimmer" />
        </div>
        <div className="h-3 w-1/3 rounded-md skeleton-shimmer" />
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-[var(--border-glass)] bg-slate-50/60 dark:bg-[var(--void)]/40">
        <div className="flex items-center gap-1.5">
          <div className="w-7 h-7 rounded-full skeleton-shimmer" />
          <div className="h-3 w-7 rounded skeleton-shimmer" />
        </div>
        <div className="h-6 w-14 rounded-lg skeleton-shimmer" />
      </div>
    </div>
  );
}

/* ─── Stats card — used in asymmetric bento layout ───── */
/**
 * featured: boolean — if true, renders taller with larger number (the "hero" stat)
 * accent: 'signal' | 'violet' | 'scanline' | 'amber'
 */
function StatCard({ IconComponent, label, value, sub, accent = 'signal', featured = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const accentMap = {
    signal: {
      bg:    'bg-indigo-50 dark:bg-[var(--signal)]/8',
      icon:  'text-indigo-600 dark:text-[var(--signal)]',
      value: 'text-indigo-700 dark:text-[var(--signal)]',
    },
    violet: {
      bg:    'bg-violet-50 dark:bg-[var(--signal)]/5',
      icon:  'text-violet-600 dark:text-[var(--signal-hover)]',
      value: 'text-violet-700 dark:text-[var(--signal-hover)]',
    },
    scanline: {
      bg:    'bg-emerald-50 dark:bg-[var(--scanline)]/8',
      icon:  'text-emerald-600 dark:text-[var(--scanline)]',
      value: 'text-emerald-700 dark:text-[var(--scanline)]',
    },
    amber: {
      bg:    'bg-amber-50 dark:bg-[var(--flag)]/8',
      icon:  'text-amber-600 dark:text-[var(--flag)]',
      value: 'text-amber-700 dark:text-[var(--flag)]',
    },
  };
  const c = accentMap[accent] || accentMap.signal;

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex items-center gap-3.5 p-4 rounded-2xl bg-white dark:bg-[var(--ink)] border shadow-soft-sm hover:shadow-soft-md transition-all duration-200 min-w-0 overflow-hidden group cursor-pointer ${
        featured
          ? 'border-indigo-200/90 dark:border-[var(--signal)]/30 bg-indigo-50/20 dark:bg-[var(--signal)]/5'
          : 'border-slate-200 dark:border-[var(--border-glass)] hover:dark:border-[var(--signal)]/20'
      }`}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.bg}`}>
        {IconComponent && <IconComponent className={`w-5 h-5 ${c.icon}`} isHovered={isHovered} />}
      </div>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className={`font-mono font-bold leading-tight tracking-tight ${c.value} text-2xl truncate`}>
          {value}
        </p>
        <p className="font-semibold text-xs text-slate-600 dark:text-[var(--parchment)] mt-0.5 truncate">
          {label}
        </p>
        {sub && (
          <p className="text-[11px] text-slate-400 dark:text-[var(--dust)] mt-0.5 truncate">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Dynamic banner subtitle ─────────────────────────── */
function getBannerSubtitle(resumes) {
  const total = resumes.length;
  const tailored = resumes.filter(r => r.tailored_for_jd_title || r.tailoredForJdTitle).length;
  const base = total - tailored;

  if (total === 0) return 'Create your first ATS-optimized resume to get started.';
  if (tailored === 0 && base > 0)
    return `You have ${base} base resume${base !== 1 ? 's' : ''} ready — try tailoring one for your next role.`;
  if (tailored > 0 && tailored === total)
    return `All ${total} of your resumes are tailored versions. Consider keeping a clean base resume too.`;
  if (tailored > 0)
    return `${tailored} tailored version${tailored !== 1 ? 's' : ''} created — your AI-assisted work is paying off.`;
  return 'Manage, edit, and tailor your ATS-optimized resumes in one place.';
}

const SORT_OPTIONS = [
  { value: 'updated_desc', label: 'Recently Updated' },
  { value: 'updated_asc',  label: 'Oldest First' },
  { value: 'name_asc',     label: 'Name A→Z' },
  { value: 'name_desc',    label: 'Name Z→A' },
];

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // ── Data state (unchanged logic) ──────────────────────
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteConfirmTitle, setDeleteConfirmTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  // ── UI/filter state (new) ─────────────────────────────
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'base' | 'tailored'
  const [sortBy, setSortBy] = useState('updated_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  /* ── API: fetch ───────────────────────────────────────── */
  const fetchResumes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/resumes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setResumes(data.resumes || []);
      } else {
        setError(data.message || 'Failed to load your resumes.');
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
      setError('Network error — could not load resumes. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchResumes();
  }, [token]);

  /* ── API: delete ──────────────────────────────────────── */
  const handleDeleteResume = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/resumes/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setResumes(prev => prev.filter(r => r.id !== deleteConfirmId));
        setDeleteConfirmId(null);
        setDeleteConfirmTitle('');
      } else {
        setError(data.message || 'Failed to delete resume');
        setDeleteConfirmId(null);
        setDeleteConfirmTitle('');
      }
    } catch (err) {
      console.error('Failed to delete resume:', err);
      setError('Network error — could not delete resume.');
      setDeleteConfirmId(null);
      setDeleteConfirmTitle('');
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── API: create ──────────────────────────────────────── */
  const handleCreateResume = async (e) => {
    e.preventDefault();
    const titleToUse = newTitle.trim() || 'My Resume';
    setCreating(true);
    setError('');
    try {
      const response = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: titleToUse }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to create resume');
        setCreating(false);
      } else {
        setShowModal(false);
        setNewTitle('');
        navigate(`/builder/${data.resumeId}`);
      }
    } catch (err) {
      console.error('Error creating resume:', err);
      setError('Network error. Failed to create resume.');
      setCreating(false);
    }
  };

  /* ── Derived stats ────────────────────────────────────── */
  const stats = useMemo(() => {
    const total = resumes.length;
    const tailored = resumes.filter(r => r.tailored_for_jd_title || r.tailoredForJdTitle).length;
    const base = total - tailored;
    const lastUpdated = resumes.length
      ? resumes.reduce((latest, r) =>
          new Date(r.updated_at) > new Date(latest.updated_at) ? r : latest
        )
      : null;

    const lastActivityText = (() => {
      if (!lastUpdated) return '—';
      const diffDays = Math.floor((Date.now() - new Date(lastUpdated.updated_at)) / 86400000);
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(lastUpdated.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    })();

    return { total, tailored, base, lastActivityText };
  }, [resumes]);

  /* ── Filtered + sorted resumes ────────────────────────── */
  const displayedResumes = useMemo(() => {
    let list = [...resumes];

    // Tab filter
    if (filterTab === 'base') {
      list = list.filter(r => !(r.tailored_for_jd_title || r.tailoredForJdTitle));
    } else if (filterTab === 'tailored') {
      list = list.filter(r => r.tailored_for_jd_title || r.tailoredForJdTitle);
    }

    // Search
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(r => r.title.toLowerCase().includes(q));
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'updated_desc') return new Date(b.updated_at) - new Date(a.updated_at);
      if (sortBy === 'updated_asc')  return new Date(a.updated_at) - new Date(b.updated_at);
      if (sortBy === 'name_asc')     return a.title.localeCompare(b.title);
      if (sortBy === 'name_desc')    return b.title.localeCompare(a.title);
      return 0;
    });

    return list;
  }, [resumes, filterTab, search, sortBy]);

  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Sort';

  /* ── Banner subtitle ──────────────────────────────────── */
  const bannerSubtitle = useMemo(() => getBannerSubtitle(resumes), [resumes]);

  /* ── Render ───────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[var(--void)] text-slate-900 dark:text-[var(--parchment)] flex flex-col font-body selection:bg-indigo-500/20 selection:text-indigo-400">
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-5 md:p-8 space-y-6">

        {/* ─── 1. Welcome Banner ────────────────────────────── */}
        <div className="relative rounded-2xl overflow-hidden border border-indigo-200/60 dark:border-indigo-700/30 shadow-soft-md">
          {/* Gradient background — signal colors in dark mode */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 dark:from-[var(--void)] dark:via-[var(--ink)] dark:to-[var(--signal)]/20 dark:border dark:border-[var(--border-glass)]" />
          {/* Subtle dot pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />
          {/* Content */}
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 px-6 py-6 md:px-8 md:py-7">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 border border-white/20">
                <LayoutDashboard className="w-3 h-3 text-white/80" />
                <span className="text-[11px] font-bold text-white/80 tracking-wide uppercase">Dashboard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-sm text-indigo-100/80 max-w-lg leading-relaxed">
                {loading ? 'Loading your resumes…' : bannerSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/25 text-white transition-all duration-150 active:scale-[0.98] shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Import Resume
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-white hover:bg-indigo-50 text-indigo-700 transition-all duration-150 active:scale-[0.98] shadow-soft-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                New Resume
              </button>
            </div>
          </div>
        </div>

        {/* ─── 2. Stats Grid ─────────────────────────────────── */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              IconComponent={AnimatedFolderIcon}
              label="Total Resumes"
              value={stats.total}
              sub={stats.total === 1 ? '1 resume created' : `${stats.total} resumes total`}
              accent="signal"
              featured
            />
            <StatCard
              IconComponent={AnimatedFileTextIcon}
              label="Base Resumes"
              value={stats.base}
              sub="Clean originals"
              accent="signal"
            />
            <StatCard
              IconComponent={AnimatedSparklesIcon}
              label="Tailored Versions"
              value={stats.tailored}
              sub="AI-assisted"
              accent="violet"
            />
            <StatCard
              IconComponent={AnimatedClockIcon}
              label="Last Activity"
              value={stats.lastActivityText}
              sub={stats.total > 0 ? 'Most recent edit' : 'No activity yet'}
              accent="amber"
            />
          </div>
        )}

        {/* ─── 3. Resume Grid Section ───────────────────────── */}
        <div className="space-y-4">

          {/* Section header row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-[var(--parchment)]">
                Your Resumes
              </h3>
              {!loading && (
                <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-mono font-bold bg-slate-100 dark:bg-[var(--ink)] text-slate-600 dark:text-[var(--dust)] border-slate-200 dark:border-[var(--border-glass)]">
                  {resumes.length}
                </span>
              )}
            </div>
          </div>

          {/* Search + Filter tabs + Sort */}
          {!loading && resumes.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-0 w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search resumes…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-[var(--border-glass)] bg-white dark:bg-[var(--ink)] text-sm text-slate-900 dark:text-[var(--parchment)] placeholder:text-slate-400 dark:placeholder:text-[var(--dust)] focus:outline-none focus:ring-2 focus:ring-indigo-500/40 dark:focus:ring-[var(--signal)]/30 focus:border-indigo-400 dark:focus:border-[var(--signal)] transition-all duration-150"
                />
              </div>

              {/* Filter tabs */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[var(--ink)] rounded-xl p-1 shrink-0 border dark:border-[var(--border-glass)]">
                {[
                  { key: 'all',      label: 'All' },
                  { key: 'base',     label: 'Base' },
                  { key: 'tailored', label: 'Tailored' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterTab(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
                      filterTab === tab.key
                        ? 'bg-white dark:bg-[var(--signal)]/15 text-slate-900 dark:text-[var(--parchment)] shadow-soft-xs dark:border dark:border-[var(--signal)]/25'
                        : 'text-slate-500 dark:text-[var(--dust)] hover:text-slate-700 dark:hover:text-[var(--parchment)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Sort dropdown */}
              <div className="relative shrink-0">
                <button
                  onClick={() => setShowSortMenu(v => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-[var(--border-glass)] bg-white dark:bg-[var(--ink)] text-slate-700 dark:text-[var(--dust)] hover:bg-slate-50 dark:hover:bg-[var(--ink-glass-bg)] transition-all duration-150"
                >
                  <SlidersHorizontal className="w-3 h-3" />
                  {currentSortLabel}
                  <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${showSortMenu ? 'rotate-180' : ''}`} />
                </button>
                {showSortMenu && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortMenu(false)} />
                    <div className="absolute right-0 top-full mt-1.5 z-20 w-44 bg-white dark:bg-[var(--ink)] border border-slate-200 dark:border-[var(--border-glass)] rounded-xl shadow-soft-lg py-1 overflow-hidden">
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                          className={`w-full text-left px-3.5 py-2 text-xs font-semibold transition-colors ${
                            sortBy === opt.value
                              ? 'bg-indigo-50 dark:bg-[var(--signal)]/10 text-indigo-700 dark:text-[var(--signal)]'
                              : 'text-slate-700 dark:text-[var(--dust)] hover:bg-slate-50 dark:hover:bg-[var(--ink-glass-bg)]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 rounded-2xl text-xs text-rose-700 dark:text-rose-400 font-medium flex items-center justify-between gap-3">
              <span>⚠️ {error}</span>
              <button
                onClick={() => { setError(''); fetchResumes(); }}
                className="shrink-0 text-rose-600 dark:text-rose-400 hover:text-rose-900 dark:hover:text-rose-300 font-semibold underline"
              >Retry</button>
            </div>
          )}

          {/* Loading skeleton */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : resumes.length === 0 ? (
            /* Empty state */
            <div className="py-16 flex flex-col items-center text-center space-y-4 border-2 border-dashed border-slate-200 dark:border-[var(--border-glass)] rounded-2xl bg-white/60 dark:bg-[var(--ink)]/40">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/60 dark:border-indigo-700/40 rounded-2xl flex items-center justify-center text-2xl shadow-soft-xs">
                📄
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold font-display text-slate-900 dark:text-slate-100">
                  You haven't created any resumes yet
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Create your first ATS-optimized resume or import an existing PDF/DOCX document to get started.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setShowModal(true)}
                  leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
                  className="shadow-soft-sm"
                >
                  Create your first resume
                </Button>
              </div>
            </div>
          ) : displayedResumes.length === 0 ? (
            /* No search results */
            <div className="py-12 flex flex-col items-center text-center space-y-3 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No resumes match your search</p>
              <button
                onClick={() => { setSearch(''); setFilterTab('all'); }}
                className="text-xs text-indigo-600 dark:text-indigo-400 underline font-semibold"
              >
                Clear filters
              </button>
            </div>
          ) : (
            /* Resume grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {displayedResumes.map((res, i) => (
                <ResumeCard
                  key={res.id}
                  resume={res}
                  index={i}
                  onDeleteClick={(id, title) => {
                    setDeleteConfirmId(id);
                    setDeleteConfirmTitle(title);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ─── New Resume Modal ──────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md">
            <Card padding="p-6" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-soft-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Create New Resume
                </h3>
                <button
                  onClick={() => { setShowModal(false); setError(''); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/40 rounded-xl text-rose-700 dark:text-rose-400 text-xs font-medium flex items-center space-x-2">
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateResume} className="space-y-4">
                <Input
                  label="Resume Title"
                  isRequired
                  autoFocus
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer 2026"
                  helperText="Choose a title to identify this resume version."
                />
                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowModal(false); setError(''); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm" isLoading={creating}>
                    {creating ? 'Creating…' : 'Create & Open'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─────────────────────── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md">
            <Card padding="p-6" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-soft-xl space-y-4">
              <div className="flex items-start gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-500" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">
                    Delete Resume?
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Are you sure you want to delete <span className="font-semibold text-slate-900 dark:text-slate-200">'{deleteConfirmTitle}'</span>? This cannot be undone.
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400/90 font-medium pt-1">
                    Note: If this resume has tailored versions, you must delete them first before deleting this base resume.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setDeleteConfirmId(null); setDeleteConfirmTitle(''); }}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDeleteResume}
                  disabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-700 text-white border-rose-600 dark:border-rose-600 shadow-soft-sm"
                >
                  {isDeleting ? 'Deleting…' : 'Delete Resume'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ─── Import Modal ──────────────────────────────────── */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}
