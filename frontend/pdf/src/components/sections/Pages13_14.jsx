'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, Badge, InsightBox } from '../layout';

// API configuration
import API_BASE_URL from "@/lib/apiConfig";

// ---- Helper Functions for Rating and Priority ----
function getRating(metric, value) {
  if (metric === 'LCP') {
    if (value < 2.5) return 'Good';
    if (value < 4) return 'Needs Work';
    return 'Poor';
  }

  if (metric === 'TBT') {
    if (value < 200) return 'Good';
    if (value < 600) return 'Needs Work';
    return 'Poor';
  }

  if (metric === 'CLS') {
    if (value < 0.1) return 'Good';
    if (value < 0.25) return 'Needs Work';
    return 'Poor';
  }

  if (metric === 'FCP') {
    if (value < 1.8) return 'Good';
    if (value < 3.0) return 'Needs Work';
    return 'Poor';
  }

  if (metric === 'TTFB') {
    if (value < 800) return 'Good';
    if (value < 1800) return 'Needs Work';
    return 'Poor';
  }

  return 'Good';
}

function getPriority(rating) {
  if (rating === 'Poor') return 'HIGH';
  if (rating === 'Needs Work') return 'MEDIUM';
  return 'LOW';
}

function safeValue(value) {
  if (value === null || value === undefined || isNaN(value) || typeof value === 'object') {
    return 0;
  }
  return typeof value === 'number' ? value : parseFloat(value) || 0;
}

function getTTFBFromDiagnostics(diagnostics) {
  if (!Array.isArray(diagnostics)) return 0;
  const serverResponseTime = diagnostics.find(d => d.id === 'server-response-time');
  if (serverResponseTime?.details?.items?.[0]?.responseTime !== undefined) {
    return serverResponseTime.details.items[0].responseTime;
  }
  return 0;
}

function formatMetricValue(value, unit = '') {
  const numValue = safeValue(value);
  if (numValue === 0 && unit !== '') return '0' + unit;
  if (unit === 's' && numValue >= 1) return `${numValue.toFixed(1)}s`;
  if (unit === 'ms') return `${Math.round(numValue)}ms`;
  if (numValue < 1) return numValue.toFixed(2);
  return numValue.toFixed(1);
}

// ---- Page 13: Core Web Vitals ----
export function CoreWebVitalsPage({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    const fetchPerformanceData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/app_user/projects/${projectId}/performance`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("API data:", result.data);
        console.log("Mobile metrics:", result.data?.mobile);
        console.log("Desktop metrics:", result.data?.desktop);
        console.log("Mobile LCP structure:", result.data?.mobile?.metrics?.lcp);
        console.log("Mobile TBT structure:", result.data?.mobile?.metrics?.tbt);
        console.log("Mobile diagnostics TTFB:", getTTFBFromDiagnostics(result.data?.mobile?.diagnostics));
        setData(result.data);
      } catch (err) {
        console.error('Failed to fetch performance data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [projectId]);

  // Handle loading state
  if (loading) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: '#fff', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ fontSize: 16, color: '#6B7280' }}>Loading Core Web Vitals data...</div>
      </div>
    );
  }

  // Use mock data if no real data available (for PDF safety)
  const mobile = data?.mobile || {};
  const desktop = data?.desktop || {};

  // Map top cards data with safe extraction
  const desktopScore = safeValue(desktop.performance_score || desktop.performance);
  const mobileScore = safeValue(mobile.performance_score || mobile.performance);
  const mobileLCP = safeValue(mobile.metrics?.lcp?.value || mobile.lcp?.value || mobile.lcp);
  const mobileTBT = safeValue(mobile.metrics?.tbt?.value || mobile.tbt?.value || mobile.tbt);

  console.log("Extracted values:", {
    desktopScore,
    mobileScore,
    mobileLCP,
    mobileTBT,
    mobileMetrics: mobile.metrics,
    mobileTTFB: mobile.ttfb,
    mobileLCPObj: mobile.metrics?.lcp,
    mobileTBTObj: mobile.metrics?.tbt
  });

  // Desktop vs Mobile comparison
  const comparison = [
    { label: 'Performance', d: safeValue(desktop.performance_score || desktop.performance), m: safeValue(mobile.performance_score || mobile.performance) },
    { label: 'Best Practices', d: safeValue(desktop.best_practices_score || desktop.best_practices), m: safeValue(mobile.best_practices_score || mobile.best_practices) },
    { label: 'Accessibility', d: safeValue(desktop.accessibility_score || desktop.accessibility), m: safeValue(mobile.accessibility_score || mobile.accessibility) },
  ];

  // Core Web Vitals metrics table
  const metrics = [
    {
      name: 'First Contentful Paint (FCP)',
      desktop: safeValue(desktop.metrics?.fcp?.value || desktop.fcp?.value || desktop.fcp),
      mobile: safeValue(mobile.metrics?.fcp?.value || mobile.fcp?.value || mobile.fcp),
      unit: 's'
    },
    {
      name: 'Largest Contentful Paint (LCP)',
      desktop: safeValue(desktop.metrics?.lcp?.value || desktop.lcp?.value || desktop.lcp),
      mobile: safeValue(mobile.metrics?.lcp?.value || mobile.lcp?.value || mobile.lcp),
      unit: 's'
    },
    {
      name: 'Total Blocking Time (TBT)',
      desktop: safeValue(desktop.metrics?.tbt?.value || desktop.tbt?.value || desktop.tbt),
      mobile: safeValue(mobile.metrics?.tbt?.value || mobile.tbt?.value || mobile.tbt),
      unit: 'ms'
    },
    {
      name: 'Cumulative Layout Shift (CLS)',
      desktop: safeValue(desktop.metrics?.cls?.value || desktop.cls?.value || desktop.cls),
      mobile: safeValue(mobile.metrics?.cls?.value || mobile.cls?.value || mobile.cls),
      unit: ''
    },
    {
      name: 'Time to First Byte (TTFB)',
      desktop: safeValue(desktop.ttfb?.value || desktop.metrics?.ttfb?.value || getTTFBFromDiagnostics(desktop.diagnostics)),
      mobile: safeValue(mobile.ttfb?.value || mobile.metrics?.ttfb?.value || getTTFBFromDiagnostics(mobile.diagnostics)),
      unit: 'ms'
    }
  ];

  // Generate vitals table with ratings and priorities
  const vitals = metrics.map(m => {
    const dRating = getRating(m.name.includes('LCP') ? 'LCP' : m.name.includes('TBT') ? 'TBT' : m.name.includes('CLS') ? 'CLS' : m.name.includes('FCP') ? 'FCP' : 'TTFB', m.desktop);
    const mRating = getRating(m.name.includes('LCP') ? 'LCP' : m.name.includes('TBT') ? 'TBT' : m.name.includes('CLS') ? 'CLS' : m.name.includes('FCP') ? 'FCP' : 'TTFB', m.mobile);
    const priority = getPriority(mRating);

    return [
      m.name,
      formatMetricValue(m.desktop, m.unit),
      dRating,
      formatMetricValue(m.mobile, m.unit),
      mRating,
      priority
    ];
  });

  // Helper for rating color
  const ratingColor = (r) => r === 'Good' ? '#10B981' : r === 'Needs Work' ? '#F59E0B' : '#EF4444';
  const priorityType = (p) => p === 'LOW' ? 'low' : p === 'MEDIUM' ? 'medium' : 'critical';

  // Score color based on value
  const getScoreColor = (score) => {
    if (score >= 90) return '#10B981';
    if (score >= 50) return '#F59E0B';
    return '#EF4444';
  };

  // LCP color
  const lcpColor = getScoreColor(mobileLCP < 2.5 ? 90 : mobileLCP < 4 ? 75 : 50);

  // SEO Impact text based on data
  const getSEOImpact = () => {
    if (!data?.mobile && !data?.desktop) {
      return 'Performance data not available. Run a PageSpeed audit to see Core Web Vitals metrics and their impact on search rankings.';
    }

    if (mobileScore >= 75 && desktopScore >= 75) {
      return `Excellent Core Web Vitals with mobile score ${mobileScore} and desktop score ${desktopScore}. These metrics provide a strong foundation for search rankings and user experience.`;
    } else if (mobileScore >= 60 && desktopScore >= 60) {
      return `Good Core Web Vitals with room for improvement. Mobile score (${mobileScore}) and desktop score (${desktopScore}) can be enhanced for better rankings.`;
    } else {
      return `Core Web Vitals require optimization. Mobile performance (${mobileScore}) and desktop performance (${desktopScore}) impact search visibility and user experience. LCP of ${formatMetricValue(mobileLCP, 's')} needs attention.`;
    }
  };

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
          <StatCard value={desktopScore} label="Desktop Score" sub="Lighthouse" color={getScoreColor(desktopScore)} borderColor={getScoreColor(desktopScore)} />
          <StatCard value={mobileScore} label="Mobile Score" sub="Lighthouse" color={getScoreColor(mobileScore)} borderColor={getScoreColor(mobileScore)} />
          <StatCard value={formatMetricValue(mobileLCP, 's')} label="Mobile LCP" sub="Target < 2.5s" color={lcpColor} borderColor={lcpColor} />
          <StatCard value={formatMetricValue(mobileTBT, 'ms')} label="Mobile TBT" sub="Target < 200ms" color={getScoreColor(mobileTBT < 200 ? 90 : mobileTBT < 600 ? 75 : 50)} borderColor={getScoreColor(mobileTBT < 200 ? 90 : mobileTBT < 600 ? 75 : 50)} />
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
              {comparison.map(({ label, d, m }) => (
                <div key={label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', justifyContent: 'center', height: 130 }}>
                    <div style={{ width: 26, height: `${Math.min(d * 1.2, 120)}px`, background: '#4F6EF7', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 700, color: '#374151' }}>{d}</span>
                    </div>
                    <div style={{ width: 26, height: `${Math.min(m * 1.2, 120)}px`, background: '#00D4FF', borderRadius: '3px 3px 0 0', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', fontSize: 11, fontWeight: 700, color: '#374151' }}>{m}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
            <p style={{ fontSize: 14, color: '#374151' }}>Desktop: <strong style={{ color: '#4F6EF7' }}>{desktopScore}/100</strong></p>
            <p style={{ fontSize: 14, color: '#374151' }}>Mobile: <strong style={{ color: getScoreColor(mobileScore) }}>{mobileScore}/100</strong></p>
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
                  <td style={{ padding: '10px 14px', color: ratingColor(drat), fontWeight: 600 }}>{dval}</td>
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
          {getSEOImpact()}
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
