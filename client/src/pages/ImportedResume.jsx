import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, FileText, ArrowLeft, ArrowRight, Upload, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge, { Pill } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import logoMark from '../assets/logo-mark.png';

export default function ImportedResume() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token, logout } = useAuth();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stateData = location.state || {};
  const filename = stateData.filename || 'Uploaded_Resume.pdf';
  const size = stateData.size || 0;

  useEffect(() => {
    const fetchResume = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/resumes/${resumeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setResume(data.resume);
        } else {
          setError(data.message || 'Failed to load imported resume details');
        }
      } catch (err) {
        console.error('Error fetching imported resume:', err);
        setError('Network error fetching resume details');
      } finally {
        setLoading(false);
      }
    };

    if (token && resumeId) {
      fetchResume();
    }
  }, [token, resumeId]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Navigation back button */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Dashboard
          </Button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-surface-500 space-y-3">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium">Loading uploaded resume details...</p>
          </div>
        ) : error ? (
          <Card padding="p-8" className="bg-rose-50/70 border-rose-200 text-center space-y-4">
            <div className="text-rose-600 text-3xl">⚠️</div>
            <h3 className="text-lg font-bold font-display text-rose-900">{error}</h3>
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Success Hero Card */}
            <Card padding="p-8" className="bg-white border-surface-200 shadow-soft-lg space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-soft-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-2">
                    <Pill variant="success" size="sm">
                      Upload Confirmed
                    </Pill>
                    <span className="text-xs font-semibold text-surface-400">ID #{resumeId}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold font-display text-surface-900 tracking-tight">
                    Resume Uploaded Successfully!
                  </h2>
                  <p className="text-sm text-surface-600">
                    Your file has been validated and uploaded to HireSetu.
                  </p>
                </div>
              </div>

              {/* Upload Details Box */}
              <div className="rounded-2xl border border-surface-200 bg-surface-50/70 p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-surface-500 font-display">
                  File Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-surface-200/80 shadow-soft-xs">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] font-semibold text-surface-400">Filename</p>
                      <p className="text-xs font-bold text-surface-900 truncate">{filename}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-white p-3.5 rounded-xl border border-surface-200/80 shadow-soft-xs">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-surface-400">File Size</p>
                      <p className="text-xs font-bold text-surface-900">{formatFileSize(size)}</p>
                    </div>
                  </div>
                </div>

                {/* Status Notice */}
                <div className="p-4 bg-brand-50/60 border border-brand-200/70 rounded-xl flex items-start gap-3">
                  <span className="text-brand-600 text-lg">💡</span>
                  <div className="text-xs text-brand-900 space-y-0.5">
                    <p className="font-bold font-display">Next Step: Text Extraction & Parsing</p>
                    <p className="text-brand-700">
                      File validation is complete. Automatic content parsing and field extraction will be integrated in the next phase.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => navigate('/dashboard')}
                  className="w-full sm:w-auto"
                >
                  Back to Dashboard
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => navigate(`/builder/${resumeId}`)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-soft-md"
                >
                  Open in Builder
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
