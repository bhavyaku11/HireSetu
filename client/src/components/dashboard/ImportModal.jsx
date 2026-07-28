import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { Card } from '../ui/Card';

export default function ImportModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const validateFile = (file) => {
    if (!file) return 'No file selected';

    const ext = file.name.split('.').pop().toLowerCase();
    const allowedExts = ['pdf', 'docx'];
    const isAllowedExt = allowedExts.includes(ext);

    if (!isAllowedExt) {
      return 'Invalid file type. Only PDF (.pdf) and DOCX (.docx) files are allowed.';
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'File size exceeds maximum limit of 5MB.';
    }

    return null;
  };

  const handleFileChange = (file) => {
    setError('');
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF or DOCX file to upload');
      return;
    }

    setUploading(true);
    setError('');

    try {
      // 1. Create a resume record
      const defaultTitle = selectedFile.name.replace(/\.[^/.]+$/, '') || 'Imported Resume';
      const createRes = await fetch('/api/resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: defaultTitle }),
      });

      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.message || 'Failed to create resume record');
      }

      const resumeId = createData.resumeId;

      // 2. Upload file to /api/resumes/:id/import
      const formData = new FormData();
      formData.append('file', selectedFile);

      const uploadRes = await fetch(`/api/resumes/${resumeId}/import`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadData.message || 'File upload failed');
      }

      // 3. Navigate to Imported Resume view page
      onClose();
      navigate(`/imported/${resumeId}`, {
        state: {
          filename: uploadData.filename || selectedFile.name,
          size: uploadData.size || selectedFile.size,
          rawText: uploadData.rawText || '',
          resumeTitle: defaultTitle,
        },
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/60 dark:bg-slate-50/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="w-full max-w-lg">
        <Card padding="p-6" className="bg-white border-slate-200 dark:border-slate-700 shadow-soft-xl space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <div className="space-y-0.5">
              <h3 className="text-lg font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Import Resume
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload your existing resume to import data into HireSetu
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={uploading}
              className="text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:text-slate-400 text-sm p-1 rounded-lg hover:bg-slate-100 dark:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all duration-200 ${
              isDragging
                ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-900/20/70 scale-[1.01]'
                : selectedFile
                ? 'border-indigo-300 dark:border-indigo-400 bg-indigo-50/30 dark:bg-indigo-900/20/30'
                : 'border-slate-300 dark:border-slate-400 hover:border-indigo-400 dark:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-indigo-50/20 dark:bg-indigo-900/20/20'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileChange(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            {selectedFile ? (
              <div className="space-y-2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-800/30 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shadow-soft-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 underline font-semibold pt-1">
                  Click or drag to change file
                </span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-soft-xs group-hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Drag and drop your resume here
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    or <span className="text-indigo-600 dark:text-indigo-400 underline font-semibold">browse files</span> from your computer
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 pt-1">
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                    PDF or DOCX
                  </span>
                  <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">
                    Max 5MB
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              isDisabled={uploading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              isLoading={uploading}
              isDisabled={!selectedFile}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              {uploading ? 'Uploading...' : 'Import Resume'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
