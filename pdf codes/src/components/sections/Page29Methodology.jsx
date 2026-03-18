import React from 'react';
import { PageHeader, PageFooter, SectionHeader } from '../layout';

const steps = [
  { num: 1, color: '#4F6EF7', title: 'Crawler Engine', desc: 'Distributed crawler scans up to 10,000 pages, extracting on-page signals, HTTP headers, redirects, canonical tags, robots directives, and structured data from every URL.' },
  { num: 2, color: '#00D4FF', title: 'AI Entity Detection', desc: "Entity graph maps content against Google's Knowledge Graph and Wikidata, identifying covered, partially covered, and missing entities." },
  { num: 3, color: '#F59E0B', title: 'Structured Data Validation', desc: 'All JSON-LD, Microdata, and RDFa validated against Schema.org specs and Google Rich Results requirements.' },
  { num: 4, color: '#10B981', title: 'LLM Citation Analysis', desc: 'Odito AI probes ChatGPT, Perplexity, Gemini, and Claude with domain-related queries to measure actual brand citation rate.' },
  { num: 5, color: '#F97316', title: 'Core Web Vitals', desc: 'PageSpeed Insights API data collected for all key pages on desktop and mobile, mapped against Good/Needs Work/Poor thresholds.' },
  { num: 6, color: '#111827', title: 'Score Calculation', desc: 'Weighted model: Technical (25%), On-Page (25%), AI Visibility (30%), Performance (10%), Authority (10%).' },
];

export default function AuditMethodologyPage() {
  return (
    <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader page={29} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="21" title="Audit Methodology" subtitle="How Odito AI performs SEO and AI Visibility audits" />

        <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 28, lineHeight: 1.7 }}>
          Odito AI uses a multi-layer analysis engine combining traditional SEO crawling, AI entity detection, structured data validation, and LLM citation measurement to produce a 360-degree audit.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {steps.map(({ num, color, title, desc }) => (
            <div key={num} style={{ display: 'flex', borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <div style={{ background: color, width: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: "'Syne', sans-serif" }}>{num}</span>
              </div>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 5, fontFamily: "'Syne', sans-serif" }}>{title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.6 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <PageFooter page={29} />
    </div>
  );
}
