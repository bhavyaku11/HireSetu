import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import JdMatchDiffView from '../components/ats/JdMatchDiffView';
import JobDescriptionManager from '../components/builder/JobDescriptionManager';
import Button from '../components/ui/Button';
import UserDropdown from '../components/ui/UserDropdown';
import { usePdfExport } from '../hooks/usePdfExport';

export default function JdMatch() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { exportPdf, isExporting, exportError, clearExportError } = usePdfExport();
  const [tailorLoading, setTailorLoading] = useState(false);
  const [tailorSuccess, setTailorSuccess] = useState('');

  const [resume, setResume] = useState(null);
  const [savedJds, setSavedJds] = useState([]);
  const [currentJd, setCurrentJd] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Load Resume & Saved JDs on mount
  useEffect(() => {
    const loadInitialData = async () => {
      if (!resumeId || !token) return;
      setLoading(true);
      setError('');

      try {
        // Fetch Resume meta
        const resResume = await fetch(`/api/resumes/${resumeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataResume = await resResume.json();
        if (resResume.ok) {
          setResume(dataResume.resume);
        } else {
          setError(dataResume.message || 'Failed to load resume');
          setLoading(false);
          return;
        }

        // Fetch saved JDs
        const resJds = await fetch(`/api/resumes/${resumeId}/job-descriptions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const dataJds = await resJds.json();
        if (resJds.ok) {
          const list = dataJds.job_descriptions || dataJds.jobDescriptions || [];
          setSavedJds(list);
          if (list.length > 0) {
            setCurrentJd(list[0]);
            runMatchEngine(list[0].id);
          }
        }
      } catch (err) {
        console.error('Error loading initial match data:', err);
        setError('Network error loading data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [resumeId, token]);

  const runMatchEngine = async (jdId) => {
    if (!resumeId || !token || !jdId) return;
    setMatchLoading(true);

    try {
      const res = await fetch(`/api/resumes/${resumeId}/job-descriptions/${jdId}/match`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        setMatchData(data);
      } else {
        console.error('Failed to run match calculation:', data.message);
      }
    } catch (err) {
      console.error('Error calculating match score:', err);
    } finally {
      setMatchLoading(false);
    }
  };

  const handleSelectJd = (jd) => {
    setCurrentJd(jd);
    runMatchEngine(jd.id);
  };

  const handleRefreshJds = async () => {
    try {
      const resJds = await fetch(`/api/resumes/${resumeId}/job-descriptions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const dataJds = await resJds.json();
      if (resJds.ok) {
        const list = dataJds.job_descriptions || dataJds.jobDescriptions || [];
        setSavedJds(list);
        if (list.length > 0) {
          setCurrentJd(list[0]);
          runMatchEngine(list[0].id);
        }
      }
    } catch (err) {
      console.error('Error refreshing JDs:', err);
    }
  };

  const handleSaveTailoredVersion = async (targetJd) => {
    if (!resumeId || !token) return;
    setTailorLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/resumes/${resumeId}/tailor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jdId: targetJd?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.resumeId) {
        setTailorSuccess(`Tailored version created! Opening builder...`);
        setTimeout(() => navigate(`/builder/${data.resumeId}`), 1200);
      } else {
        setError(data.message || 'Failed to create tailored resume version');
      }
    } catch (err) {
      console.error('Error saving tailored resume:', err);
      setError('Network error saving tailored version');
    } finally {
      setTailorLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-canvas text-surface-900 flex items-center justify-center font-body">
        <div className="flex items-center space-x-3 bg-white p-6 rounded-2xl border border-surface-200 shadow-soft-md">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-surface-600">Loading Job Match Analysis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 text-surface-900 flex flex-col font-body selection:bg-brand-500/20 selection:text-brand-700">
      {/* Page Header */}
      <header className="h-16 bg-white/90 border-b border-surface-200/80 backdrop-blur px-3 md:px-8 flex items-center justify-between sticky top-0 z-30 shadow-soft-xs gap-2">
        <div className="flex items-center space-x-2 md:space-x-4 min-w-0">
          <Link to={`/builder/${resumeId}`}>
            <Button variant="ghost" size="sm" leftIcon={<span>←</span>}>
              <span className="hidden sm:inline">Resume Builder</span>
            </Button>
          </Link>
          <div className="h-5 w-px bg-surface-200 hidden sm:block"></div>
          <h1 className="text-sm md:text-base font-bold font-display text-surface-900 tracking-tight truncate">
            <span className="hidden sm:inline">{resume?.title || 'Resume'} — </span>Job Match
          </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => exportPdf(resumeId)}
            disabled={isExporting}
            leftIcon={isExporting ? <span className="animate-spin inline-block">⏳</span> : <span>📄</span>}
          >
            <span className="hidden sm:inline">{isExporting ? 'Generating...' : 'Download PDF'}</span>
            <span className="sm:hidden">{isExporting ? '⏳' : '📄'}</span>
          </Button>
          <Link to="/dashboard" className="hidden sm:block">
            <Button variant="outline" size="sm">
              Dashboard
            </Button>
          </Link>
          <UserDropdown />
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 md:p-8 space-y-4 md:space-y-6">
        {(error || exportError) && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 font-medium flex items-center justify-between gap-3">
            <span>⚠️ {error || exportError}</span>
            <button
              onClick={() => { setError(''); clearExportError(); }}
              className="shrink-0 text-rose-400 hover:text-rose-700 font-bold text-lg leading-none"
            >×</button>
          </div>
        )}

        {tailorSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-700 font-semibold flex items-center gap-2">
            ✅ {tailorSuccess}
          </div>
        )}

        <JdMatchDiffView
          savedJds={savedJds}
          currentJd={currentJd}
          onSelectJd={handleSelectJd}
          onAddJdClick={() => setShowAddModal(true)}
          onSaveTailoredVersion={handleSaveTailoredVersion}
          matchData={matchData}
          loading={matchLoading}
          tailorLoading={tailorLoading}
        />
      </main>

      {/* Modal for Adding / Pasting a New Job Description */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
          <div className="bg-white rounded-3xl border border-surface-200 p-6 md:p-8 max-w-2xl w-full shadow-soft-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-surface-100 pb-4">
              <h3 className="text-base font-bold font-display text-surface-900 flex items-center space-x-2">
                <span>🎯 Save New Job Description</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-surface-400 hover:text-surface-900 text-lg font-bold w-8 h-8 rounded-full hover:bg-surface-100 flex items-center justify-center transition-colors"
              >
                ×
              </button>
            </div>

            <JobDescriptionManager
              resumeId={resumeId}
              token={token}
              onSelectJd={(newJd) => {
                setShowAddModal(false);
                handleRefreshJds();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
