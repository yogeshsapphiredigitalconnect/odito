import React from 'react';

export function PageHeader({ page, total = 31 }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '14px 40px', background: '#111827', borderBottom: '2px solid #00D4FF',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, fontFamily: "'Syne', sans-serif" }}>Odito AI</span>
      <span style={{ color: '#8892C4', fontSize: 13 }}>SEO & AI Visibility Audit Report</span>
      <span style={{ color: '#8892C4', fontSize: 13 }}>agencyplatform.com &nbsp;|&nbsp; p.{page}/{total}</span>
    </div>
  );
}

export function PageFooter({ page, total = 31 }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 40px', borderTop: '1px solid #E5E7EB', marginTop: 'auto',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      <span style={{ color: '#9CA3AF', fontSize: 12 }}>Odito AI Audit Report &nbsp;|&nbsp; March 13, 2025</span>
      <span style={{ color: '#9CA3AF', fontSize: 12 }}>agencyplatform.com</span>
      {page && <span style={{ color: '#9CA3AF', fontSize: 12 }}>Page {page} of {total}</span>}
    </div>
  );
}

export function SectionHeader({ num, title, subtitle, score }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      background: '#F9FAFB', border: '1px solid #E5E7EB',
      borderLeft: '4px solid #4F6EF7', borderRadius: 8,
      padding: '16px 20px', marginBottom: 24
    }}>
      <span style={{
        background: '#EEF2FF', color: '#4F6EF7', fontWeight: 700,
        fontSize: 13, padding: '4px 10px', borderRadius: 6,
        fontFamily: "'Syne', sans-serif", minWidth: 36, textAlign: 'center'
      }}>{num}</span>
      <div style={{ flex: 1 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', fontFamily: "'Syne', sans-serif" }}>{title}</h2>
        {subtitle && <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {score !== undefined && (
        <div style={{
          background: '#EF4444', color: '#fff', borderRadius: 8,
          padding: '8px 16px', fontWeight: 700, fontSize: 16,
          fontFamily: "'Syne', sans-serif"
        }}>{score}</div>
      )}
    </div>
  );
}

export function StatCard({ value, label, sub, color = '#4F6EF7', borderColor }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #E5E7EB',
      borderTop: `3px solid ${borderColor || color}`,
      borderRadius: 8, padding: '20px 16px', textAlign: 'center'
    }}>
      <div style={{ fontSize: 36, fontWeight: 800, color, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function InsightBox({ title, children }) {
  return (
    <div style={{
      background: '#EEF2FF', border: '1px solid #C7D2FE',
      borderLeft: '4px solid #4F6EF7', borderRadius: 8, padding: '16px 20px', marginTop: 24
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, color: '#4F6EF7', fontSize: 14, fontFamily: "'Syne', sans-serif" }}>{title}</span>
        <span style={{
          background: '#4F6EF7', color: '#fff', fontSize: 12,
          padding: '4px 12px', borderRadius: 20, fontWeight: 500
        }}>✦ Odito AI Insight</span>
      </div>
      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}

export function DataTable({ headers, rows }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #E5E7EB' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#111827' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '12px 14px', color: '#fff', fontWeight: 600,
                textAlign: 'left', fontFamily: "'DM Sans', sans-serif",
                borderRight: i < headers.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '11px 14px', color: '#374151', verticalAlign: 'middle' }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({ label, type = 'info' }) {
  const colors = {
    critical: { bg: '#F3E8FF', color: '#9333EA' }, // Purple
    high: { bg: '#FEE2E2', color: '#EF4444' },     // Red
    medium: { bg: '#FEF9C3', color: '#EAB308' },   // Yellow
    low: { bg: '#DBEAFE', color: '#3B82F6' },      // Blue
    info: { bg: '#DBEAFE', color: '#3B82F6' },     // Blue (same as low)
    pass: { bg: '#D1FAE5', color: '#059669' },
    warn: { bg: '#FEF3C7', color: '#D97706' },
    fail: { bg: '#FEE2E2', color: '#DC2626' },
  };
  const c = colors[type.toLowerCase()] || colors.info;
  return (
    <span style={{
      background: c.bg, color: c.color, fontWeight: 700,
      fontSize: 11, padding: '3px 10px', borderRadius: 20,
      display: 'inline-block', whiteSpace: 'nowrap'
    }}>{label}</span>
  );
}

export function Page({ children, style }) {
  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff',
      display: 'flex', flexDirection: 'column',
      boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', ...style
    }}>
      {children}
    </div>
  );
}

export function PageContent({ children }) {
  return (
    <div style={{ padding: '32px 40px', flex: 1 }}>
      {children}
    </div>
  );
}
