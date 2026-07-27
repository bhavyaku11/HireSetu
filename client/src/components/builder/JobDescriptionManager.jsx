import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input, { TextArea } from '../ui/Input';
import Badge from '../ui/Badge';

export default function JobDescriptionManager({ resumeId, token, onSelectJd }) {
  const [title, setTitle] = useState('');
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSaved, setFetchingSaved] = useState(true);
  const [savedJds, setSavedJds] = useState([]);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [expandedJdId, setExpandedJdId] = useState(null);
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'upload'

  // Fetch saved job descriptions on mount
  useEffect(() => {
    fetchSavedJobDescriptions();
  }, [resumeId, token]);

  const fetchSavedJobDescriptions = async () => {
    if (!resumeId || !token) return;
    setFetchingSaved(true);
    try {
      const res = await fetch(`/api/resumes/${resumeId}/job-descriptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setSavedJds(data.job_descriptions || data.jobDescriptions || []);
      }
    } catch (err) {
      console.error('Error fetching saved job descriptions:', err);
    } finally {
      setFetchingSaved(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['txt', 'pdf', 'docx'].includes(ext)) {
        setError('Invalid file format. Please upload a .txt, .pdf, or .docx file.');
        setSelectedFile(null);
        return;
      }
      setError('');
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (activeTab === 'paste') {
      if (!rawText || rawText.trim().length < 50) {
        setError('Job description text must be at least 50 characters long.');
        return;
      }
    } else {
      if (!selectedFile) {
        setError('Please select a .txt, .pdf, or .docx file to upload.');
        return;
      }
    }

    setLoading(true);

    try {
      let response;
      if (selectedFile && activeTab === 'upload') {
        const formData = new FormData();
        formData.append('file', selectedFile);
        if (title.trim()) {
          formData.append('title', title.trim());
        }

        response = await fetch(`/api/resumes/${resumeId}/job-descriptions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        response = await fetch(`/api/resumes/${resumeId}/job-descriptions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            raw_text: rawText.trim(),
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Failed to save job description');
      } else {
        setSuccessMsg('Job description saved successfully!');
        setTitle('');
        setRawText('');
        setSelectedFile(null);
        fetchSavedJobDescriptions();
        if (onSelectJd && data.job_description) {
          onSelectJd(data.job_description);
        }
      }
    } catch (err) {
      console.error('Error saving job description:', err);
      setError('Network error saving job description');
    } finally {
      setLoading(false);
    }
  };

  const textLength = rawText.trim().length;
  const isTextTooShort = activeTab === 'paste' && textLength > 0 && textLength < 50;

  return (
    <div className="space-y-6 font-body">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-950 p-6 rounded-2xl text-white shadow-soft-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl backdrop-blur">
            🎯
          </div>
          <div>
            <h2 className="text-lg font-bold font-display">Target Job Description</h2>
            <p className="text-xs text-brand-100/80">
              Save job descriptions to tailor your resume for specific positions.
            </p>
          </div>
        </div>
      </div>

      {/* Main Input Form Card */}
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-soft-sm space-y-5">
        <div className="flex items-center justify-between border-b border-surface-100 pb-4">
          <h3 className="text-sm font-bold text-surface-900 font-display">Save New Job Description</h3>
          {/* Tab Switcher */}
          <div className="flex p-1 bg-surface-100 rounded-xl space-x-1">
            <button
              type="button"
              onClick={() => { setActiveTab('paste'); setError(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'paste'
                  ? 'bg-white text-surface-900 shadow-soft-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              📝 Paste Text
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('upload'); setError(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-white text-surface-900 shadow-soft-xs'
                  : 'text-surface-600 hover:text-surface-900'
              }`}
            >
              📁 Upload File
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Optional Title Input */}
          <Input
            label="Job Title / Role (Optional)"
            placeholder="e.g. Senior Frontend Engineer @ TechCorp"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Paste Tab */}
          {activeTab === 'paste' && (
            <div className="space-y-1.5">
              <TextArea
                label="Job Description Raw Text"
                isRequired
                rows={7}
                placeholder="Paste the full job description text here (minimum 50 characters)..."
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  if (error) setError('');
                }}
                error={isTextTooShort ? `Job description text must be at least 50 characters (currently ${textLength})` : ''}
              />
              <div className="flex justify-between items-center text-[11px] text-surface-500 px-1">
                <span>Must be at least 50 characters</span>
                <span className={textLength >= 50 ? 'text-emerald-600 font-semibold' : 'text-surface-400'}>
                  {textLength} chars
                </span>
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-surface-700">
                Upload JD Document <span className="text-brand-500 font-bold">*</span>
              </label>
              <div className="border-2 border-dashed border-surface-200 rounded-2xl p-6 text-center hover:border-brand-400 transition-colors bg-surface-50/50">
                <input
                  type="file"
                  id="jd-file-input"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="jd-file-input" className="cursor-pointer block space-y-2">
                  <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto text-xl">
                    📄
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-brand-600 hover:underline">
                      Click to upload
                    </span>{' '}
                    <span className="text-xs text-surface-500">or drag and drop</span>
                  </div>
                  <p className="text-[11px] text-surface-400">Supports .TXT, .PDF, or .DOCX (Max 5MB)</p>
                </label>
                {selectedFile && (
                  <div className="mt-3 inline-flex items-center space-x-2 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-xl text-xs text-brand-800 font-medium">
                    <span>📎 {selectedFile.name}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="text-brand-600 hover:text-brand-900 font-bold ml-1"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center space-x-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-center space-x-2">
              <span>✅</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              isDisabled={
                loading ||
                (activeTab === 'paste' && textLength < 50) ||
                (activeTab === 'upload' && !selectedFile)
              }
            >
              Save Job Description
            </Button>
          </div>
        </form>
      </div>

      {/* Previously Saved Job Descriptions */}
      <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-soft-sm space-y-4">
        <div className="flex items-center justify-between border-b border-surface-100 pb-3">
          <h3 className="text-sm font-bold text-surface-900 font-display flex items-center space-x-2">
            <span>📚 Saved Job Descriptions</span>
            <Badge variant="neutral" size="sm">
              {savedJds.length}
            </Badge>
          </h3>
        </div>

        {fetchingSaved ? (
          <div className="p-4 text-center text-xs text-surface-500 space-x-2 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading saved job descriptions...</span>
          </div>
        ) : savedJds.length === 0 ? (
          <div className="p-6 text-center text-xs text-surface-400 bg-surface-50 rounded-xl border border-dashed border-surface-200">
            No saved job descriptions yet. Paste or upload a job description above to get started!
          </div>
        ) : (
          <div className="space-y-3">
            {savedJds.map((jd) => {
              const isExpanded = expandedJdId === jd.id;
              const dateStr = new Date(jd.created_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={jd.id}
                  className="border border-surface-200 rounded-xl p-4 transition-all hover:border-brand-200 hover:shadow-soft-xs bg-white space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-surface-900 font-display">
                        {jd.title || 'Untitled Job Description'}
                      </h4>
                      <p className="text-[11px] text-surface-400">
                        Saved on {dateStr} • {jd.raw_text ? jd.raw_text.length : 0} characters
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setExpandedJdId(isExpanded ? null : jd.id)}
                        className="text-xs font-medium text-brand-600 hover:text-brand-800 px-2 py-1 rounded hover:bg-brand-50 transition-colors"
                      >
                        {isExpanded ? 'Hide Snippet' : 'View Snippet'}
                      </button>
                      {onSelectJd && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onSelectJd(jd)}
                        >
                          Select
                        </Button>
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-2 p-3 bg-surface-50 rounded-xl border border-surface-200 text-xs text-surface-700 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {jd.raw_text}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
