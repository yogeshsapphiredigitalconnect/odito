import React from 'react';
import { PageHeader, PageFooter, SectionHeader, Badge } from '../layout';

const actions = [
  { num: 1, action: 'Add JSON-LD schema to 47 pages', impact: '+15 pts', effort: 'Medium', priority: 'P1' },
  { num: 2, action: 'Claim Knowledge Graph entity', impact: '+8 pts', effort: 'Hard', priority: 'P2' },
  { num: 3, action: 'Add FAQPage schema to 31 Q&A pages', impact: '+6 pts', effort: 'Easy', priority: 'P3' },
  { num: 4, action: 'Rewrite 10 intros for conversational GEO', impact: '+5 pts', effort: 'Medium', priority: 'P4' },
  { num: 5, action: 'Create E-E-A-T and AI Overviews hub pages', impact: '+4 pts', effort: 'Medium', priority: 'P5' },
  { num: 6, action: 'Add Organization schema with sameAs links', impact: '+3 pts', effort: 'Easy', priority: 'P6' },
];

const steps = [
  {
    num: 1, color: '#EF4444',
    title: 'Add JSON-LD Schema to 47 Pages',
    desc: 'Use Google\'s Structured Data Markup Helper to generate JSON-LD. Place in <head>. Validate with Rich Results Test. Article for blogs; WebPage + BreadcrumbList for landing pages.'
  },
  {
    num: 2, color: '#F59E0B',
    title: 'Claim Knowledge Graph Entity',
    desc: 'Verify Google Business Profile → ensure consistent NAP → add Organization schema with sameAs links → submit Knowledge Panel claim.'
  },
  {
    num: 3, color: '#F59E0B',
    title: 'Add FAQPage Schema to 31 Pages',
    desc: 'Wrap Q&A content in FAQPage JSON-LD. Each Question/Answer must match visible text exactly. Keep answers under 300 characters for optimal AI extraction.'
  },
];

const effortMap = { Easy: 'pass', Medium: 'warn', Hard: 'fail' };
const priorityColors = { P1: '#EF4444', P2: '#F59E0B', P3: '#F59E0B', P4: '#F59E0B', P5: '#F59E0B', P6: '#10B981' };

export default function AIOptimisationPage() {
  return (
    <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader page={26} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="18" title="AI Optimisation Recommendations" subtitle="Prioritised actions to improve AI search visibility" />

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>AI Action Plan</h3>

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 32 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['#', 'Recommended Action', 'Expected Impact', 'Effort', 'Priority'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actions.map(({ num, action, impact, effort, priority }, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 14px', color: '#4F6EF7', fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>{num}</td>
                  <td style={{ padding: '11px 14px', fontWeight: 500, color: '#111827' }}>{action}</td>
                  <td style={{ padding: '11px 14px', color: '#10B981', fontWeight: 700 }}>{impact}</td>
                  <td style={{ padding: '11px 14px' }}><Badge label={effort} type={effortMap[effort]} /></td>
                  <td style={{ padding: '11px 14px', color: priorityColors[priority], fontWeight: 700 }}>{priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Implementation Steps</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map(({ num, color, title, desc }) => (
            <div key={num} style={{ display: 'flex', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ background: color, width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, fontFamily: "'Syne', sans-serif" }}>{num}</span>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6, fontFamily: "'Syne', sans-serif" }}>{title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PageFooter page={26} />
    </div>
  );
}
