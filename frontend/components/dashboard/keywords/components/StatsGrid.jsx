import React from 'react';

export default function StatsGrid({ intelligence, keywords }) {
  // Ensure keywords is an array
  const keywordsArray = Array.isArray(keywords) ? keywords : [];
  
  // Use intelligence data if available, fallback to calculating from keywords
  const totalVol = intelligence?.summary?.total_volume || keywordsArray.reduce((sum, k) => sum + (k.vol || 0), 0);
  const avgKd = intelligence?.summary?.avg_kd_score || (keywordsArray.length > 0 ? Math.round(keywordsArray.reduce((sum, k) => sum + (k.kd || 0), 0) / keywordsArray.length) : 0);
  const avgCpc = intelligence?.summary?.avg_cpc || (keywordsArray.length > 0 ? (keywordsArray.reduce((sum, k) => sum + (k.cpc || 0), 0) / keywordsArray.length).toFixed(2) : '0.00');
  const aiOverviewCount = intelligence?.summary?.ai_overview_count || keywordsArray.filter(k => k.serpTypes?.includes('ai_overview')).length;
  const localPackCount = intelligence?.summary?.local_pack_count || keywordsArray.filter(k => k.serpTypes?.includes('local_pack')).length;

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
