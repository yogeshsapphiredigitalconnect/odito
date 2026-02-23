import { useState, useEffect } from 'react';
import { getWebsiteOptimization } from '../services/aiVisibilityService';

export function useWebsiteOptimization(projectId) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    // Skip if projectId is not provided
    if (!projectId) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getWebsiteOptimization(projectId);
        setData(result);
      } catch (err) {
        const errorMessage = err.message || 'Failed to fetch website optimization data';
        setError(errorMessage);
        console.error('Website optimization fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  return {
    loading,
    error,
    data
  };
}
