import React from 'react';
import { PageHeader, PageFooter, SectionHeader, Badge, InsightBox } from '../layout';

const rows = [
  [1, 'Remove noindex from 5 key pages', 'High', 'Easy', '+8 pts', 'Day 1'],
  [2, 'Add FAQ schema to top 10 blog posts', 'High', 'Easy', '+6 pts', 'Day 1-2'],
  [3, 'Fix 14 broken internal links', 'Medium', 'Easy', '+4 pts', 'Day 1-2'],
  [4, 'Add Article/WebPage schema to 47 pages', 'High', 'Medium', '+15 pts', 'Day 3-7'],
  [5, 'Rewrite 10 page intros for GEO', 'Medium', 'Medium', '+5 pts', 'Day 7-14'],
  [6, 'Fix 18 missing meta descriptions', 'Medium', 'Easy', '+4 pts', 'Day 7-10'],
  [7, 'Add ALT text to 31 images', 'Low', 'Easy', '+2 pts', 'Day 7-10'],
  [8, 'Claim Knowledge Graph entity', 'High', 'Hard', '+8 pts', 'Day 14-21'],
  [9, 'Optimise mobile LCP to under 2.5s', 'High', 'Hard', '+10 pts', 'Day 14-30'],
  [10, 'Create E-E-A-T and GEO hub pages', 'Medium', 'Hard', '+5 pts', 'Day 21-30'],
];

const impactMap = { High: 'critical', Medium: 'medium', Low: 'low' };
const effortMap = { Easy: 'pass', Medium: 'warn', Hard: 'fail' };
const gainColors = { '+8 pts': '#10B981', '+6 pts': '#10B981', '+4 pts': '#10B981', '+15 pts': '#10B981', '+5 pts': '#10B981', '+2 pts': '#10B981', '+10 pts': '#10B981' };

export default function PriorityRoadmapPage() {
  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={5} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="04" title="Priority Fix Roadmap" subtitle="Action plan ordered by impact and effort" />

        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20, lineHeight: 1.6 }}>
          Execute items in order for maximum cumulative score improvement. Easy items take hours; Hard items may need a developer.
        </p>

        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #E5E7EB' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['#', 'Issue', 'Impact', 'Effort', 'Est. Gain', 'Timeline'].map((h, i) => (
                  <th key={i} style={{
                    padding: '11px 14px', color: '#fff', fontWeight: 600,
                    textAlign: 'left', borderRight: i < 5 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([num, issue, impact, effort, gain, timeline], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 14px', color: '#4F6EF7', fontWeight: 700 }}>{num}</td>
                  <td style={{ padding: '11px 14px', color: '#374151', fontWeight: 500 }}>{issue}</td>
                  <td style={{ padding: '11px 14px' }}><Badge label={impact} type={impactMap[impact]} /></td>
                  <td style={{ padding: '11px 14px' }}><Badge label={effort} type={effortMap[effort]} /></td>
                  <td style={{ padding: '11px 14px', color: '#10B981', fontWeight: 700 }}>{gain}</td>
                  <td style={{ padding: '11px 14px', color: '#4F6EF7' }}>{timeline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Roadmap Impact Forecast">
          Following this roadmap is projected to lift overall score 58→82, SEO 67→84, and AI Visibility 41→68 within 30 days. Items 1-3 take under half a day and deliver +18 points.
        </InsightBox>
      </div>
      <PageFooter page={5} />
    </div>
  );
}
