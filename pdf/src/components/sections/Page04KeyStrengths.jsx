import React from 'react';
import { PageHeader, PageFooter, SectionHeader, InsightBox } from '../layout';

export default function KeyStrengthsPage() {
  const strengths = [
    'Valid SSL — HTTPS enforced site-wide via 301',
    'XML Sitemap with 298 URLs correctly declared',
    'Mobile-responsive with proper viewport configuration',
    'Clean URL architecture and logical hierarchy',
    'Core landing pages correctly indexed by Google',
  ];
  const issues = [
    '47 pages missing JSON-LD structured data markup',
    'Knowledge Graph entity not claimed or verified',
    'Mobile LCP 3.2s exceeds Google\'s 2.5s Good threshold',
    '31 images missing ALT text — accessibility & SEO risk',
    '5 key revenue pages blocked by noindex tags',
  ];

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={4} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="03" title="Key Strengths vs Issues" subtitle="What's working and what needs fixing" />

        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.6 }}>
          The Odito AI engine evaluated all SEO and AI visibility signals. Here is a summary of the site's strongest points and most critical areas for improvement.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28 }}>
          {/* Strengths */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14, fontFamily: "'Syne', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10B981' }}>✓</span> Key Strengths
            </h3>
            <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
              {strengths.map((s, i) => (
                <div key={i} style={{
                  padding: '12px 16px', borderBottom: i < strengths.length - 1 ? '1px solid #F3F4F6' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fff'
                }}>
                  <span style={{ color: '#10B981', fontWeight: 700, fontSize: 14, marginTop: 1 }}>✓</span>
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Issues */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 14, fontFamily: "'Syne', sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#EF4444' }}>✗</span> Issues to Address
            </h3>
            <div style={{ border: '1px solid #FEE2E2', borderRadius: 8, overflow: 'hidden', background: '#FFF5F5' }}>
              {issues.map((s, i) => (
                <div key={i} style={{
                  padding: '12px 16px', borderBottom: i < issues.length - 1 ? '1px solid #FEE2E2' : 'none',
                  display: 'flex', alignItems: 'flex-start', gap: 10
                }}>
                  <span style={{ color: '#EF4444', fontWeight: 700, fontSize: 14, marginTop: 1 }}>✗</span>
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <InsightBox title="Priority Assessment">
          Odito AI identifies the noindex issue on 5 revenue pages as the fastest win — a 30-minute fix restoring Google ranking access. Missing schema on 47 pages is the most impactful structural improvement, delivering +15 AI Visibility points once implemented.
        </InsightBox>
      </div>
      <PageFooter page={4} />
    </div>
  );
}
