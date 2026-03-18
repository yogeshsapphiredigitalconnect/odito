import React from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, InsightBox } from '../layout';

function DonutChart({ value, max = 100, color, size = 100 }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={r} fill="none" stroke="#E5E7EB" strokeWidth={10} />
      <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)" />
      <text x={50} y={47} textAnchor="middle" fontSize={18} fontWeight={800} fill="#111827" fontFamily="'Syne', sans-serif">{value}</text>
      <text x={50} y={60} textAnchor="middle" fontSize={10} fill="#9CA3AF">/100</text>
    </svg>
  );
}

export default function ExecutiveSummaryPage() {
  const scoreColors = { 67: '#F59E0B', 41: '#EF4444', 71: '#F59E0B', 43: '#EF4444' };

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={3} />

      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="02" title="Executive Summary" subtitle="Performance snapshot and AI-generated analysis" />

        {/* 4 donut score cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16,
          border: '1px solid #E5E7EB', borderRadius: 8, padding: 24, marginBottom: 20
        }}>
          {[
            { v: 67, l: 'SEO Health', c: '#F59E0B' },
            { v: 41, l: 'AI Visibility', c: '#EF4444' },
            { v: 71, l: 'Performance', c: '#F59E0B' },
            { v: 43, l: 'Authority', c: '#EF4444' },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <DonutChart value={v} color={c} size={110} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 8 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Issue stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={8} label="Critical Issues" sub="Fix immediately" color="#EF4444" borderColor="#EF4444" />
          <StatCard value={14} label="Warnings" sub="Fix within 30 days" color="#F59E0B" borderColor="#F59E0B" />
          <StatCard value={22} label="Informational" sub="Opportunities" color="#4F6EF7" borderColor="#4F6EF7" />
          <StatCard value={47} label="Checks Passed" sub="No action needed" color="#10B981" borderColor="#10B981" />
        </div>

        <div style={{ borderBottom: '1px solid #E5E7EB', marginBottom: 24 }} />

        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>AI Analysis Summary</h3>

        <InsightBox title="Full-Site AI Analysis">
          Odito AI analysis shows agencyplatform.com has strong technical foundations — valid SSL, clean sitemap, and responsive design — but suffers from critically low AI search visibility. 47 pages lack structured data and no Knowledge Graph entity is verified. Fixing these issues is projected to deliver a 35-50% organic traffic increase within 90 days.
        </InsightBox>

        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '28px 0 16px', fontFamily: "'Syne', sans-serif" }}>Issue Distribution</h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {/* Simple donut */}
          <svg width={180} height={180} viewBox="0 0 180 180">
            {[
              { pct: 0.088, color: '#EF4444', offset: 0 },
              { pct: 0.154, color: '#F59E0B', offset: 0.088 },
              { pct: 0.242, color: '#4F6EF7', offset: 0.242 },
              { pct: 0.516, color: '#10B981', offset: 0.484 },
            ].map(({ pct, color, offset }, i) => {
              const r = 70; const c = 2 * Math.PI * r;
              return (
                <circle key={i} cx={90} cy={90} r={r} fill="none" stroke={color} strokeWidth={22}
                  strokeDasharray={`${c * pct} ${c}`}
                  strokeDashoffset={-c * offset}
                  transform="rotate(-90 90 90)" />
              );
            })}
            <circle cx={90} cy={90} r={50} fill="white" />
          </svg>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { color: '#EF4444', label: 'Critical (8)' },
              { color: '#F59E0B', label: 'Warnings (14)' },
              { color: '#4F6EF7', label: 'Info (22)' },
              { color: '#10B981', label: 'Passed (47)' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 14, color: '#374151' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PageFooter page={3} />
    </div>
  );
}
