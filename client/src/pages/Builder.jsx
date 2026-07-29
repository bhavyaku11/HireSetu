import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PersonalInfoForm from '../components/builder/PersonalInfoForm';
import EducationForm from '../components/builder/EducationForm';
import ExperienceForm from '../components/builder/ExperienceForm';
import ProjectsForm from '../components/builder/ProjectsForm';
import SkillsForm from '../components/builder/SkillsForm';
import ResumePreview from '../components/builder/ResumePreview';
import JobDescriptionManager from '../components/builder/JobDescriptionManager';
import Button from '../components/ui/Button';
import Badge, { Pill } from '../components/ui/Badge';
import AppHeader from '../components/ui/AppHeader';
import { usePdfExport } from '../hooks/usePdfExport';

const ACTIVE_SECTIONS = [
  { id: 'personal_info', label: 'Personal Info', icon: '👤', sortOrder: 1 },
  { id: 'education', label: 'Education', icon: '🎓', sortOrder: 2 },
  { id: 'experience', label: 'Experience', icon: '💼', sortOrder: 3 },
  { id: 'projects', label: 'Projects', icon: '🚀', sortOrder: 4 },
  { id: 'skills', label: 'Skills', icon: '⚡', sortOrder: 5 },
  { id: 'job_description', label: 'Match to Job', icon: '🎯', sortOrder: 6 },
];

const COMING_SOON_SECTIONS = [
  { id: 'certifications', label: 'Certifications', icon: '📜' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'positions_of_responsibility', label: 'Responsibility', icon: '🛡️' },
  { id: 'languages', label: 'Languages', icon: '🌐' },
  { id: 'interests', label: 'Interests', icon: '🎯' },
];

export default function Builder() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { exportPdf, isExporting, exportError, clearExportError } = usePdfExport();

  const [showImportNotice, setShowImportNotice] = useState(!!location.state?.importedNotice);
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal_info');
  const [saveStatus, setSaveStatus] = useState('All changes saved');

  // Sections content dictionary
  const [sectionsData, setSectionsData] = useState({
    personal_info: {},
    education: { items: [] },
    experience: { items: [] },
    projects: { items: [] },
    skills: { categories: [] },
  });

  const saveTimerRef = useRef({});

  // Fetch Resume and Existing Sections
  useEffect(() => {
    const fetchResume = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/resumes/${resumeId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || 'Failed to load resume');
        } else {
          setResume(data.resume);

          // Populate sectionsData from API response
          const initialSections = {
            personal_info: {},
            education: { items: [] },
            experience: { items: [] },
            projects: { items: [] },
            skills: { categories: [] },
          };

          if (Array.isArray(data.resume.sections)) {
            data.resume.sections.forEach((sec) => {
              initialSections[sec.section_type] = sec.content;
            });
          }

          setSectionsData(initialSections);
        }
      } catch (err) {
        console.error('Error fetching resume:', err);
        setError('Network error loading resume');
      } finally {
        setLoading(false);
      }
    };

    if (resumeId && token) {
      fetchResume();
    }
  }, [resumeId, token]);

  // Save section content to API
  const saveSectionToApi = useCallback(
    async (sectionType, content) => {
      setSaveStatus('Saving...');
      try {
        const secMeta = ACTIVE_SECTIONS.find((s) => s.id === sectionType);
        const sortOrder = secMeta ? secMeta.sortOrder : 1;

        const response = await fetch(`/api/resumes/${resumeId}/sections/${sectionType}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            sort_order: sortOrder,
          }),
        });

        if (response.ok) {
          setSaveStatus('All changes saved');
        } else {
          setSaveStatus('Failed to save');
        }
      } catch (err) {
        console.error('Failed to auto-save section:', err);
        setSaveStatus('Failed to save');
      }
    },
    [resumeId, token]
  );

  // Handle local state change and trigger 1-second debounced auto-save
  const handleSectionChange = (sectionType, newContent) => {
    setSectionsData((prev) => ({
      ...prev,
      [sectionType]: newContent,
    }));

    setSaveStatus('Saving...');

    if (saveTimerRef.current[sectionType]) {
      clearTimeout(saveTimerRef.current[sectionType]);
    }

    saveTimerRef.current[sectionType] = setTimeout(() => {
      saveSectionToApi(sectionType, newContent);
    }, 1000);
  };

  const handleRetrySave = () => {
    if (sectionsData[activeTab]) {
      saveSectionToApi(activeTab, sectionsData[activeTab]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center font-body">
        <div className="flex items-center space-x-3 bg-white p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-soft-md">
          <div className="w-6 h-6 border-2 border-indigo-500 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 dark:text-slate-400 text-xs font-semibold">Loading resume builder...</span>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 font-body">
        <div className="bg-white border border-slate-200 dark:border-slate-700 p-8 rounded-2xl max-w-md text-center space-y-4 shadow-soft-xl">
          <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-xl shadow-soft-xs">
            ⚠️
          </div>
          <h2 className="text-xl font-bold font-display text-slate-900 dark:text-slate-100">Error Loading Resume</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs">{error || 'Resume not found'}</p>
          <Link to="/dashboard">
            <Button variant="primary" size="sm">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-body selection:bg-indigo-500/20 selection:text-indigo-400">
      {/* Top Header */}
      <AppHeader
        leftSlot={
          <h1 className="text-sm md:text-base font-bold font-display text-slate-900 dark:text-slate-100 dark:text-[#F5F6FA] tracking-tight truncate max-w-[160px] md:max-w-sm">
            {resume.title}
          </h1>
        }
        rightSlot={
          <div className="flex items-center gap-2">
            {saveStatus === 'Saving...' && (
              <Badge variant="warning" size="md" dot>
                <span className="hidden sm:inline">Saving...</span>
              </Badge>
            )}
            {saveStatus === 'All changes saved' && (
              <Badge variant="success" size="md" dot>
                <span className="hidden sm:inline">Saved</span>
              </Badge>
            )}
            {saveStatus === 'Failed to save' && (
              <div className="flex items-center gap-2">
                <Badge variant="danger" size="md" dot>
                  <span className="hidden sm:inline">Failed</span>
                </Badge>
                <Button size="sm" variant="outline" onClick={handleRetrySave}>Retry</Button>
              </div>
            )}
            <Button
              variant="primary" size="sm"
              onClick={() => exportPdf(resumeId)}
              disabled={isExporting}
              leftIcon={isExporting ? <span className="animate-spin inline-block">⏳</span> : <span>📄</span>}
            >
              <span className="hidden sm:inline">{isExporting ? 'Generating...' : 'Download PDF'}</span>
              <span className="sm:hidden">{isExporting ? '⏳' : '📄'}</span>
            </Button>
            <Link to={`/builder/${resumeId}/match`} className="hidden sm:block">
              <Button variant="outline" size="sm" leftIcon={<span>🎯</span>}>Match to Job</Button>
            </Link>
          </div>
        }
      />

      {/* PDF Export Error Banner */}
      {exportError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          <span className="text-rose-700 text-xs font-semibold">⚠️ {exportError}</span>
          <button onClick={clearExportError} className="text-rose-400 hover:text-rose-700 font-bold text-lg leading-none">×</button>
        </div>
      )}

      {/* One-Time Imported Resume Notice Banner */}
      {showImportNotice && (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-200 dark:border-indigo-700/40 px-6 py-3 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-400 text-xs font-semibold">
            <span>✨</span>
            <span>We've done our best to pull in your resume — please double check everything looks right.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowImportNotice(false)}
            className="text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded hover:bg-indigo-100/60 dark:bg-indigo-800/30/60 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Panel Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Section Navigation & Active Form */}
        <div className="w-full md:w-1/2 lg:w-5/12 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900">
          {/* Horizontal scrollable tabs */}
          <div className="p-3 bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
            <div className="flex space-x-2">
              {ACTIVE_SECTIONS.map((sec) => {
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 text-white shadow-soft-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-500/10 border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <span>{sec.icon}</span>
                    <span>{sec.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row overflow-y-auto">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-48 bg-slate-50/50 dark:bg-slate-900/50 border-b md:border-b-0 md:border-r border-slate-200/80 dark:border-slate-700/80 p-3 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                Active Sections
              </div>
              {ACTIVE_SECTIONS.map((sec) => {
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-700/40/80 shadow-soft-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-slate-100 hover:bg-slate-100/70 dark:bg-slate-800/70'
                    }`}
                  >
                    <span className="flex items-center space-x-2">
                      <span>{sec.icon}</span>
                      <span>{sec.label}</span>
                    </span>
                  </button>
                );
              })}

              <div className="pt-3">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                  More Sections
                </div>
                {COMING_SOON_SECTIONS.map((sec) => (
                  <div
                    key={sec.id}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-400 dark:text-slate-400 opacity-60 flex items-center justify-between cursor-not-allowed"
                  >
                    <span className="flex items-center space-x-2">
                      <span>{sec.icon}</span>
                      <span>{sec.label}</span>
                    </span>
                    <Pill variant="neutral" size="sm">
                      Soon
                    </Pill>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Form Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/30 min-h-[400px]">
              {activeTab === 'personal_info' && (
                <PersonalInfoForm
                  data={sectionsData.personal_info || {}}
                  onChange={(newVal) => handleSectionChange('personal_info', newVal)}
                />
              )}

              {activeTab === 'education' && (
                <EducationForm
                  data={sectionsData.education || { items: [] }}
                  onChange={(newVal) => handleSectionChange('education', newVal)}
                />
              )}

              {activeTab === 'experience' && (
                <ExperienceForm
                  data={sectionsData.experience || { items: [] }}
                  onChange={(newVal) => handleSectionChange('experience', newVal)}
                />
              )}

              {activeTab === 'projects' && (
                <ProjectsForm
                  data={sectionsData.projects || { items: [] }}
                  onChange={(newVal) => handleSectionChange('projects', newVal)}
                />
              )}

              {activeTab === 'skills' && (
                <SkillsForm
                  data={sectionsData.skills || { categories: [] }}
                  onChange={(newVal) => handleSectionChange('skills', newVal)}
                />
              )}

              {activeTab === 'job_description' && (
                <JobDescriptionManager
                  resumeId={resumeId}
                  token={token}
                  onSelectJd={(selectedJd) => {
                    console.log('Selected Job Description:', selectedJd);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: Real-time Live Resume Preview */}
        <div className="w-full md:w-1/2 lg:w-7/12 bg-slate-900/95 dark:bg-slate-100/95 p-4 md:p-8 flex items-start justify-center min-h-[450px] overflow-y-auto shadow-inner">
          <ResumePreview sections={sectionsData} />
        </div>
      </div>
    </div>
  );
}
