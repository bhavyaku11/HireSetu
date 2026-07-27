import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function usePdfExport() {
  const { token } = useAuth();
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  const exportPdf = async (resumeId) => {
    if (!token || !resumeId) return;

    setIsExporting(true);
    setExportError(null);
    try {
      const response = await fetch(`/api/resumes/${resumeId}/export`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let msg = 'Failed to generate PDF';
        try { const d = await response.json(); msg = d.message || msg; } catch (_) {}
        throw new Error(msg);
      }

      const blob = await response.blob();
      
      // Get filename from Content-Disposition header if available
      let filename = 'Resume.pdf';
      const disposition = response.headers.get('Content-Disposition');
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const matches = /filename="([^"]+)"/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      setExportError(error.message || 'Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return { exportPdf, isExporting, exportError, clearExportError: () => setExportError(null) };
}

