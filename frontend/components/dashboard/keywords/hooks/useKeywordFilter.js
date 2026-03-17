import { useMemo } from 'react';

export function useKeywordFilter({ keywords, filter, search, sort }) {
  return useMemo(() => {
    let filtered = keywords;

    // Apply intent filter
    if (filter !== 'all') {
      filtered = filtered.filter(k => k.intent === filter);
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter(k => 
        k.keyword.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const direction = sort.dir === 'desc' ? -1 : 1;
      
      const getSortValue = (keyword) => {
        switch (sort.col) {
          case 'vol':
            return keyword.vol;
          case 'kd':
            return keyword.kd;
          case 'cpc':
            return keyword.cpc;
          case 'trend':
            return keyword.trend.monthly;
          default:
            return keyword.vol;
        }
      };

      return direction * (getSortValue(a) - getSortValue(b));
    });

    return sorted;
  }, [keywords, filter, search, sort]);
}
