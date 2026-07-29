import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Upload, Trash2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge, { Pill } from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import ImportModal from '../components/dashboard/ImportModal';
import AppHeader from '../components/ui/AppHeader';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

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

  const fetchResumes = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/resumes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    if (token) {
      fetchResumes();
    }
  }, [token]);

  const handleDeleteResume = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    setError('');
    try {
      const response = await fetch(`/api/resumes/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== deleteConfirmId));
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-body selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* Top Navbar Header */}
      <AppHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Banner Card */}
        <Card padding="p-8" className="bg-white/90 border-slate-200/80 dark:border-slate-700/80 shadow-soft-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Dashboard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-slate-100 tracking-tight">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Manage, edit, and tailor your ATS-optimized resumes in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto shrink-0">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowImportModal(true)}
                leftIcon={<Upload className="w-5 h-5" />}
                className="shadow-soft-sm"
              >
                Import Resume
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => setShowModal(true)}
                leftIcon={<span>+</span>}
                className="shadow-soft-md"
              >
                New Resume
              </Button>
            </div>
          </div>
        </Card>

        {/* Resumes Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700/70 pb-3">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">
                Your Resumes
              </h3>
              <Badge variant="neutral" size="sm">
                {resumes.length} total
              </Badge>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center justify-between gap-3">
              <span>⚠️ {error}</span>
              <button
                onClick={() => { setError(''); fetchResumes(); }}
                className="shrink-0 text-rose-600 hover:text-rose-900 font-semibold underline"
              >Retry</button>
            </div>
          )}

          {loading ? (
            <div className="p-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
              <div className="w-7 h-7 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-medium">Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <Card padding="p-12" className="text-center space-y-4 bg-white/80 border-dashed border-slate-300 dark:border-slate-400">
              <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200/60 dark:border-indigo-700/40/60 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-soft-xs">
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
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Saved Resume Cards */}
              {resumes.map((res) => (
                <Card
                  key={res.id}
                  hoverable
                  padding="p-6"
                  className="flex flex-col justify-between space-y-4"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Pill variant="primary" size="sm">
                          ID #{res.id}
                        </Pill>
                        {res.tailored_for_jd_title || res.tailoredForJdTitle ? (
                          <Badge variant="primary" size="sm">
                            ✨ Tailored for: {res.tailored_for_jd_title || res.tailoredForJdTitle}
                          </Badge>
                        ) : (
                          <Badge variant="neutral" size="sm">
                            Base Resume
                          </Badge>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setDeleteConfirmId(res.id);
                          setDeleteConfirmTitle(res.title);
                        }}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-500 transition-colors p-1 rounded-md hover:bg-rose-50 dark:hover:bg-rose-500/10"
                        title="Delete resume"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <CardTitle className="pt-1 truncate">{res.title}</CardTitle>
                    <CardDescription>
                      Last updated {new Date(res.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="pt-2">
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 font-medium">ATS Ready</span>
                    <Link to={`/builder/${res.id}`}>
                      <Button size="sm" variant="secondary" rightIcon={<span>→</span>}>
                        Continue Editing
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* New Resume Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-50/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <Card padding="p-6" className="bg-white border-slate-200 dark:border-slate-700 shadow-soft-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100">
                  Create New Resume
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:text-slate-400 text-sm"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center space-x-2">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateResume} className="space-y-4">
                <Input
                  label="Resume Title"
                  isRequired
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Software Engineer 2026"
                  helperText="Choose a title to identify this resume version."
                />

                <div className="flex justify-end space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowModal(false);
                      setError('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    isLoading={creating}
                  >
                    {creating ? 'Creating...' : 'Create & Open'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-50/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
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
                  onClick={() => {
                    setDeleteConfirmId(null);
                    setDeleteConfirmTitle('');
                  }}
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
                  {isDeleting ? 'Deleting...' : 'Delete Resume'}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Import Resume Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}

