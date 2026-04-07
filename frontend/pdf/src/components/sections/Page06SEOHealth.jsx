'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, PageFooter, SectionHeader, InsightBox } from '../layout';
import API_BASE_URL from "@/lib/apiConfig";

export default function Page06SEOHealth({ projectId }) {
  const [coverData, setCoverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[SEO HEALTH PAGE] useEffect triggered with projectId:', projectId);
    
    if (!projectId) {
      console.error('[SEO HEALTH PAGE] Project ID is missing or undefined');
      setError('Project ID is required');
      setLoading(false);
      return;
    }

    const fetchCoverData = async () => {
      try {
        console.log('[SEO HEALTH PAGE] Fetching cover data for projectId:', projectId);
        
        const token = localStorage.getItem('token');
        console.log('[SEO HEALTH PAGE] Token from localStorage:', token ? 'Present' : 'Missing');
        
        if (!token) {
          console.error('[SEO HEALTH PAGE] No authentication token found');
          setError('Authentication required - please login again');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/pdf/${projectId}/cover`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('[SEO HEALTH PAGE] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[SEO HEALTH PAGE] API Error:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('[SEO HEALTH PAGE] API response:', result);
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch cover data');
        }

        console.log('[SEO HEALTH PAGE] Cover data loaded successfully:', result.data);
        setCoverData(result.data);
      } catch (err) {
        console.error('[SEO HEALTH PAGE] Error fetching cover page data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverData();
  }, [projectId]);

  // Extract scores from coverData, with fallbacks
  const seoHealth = coverData?.scores?.seoHealth || 0;
  const aiVisibility = coverData?.scores?.aiVisibility || 0;
  const performance = coverData?.scores?.performance || 0;
  const authority = coverData?.scores?.authority || 0;
  const overallScore = coverData?.overallScore || 0;

  const bars = [
    { label: 'SEO Health', value: seoHealth, color: '#4F6EF7', legend: `SEO Health (${seoHealth}/100)` },
    { label: 'AI Visibility', value: aiVisibility, color: '#00D4FF', legend: `AI Visibility (${aiVisibility}/100)` },
    { label: 'Performance', value: performance, color: '#F59E0B', legend: `Performance (${performance}/100)` },
    { label: 'Authority', value: authority, color: '#60A5FA', legend: `Authority (${authority}/100)` },
    { label: 'Overall Score', value: overallScore, color: '#111827', legend: `Overall (${overallScore}/100)` },
  ];

  const grades = [
    { range: '90-100', grade: 'A+', status: 'Excellent', meaning: 'Top percentile — elite signals across all categories', color: '#10B981' },
    { range: '80-89', grade: 'A', status: 'Very Good', meaning: 'Minor improvements reach the elite tier', color: '#10B981' },
    { range: '70-79', grade: 'B', status: 'Good', meaning: 'Solid base — focused fixes move the needle', color: '#F59E0B' },
    { range: '60-69', grade: 'C+', status: 'Fair', meaning: 'Prioritised action plan recommended', color: '#F59E0B' },
    { range: '50-59', grade: 'C', status: 'Average', meaning: 'Structured improvement plan needed', color: '#F97316' },
    { range: '0-49', grade: 'D', status: 'Poor', meaning: 'Significant issues across multiple dimensions', color: '#EF4444' },
  ];

  if (loading) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: '#6B7280', fontSize: 16 }}>Loading SEO Health data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: '#EF4444', fontSize: 16 }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={6} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="05" title="SEO Health Overview" subtitle="Score breakdown by category" score={overallScore} />

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Score Breakdown by Category</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 24 }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, marginBottom: 32 }}>
          <div>
            {bars.map(({ label, value, color }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: '#374151', width: 110 }}>{label}</span>
                <div style={{ flex: 1, height: 14, background: '#F3F4F6', borderRadius: 3 }}>
                  <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151', width: 36, textAlign: 'right' }}>{value}%</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4 }}>
            {bars.map(({ color, legend }) => (
              <div key={legend} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 2, background: color }} />
                <span style={{ fontSize: 12, color: '#6B7280' }}>{legend}</span>
              </div>
            ))}
          </div>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Score Grade Reference</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 16 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Range', 'Grade', 'Status', 'What it means'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grades.map(({ range, grade, status, meaning, color }, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 14px', color: '#374151' }}>{range}</td>
                  <td style={{ padding: '11px 14px', color, fontWeight: 800, fontFamily: "'Syne', sans-serif", fontSize: 15 }}>{grade}</td>
                  <td style={{ padding: '11px 14px', color, fontWeight: 600 }}>{status}</td>
                  <td style={{ padding: '11px 14px', color: '#6B7280' }}>{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Score Interpretation">
          {coverData?.domain || 'your website'} scores {overallScore >= 70 ? 'B' : overallScore >= 60 ? 'C+' : overallScore >= 50 ? 'C' : 'D'} ({overallScore}/100). SEO Health at {seoHealth} {seoHealth >= 70 ? 'reflects good foundations' : seoHealth >= 50 ? 'shows room for improvement' : 'needs significant work'}. AI Visibility at {aiVisibility} is {aiVisibility >= 70 ? 'performing well' : aiVisibility >= 50 ? 'the most critical gap' : 'critically low'} — and the fastest to fix.
        </InsightBox>
      </div>
      <PageFooter page={6} />
    </div>
  );
}
