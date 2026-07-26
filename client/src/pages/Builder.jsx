import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PersonalInfoForm from '../components/builder/PersonalInfoForm';
import EducationForm from '../components/builder/EducationForm';
import ExperienceForm from '../components/builder/ExperienceForm';
import ProjectsForm from '../components/builder/ProjectsForm';
import SkillsForm from '../components/builder/SkillsForm';
import ResumePreview from '../components/builder/ResumePreview';
import Button from '../components/ui/Button';
import Badge, { Pill } from '../components/ui/Badge';

const ACTIVE_SECTIONS = [
  { id: 'personal_info', label: 'Personal Info', icon: '👤', sortOrder: 1 },
  { id: 'education', label: 'Education', icon: '🎓', sortOrder: 2 },
  { id: 'experience', label: 'Experience', icon: '💼', sortOrder: 3 },
  { id: 'projects', label: 'Projects', icon: '🚀', sortOrder: 4 },
  { id: 'skills', label: 'Skills', icon: '⚡', sortOrder: 5 },
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
      <div className="min-h-screen bg-brand-canvas text-surface-900 flex items-center justify-center font-body">
        <div className="flex items-center space-x-3 bg-white p-6 rounded-2xl border border-surface-200 shadow-soft-md">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-surface-600 text-xs font-semibold">Loading resume builder...</span>
        </div>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-brand-canvas text-surface-900 flex flex-col items-center justify-center p-4 font-body">
        <div className="bg-white border border-surface-200 p-8 rounded-2xl max-w-md text-center space-y-4 shadow-soft-xl">
          <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl flex items-center justify-center mx-auto text-xl shadow-soft-xs">
            ⚠️
          </div>
          <h2 className="text-xl font-bold font-display text-surface-900">Error Loading Resume</h2>
          <p className="text-surface-500 text-xs">{error || 'Resume not found'}</p>
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
    <div className="min-h-screen bg-surface-50 text-surface-900 flex flex-col font-body selection:bg-brand-500/20 selection:text-brand-700">
      {/* Top Header */}
      <header className="h-16 bg-white/90 border-b border-surface-200/80 backdrop-blur px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-soft-xs">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" leftIcon={<span>←</span>}>
              Dashboard
            </Button>
          </Link>
          <div className="h-5 w-px bg-surface-200"></div>
          <h1 className="text-base md:text-lg font-bold font-display text-surface-900 tracking-tight truncate max-w-xs md:max-w-md">
            {resume.title}
          </h1>
        </div>

        {/* Styled Save Status Indicator Badge */}
        <div className="flex items-center space-x-4">
          {saveStatus === 'Saving...' && (
            <Badge variant="warning" size="md" dot>
              Saving...
            </Badge>
          )}
          {saveStatus === 'All changes saved' && (
            <Badge variant="success" size="md" dot>
              All changes saved
            </Badge>
          )}
          {saveStatus === 'Failed to save' && (
            <div className="flex items-center space-x-2">
              <Badge variant="danger" size="md" dot>
                Failed to save
              </Badge>
              <Button size="sm" variant="outline" onClick={handleRetrySave}>
                Retry
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* One-Time Imported Resume Notice Banner */}
      {showImportNotice && (
        <div className="bg-brand-50 border-b border-brand-200 px-6 py-3 flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-2 text-brand-900 text-xs font-semibold">
            <span>✨</span>
            <span>We've done our best to pull in your resume — please double check everything looks right.</span>
          </div>
          <button
            type="button"
            onClick={() => setShowImportNotice(false)}
            className="text-brand-700 hover:text-brand-900 text-xs font-bold px-2 py-1 rounded hover:bg-brand-100/60 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Two-Panel Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel: Section Navigation & Active Form */}
        <div className="w-full md:w-1/2 lg:w-5/12 border-r border-surface-200 flex flex-col bg-white">
          {/* Horizontal scrollable tabs */}
          <div className="p-3 bg-surface-50/80 border-b border-surface-200/80 overflow-x-auto scrollbar-none">
            <div className="flex space-x-2">
              {ACTIVE_SECTIONS.map((sec) => {
                const isActive = activeTab === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => setActiveTab(sec.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-brand text-white shadow-soft-sm'
                        : 'bg-white text-surface-600 hover:text-brand-600 hover:bg-brand-50/60 border border-surface-200/60'
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
            <div className="w-full md:w-48 bg-surface-50/50 border-b md:border-b-0 md:border-r border-surface-200/80 p-3 space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-surface-400 uppercase tracking-wider">
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
                        ? 'bg-brand-50 text-brand-700 border border-brand-200/80 shadow-soft-xs'
                        : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100/70'
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
                <div className="px-2 py-1 text-[10px] font-bold text-surface-400 uppercase tracking-wider">
                  More Sections
                </div>
                {COMING_SOON_SECTIONS.map((sec) => (
                  <div
                    key={sec.id}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-surface-400 opacity-60 flex items-center justify-between cursor-not-allowed"
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
            <div className="flex-1 p-6 overflow-y-auto bg-surface-50/30 min-h-[400px]">
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
            </div>
          </div>
        </div>

        {/* Right Panel: Real-time Live Resume Preview */}
        <div className="w-full md:w-1/2 lg:w-7/12 bg-surface-900/95 p-4 md:p-8 flex items-start justify-center min-h-[450px] overflow-y-auto shadow-inner">
          <ResumePreview sections={sectionsData} />
        </div>
      </div>
    </div>
  );
}
