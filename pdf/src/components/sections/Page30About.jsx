import React from 'react';
import { PageHeader, PageFooter, SectionHeader } from '../layout';

const features = [
  { title: 'SEO Audit Engine', desc: 'Full technical and on-page crawl with issue prioritisation and fix recommendations', color: '#F59E0B' },
  { title: 'AI Visibility Suite', desc: 'GEO, AEO, AISEO scoring across ChatGPT, Perplexity, Gemini, and Claude', color: '#00D4FF' },
  { title: 'Knowledge Graph Audit', desc: 'Entity detection, KG status, and structured data coverage analysis', color: '#F59E0B' },
  { title: 'Core Web Vitals', desc: 'Desktop and mobile CWV with optimisation roadmap and impact forecasting', color: '#10B981' },
  { title: 'Keyword Intelligence', desc: 'Position tracking, opportunity analysis, and search intent classification', color: '#F59E0B' },
  { title: 'White-Label Reports', desc: 'Professional PDF reports with agency branding, fully customisable', color: '#4F6EF7' },
];

export default function AboutOditoPage() {
  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={30} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="22" title="About Odito AI" subtitle="AI-powered SEO & Visibility Platform for agencies" />

        <h2 style={{ fontSize: 28, fontWeight: 800, color: '#111827', marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>
          Built for Agencies and In-House Teams
        </h2>
        <div style={{ borderBottom: '2px solid #E5E7EB', marginBottom: 20 }} />

        <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 32, maxWidth: 700 }}>
          Odito AI is a next-generation SEO and AI Visibility audit platform designed for digital agencies and enterprise teams who need professional, white-label audit reports covering both traditional SEO and the emerging AI search landscape.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
          {features.map(({ title, desc, color }) => (
            <div key={title} style={{
              border: '1px solid #E5E7EB', borderRadius: 8, padding: '16px 20px',
              display: 'flex', gap: 14, alignItems: 'flex-start'
            }}>
              <span style={{ fontSize: 18, color, marginTop: 2 }}>✦</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4, fontFamily: "'Syne', sans-serif" }}>{title}</div>
                <div style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div style={{
          background: '#111827', borderRadius: 8, padding: '28px 32px',
          display: 'flex', justifyContent: 'flex-end', alignItems: 'center'
        }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Syne', sans-serif" }}>odi.to/ai</span>
        </div>

        <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #E5E7EB' }}>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>
            Odito AI Audit Report | March 13, 2025 | agencyplatform.com | 312 pages | Odito AI Engine v2
          </p>
        </div>
      </div>
      <PageFooter page={30} />
    </div>
  );
}
