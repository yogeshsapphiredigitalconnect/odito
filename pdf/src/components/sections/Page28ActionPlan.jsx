import React from 'react';
import { PageHeader, PageFooter, SectionHeader, InsightBox } from '../layout';

const weeks = [
  {
    num: 1, title: 'Technical Quick Wins', days: 'Days 1-7', color: '#EF4444',
    tasks: [
      'Remove noindex from 5 revenue pages (30 min)',
      'Fix 14 broken internal links (1 hour)',
      'Add FAQ schema to top 10 blog posts (2-3 hrs)',
      'Fix 18 missing meta descriptions on key pages',
    ]
  },
  {
    num: 2, title: 'Schema Rollout', days: 'Days 8-14', color: '#7B5CF0',
    tasks: [
      'Add Article JSON-LD to all blog posts (1 day)',
      'Add WebPage schema to all landing pages',
      'Add Organization schema with sameAs links',
      'Validate all schema via Google Rich Results Test',
    ]
  },
  {
    num: 3, title: 'Content Optimization', days: 'Days 15-21', color: '#00D4FF',
    tasks: [
      'Rewrite 10 key page intros for GEO optimization',
      'Add ALT text to all 31 images',
      'Enable image compression (480ms saving)',
      'Enable gzip/br text compression (320ms saving)',
    ]
  },
  {
    num: 4, title: 'AI Entity & Authority', days: 'Days 22-30', color: '#F59E0B',
    tasks: [
      'Claim Google Knowledge Graph entity',
      'Create E-E-A-T hub page with Article schema',
      'Set up / verify Google Business Profile',
      'Begin mobile LCP optimization (target < 2.5s)',
    ]
  },
];

export default function ActionPlanPage() {
  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={28} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="20" title="30-Day Action Plan" subtitle="Structured implementation roadmap" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {weeks.map(({ num, title, days, color, tasks }) => (
            <div key={num} style={{ border: `1px solid ${color}30`, borderRadius: 8, overflow: 'hidden' }}>
              <div style={{
                background: color, display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', padding: '12px 20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 700, opacity: 0.8 }}>Week {num}</span>
                  <span style={{ color: '#fff', fontSize: 16, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{title}</span>
                </div>
                <span style={{ color: '#fff', fontSize: 13, opacity: 0.85 }}>{days}</span>
              </div>
              <div>
                {tasks.map((task, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px',
                    borderBottom: i < tasks.length - 1 ? '1px solid #F3F4F6' : 'none',
                    background: '#fff'
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#374151' }}>{task}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <InsightBox title="30-Day Plan Impact Forecast">
          Week 1 quick wins deliver +18 score points within 7 days. By end of Week 2 the schema rollout adds +15 AI Visibility points. The full 30-day plan targets overall score 76+, up from 58.
        </InsightBox>
      </div>
      <PageFooter page={28} />
    </div>
  );
}
