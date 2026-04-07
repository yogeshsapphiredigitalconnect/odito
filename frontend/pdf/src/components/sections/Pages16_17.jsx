'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, InsightBox } from '../layout';
import apiService from '../../../../lib/apiService.js';

// ---- Page 16: Keyword Ranking Analysis ----
export function KeywordRankingPage({ projectId }) {
  const [loading, setLoading] = useState(true);
  const [keywordData, setKeywordData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) return;
    
    const fetchKeywordData = async () => {
      try {
        setLoading(true);
        const result = await apiService.getKeywordRankingAnalysis(projectId);
        
        if (result.success) {
          setKeywordData(result.data);
        } else {
          setError(result.error?.message || 'Failed to load keyword data');
        }
      } catch (err) {
        setError('Network error loading keyword data');
        console.error('Keyword data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchKeywordData();
  }, [projectId]);

  // Helper functions for formatting
  const rankColor = (rank) => {
    if (rank === null || rank === undefined) return '#9CA3AF';
    if (rank <= 3) return '#10B981';
    if (rank <= 10) return '#4F6EF7';
    return '#F59E0B';
  };

  const formatRank = (rank) => {
    if (rank === null || rank === undefined) return '—';
    return `#${rank}`;
  };

  const statusColor = (status) => {
    return status === 'ranking' ? '#10B981' : '#EF4444';
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>
        <PageHeader page={16} />
        <div style={{ padding: '32px 40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div>Loading keyword ranking data...</div>
          </div>
        </div>
        <PageFooter page={16} />
      </div>
    );
  }

  // Show error state
  if (error || !keywordData) {
    return (
      <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', sans-serif" }}>
        <PageHeader page={16} />
        <div style={{ padding: '32px 40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#EF4444' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Data Unavailable</div>
            <div>{error || 'No keyword ranking data found'}</div>
          </div>
        </div>
        <PageFooter page={16} />
      </div>
    );
  }

  const { totalKeywords, rankingKeywords, notRankingKeywords, top3, top10, nearTop10, keywords, allNotRanking } = keywordData;

  return (
    <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader page={16} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="12" title="Keyword Ranking Analysis" subtitle={`${totalKeywords} keywords tracked`} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={totalKeywords} label="Total Keywords" sub="tracked" color="#6B7280" borderColor="#6B7280" />
          <StatCard value={rankingKeywords} label="Ranking Keywords" sub={`of ${totalKeywords}`} color="#10B981" borderColor="#10B981" />
          <StatCard value={notRankingKeywords} label="Not Ranking" sub="outside Top 100" color="#EF4444" borderColor="#EF4444" />
          <StatCard value={top10} label="Top 10 Rankings" sub={`of ${totalKeywords}`} color="#4F6EF7" borderColor="#4F6EF7" />
        </div>

        {/* Warning message if all keywords are not ranking */}
        {allNotRanking && (
          <div style={{ 
            background: '#FEF2F2', 
            border: '1px solid #FECACA', 
            borderRadius: 8, 
            padding: '16px', 
            marginBottom: 24,
            color: '#991B1B'
          }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>⚠️ Ranking Alert</div>
            <div style={{ fontSize: 14 }}>None of the tracked keywords are ranking within the top 100 search results.</div>
          </div>
        )}

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Keyword Position Table</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 12 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                <th style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>Keyword</th>
                <th style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>Rank</th>
                <th style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((keyword, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 500, color: '#111827' }}>{keyword.keyword}</td>
                  <td style={{ padding: '10px 14px', color: rankColor(keyword.rank), fontWeight: 700 }}>
                    {formatRank(keyword.rank)}
                  </td>
                  <td style={{ padding: '10px 14px', color: statusColor(keyword.status), fontWeight: 600 }}>
                    {keyword.status === 'ranking' ? 'Ranking' : 'Not Ranking'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Keyword Ranking Insights">
          {allNotRanking 
            ? `None of your ${totalKeywords} tracked keywords are currently ranking in the top 100. Focus on technical SEO foundations, content optimization, and building authority to improve visibility.`
            : `You have ${rankingKeywords} keywords ranking (${top10} in top 10). The ${nearTop10} keywords near the top 10 represent immediate optimization opportunities for increased visibility.`
          }
        </InsightBox>
      </div>
      <PageFooter page={16} />
    </div>
  );
}

// ---- Page 17: Keyword Opportunity Analysis ----
export function KeywordOpportunityPage() {
  const opportunities = [
    { kw: 'seo audit software', vol: '4,400', pos: '#11', gap: '1 positions', clicks: '+120/mo' },
    { kw: 'technical seo checker', vol: '3,200', pos: '#14', gap: '4 positions', clicks: '+274/mo' },
    { kw: 'ai visibility seo', vol: '2,900', pos: '#18', gap: '8 positions', clicks: '+386/mo' },
    { kw: 'ai search optimization', vol: '1,800', pos: '#24', gap: '14 positions', clicks: '+315/mo' },
  ];

  return (
    <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader page={17} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="13" title="Keyword Opportunity Analysis" subtitle="Near page-1 keywords and ranking distribution" />

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Ranking Distribution</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 32 }}>
          <svg width={200} height={200} viewBox="0 0 200 200">
            {[
              { pct: 0.2, color: '#10B981', offset: 0 },
              { pct: 0.4, color: '#4F6EF7', offset: 0.2 },
              { pct: 0.3, color: '#F59E0B', offset: 0.6 },
              { pct: 0.1, color: '#F97316', offset: 0.9 },
            ].map(({ pct, color, offset }, i) => {
              const r = 78; const c = 2 * Math.PI * r;
              return <circle key={i} cx={100} cy={100} r={r} fill="none" stroke={color} strokeWidth={28}
                strokeDasharray={`${c * pct} ${c}`} strokeDashoffset={-c * offset} transform="rotate(-90 100 100)" />;
            })}
            <circle cx={100} cy={100} r={62} fill="white" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { color: '#10B981', label: 'Top 3 (2 keywords)' },
              { color: '#4F6EF7', label: 'Pos 4-10 (4 keywords)' },
              { color: '#F59E0B', label: 'Pos 11-20 (3 keywords)' },
              { color: '#F97316', label: 'Pos 21-30 (1 keywords)' },
              { color: '#EF4444', label: '30+ (0 keywords)' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 13, color: '#374151' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Near Top-10 Opportunities</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 16 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Keyword', 'Volume', 'Position', 'Gap to #10', 'Est. Additional Clicks'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {opportunities.map(({ kw, vol, pos, gap, clicks }, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111827' }}>{kw}</td>
                  <td style={{ padding: '11px 14px', color: '#6B7280' }}>{vol}</td>
                  <td style={{ padding: '11px 14px', color: '#F59E0B', fontWeight: 700 }}>{pos}</td>
                  <td style={{ padding: '11px 14px', color: '#6B7280' }}>{gap}</td>
                  <td style={{ padding: '11px 14px', color: '#10B981', fontWeight: 700 }}>{clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Keyword Distribution Insight">
          Near-page-1 group represents 15,000+ additional impressions/month within 90 days. Targeted content improvements and authority building on 3 key pages can deliver this within the forecast window.
        </InsightBox>
      </div>
      <PageFooter page={17} />
    </div>
  );
}
