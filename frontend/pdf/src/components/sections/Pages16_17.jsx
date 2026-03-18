import React from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, InsightBox } from '../layout';

// ---- Page 16: Keyword Ranking Analysis ----
export function KeywordRankingPage() {
  const keywords = [
    { kw: 'seo audit tool', vol: '8,100', rank: '#2', prev: '#4', change: '+2', diff: '45/100', highlight: false },
    { kw: 'what is an seo audit', vol: '5,400', rank: '#1', prev: '#1', change: '—', diff: '32/100', highlight: false },
    { kw: 'seo audit software', vol: '4,400', rank: '#11', prev: '#14', change: '+3', diff: '58/100', highlight: true },
    { kw: 'site audit free tool', vol: '6,700', rank: '#5', prev: '#5', change: '—', diff: '61/100', highlight: false },
    { kw: 'technical seo checker', vol: '3,200', rank: '#14', prev: '#16', change: '+2', diff: '52/100', highlight: true },
    { kw: 'core web vitals checker', vol: '2,400', rank: '#6', prev: '#8', change: '+2', diff: '44/100', highlight: false },
    { kw: 'ai visibility seo', vol: '2,900', rank: '#18', prev: '#22', change: '+4', diff: '41/100', highlight: true },
    { kw: 'backlink analysis tool', vol: '5,100', rank: '#9', prev: '#7', change: '-2', diff: '55/100', highlight: false },
    { kw: 'generative engine seo', vol: '1,200', rank: '#8', prev: '#12', change: '+4', diff: '29/100', highlight: false },
    { kw: 'ai search optimization', vol: '1,800', rank: '#24', prev: '#31', change: '+7', diff: '38/100', highlight: true },
  ];

  const rankColor = (r) => {
    const n = parseInt(r.replace('#', ''));
    if (n <= 3) return '#10B981';
    if (n <= 10) return '#4F6EF7';
    return '#F59E0B';
  };
  const changeColor = (c) => c.startsWith('+') ? '#10B981' : c.startsWith('-') ? '#EF4444' : '#9CA3AF';

  return (
    <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader page={16} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="12" title="Keyword Ranking Analysis" subtitle="10 keywords tracked" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={2} label="Top 3 Rankings" sub="of 10" color="#10B981" borderColor="#10B981" />
          <StatCard value={6} label="Top 10 Rankings" sub="of 10" color="#4F6EF7" borderColor="#4F6EF7" />
          <StatCard value={7} label="Positions Gained" sub="vs last period" color="#00D4FF" borderColor="#00D4FF" />
          <StatCard value={4} label="Near Top 10" sub="positions 11-25" color="#F59E0B" borderColor="#F59E0B" />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Keyword Position Table</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 12 }} />
        <p style={{ fontSize: 12, color: '#F59E0B', marginBottom: 12 }}>■ Highlighted = near top-10 opportunity keywords</p>

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Keyword', 'Volume', 'Rank', 'Prev', 'Change', 'Difficulty'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {keywords.map(({ kw, vol, rank, prev, change, diff, highlight }, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: highlight ? '#FFFBEB' : i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', fontWeight: highlight ? 600 : 400, color: '#111827' }}>{kw}</td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>{vol}</td>
                  <td style={{ padding: '10px 14px', color: rankColor(rank), fontWeight: 700 }}>{rank}</td>
                  <td style={{ padding: '10px 14px', color: '#9CA3AF' }}>{prev}</td>
                  <td style={{ padding: '10px 14px', color: changeColor(change), fontWeight: 600 }}>{change}</td>
                  <td style={{ padding: '10px 14px', color: parseInt(diff) < 50 ? '#10B981' : '#F59E0B' }}>{diff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Keyword Growth Forecast">
          Near-page-1 keywords: 'seo audit software' (#11) · 'technical seo checker' (#14) · 'ai visibility seo' (#18). Content improvements + 1-2 backlinks per page could move these to page 1 within 60-90 days, unlocking 10,500 additional monthly impressions.
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
