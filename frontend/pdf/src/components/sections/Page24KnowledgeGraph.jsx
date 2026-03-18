import React from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, InsightBox } from '../layout';

export default function KnowledgeGraphPage() {
  const entities = [
    { name: 'SEO Audit', status: 'Linked', pages: 3, action: 'No action needed' },
    { name: 'Technical SEO', status: 'Linked', pages: 5, action: 'No action needed' },
    { name: 'Core Web Vitals', status: 'Linked', pages: 2, action: 'No action needed' },
    { name: 'E-E-A-T', status: 'Missing', pages: 0, action: 'Create hub page + schema' },
    { name: 'AI Overviews', status: 'Missing', pages: 0, action: 'Create hub page + schema' },
    { name: 'GEO', status: 'Missing', pages: 0, action: 'Create hub page + schema' },
    { name: 'Knowledge Graph', status: 'Partial', pages: 1, action: 'Add schema + content' },
    { name: 'AEO', status: 'Missing', pages: 0, action: 'Create hub page + schema' },
  ];

  const statusStyle = (s) => {
    if (s === 'Linked') return { color: '#10B981', bg: '#D1FAE5', label: '✓ Linked' };
    if (s === 'Missing') return { color: '#EF4444', bg: '#FEE2E2', label: '✗ Missing' };
    return { color: '#F59E0B', bg: '#FEF3C7', label: '■ Partial' };
  };

  return (
    <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader page={24} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="17" title="Knowledge Graph & Entity Analysis" subtitle="Brand entity presence and coverage" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderTop: '3px solid #EF4444', borderRadius: 8, padding: '20px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#EF4444', fontFamily: "'Syne', sans-serif" }}>Not Claimed</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 6 }}>KG Status</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>Brand entity</div>
          </div>
          <StatCard value={3} label="Entities Linked" sub="of 8" color="#10B981" borderColor="#10B981" />
          <StatCard value={4} label="Entities Missing" sub="High priority" color="#EF4444" borderColor="#EF4444" />
          <StatCard value={1} label="Partial Coverage" sub="Need improvement" color="#F59E0B" borderColor="#F59E0B" />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Entity Coverage Map</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 16 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Entity', 'Status', 'Pages', 'Action Required'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entities.map(({ name, status, pages, action }, i) => {
                const s = statusStyle(status);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111827' }}>{name}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ background: s.bg, color: s.color, fontWeight: 700, fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#374151', textAlign: 'center' }}>{pages}</td>
                    <td style={{ padding: '11px 14px', color: '#6B7280' }}>{action}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {[
            { title: 'What is a Knowledge Graph Entity?', text: "Google's KG is a database of facts about real-world entities. A verified brand entity gives AI models an authoritative source of facts about your business." },
            { title: 'Impact Without a KG Entity', text: 'Without a KG anchor, AI models may fabricate or omit facts about your brand in generated answers.' },
            { title: 'How to Claim Your Entity', text: 'Verify Google Business Profile → add Organization schema with sameAs to LinkedIn/Twitter/Crunchbase → ensure NAP consistency.' },
          ].map(({ title, text }) => (
            <div key={title}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4, fontFamily: "'Syne', sans-serif" }}>{title}</div>
              <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{text}</div>
            </div>
          ))}
        </div>

        <InsightBox title="Knowledge Graph Impact">
          Claiming the KG entity adds +8 AI Readiness points and improves brand citation accuracy across ChatGPT, Gemini, and Perplexity. Without it, AI-generated answers about your brand may be inaccurate.
        </InsightBox>
      </div>
      <PageFooter page={24} />
    </div>
  );
}
