import { useMemo } from 'react';

export function useKeywordFilter({ keywords, filter, search, sort }) {
  return useMemo(() => {
    // Ensure keywords is an array
    const keywordsArray = Array.isArray(keywords) ? keywords : [];
    let filtered = keywordsArray;

    // Apply intent filter
    if (filter !== 'all') {
      filtered = filtered.filter(k => k.intent === filter);
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter(k => 
        k.keyword?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const direction = sort.dir === 'desc' ? -1 : 1;
      
      const getSortValue = (keyword) => {
        switch (sort.col) {
          case 'vol':
            return keyword.vol || 0;
          case 'kd':
            return keyword.kd || 0;
          case 'cpc':
            return keyword.cpc || 0;
          case 'trend':
            return keyword.trend?.monthly || 0;
          default:
            return keyword.vol || 0;
        }
      };

      return direction * (getSortValue(a) - getSortValue(b));
    });

    return sorted;
  }, [keywords, filter, search, sort]);
}
