import React from 'react';

export default function VolumeChart({ keywords, selected, onSelect }) {
  const maxVol = Math.max(...keywords.map(k => k.vol));
  const sortedKeywords = [...keywords].sort((a, b) => b.vol - a.vol);

  const getBarColor = (kd) => {
    if (kd >= 70) return '#ff4560';
    if (kd >= 35) return '#ffbb33';
    return '#10ffa0';
  };

  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 14,
      padding: '16px 20px',
      marginBottom: 18
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 10, 
        flexWrap: 'wrap', 
        gap: 8 
      }}>
        <div style={{ 
          fontSize: 11, 
          fontWeight: 700, 
          color: '#8896b0', 
          textTransform: 'uppercase', 
          letterSpacing: '0.09em' 
        }}>
          Volume Distribution
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'Easy', color: '#10ffa0' },
            { label: 'Med', color: '#ffbb33' },
            { label: 'Hard', color: '#ff4560' }
          ].map(item => (
            <span key={item.label} style={{ 
              fontSize: 9, 
              fontWeight: 700, 
              color: item.color 
            }}>
              ● {item.label}
            </span>
          ))}
        </div>
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-end', 
        gap: 2, 
        height: 50 
      }}>
        {sortedKeywords.map((keyword, index) => {
          const percentage = (keyword.vol / maxVol) * 100;
          const color = getBarColor(keyword.kd);
          const isSelected = selected?.keyword === keyword.keyword;
          
          return (
            <div
              key={keyword.keyword}
              title={`${keyword.keyword}: ${keyword.vol.toLocaleString()}`}
              onClick={() => onSelect(isSelected ? null : keyword)}
              style={{
                flex: 1,
                height: `${Math.max(percentage * 0.46 + 6, 7)}%`,
                background: isSelected ? color : `${color}45`,
                borderRadius: '3px 3px 0 0',
                cursor: 'pointer',
                transition: 'all 0.25s',
                minWidth: 2
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
