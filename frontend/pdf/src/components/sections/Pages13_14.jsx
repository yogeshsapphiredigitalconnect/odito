import React from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, Badge, InsightBox } from '../layout';

// ---- Page 13: Core Web Vitals ----
export function CoreWebVitalsPage() {
  const vitals = [
    ['First Contentful Paint (FCP)', '1.2s', 'Good', '1.8s', 'Good', 'LOW'],
    ['Largest Contentful Paint (LCP)', '2.1s', 'Good', '3.2s', 'Needs Work', 'MEDIUM'],
    ['Total Blocking Time (TBT)', '120ms', 'Good', '280ms', 'Needs Work', 'MEDIUM'],
    ['Cumulative Layout Shift (CLS)', '0.04', 'Good', '0.08', 'Good', 'LOW'],
    ['Time to First Byte (TTFB)', '280ms', 'Good', '340ms', 'Good', 'LOW'],
  ];

  const ratingColor = (r) => r === 'Good' ? '#10B981' : r === 'Needs Work' ? '#F59E0B' : '#EF4444';
  const priorityType = (p) => p === 'LOW' ? 'low' : p === 'MEDIUM' ? 'medium' : 'critical';

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={13} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="10" title="Core Web Vitals" subtitle="Desktop and mobile Lighthouse analysis" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={82} label="Desktop Score" sub="Lighthouse" color="#10B981" borderColor="#10B981" />
          <StatCard value={71} label="Mobile Score" sub="Lighthouse" color="#F59E0B" borderColor="#F59E0B" />
          <StatCard value="3.2s" label="Mobile LCP" sub="Target < 2.5s" color="#EF4444" borderColor="#EF4444" />
          <StatCard value="280ms" label="Mobile TBT" sub="Target < 200ms" color="#F59E0B" borderColor="#F59E0B" />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Desktop vs Mobile Comparison</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginBottom: 28 }}>
          {/* Bar chart */}
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, background: '#4F6EF7', borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: '#6B7280' }}>Desktop</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 12, height: 12, background: '#00D4FF', borderRadius: 2 }} />
                <span style={{ fontSize: 12, color: '#6B7280' }}>Mobile</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', height: 160 }}>
              {[
                { label: 'Performance', d: 82, m: 71 },
                { label: 'Best Practices', d: 82, m: 71 },
                { label: 'Accessibility', d: 92, m: 88 },
              ].map(({ label, d, m }) => (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', justifyContent: 'center', height: 130 }}>
                    <div style={{ width: 26, height: `${d * 1.2}px`, background: '#4F6EF7', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 700, color: '#374151' }}>{d}</span>
                    </div>
                    <div style={{ width: 26, height: `${m * 1.2}px`, background: '#00D4FF', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 700, color: '#374151' }}>{m}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
            <p style={{ fontSize: 14, color: '#374151' }}>Desktop: <strong style={{ color: '#4F6EF7' }}>82/100</strong></p>
            <p style={{ fontSize: 14, color: '#374151' }}>Mobile: <strong style={{ color: '#F59E0B' }}>71/100</strong></p>
            <p style={{ fontSize: 13, color: '#10B981', marginTop: 8 }}>Good: ≥90 &nbsp; Fair: 50-89 &nbsp; Poor: &lt;50</p>
          </div>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Core Web Vitals — Detailed</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 16 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Metric', 'Desktop', 'Rating', 'Mobile', 'Rating', 'Priority'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vitals.map(([metric, dval, drat, mval, mrat, priority], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{metric}</td>
                  <td style={{ padding: '10px 14px', color: '#10B981', fontWeight: 600 }}>{dval}</td>
                  <td style={{ padding: '10px 14px', color: ratingColor(drat), fontWeight: 600 }}>{drat}</td>
                  <td style={{ padding: '10px 14px', color: ratingColor(mrat), fontWeight: 600 }}>{mval}</td>
                  <td style={{ padding: '10px 14px', color: ratingColor(mrat), fontWeight: 600 }}>{mrat}</td>
                  <td style={{ padding: '10px 14px' }}><Badge label={priority} type={priorityType(priority)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Core Web Vitals SEO Impact">
          Mobile LCP of 3.2s is the critical ranking factor. Moving from Poor to Good (&lt;2.5s) can improve mobile rankings 10-15%. The optimisation page shows how to achieve this with a combined 2,500ms saving.
        </InsightBox>
      </div>
      <PageFooter page={13} />
    </div>
  );
}

// ---- Page 14: Performance Opportunities ----
export function PerformanceOpportunitiesPage() {
  const opps = [
    ['Eliminate render-blocking resources', '840ms', 'Medium', '-840ms', 'HIGH'],
    ['Remove unused JavaScript', '620ms', 'Medium', '-1460ms', 'MEDIUM'],
    ['Optimise and compress images', '480ms', 'Easy', '-1940ms', 'MEDIUM'],
    ['Enable text compression (gzip/br)', '320ms', 'Easy', '-2260ms', 'LOW'],
    ['Serve assets with efficient caching', '240ms', 'Easy', '-2500ms', 'LOW'],
  ];

  const forecasts = [
    { label: 'Current', lcp: '3.2s', score: 71, color: '#F59E0B', status: 'Poor', pct: 71 },
    { label: 'After Images', lcp: '2.7s', score: 78, color: '#F59E0B', status: 'Fair', pct: 78 },
    { label: 'After JS fix', lcp: '2.1s', score: 83, color: '#10B981', status: 'Good', pct: 83 },
    { label: 'Full fix', lcp: '0.7s', score: 91, color: '#10B981', status: 'Excellent', pct: 91 },
  ];

  const effortMap = { Easy: 'pass', Medium: 'warn', Hard: 'fail' };
  const priorityMap = { HIGH: 'critical', MEDIUM: 'medium', LOW: 'low' };

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={14} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="11" title="Performance Opportunities" subtitle="Speed improvements and estimated savings" />

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Optimisation Opportunities</h3>

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 28 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Optimisation', 'Saving', 'Effort', 'Cumulative Impact', 'Priority'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {opps.map(([opt, saving, effort, cumulative, priority], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{opt}</td>
                  <td style={{ padding: '10px 14px', color: '#10B981', fontWeight: 700 }}>{saving}</td>
                  <td style={{ padding: '10px 14px' }}><Badge label={effort} type={effortMap[effort]} /></td>
                  <td style={{ padding: '10px 14px', color: '#4F6EF7', fontWeight: 600 }}>{cumulative}</td>
                  <td style={{ padding: '10px 14px' }}><Badge label={priority} type={priorityMap[priority]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Performance Improvement Forecast</h3>

        <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          {forecasts.map(({ label, lcp, score, color, status, pct }, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: i < 3 ? 20 : 0 }}>
              <span style={{ width: 90, fontSize: 13, fontWeight: 600, color: '#374151' }}>{label}</span>
              <span style={{ width: 70, fontSize: 13, color, fontWeight: 700 }}>LCP: {lcp}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>Score: {score}/100</div>
                <div style={{ height: 12, background: '#F3F4F6', borderRadius: 6 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6 }} />
                </div>
              </div>
              <span style={{ width: 70, fontSize: 13, color, fontWeight: 600, textAlign: 'right' }}>{status}</span>
            </div>
          ))}
        </div>

        <InsightBox title="Performance Optimisation Plan">
          All optimisations deliver 2,500ms saving — moving Mobile LCP from 3.2s (Poor) to 0.7s (Excellent), Performance 71→91. Image compression and gzip are deployable in under an hour for an instant 800ms gain.
        </InsightBox>
      </div>
      <PageFooter page={14} />
    </div>
  );
}
