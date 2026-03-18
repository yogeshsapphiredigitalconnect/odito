import React from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, Badge, InsightBox } from '../layout';

const issues = [
  [1, 'Schema Markup Missing', 'CRITICAL', 47, 'High', 'Add JSON-LD per page type'],
  [2, 'Meta Descriptions Missing', 'CRITICAL', 18, 'High', 'Write unique 150-160 char descriptions'],
  [3, 'H1 Tags Missing', 'CRITICAL', 12, 'High', 'Add one H1 per page with target keyword'],
  [4, 'Images Missing ALT Text', 'CRITICAL', 31, 'Medium', 'Add descriptive ALT text to all images'],
  [5, 'FAQ Schema Missing', 'HIGH', 31, 'High', 'Add FAQPage JSON-LD schema'],
  [6, 'Broken Internal Links', 'HIGH', 14, 'Medium', 'Fix or 301-redirect broken links'],
  [7, 'Duplicate Title Tags', 'HIGH', 7, 'Medium', 'Make every page title unique'],
  [8, 'Title Tags Too Long', 'MEDIUM', 9, 'Low', 'Trim to 50-60 characters'],
  [9, 'Thin Content Pages', 'MEDIUM', 14, 'Medium', 'Expand to 600+ words'],
  [10, 'Open Graph Tags Missing', 'LOW', 22, 'Low', 'Add og:title, description, image'],
];

const sevMap = { CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low' };
const impMap = { High: 'critical', Medium: 'medium', Low: 'low' };

export default function OnPageSEOPage() {
  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={8} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="06" title="On-Page SEO Audit" subtitle="10 issues across 312 pages" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={4} label="Critical" sub="Immediate action" color="#EF4444" borderColor="#EF4444" />
          <StatCard value={3} label="High" sub="Fix within 7 days" color="#F59E0B" borderColor="#F59E0B" />
          <StatCard value={2} label="Medium" sub="Fix in 30 days" color="#CA8A04" borderColor="#CA8A04" />
          <StatCard value={1} label="Low" sub="Opportunities" color="#4F6EF7" borderColor="#4F6EF7" />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Issue Breakdown</h3>

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['#', 'Issue', 'Severity', 'Pages', 'Impact', 'Recommended Fix'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issues.map(([num, issue, sev, pages, impact, fix], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', color: '#9CA3AF' }}>{num}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{issue}</td>
                  <td style={{ padding: '10px 14px' }}><Badge label={sev} type={sevMap[sev]} /></td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{pages}</td>
                  <td style={{ padding: '10px 14px' }}><Badge label={impact} type={impMap[impact]} /></td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="On-Page Priority Recommendation">
          Odito AI recommends prioritising JSON-LD structured data on all 47 affected pages. This enables rich results in Google, increases AI snippet probability, and improves LLM citation rate — all from a single code change per page.
        </InsightBox>
      </div>
      <PageFooter page={8} />
    </div>
  );
}
