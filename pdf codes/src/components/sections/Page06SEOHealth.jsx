import React from 'react';
import { PageHeader, PageFooter, SectionHeader, InsightBox } from '../layout';

export default function SEOHealthOverviewPage() {
  const bars = [
    { label: 'SEO Health', value: 67, color: '#4F6EF7', legend: 'SEO Health (67/100)' },
    { label: 'AI Visibility', value: 41, color: '#00D4FF', legend: 'AI Visibility (41/100)' },
    { label: 'Performance', value: 71, color: '#F59E0B', legend: 'Performance (71/100)' },
    { label: 'Authority', value: 43, color: '#60A5FA', legend: 'Authority (43/100)' },
    { label: 'Overall Score', value: 58, color: '#111827', legend: 'Overall (58/100)' },
  ];

  const grades = [
    { range: '90-100', grade: 'A+', status: 'Excellent', meaning: 'Top percentile — elite signals across all categories', color: '#10B981' },
    { range: '80-89', grade: 'A', status: 'Very Good', meaning: 'Minor improvements reach the elite tier', color: '#10B981' },
    { range: '70-79', grade: 'B', status: 'Good', meaning: 'Solid base — focused fixes move the needle', color: '#F59E0B' },
    { range: '60-69', grade: 'C+', status: 'Fair', meaning: 'Prioritised action plan recommended', color: '#F59E0B' },
    { range: '50-59', grade: 'C', status: 'Average', meaning: 'Structured improvement plan needed', color: '#F97316' },
    { range: '0-49', grade: 'D', status: 'Poor', meaning: 'Significant issues across multiple dimensions', color: '#EF4444' },
  ];

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={6} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="05" title="SEO Health Overview" subtitle="Score breakdown by category" score={58} />

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Score Breakdown by Category</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 24 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, marginBottom: 32 }}>
          <div>
            {bars.map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#374151', width: 110 }}>{label}</span>
                <div style={{ flex: 1, height: 14, background: '#F3F4F6', borderRadius: 3 }}>
                  <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', width: 36, textAlign: 'right' }}>{value}%</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
            {bars.map(({ color, legend }) => (
              <div key={legend} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
                <span style={{ fontSize: 12, color: '#6B7280' }}>{legend}</span>
              </div>
            ))}
          </div>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Score Grade Reference</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 16 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Range', 'Grade', 'Status', 'What it means'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.map(({ range, grade, status, meaning, color }, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 14px', color: '#374151' }}>{range}</td>
                  <td style={{ padding: '11px 14px', color, fontWeight: 800, fontFamily: "'Syne', sans-serif", fontSize: 15 }}>{grade}</td>
                  <td style={{ padding: '11px 14px', color, fontWeight: 600 }}>{status}</td>
                  <td style={{ padding: '11px 14px', color: '#6B7280' }}>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Score Interpretation">
          agencyplatform.com scores C+ (58/100). SEO Health at 67 reflects good foundations but structured data gaps are limiting rankings. AI Visibility at 41 is the most critical gap — and the fastest to fix.
        </InsightBox>
      </div>
      <PageFooter page={6} />
    </div>
  );
}
