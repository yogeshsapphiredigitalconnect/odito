'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, InsightBox } from '../layout';
import API_BASE_URL from "@/lib/apiConfig";

// Simple API helper function for PDF app
const getPDFPageData = async (projectId, page) => {
  const token = localStorage.getItem('token');
  
  console.log('📄 PDF API Request:', { 
    endpoint: `/pdf/${projectId}/page${page}`, 
    projectId, 
    page,
    hasToken: !!token 
  });
  
  const response = await fetch(`${API_BASE_URL}/pdf/${projectId}/page${page}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const data = await response.json();
  console.log('✅ PDF API Response:', { 
    status: response.status, 
    success: data.success,
    hasData: !!data.data 
  });
  
  return data;
};

// ---- Page 20: LLM Visibility Analysis ----
export function LLMVisibilityPage() {
  const platforms = [
    { name: 'ChatGPT', pct: 18, color: '#10B981', gap: '25% gap' },
    { name: 'Perplexity', pct: 12, color: '#10B981', gap: '31% gap' },
    { name: 'Gemini', pct: 24, color: '#4F6EF7', gap: '19% gap' },
    { name: 'Claude', pct: 8, color: '#7B5CF0', gap: '35% gap' },
  ];

  const signals = [
    ['Structured Data', '34% coverage', '+15-20%', 'Add JSON-LD to all pages'],
    ['Knowledge Graph', 'Not Claimed', '+8-12%', 'Claim via Google GBP'],
    ['FAQ Schema', '0% coverage', '+6-10%', 'Add FAQPage JSON-LD'],
    ['Topical Authority', 'Partial', '+4-8%', 'Create entity hub pages'],
    ['Conversational Content', '31% score', '+3-5%', 'Rewrite intros for GEO'],
  ];

  const sigStatusColor = (s) => s.includes('Not') || s.includes('0%') ? '#EF4444' : s === 'Partial' ? '#F59E0B' : '#F97316';

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={20} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="15" title="LLM Visibility Analysis" subtitle="Brand citation rates across AI platforms" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value="12%" label="Citation Rate" sub="across all LLMs" color="#EF4444" borderColor="#EF4444" />
          <StatCard value="43%" label="Industry Average" sub="benchmark" color="#4F6EF7" borderColor="#4F6EF7" />
          <StatCard value="31%" label="Gap to Close" sub="vs benchmark" color="#F59E0B" borderColor="#F59E0B" />
          <StatCard value={4} label="Platforms" sub="ChatGPT · Perplexity · Gemini · Claude" color="#60A5FA" borderColor="#60A5FA" />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Citation Rate by Platform</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

        <div style={{ marginBottom: 28 }}>
          {platforms.map(({ name, pct, color, gap }) => (
            <div key={name} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{name}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#4F6EF7' }}>{pct}%</span>
              </div>
              <div style={{ position: 'relative', height: 12, background: '#F3F4F6', borderRadius: 6 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6 }} />
                <div style={{
                  position: 'absolute', left: '43%', top: -4, width: 2, height: 20,
                  background: '#374151', borderRadius: 1
                }} />
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>
                Industry avg: 43% <span style={{ color: '#EF4444' }}>■ {gap}</span>
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Citation Signal Analysis</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 16 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Citation Signal', 'Status', 'Impact on Rate', 'Fix'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {signals.map(([signal, status, impact, fix], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111827' }}>{signal}</td>
                  <td style={{ padding: '11px 14px', color: sigStatusColor(status), fontWeight: 600 }}>{status}</td>
                  <td style={{ padding: '11px 14px', color: '#10B981', fontWeight: 600 }}>{impact}</td>
                  <td style={{ padding: '11px 14px', color: '#6B7280' }}>{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PageFooter page={20} />
    </div>
  );
}

// ---- Page 22: AI Content Readiness ----
export function AIContentReadinessPage({ projectId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPage22Data = async () => {
      if (!projectId) {
        console.error('AIContentReadinessPage: No projectId provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('AIContentReadinessPage: Fetching data for projectId:', projectId);
        
        const response = await getPDFPageData(projectId, '22');
        
        if (response.success && response.data) {
          console.log('AIContentReadinessPage: Data received:', response.data);
          setData(response.data);
        } else {
          console.error('AIContentReadinessPage: Invalid response structure:', response);
          throw new Error(response.error?.message || 'Invalid data format received');
        }
        
      } catch (err) {
        console.error('AIContentReadinessPage: Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPage22Data();
  }, [projectId]);

  // Show loading state
  if (loading) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: '#fff', display: 'flex',
        flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
        margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
      }}>
        <PageHeader page={22} />
        <div style={{ padding: '32px 40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#6B7280' }}>
            <div>Loading AI Content Readiness data...</div>
          </div>
        </div>
        <PageFooter page={22} />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: '#fff', display: 'flex',
        flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
        margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
      }}>
        <PageHeader page={22} />
        <div style={{ padding: '32px 40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#EF4444' }}>
            <div>Error loading data: {error}</div>
          </div>
        </div>
        <PageFooter page={22} />
      </div>
    );
  }

  // Transform API data to component format (IDENTICAL to Dashboard)
  const signals = [
    { label: 'Schema Coverage', pct: data?.signals?.schemaCoverage || 0, color: '#F59E0B', sub: `${data?.signals?.schemaCoverage || 0}% — Schema markup coverage` },
    { label: 'FAQ Schema Optimization', pct: data?.signals?.faqOptimization || 0, color: '#00D4FF', sub: `${data?.signals?.faqOptimization || 0}% — FAQ schema implementation` },
    { label: 'Conversational Content', pct: data?.signals?.conversationalScore || 0, color: '#4F6EF7', sub: `${data?.signals?.conversationalScore || 0}% — AI-friendly content score` },
    { label: 'AI Snippet Probability', pct: data?.signals?.aiSnippetProbability || 0, color: '#10B981', sub: `${data?.signals?.aiSnippetProbability || 0}% — Snippet extraction likelihood` },
    { label: 'AI Citation Rate', pct: data?.signals?.aiCitationRate || 0, color: '#10B981', sub: `${data?.signals?.aiCitationRate || 0}% — AI platform citation rate` },
    { label: 'Knowledge Graph', pct: data?.signals?.knowledgeGraph || 0, color: '#7B5CF0', sub: `${data?.signals?.knowledgeGraph || 0}% — Named entity coverage` },
  ];

  const checklist = data?.checklist?.map(item => [
    item.title || 'Unknown Issue',
    item.status || 'info',
    item.recommendation || 'No recommendation available'
  ]) || [];

  const statusColor = (s) => {
    if (s === 'critical' || s.startsWith('Failing')) return '#EF4444';
    if (s === 'warning' || s.startsWith('Partial')) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={22} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="16" title="AI Content Readiness" subtitle="Conversational content, FAQ and snippet optimization" />

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>AI Content Signal Scores</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

        <div style={{ marginBottom: 28 }}>
          {signals.map(({ label, pct, color, sub }) => (
            <div key={label} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#374151' }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#4F6EF7' }}>{pct}%</span>
              </div>
              <div style={{ position: 'relative', height: 12, background: '#F3F4F6', borderRadius: 6 }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 6 }} />
                <div style={{
                  position: 'absolute', left: '50%', top: -4, width: 2, height: 20,
                  background: '#374151', borderRadius: 1
                }} />
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3 }}>{sub}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Content Optimization Checklist</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 16 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Content Signal', 'Status', 'Recommendation'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checklist.map(([signal, status, rec], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{signal}</td>
                  <td style={{ padding: '10px 14px', color: statusColor(status), fontWeight: 600 }}>{status}</td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>{rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <PageFooter page={22} />
    </div>
  );
}

// ---- Page 23: AI Content Strategy (insight only page) ----
export function AIContentStrategyPage() {
  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={23} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <InsightBox title="AI Content Strategy">
          Rewriting 10 key page intros to lead with a direct answer is estimated to increase AI snippet probability from 29% to 45-50% on those pages. AI models weight the first 60 words most heavily for answer extraction.
        </InsightBox>
      </div>
      <PageFooter page={23} />
    </div>
  );
}
