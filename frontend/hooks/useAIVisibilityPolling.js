import { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from "@/lib/apiConfig";

/**
 * Custom hook for polling AI Visibility analysis status
 * Handles polling logic with proper cleanup and memory leak prevention
 */
export const useAIVisibilityPolling = (analysisId, options = {}) => {
  const {
    interval = 3000, // 3 seconds
    onComplete,
    onError,
    enabled = true
  } = options;

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  // Function to fetch status
  const fetchStatus = useCallback(async () => {
    if (!analysisId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/ai-visibility/${analysisId}`, {
        headers: {
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('token') : ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setStatus(data);

      // Stop polling if completed or failed
      if (data.aiStatus === 'completed' || data.aiStatus === 'failed') {
        setIsPolling(false);
        
        if (data.aiStatus === 'completed' && onComplete) {
          onComplete(data);
        } else if (data.aiStatus === 'failed' && onError) {
          onError(data);
        }
      }

      return data;
    } catch (err) {
      setError(err.message);
      setIsPolling(false);
      
      if (onError) {
        onError({ error: err.message });
      }
    }
  }, [analysisId, onComplete, onError]);

  // Start polling
  const startPolling = useCallback(() => {
    if (!analysisId || !enabled) return;

    setIsPolling(true);
    setLoading(true);
    setError(null);

    // Initial fetch
    fetchStatus().finally(() => {
      setLoading(false);
    });
  }, [analysisId, enabled, fetchStatus]);

  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  // Set up polling interval
  useEffect(() => {
    if (!isPolling || !analysisId) return;

    const intervalId = setInterval(() => {
      fetchStatus();
    }, interval);

    // Cleanup on unmount or when polling stops
    return () => {
      clearInterval(intervalId);
    };
  }, [isPolling, analysisId, interval, fetchStatus]);

  return {
    status,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refetch: fetchStatus
  };
}
