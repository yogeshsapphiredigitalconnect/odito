import React from 'react';
import { PageHeader, PageFooter, SectionHeader, InsightBox } from '../layout';

const forecastData = [
  { label: 'Current', seo: 67, ai: 41, perf: 71 },
  { label: '30 Days', seo: 76, ai: 56, perf: 75 },
  { label: '60 Days', seo: 80, ai: 62, perf: 80 },
  { label: '90 Days', seo: 84, ai: 68, perf: 84 },
];

const milestones = [
  { milestone: 'Current', seo: 67, ai: 41, perf: 71, overall: 60, seoC: '#F59E0B', aiC: '#EF4444', perfC: '#F59E0B', oC: '#F59E0B' },
  { milestone: '30 Days', seo: 76, ai: 56, perf: 75, overall: 69, seoC: '#F59E0B', aiC: '#F59E0B', perfC: '#F59E0B', oC: '#F59E0B' },
  { milestone: '60 Days', seo: 80, ai: 62, perf: 80, overall: 74, seoC: '#10B981', aiC: '#F59E0B', perfC: '#10B981', oC: '#F59E0B' },
  { milestone: '90 Days', seo: 84, ai: 68, perf: 84, overall: 79, seoC: '#10B981', aiC: '#10B981', perfC: '#10B981', oC: '#10B981' },
];

export default function AIGrowthForecastPage() {
  const maxVal = 100;
  const chartH = 160;

  return (
    <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader page={27} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="19" title="AI Growth Forecast" subtitle="Projected score improvements over 90 days" />

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>90-Day Score Projection</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, marginBottom: 32 }}>
          {/* Bar chart */}
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              {[['#4F6EF7', 'SEO Score'], ['#00D4FF', 'AI Score'], ['#F59E0B', 'PERF Score']].map(([c, l]) => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, background: c, borderRadius: 2 }} />
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{l}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 0, alignItems: 'flex-end', position: 'relative' }}>
              {/* Y axis labels */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: chartH + 20, paddingBottom: 20, marginRight: 8 }}>
                {[100, 75, 50, 25, 0].map(v => (
                  <span key={v} style={{ fontSize: 10, color: '#9CA3AF' }}>{v}</span>
                ))}
              </div>

              <div style={{ flex: 1, display: 'flex', gap: 24, alignItems: 'flex-end' }}>
                {forecastData.map(({ label, seo, ai, perf }) => (
                  <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', justifyContent: 'center', height: chartH }}>
                      {[{ v: seo, c: '#4F6EF7' }, { v: ai, c: '#00D4FF' }, { v: perf, c: '#F59E0B' }].map(({ v, c }, j) => (
                        <div key={j} style={{ width: 24, height: `${(v / maxVal) * chartH}px`, background: c, borderRadius: '3px 3px 0 0', position: 'relative' }}>
                          <span style={{ position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: '#374151', whiteSpace: 'nowrap' }}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 8, borderTop: '1px solid #E5E7EB', paddingTop: 6 }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Legend + projections */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, minWidth: 160 }}>
            {[['#4F6EF7', 'SEO Health'], ['#00D4FF', 'AI Visibility'], ['#F59E0B', 'Performance']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 16, height: 16, background: c, borderRadius: 3 }} />
                <span style={{ fontSize: 13, color: '#374151' }}>{l}</span>
              </div>
            ))}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 8 }}>After 90 days:</div>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 2 }}>
                SEO: <strong style={{ color: '#4F6EF7' }}>67 → 84</strong><br />
                AI Vis: <strong style={{ color: '#00D4FF' }}>41 → 68</strong><br />
                Speed: <strong style={{ color: '#F59E0B' }}>71 → 84</strong>
              </div>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Forecast Breakdown</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 16 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Milestone', 'SEO Health', 'AI Visibility', 'Performance', 'Overall'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {milestones.map(({ milestone, seo, ai, perf, overall, seoC, aiC, perfC, oC }, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111827' }}>{milestone}</td>
                  <td style={{ padding: '11px 14px', color: seoC, fontWeight: 700 }}>{seo}</td>
                  <td style={{ padding: '11px 14px', color: aiC, fontWeight: 700 }}>{ai}</td>
                  <td style={{ padding: '11px 14px', color: perfC, fontWeight: 700 }}>{perf}</td>
                  <td style={{ padding: '11px 14px', color: oC, fontWeight: 700 }}>{overall}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="90-Day Growth Projection">
          Executing the full recommended plan is projected to move overall grade from C+ (58) to B+ (79) within 90 days. AI Visibility gains +27 points — the most dramatic improvement — positioning the site to capture 15,000-25,000 additional monthly sessions.
        </InsightBox>
      </div>
      <PageFooter page={27} />
    </div>
  );
}
