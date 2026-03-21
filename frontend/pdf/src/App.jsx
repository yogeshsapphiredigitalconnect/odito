import React, { useState, useEffect } from 'react';
import './styles/pdf.css';

import CoverPage from './components/sections/Page01Cover';
import SectionDivider from './components/sections/SectionDivider';
import ExecutiveSummaryPage from './components/sections/Page03ExecutiveSummary';
import KeyStrengthsPage from './components/sections/Page04KeyStrengths';
import PriorityRoadmapPage from './components/sections/Page05Roadmap';
import SEOHealthOverviewPage from './components/sections/Page06SEOHealth';
import OnPageSEOPage from './components/sections/Page08OnPageSEO';
import { StructuredDataPage, TechnicalSEOPage, CrawlabilityPage } from './components/sections/Pages09_10_11';
import { CoreWebVitalsPage, PerformanceOpportunitiesPage } from './components/sections/Pages13_14';
import { KeywordRankingPage, KeywordOpportunityPage } from './components/sections/Pages16_17';
import { AIVisibilityOverviewPage, LLMCitationForecastPage } from './components/sections/Pages19_21';
import { LLMVisibilityPage, AIContentReadinessPage, AIContentStrategyPage } from './components/sections/Pages20_22_23';
import KnowledgeGraphPage from './components/sections/Page24KnowledgeGraph';
import AIOptimisationPage from './components/sections/Page26AIOptimisation';
import AIGrowthForecastPage from './components/sections/Page27GrowthForecast';
import ActionPlanPage from './components/sections/Page28ActionPlan';
import AuditMethodologyPage from './components/sections/Page29Methodology';
import AboutOditoPage from './components/sections/Page30About';

export default function App() {
  const [current, setCurrent] = useState(0);
  const [projectId, setProjectId] = useState(null);

  // Extract projectId from URL or use default
  useEffect(() => {
    // Try to get projectId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlProjectId = urlParams.get('projectId');
    
    // Try to get from filename (fallback)
    const filename = window.location.pathname.split('/').pop();
    const filenameMatch = filename.match(/([a-f0-9]{24})/);
    
    const extractedProjectId = urlProjectId || (filenameMatch ? filenameMatch[1] : null);
    
    if (extractedProjectId) {
      setProjectId(extractedProjectId);
    } else {
      // Default project ID for testing
      setProjectId('69bd09a878159772d6a2e4de');
    }
  }, []);

  const pages = [
    { id: 'p01', label: 'p.1 — Cover', component: <CoverPage projectId={projectId} /> },
  { id: 'p02', label: 'p.2 — Section 01: Executive Summary', component: <SectionDivider pageNum={2} sectionNum={1} title="Executive Summary" subtitle="Scores, issue overview and AI-generated analysis" /> },
  { id: 'p03', label: 'p.3 — Executive Summary', component: <ExecutiveSummaryPage /> },
  { id: 'p04', label: 'p.4 — Key Strengths vs Issues', component: <KeyStrengthsPage /> },
  { id: 'p05', label: 'p.5 — Priority Fix Roadmap', component: <PriorityRoadmapPage /> },
  { id: 'p06', label: 'p.6 — SEO Health Overview', component: <SEOHealthOverviewPage projectId={projectId} /> },
  { id: 'p07', label: 'p.7 — Section 02: SEO Audit', component: <SectionDivider pageNum={7} sectionNum={2} title="SEO Audit" subtitle="On-page, schema, technical and crawlability" /> },
  { id: 'p08', label: 'p.8 — On-Page SEO Audit', component: <OnPageSEOPage /> },
  { id: 'p09', label: 'p.9 — Structured Data Analysis', component: <StructuredDataPage /> },
  { id: 'p10', label: 'p.10 — Technical SEO Health', component: <TechnicalSEOPage /> },
  { id: 'p11', label: 'p.11 — Crawlability Analysis', component: <CrawlabilityPage /> },
  { id: 'p12', label: 'p.12 — Section 03: Performance Analysis', component: <SectionDivider pageNum={12} sectionNum={3} title="Performance Analysis" subtitle="Core Web Vitals, Lighthouse and optimisation roadmap" /> },
  { id: 'p13', label: 'p.13 — Core Web Vitals', component: <CoreWebVitalsPage /> },
  { id: 'p14', label: 'p.14 — Performance Opportunities', component: <PerformanceOpportunitiesPage /> },
  { id: 'p15', label: 'p.15 — Section 04: Keyword Analysis', component: <SectionDivider pageNum={15} sectionNum={4} title="Keyword Analysis" subtitle="Rankings, positions and near-page-1 opportunities" /> },
  { id: 'p16', label: 'p.16 — Keyword Ranking Analysis', component: <KeywordRankingPage /> },
  { id: 'p17', label: 'p.17 — Keyword Opportunity Analysis', component: <KeywordOpportunityPage /> },
  { id: 'p18', label: 'p.18 — Section 05: AI Visibility', component: <SectionDivider pageNum={18} sectionNum={5} title="AI Visibility" subtitle="GEO, AEO, AISEO — visibility across AI search platforms" /> },
  { id: 'p19', label: 'p.19 — AI Visibility Overview', component: <AIVisibilityOverviewPage /> },
  { id: 'p20', label: 'p.20 — LLM Visibility Analysis', component: <LLMVisibilityPage /> },
  { id: 'p21', label: 'p.21 — LLM Citation Growth Forecast', component: <LLMCitationForecastPage /> },
  { id: 'p22', label: 'p.22 — AI Content Readiness', component: <AIContentReadinessPage /> },
  { id: 'p23', label: 'p.23 — AI Content Strategy', component: <AIContentStrategyPage /> },
  { id: 'p24', label: 'p.24 — Knowledge Graph & Entity Analysis', component: <KnowledgeGraphPage /> },
  { id: 'p25', label: 'p.25 — Section 06: Action Plan & Forecast', component: <SectionDivider pageNum={25} sectionNum={6} title="Action Plan & Forecast" subtitle="30-day roadmap, growth projection and methodology" /> },
  { id: 'p26', label: 'p.26 — AI Optimisation Recommendations', component: <AIOptimisationPage /> },
  { id: 'p27', label: 'p.27 — AI Growth Forecast', component: <AIGrowthForecastPage /> },
  { id: 'p28', label: 'p.28 — 30-Day Action Plan', component: <ActionPlanPage /> },
  { id: 'p29', label: 'p.29 — Audit Methodology', component: <AuditMethodologyPage /> },
  { id: 'p30', label: 'p.30 — About Odito AI', component: <AboutOditoPage /> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#F1F5F9' }}>
      <div style={{
        background: '#111827', color: '#fff', padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0', marginRight: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#4F6EF7' }} />
          <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "'Syne', sans-serif" }}>Odito AI Report</span>
        </div>
        <select value={current} onChange={e => setCurrent(Number(e.target.value))}
          style={{ background: '#1F2937', color: '#fff', border: '1px solid #374151', borderRadius: 6, padding: '6px 12px', fontSize: 13, cursor: 'pointer', maxWidth: 340 }}>
          {pages.map((p, i) => <option key={p.id} value={i}>{p.label}</option>)}
        </select>
        <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}
          style={{ background: 'transparent', border: '1px solid #374151', color: '#9CA3AF', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>← Prev</button>
        <button onClick={() => setCurrent(c => Math.min(pages.length - 1, c + 1))} disabled={current === pages.length - 1}
          style={{ background: '#4F6EF7', border: 'none', color: '#fff', padding: '6px 14px', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Next →</button>
        <span style={{ color: '#6B7280', fontSize: 13, marginLeft: 'auto' }}>{current + 1} / {pages.length} pages</span>
      </div>
      <div style={{ padding: '40px 24px', display: 'flex', justifyContent: 'center' }}>
        {pages[current].component}
      </div>
    </div>
  );
}
