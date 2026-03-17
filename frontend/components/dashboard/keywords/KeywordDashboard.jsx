import React, { useState, useEffect } from 'react';
import { KEYWORDS } from './data/keywords';
import { useKeywordFilter } from './hooks/useKeywordFilter';
import StatsGrid from './components/StatsGrid';
import VolumeChart from './components/VolumeChart';
import FilterTabs from './components/FilterTabs';
import KeywordTable from './components/KeywordTable';
import DetailDrawer from './components/DetailDrawer';
import './styles/keywords.css';

export default function KeywordDashboard() {
  const [selected, setSelected] = useState(null);
  const [sort, setSort] = useState({ col: 'vol', dir: 'desc' });
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Calculate counts for filters
  const counts = {
    commercial: KEYWORDS.filter(k => k.intent === 'commercial').length,
    informational: KEYWORDS.filter(k => k.intent === 'informational').length,
    navigational: KEYWORDS.filter(k => k.intent === 'navigational').length
  };

  // Filter and sort keywords
  const rows = useKeywordFilter({ 
    keywords: KEYWORDS, 
    filter, 
    search, 
    sort 
  });

  const toggleSort = (col) => {
    setSort(s => 
      s.col === col 
        ? { col, dir: s.dir === 'desc' ? 'asc' : 'desc' }
        : { col, dir: 'desc' }
    );
  };

  const maxVol = Math.max(...KEYWORDS.map(k => k.vol));

  const drawerWidth = selected ? "min(360px, 100vw)" : "0px";

  return (
    <div className="keyword-dashboard" style={{ minHeight: '100vh', background: '#04070f', display: 'flex', flexDirection: 'column' }}>

      {/* TOP BAR */}
      <div style={{ 
        background: '#07101e', 
        borderBottom: '1px solid rgba(255,255,255,0.07)', 
        padding: '14px 20px', 
        flexShrink: 0 
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          gap: 12, 
          flexWrap: 'wrap' 
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 7, 
              marginBottom: 3 
            }}>
              <div style={{ 
                width: 7, 
                height: 7, 
                borderRadius: '50%', 
                background: '#10ffa0', 
                boxShadow: '0 0 8px #10ffa0', 
                flexShrink: 0 
              }} />
              <span style={{ 
                fontSize: 9, 
                fontWeight: 800, 
                color: '#10ffa0', 
                letterSpacing: '0.12em', 
                textTransform: 'uppercase' 
              }}>
                Live · DataForSEO · Google US
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: 8, 
              flexWrap: 'wrap' 
            }}>
              <h1 style={{ 
                fontFamily: "'Syne',sans-serif", 
                fontSize: 20, 
                fontWeight: 800, 
                color: '#f0f4ff', 
                lineHeight: 1.2 
              }}>
                Keyword Intelligence
              </h1>
              <span style={{ 
                fontSize: 11, 
                fontWeight: 500, 
                color: '#5a6a82', 
                fontFamily: "'DM Sans',sans-serif" 
              }}>
                Seed: "seo" · Depth 3 · {KEYWORDS.length} keywords
              </span>
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: 9, 
            alignItems: 'center', 
            flexWrap: 'wrap' 
          }}>
            <div style={{ position: 'relative' }}>
              <input 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                placeholder="Search keywords..."
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.09)', 
                  borderRadius: 9, 
                  padding: '8px 12px 8px 32px', 
                  fontSize: 12, 
                  color: '#f0f4ff', 
                  outline: 'none', 
                  width: 'min(200px, 100%)', 
                  fontFamily: "'DM Sans',sans-serif" 
                }} 
              />
              <span style={{ 
                position: 'absolute', 
                left: 10, 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#5a6a82', 
                fontSize: 13 
              }}>
                ⌕
              </span>
            </div>
            <button style={{ 
              background: 'linear-gradient(135deg,#7c3aed,#00e5ff)', 
              border: 'none', 
              borderRadius: 9, 
              padding: '8px 16px', 
              color: '#fff', 
              fontSize: 12, 
              fontWeight: 700, 
              cursor: 'pointer', 
              fontFamily: "'DM Sans',sans-serif", 
              whiteSpace: 'nowrap' 
            }}>
              ↓ Export
            </button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="kwdash-wrap" style={{ 
        marginRight: selected ? "min(360px,100vw)" : 0, 
        flex: 1 
      }}>

        {/* Stats Grid */}
        <StatsGrid keywords={KEYWORDS} />

        {/* Volume Chart */}
        <VolumeChart 
          keywords={KEYWORDS} 
          selected={selected} 
          onSelect={setSelected} 
        />

        {/* Filter Tabs */}
        <FilterTabs 
          filter={filter} 
          setFilter={setFilter} 
          counts={counts} 
          total={rows.length} 
        />

        {/* Keyword Table */}
        <KeywordTable 
          rows={rows} 
          sort={sort} 
          toggleSort={toggleSort} 
          selected={selected} 
          setSelected={setSelected} 
          maxVol={maxVol} 
        />

        {/* Footer */}
        <div style={{ 
          marginTop: 12, 
          fontSize: 11, 
          color: '#3a4a5f', 
          textAlign: 'center' 
        }}>
          DataForSEO Labs · Google US (2840) · March 2026 · Click any row to inspect
        </div>
      </div>

      {/* Detail Drawer */}
      <DetailDrawer kw={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
