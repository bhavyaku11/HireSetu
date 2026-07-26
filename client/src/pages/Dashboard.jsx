import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Upload } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge, { Pill } from '../components/ui/Badge';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import ImportModal from '../components/dashboard/ImportModal';
import logoMark from '../assets/logo-mark.png';

export default function Dashboard() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [error, setError] = useState('');

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/resumes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setResumes(data.resumes || []);
      }
    } catch (err) {
      console.error('Failed to fetch resumes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchResumes();
    }
  }, [token]);

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
    <div className="min-h-screen bg-brand-canvas text-surface-900 flex flex-col font-body selection:bg-brand-500/20 selection:text-brand-700">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-surface-200/80 px-6 py-4 shadow-soft-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center space-x-2.5 group">
            <img
              src={logoMark}
              alt="HireSetu Logo"
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform duration-200"
            />
            <span className="text-xl font-extrabold font-display tracking-tight text-surface-900">
              Hire<span className="text-brand-500">Setu</span>
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
        {/* Banner Card */}
        <Card padding="p-8" className="bg-white/90 border-surface-200/80 shadow-soft-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center space-x-2">
                <span className="text-xs font-semibold text-brand-600">Dashboard</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-surface-900 tracking-tight">
                Welcome back, {user?.name}!
              </h2>
              <p className="text-xs sm:text-sm text-surface-600">
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
          <div className="flex items-center justify-between border-b border-surface-200/70 pb-3">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold font-display text-surface-900">
                Your Resumes
              </h3>
              <Badge variant="neutral" size="sm">
                {resumes.length} total
              </Badge>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-surface-500 space-y-3">
              <div className="w-7 h-7 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-medium">Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <Card padding="p-12" className="text-center space-y-4 bg-white/80 border-dashed border-surface-300">
              <div className="w-14 h-14 bg-brand-50 border border-brand-200/60 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-soft-xs">
                📄
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold font-display text-surface-900">
                  No resumes created yet
                </h4>
                <p className="text-xs text-surface-500 max-w-sm mx-auto">
                  Create a new ATS resume or import an existing PDF/DOCX file.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowImportModal(true)}
                  leftIcon={<Upload className="w-4 h-4" />}
                >
                  Import Resume
                </Button>
                <Button variant="primary" size="md" onClick={() => setShowModal(true)} leftIcon={<span>+</span>}>
                  New Resume
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* + Create New Resume Card Tile */}
              <div
                onClick={() => setShowModal(true)}
                className="rounded-2xl border-2 border-dashed border-brand-200 hover:border-brand-400 bg-brand-50/30 hover:bg-brand-50/70 p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all duration-200 group min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-brand-200 flex items-center justify-center text-brand-600 shadow-soft-xs group-hover:scale-110 transition-transform">
                  <Plus className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold font-display text-brand-700">
                    Create New Resume
                  </h4>
                  <p className="text-[11px] text-surface-500">
                    Start a fresh document with ATS layout
                  </p>
                </div>
              </div>

              {/* Import Resume Card Tile */}
              <div
                onClick={() => setShowImportModal(true)}
                className="rounded-2xl border-2 border-dashed border-surface-300 hover:border-brand-400 bg-surface-50/50 hover:bg-brand-50/40 p-6 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all duration-200 group min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-white border border-surface-200 group-hover:border-brand-200 flex items-center justify-center text-surface-600 group-hover:text-brand-600 shadow-soft-xs group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold font-display text-surface-900 group-hover:text-brand-700">
                    Import Resume
                  </h4>
                  <p className="text-[11px] text-surface-500">
                    Upload PDF or DOCX file
                  </p>
                </div>
              </div>

              {/* Resume Cards */}
              {resumes.map((res) => (
                <Card
                  key={res.id}
                  hoverable
                  padding="p-6"
                  className="flex flex-col justify-between space-y-4"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Pill variant="primary" size="sm">
                        ID #{res.id}
                      </Pill>
                      <Badge variant="success" size="sm" dot>
                        Saved
                      </Badge>
                    </div>
                    <CardTitle className="pt-1 truncate">{res.title}</CardTitle>
                    <CardDescription>
                      Last updated {new Date(res.updated_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>

                  <CardFooter className="pt-2">
                    <span className="text-[11px] text-surface-400 font-medium">ATS Ready</span>
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
        <div className="fixed inset-0 bg-surface-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md">
            <Card padding="p-6" className="bg-white border-surface-200 shadow-soft-xl space-y-4">
              <div className="flex items-center justify-between border-b border-surface-100 pb-3">
                <h3 className="text-lg font-bold font-display text-surface-900">
                  Create New Resume
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  className="text-surface-400 hover:text-surface-600 text-sm"
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

      {/* Import Resume Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
    </div>
  );
}

