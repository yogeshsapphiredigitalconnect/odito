import React from 'react';
import VolBar from './ui/VolBar';
import KdRing from './ui/KdRing';
import IntentPill from './ui/IntentPill';
import TrendCell from './ui/TrendCell';
import Sparkline from './ui/Sparkline';
import SerpDots from './ui/SerpDots';

export default function KeywordTable({ rows, sort, toggleSort, selected, setSelected, maxVol, loading }) {
  const columns = [
    { key: null, label: '#', width: 36 },
    { key: null, label: 'Keyword', width: 180 },
    { key: 'vol', label: 'Volume', width: 130 },
    { key: null, label: 'Intent', width: 64 },
    { key: 'kd', label: 'KD', width: 80 },
    { key: 'cpc', label: 'CPC', width: 64 },
    { key: 'trend', label: 'M/M', width: 56 },
    { key: null, label: 'Q/Q', width: 56 },
    { key: null, label: 'Y/Y', width: 56 },
    { key: null, label: 'Trend', width: 88 },
    { key: null, label: 'SERP', width: 80 },
    { key: null, label: 'D', width: 40 }
  ];

  const formatRefDomains = (domains) => {
    return domains >= 1000 ? `${(domains / 1000).toFixed(1)}K` : domains;
  };

  return (
    <div className="tbl-scroll" style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      overflow: 'hidden'
    }}>
      <table style={{ minWidth: 700, width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {columns.map((col, index) => (
              <th
                key={index}
                className={col.key ? 'shdr' : ''}
                onClick={col.key ? () => toggleSort(col.key) : undefined}
                style={{
                  padding: '10px 11px',
                  textAlign: 'left',
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: '0.09em',
                  textTransform: 'uppercase',
                  color: sort.col === col.key ? '#00e5ff' : '#5a6a82',
                  whiteSpace: 'nowrap',
                  width: col.width
                }}
              >
                {col.label}
                {col.key && (
                  <span style={{ marginLeft: 3, opacity: 0.5 }}>
                    {sort.col === col.key ? (sort.dir === 'desc' ? '↓' : '↑') : '↕'}
                  </span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#5a6a82',
                fontSize: '13px'
              }}>
                Loading keywords...
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: '#5a6a82',
                fontSize: '13px'
              }}>
                No keywords found
              </td>
            </tr>
          ) : (
            rows.map((keyword, index) => (
              <tr
                key={keyword.keyword}
                className={`kw-row frow ${selected?.keyword === keyword.keyword ? 'sel' : ''}`}
                style={{
                  animationDelay: `${index * 0.02}s`,
                  borderBottom: '1px solid rgba(255,255,255,0.04)'
                }}
                onClick={() => setSelected && setSelected(keyword)}
              >
                <td style={{ 
                  padding: '12px 11px', 
                  fontSize: 10, 
                  color: '#3a4a5f', 
                  fontWeight: 800, 
                  fontFamily: "'Syne',sans-serif" 
                }}>
                  {index + 1}
                </td>
                <td style={{ padding: '12px 11px' }}>
                  <div style={{ 
                    fontSize: 13, 
                    fontWeight: 600, 
                    color: '#e8edf7', 
                    marginBottom: 1 
                  }}>
                    {keyword.keyword}
                  </div>
                  <div style={{ fontSize: 10, color: '#3a4a5f' }}>
                    {formatRefDomains(keyword.refDomains)} ref domains
                    {keyword.serpTypes.includes('ai_overview') && (
                      <span style={{ color: '#a855f7', marginLeft: 5 }}>✦</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '12px 11px' }}>
                  <VolBar vol={keyword.vol} max={maxVol} />
                </td>
                <td style={{ padding: '12px 11px' }}>
                  <IntentPill intent={keyword.intent} />
                </td>
                <td style={{ padding: '12px 11px' }}>
                  <KdRing kd={keyword.kd} />
                </td>
                <td style={{ 
                  padding: '12px 11px', 
                  fontFamily: "'Syne',sans-serif", 
                  fontSize: 12, 
                  fontWeight: 700, 
                  color: keyword.cpc > 30 ? '#10ffa0' : '#8896b0', 
                  whiteSpace: 'nowrap' 
                }}>
                  ${keyword.cpc.toFixed(2)}
                </td>
                <td style={{ padding: '12px 11px' }}>
                  <TrendCell v={keyword.trend.monthly} />
                </td>
                <td style={{ padding: '12px 11px' }}>
                  <TrendCell v={keyword.trend.quarterly} />
                </td>
                <td style={{ padding: '12px 11px' }}>
                  <TrendCell v={keyword.trend.yearly} />
                </td>
                <td style={{ padding: '12px 11px' }}>
                  <Sparkline 
                    data={keyword.monthly} 
                    color={keyword.trend.yearly > 0 ? '#10ffa0' : keyword.trend.yearly < 0 ? '#ff4560' : '#00e5ff'} 
                  />
                </td>
                <td style={{ padding: '12px 11px' }}>
                  <SerpDots types={keyword.serpTypes} />
                </td>
                <td style={{ padding: '12px 11px', textAlign: 'center' }}>
                  <span style={{ 
                    fontSize: 9, 
                    fontWeight: 800, 
                    color: '#5a6a82', 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '2px 6px', 
                    borderRadius: 4 
                  }}>
                    D{keyword.depth}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
