import { useState, useEffect, useCallback } from 'react';
import apiService from '@/lib/apiService';
import { useProject } from '@/contexts/ProjectContext';

export function useKeywordData() {
  const { activeProjectId } = useProject();
  const [intelligence, setIntelligence] = useState(null);
  const [keywords, setKeywords] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState({
    intelligence: false,
    keywords: false,
    detail: false
  });
  const [error, setError] = useState(null);

  // Fetch keyword intelligence (summary stats)
  const fetchIntelligence = useCallback(async () => {
    if (!activeProjectId) return;
    
    setLoading(prev => ({ ...prev, intelligence: true }));
    setError(null);
    
    try {
      const response = await apiService.getKeywordIntelligence(activeProjectId);
      setIntelligence(response.data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch keyword intelligence:', err);
    } finally {
      setLoading(prev => ({ ...prev, intelligence: false }));
    }
  }, [activeProjectId]);

  // Fetch keywords list
  const fetchKeywords = useCallback(async (options = {}) => {
    if (!activeProjectId) return;
    
    setLoading(prev => ({ ...prev, keywords: true }));
    setError(null);
    
    try {
      const response = await apiService.getKeywords(activeProjectId, options);
      setKeywords(response.data?.keywords || []);
      setPagination(response.data?.pagination || null);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch keywords:', err);
      setKeywords([]);
    } finally {
      setLoading(prev => ({ ...prev, keywords: false }));
    }
  }, [activeProjectId]);

  // Fetch keyword detail
  const fetchKeywordDetail = useCallback(async (keyword) => {
    if (!activeProjectId || !keyword) return null;
    
    setLoading(prev => ({ ...prev, detail: true }));
    setError(null);
    
    try {
      const response = await apiService.getKeywordDetail(activeProjectId, keyword);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch keyword detail:', err);
      return null;
    } finally {
      setLoading(prev => ({ ...prev, detail: false }));
    }
  }, [activeProjectId]);

  // Start keyword research
  const startResearch = useCallback(async (keyword, depth = 2) => {
    if (!activeProjectId) return;
    
    try {
      const response = await apiService.startKeywordResearch(activeProjectId, keyword, depth);
      return response.data;
    } catch (err) {
      setError(err.message);
      console.error('Failed to start keyword research:', err);
      throw err;
    }
  }, [activeProjectId]);

  // Auto-fetch intelligence when project changes
  useEffect(() => {
    if (activeProjectId) {
      fetchIntelligence();
    }
  }, [activeProjectId, fetchIntelligence]);

  // Initial keywords fetch
  useEffect(() => {
    if (activeProjectId) {
      fetchKeywords();
    }
  }, [activeProjectId, fetchKeywords]);

  return {
    intelligence,
    keywords,
    pagination,
    loading,
    error,
    fetchIntelligence,
    fetchKeywords,
    fetchKeywordDetail,
    startResearch
  };
}
