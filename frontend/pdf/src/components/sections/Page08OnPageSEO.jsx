'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, Badge, InsightBox } from '../layout';
import API_BASE_URL from '@/lib/apiConfig';

const sevMap = { CRITICAL: 'critical', HIGH: 'high', MEDIUM: 'medium', LOW: 'low', INFO: 'low' };
const impMap = { High: 'critical', Medium: 'medium', Low: 'low' };

// Color mapping for severity badges
const severityColors = {
  critical: '#9333EA', // Purple
  high: '#EF4444',     // Red  
  medium: '#EAB308',   // Yellow
  low: '#3B82F6',      // Blue
  info: '#3B82F6'      // Blue (same as low)
};

export default function OnPageSEOPage({ projectId }) {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[ON-PAGE SEO] useEffect triggered with projectId:', projectId);
    
    if (!projectId) {
      console.error('[ON-PAGE SEO] Project ID is missing or undefined');
      setError('Project ID is required');
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      try {
        console.log('[ON-PAGE SEO] Fetching page data for projectId:', projectId);
        
        const token = localStorage.getItem('token');
        console.log('[ON-PAGE SEO] Token from localStorage:', token ? 'Present' : 'Missing');
        
        if (!token) {
          console.error('[ON-PAGE SEO] No authentication token found');
          setError('Authentication required - please login again');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/pdf/${projectId}/page08`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('[ON-PAGE SEO] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[ON-PAGE SEO] API Error:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('[ON-PAGE SEO] API response:', result);
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch page data');
        }

        console.log('[ON-PAGE SEO] Page data loaded successfully:', result.data);
        setPageData(result.data);
      } catch (err) {
        console.error('[ON-PAGE SEO] Error fetching page data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [projectId]);

  if (loading) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: '#6B7280', fontSize: 16 }}>Loading On-Page SEO data...</div>
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

  const { totalIssues, totalPages, severityBreakdown, topIssues } = pageData || {
    totalIssues: 0,
    totalPages: 0,
    severityBreakdown: { critical: 0, high: 0, medium: 0, lowInfo: 0, totalAll: 0 },
    topIssues: []
  };

  const displayText = `${totalIssues} issues across ${totalPages} pages`;
  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={8} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="06" title="On-Page SEO Audit" subtitle={displayText} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={severityBreakdown.totalAll} label="All Issues" sub="Total issues found" color={severityColors.critical} borderColor={severityColors.critical} />
          <StatCard value={severityBreakdown.high} label="High" sub="Fix within 7 days" color={severityColors.high} borderColor={severityColors.high} />
          <StatCard value={severityBreakdown.medium} label="Medium" sub="Fix in 30 days" color={severityColors.medium} borderColor={severityColors.medium} />
          <StatCard value={severityBreakdown.lowInfo} label="Low+Info" sub="Opportunities" color={severityColors.low} borderColor={severityColors.low} />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Issue Breakdown</h3>

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['#', 'Issue', 'Severity', 'Pages', 'Count', 'Recommended Fix'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topIssues.map((issue, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', color: '#9CA3AF' }}>{i + 1}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{issue.issue}</td>
                  <td style={{ padding: '10px 14px' }}><Badge label={issue.severity.toUpperCase()} type={sevMap[issue.severity.toUpperCase()]} /></td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{issue.pages}</td>
                  <td style={{ padding: '10px 14px', color: '#374151' }}>{issue.count}</td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>{issue.recommendation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="On-Page Priority Recommendation">
          {topIssues.length > 0 ? 
            `Prioritize fixing "${topIssues[0]?.issue}" which affects ${topIssues[0]?.pages} pages with ${topIssues[0]?.count} total occurrences. This issue has the highest impact on your SEO performance and should be addressed first for maximum improvement.` :
            'No critical issues found. Your on-page SEO is well optimized. Continue monitoring for new opportunities.'
          }
        </InsightBox>
      </div>
      <PageFooter page={8} />
    </div>
  );
}
