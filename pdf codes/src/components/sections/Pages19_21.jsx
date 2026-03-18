import React from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, InsightBox } from '../layout';

// ---- Page 19: AI Visibility Overview ----
export function AIVisibilityOverviewPage() {
  const concepts = [
    {
      tag: 'GEO', color: '#4F6EF7', bg: '#EEF2FF',
      title: 'Generative Engine Optimization',
      desc: 'Optimising content so AI models like ChatGPT and Gemini cite your pages when generating answers. Requires conversational structure, entity-rich writing, and direct answers in the first 60 words.'
    },
    {
      tag: 'AEO', color: '#00D4FF', bg: '#E0F9FF',
      title: 'Answer Engine Optimization',
      desc: 'Structuring content for direct answer extraction. FAQPage schema, Q&A formatting, and concise definitions are the primary signals for Perplexity and Google AI Overviews.'
    },
    {
      tag: 'AISEO', color: '#7B5CF0', bg: '#F3EEFF',
      title: 'AI Search Engine Optimization',
      desc: 'The unified discipline covering AI-powered search visibility — traditional SEO signals combined with Knowledge Graph authority, entity coverage, and LLM indexability.'
    },
  ];

  return (
    <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader page={19} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="14" title="AI Visibility Overview" subtitle="GEO · AEO · AISEO — AI search readiness" score={41} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={41} label="AI Readiness" sub="/100 overall" color="#EF4444" borderColor="#EF4444" />
          <StatCard value={36} label="GEO Score" sub="Generative Engine Opt" color="#4F6EF7" borderColor="#4F6EF7" />
          <StatCard value={38} label="AEO Score" sub="Answer Engine Opt" color="#00D4FF" borderColor="#00D4FF" />
          <StatCard value={41} label="AISEO Score" sub="AI SEO Composite" color="#7B5CF0" borderColor="#7B5CF0" />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Understanding AI Search Optimization</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {concepts.map(({ tag, color, bg, title, desc }) => (
            <div key={tag} style={{ display: 'flex', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ background: color, width: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 13, fontFamily: "'Syne', sans-serif" }}>{tag}</span>
              </div>
              <div style={{ padding: '16px 20px', background: bg }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 6, fontFamily: "'Syne', sans-serif" }}>{title}</div>
                <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        <InsightBox title="AI Readiness Gap Analysis">
          AI Readiness 41/100 — below industry average (~55). Missing schema (34% coverage) and no Knowledge Graph entity account for an estimated 23 improvement points — more than half the gap to a Good score.
        </InsightBox>
      </div>
      <PageFooter page={19} />
    </div>
  );
}

// ---- Page 21: LLM Citation Growth Forecast (insight-only page) ----
export function LLMCitationForecastPage() {
  return (
    <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader page={21} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <InsightBox title="LLM Citation Growth Forecast">
          Citation rate 12% vs industry avg 43%. Addressing schema, Knowledge Graph, and FAQ schema is projected to lift to 28-35% within 30 days — nearly a 3x improvement in AI-driven brand visibility.
        </InsightBox>
      </div>
      <PageFooter page={21} />
    </div>
  );
}
