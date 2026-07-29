import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, FileText, ArrowLeft, ArrowRight, Upload, Sparkles } from 'lucide-react';
import Button from '../components/ui/Button';
import Badge, { Pill } from '../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import AtsParseView from '../components/ats/AtsParseView';
import AtsAnalysisResults from '../components/ats/AtsAnalysisResults';
import AppHeader from '../components/ui/AppHeader';

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
  const rawText = stateData.rawText || (resume && resume.raw_extracted_text) || '';
  const resumeTitle = (resume && resume.title) || stateData.resumeTitle || 'Imported Resume';

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

  const [mappingForBuilder, setMappingForBuilder] = useState(false);

  const handleOpenInBuilder = async () => {
    if (!resumeId) return;
    setMappingForBuilder(true);
    setError('');

    try {
      const response = await fetch(`/api/resumes/${resumeId}/parse-to-builder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to map resume content for builder');
      }

      navigate(`/builder/${resumeId}`, {
        state: { importedNotice: data.mapped },
      });
    } catch (err) {
      console.error('Error setting up builder sections:', err);
      setError(err.message || 'Failed to setup resume in builder');
    } finally {
      setMappingForBuilder(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-body selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* Top Navbar Header */}
      <AppHeader
        rightSlot={
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Dashboard
          </Button>
        }
      />

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
          <div className="p-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
            <Card padding="p-8" className="bg-white border-slate-200 dark:border-slate-700 shadow-soft-lg space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-soft-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="inline-flex items-center gap-2">
                    <Pill variant="success" size="sm">
                      Text Extraction Complete
                    </Pill>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">ID #{resumeId}</span>
                  </div>
                  <h2 className="text-2xl font-extrabold font-display text-slate-900 dark:text-slate-100 tracking-tight">
                    Resume Uploaded & Processed!
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Text extracted successfully from your uploaded resume.
                  </p>
                </div>
              </div>

              {/* Upload Details Box */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/70 p-6 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 font-display">
                  File Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-soft-xs">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="truncate">
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">Filename</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{filename}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 shadow-soft-xs">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400">File Size</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{formatFileSize(size)}</p>
                    </div>
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
                  onClick={handleOpenInBuilder}
                  isLoading={mappingForBuilder}
                  rightIcon={!mappingForBuilder && <ArrowRight className="w-4 h-4" />}
                  className="w-full sm:w-auto shadow-soft-md"
                >
                  {mappingForBuilder ? 'Setting up your resume for editing...' : 'Open in Builder'}
                </Button>
              </div>
            </Card>

            {/* ATS Analysis Audit Report Component */}
            <AtsAnalysisResults
              resumeId={resumeId}
              initialAnalysis={resume?.ats_analysis || null}
              onAnalysisComplete={(updatedAnalysis) => {
                setResume((prev) => (prev ? { ...prev, ats_analysis: updatedAnalysis } : prev));
              }}
            />

            {/* ATS Parse-Test Transparency View Component */}
            <AtsParseView
              rawText={rawText}
              resumeTitle={resumeTitle}
              sections={resume?.sections || []}
            />
          </div>
        )}
      </main>
    </div>
  );
}
