import React from 'react';

export default function StatsGrid({ keywords }) {
  const totalVol = keywords.reduce((sum, k) => sum + k.vol, 0);
  const avgKd = Math.round(keywords.reduce((sum, k) => sum + k.kd, 0) / keywords.length);
  const avgCpc = (keywords.reduce((sum, k) => sum + k.cpc, 0) / keywords.length).toFixed(2);
  const aiOverviewCount = keywords.filter(k => k.serpTypes.includes('ai_overview')).length;
  const localPackCount = keywords.filter(k => k.serpTypes.includes('local_pack')).length;

  const stats = [
    {
      label: 'Total Volume',
      value: `${(totalVol / 1000).toFixed(0)}K`,
      sub: 'monthly searches',
      color: '#00e5ff',
      icon: '📊'
    },
    {
      label: 'Avg. KD Score',
      value: avgKd,
      sub: avgKd >= 70 ? 'Hard competition' : 'Manageable',
      color: avgKd >= 70 ? '#ff4560' : avgKd >= 50 ? '#ffbb33' : '#10ffa0',
      icon: '🎯'
    },
    {
      label: 'Avg. CPC',
      value: `$${avgCpc}`,
      sub: 'cost per click',
      color: '#a855f7',
      icon: '💰'
    },
    {
      label: 'AI Overview KWs',
      value: aiOverviewCount,
      sub: 'have AI box',
      color: '#7c3aed',
      icon: '✦'
    },
    {
      label: 'Local Pack KWs',
      value: localPackCount,
      sub: 'have map pack',
      color: '#10ffa0',
      icon: '📍'
    }
  ];

  return (
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: 8 
          }}>
            <div style={{ 
              fontSize: 9, 
              fontWeight: 700, 
              color: '#5a6a82', 
              textTransform: 'uppercase', 
              letterSpacing: '0.09em', 
              lineHeight: 1.3 
            }}>
              {stat.label}
            </div>
            <span style={{ fontSize: 15 }}>{stat.icon}</span>
          </div>
          <div style={{ 
            fontFamily: "'Syne',sans-serif", 
            fontSize: 26, 
            fontWeight: 800, 
            color: stat.color, 
            lineHeight: 1 
          }}>
            {stat.value}
          </div>
          <div style={{ 
            fontSize: 10, 
            color: '#3a4a5f', 
            marginTop: 4 
          }}>
            {stat.sub}
          </div>
        </div>
      ))}
    </div>
  );
}
