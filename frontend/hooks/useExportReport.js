import { useState, useCallback, useRef } from 'react';
import API_BASE_URL from "@/lib/apiConfig";

/**
 * Reusable hook for exporting PDF reports
 * @param {string} projectId - The project ID
 * @param {string} reportType - "seo" or "ai"
 * @returns {object} - { exportReport, loading, error }
 */
export function useExportReport() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const isExportingRef = useRef(false);

  const exportReport = useCallback(async (projectId, type) => {
    // Prevent concurrent exports
    if (isExportingRef.current) {
      console.warn('[EXPORT] Export already in progress, ignoring duplicate request');
      return;
    }

    // Validate inputs
    if (!projectId || projectId === 'undefined' || projectId === 'all') {
      const err = new Error('Invalid project ID');
      setError(err.message);
      throw err;
    }

    if (!['seo', 'ai'].includes(type)) {
      const err = new Error('Invalid report type. Must be "seo" or "ai"');
      setError(err.message);
      throw err;
    }

    // Set loading state
    isExportingRef.current = true;
    setLoading(true);
    setError(null);
    abortControllerRef.current = new AbortController();

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const endpoint = type === 'seo' 
        ? `${API_BASE_URL}/export/projects/${projectId}/export/seo`
        : `${API_BASE_URL}/export/projects/${projectId}/export/ai`;

      console.log(`[EXPORT] Starting ${type.toUpperCase()} export for project: ${projectId}`);

      // Create a combined signal: user abort OR 120s timeout
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, 120_000);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        },
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeoutId);

      // Handle non-OK responses
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || errorData.error || `Export failed with status: ${response.status}`);
        } else {
          throw new Error(`Export failed with status: ${response.status}. Server may be unreachable.`);
        }
      }

      // Get the PDF blob
      const blob = await response.blob();

      // Validate we actually got a PDF (or at least a non-empty response)
      if (blob.size === 0) {
        throw new Error('Server returned an empty response. PDF generation may have failed.');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = type === 'seo'
        ? `seo-report-${projectId}-${timestamp}.pdf`
        : `ai-report-${projectId}-${timestamp}.pdf`;

      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      console.log(`[EXPORT] ${type.toUpperCase()} export completed successfully`);

      return {
        success: true,
        filename,
        size: blob.size
      };

    } catch (err) {
      // Handle abort gracefully
      if (err.name === 'AbortError') {
        console.log('[EXPORT] Export cancelled');
        return { success: false, cancelled: true };
      }

      console.error(`[EXPORT] ${type.toUpperCase()} export failed:`, err.message);
      setError(err.message);
      throw err;

    } finally {
      setLoading(false);
      isExportingRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
    }
  }, []);

  const cancelExport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isExportingRef.current = false;
    setLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    exportReport,
    cancelExport,
    clearError,
    loading,
    error
  };
}

export default useExportReport;
