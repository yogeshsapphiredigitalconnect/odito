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

// ---- Page 19: AI Visibility Overview ----
export function AIVisibilityOverviewPage({ projectId }) {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  useEffect(() => {
    const fetchPageData = async () => {
      if (!projectId) {
        setError('Project ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Page19 - Fetching data for projectId:', projectId);
        
        const response = await getPDFPageData(projectId, '19');
        
        if (response.success && response.data) {
          console.log('Page19 - Full Data received:', response.data);
          console.log('Page19 - AI Readiness:', response.data.aiReadiness);
          console.log('Page19 - GEO Score:', response.data.geoScore);
          console.log('Page19 - AEO Score:', response.data.aeoScore);
          console.log('Page19 - Voice Intent:', response.data.voiceIntent);
          console.log('Page19 - AI Citation:', response.data.aiCitation);
          console.log('Page19 - AI Topical Authority:', response.data.aiTopicalAuthority);
          console.log('Page19 - Top Score (ai_visibility.score):', response.data.topScore);
          console.log('Page19 - Overall Score for header:', response.data.topScore);
          setPageData(response.data);
        } else {
          console.error('Page19 - Invalid response structure:', response);
          setError('Invalid data structure received');
        }
      } catch (err) {
        console.error('Page19 - Error fetching data:', err);
        setError(err.message || 'Failed to fetch AI visibility data');
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [projectId]);

  // Get score for color coding
  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981'; // green
    if (score >= 60) return '#F59E0B'; // yellow
    return '#EF4444'; // red
  };

  // Get overall score for section header - use ai_visibility.score
  const overallScore = pageData ? pageData.topScore : 0;

  if (loading) {
    return (
      <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
        <PageHeader page={19} />
        <div style={{ padding: '32px 40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: '#6B7280', marginBottom: 8 }}>Loading AI Visibility data...</div>
          </div>
        </div>
        <PageFooter page={19} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
        <PageHeader page={19} />
        <div style={{ padding: '32px 40px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, color: '#EF4444', marginBottom: 8 }}>Error loading data</div>
            <div style={{ fontSize: 14, color: '#6B7280' }}>{error}</div>
          </div>
        </div>
        <PageFooter page={19} />
      </div>
    );
  }

  return (
    <div style={{ width: 960, minHeight: 1280, background: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)', margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <PageHeader page={19} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="14" title="AI Visibility Overview" subtitle="GEO · AEO · AISEO — AI search readiness" score={overallScore} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard 
            value={pageData.aiReadiness} 
            label="AI Readiness" 
            sub="/100 overall" 
            color={getScoreColor(pageData.aiReadiness)} 
            borderColor={getScoreColor(pageData.aiReadiness)} 
          />
          <StatCard 
            value={pageData.geoScore} 
            label="GEO Score" 
            sub="Generative Engine Opt" 
            color="#4F6EF7" 
            borderColor="#4F6EF7" 
          />
          <StatCard 
            value={pageData.aeoScore} 
            label="AEO Score" 
            sub="Answer Engine Opt" 
            color="#00D4FF" 
            borderColor="#00D4FF" 
          />
          <StatCard 
            value={pageData.voiceIntent} 
            label="Voice Intent" 
            sub="Voice Search Ready" 
            color="#8B5CF6" 
            borderColor="#8B5CF6" 
          />
        </div>

        {/* Second row - Additional AI Metrics - FIXED LAYOUT */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 24, 
          marginBottom: 28 
        }}>
          <div style={{ width: '220px' }}>
            <StatCard 
              value={pageData.aiCitation} 
              label="AI Citation" 
              sub="Citation Probability" 
              color="#3B82F6" 
              borderColor="#3B82F6" 
            />
          </div>
          <div style={{ width: '220px' }}>
            <StatCard 
              value={pageData.aiTopicalAuthority} 
              label="AI Topical Authority" 
              sub="Topical Authority Score" 
              color="#8B5CF6" 
              borderColor="#8B5CF6" 
            />
          </div>
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
          {pageData.summary}
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
