'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, InsightBox } from '../layout';
import API_BASE_URL from '@/lib/apiConfig';

function DonutChart({ value, max = 100, color, size = 100 }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const pct = value / max;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx={50} cy={50} r={r} fill="none" stroke="#E5E7EB" strokeWidth={10} />
      <circle cx={50} cy={50} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${circ * pct} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)" />
      <text x={50} y={47} textAnchor="middle" fontSize={18} fontWeight={800} fill="#111827" fontFamily="'Syne', sans-serif">{value}</text>
      <text x={50} y={60} textAnchor="middle" fontSize={10} fill="#9CA3AF">/100</text>
    </svg>
  );
}

export default function ExecutiveSummaryPage({ projectId }) {
  const [executiveData, setExecutiveData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!projectId) {
      setError('Project ID is required');
      setLoading(false);
      return;
    }

    const fetchExecutiveData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/pdf/${projectId}/executive`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch executive summary data');
        }

        setExecutiveData(result.data);
      } catch (err) {
        console.error('Error fetching executive summary data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExecutiveData();
  }, [projectId]);

  if (loading) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: '#fff', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: '#374151', fontSize: 16 }}>Loading executive summary data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: '#fff', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: '#EF4444', fontSize: 16 }}>Error: {error}</div>
      </div>
    );
  }

  if (!executiveData) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: '#fff', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: '#374151', fontSize: 16 }}>No executive summary data available</div>
      </div>
    );
  }

  const { scores, issues, issueDistribution, aiAnalysis } = executiveData;

  // DEBUG: Log scores to verify technicalHealth is present
  console.log("FRONTEND SCORES:", scores);

  // Dynamic score colors based on actual values
  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#4F6EF7';
    if (score >= 40) return '#F59E0B';
    return '#EF4444';
  };

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={3} />

      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="02" title="Executive Summary" subtitle="Performance snapshot and AI-generated analysis" />

        {/* 4 donut score cards - DYNAMIC VALUES */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16,
          border: '1px solid #E5E7EB', borderRadius: 8, padding: 24, marginBottom: 20
        }}>
          {[
            { v: scores.seoHealth || 0, l: 'SEO Health', c: getScoreColor(scores.seoHealth) },
            { v: scores.aiVisibility || 0, l: 'AI Visibility', c: getScoreColor(scores.aiVisibility) },
            { v: scores.performance || 0, l: 'Performance', c: getScoreColor(scores.performance) },
            { v: scores.technicalHealth || 0, l: 'Technical Health', c: getScoreColor(scores.technicalHealth) },
          ].map(({ v, l, c }) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <DonutChart value={v} color={c} size={110} />
              <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 8 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Issue stats - UPDATED ORDER: Total Issues, Critical, Medium, Info */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={(issues.critical || 0) + (issues.warnings || 0) + (issues.informational || 0)} label="Total Issues" sub="All issues found" color="#8B5CF6" borderColor="#8B5CF6" />
          <StatCard value={issues.critical || 0} label="Critical Issues" sub="Fix immediately" color="#EF4444" borderColor="#EF4444" />
          <StatCard value={issues.warnings || 0} label="Medium Issues" sub="Fix within 30 days" color="#F59E0B" borderColor="#F59E0B" />
          <StatCard value={issues.informational || 0} label="Info Issues" sub="Opportunities" color="#4F6EF7" borderColor="#4F6EF7" />
        </div>

        <div style={{ borderBottom: '1px solid #E5E7EB', marginBottom: 24 }} />

        {/* AI Analysis - DYNAMIC */}
        <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>AI Analysis Summary</h3>
        <InsightBox title="Full-Site AI Analysis">
          {aiAnalysis || "AI analysis is being generated..."}
        </InsightBox>

        {/* Issue Distribution - FIXED DONUT CHART */}
        <h3 style={{ fontSize: 18, fontWeight: 700, margin: '28px 0 16px', fontFamily: "'Syne', sans-serif" }}>Issue Distribution</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          {/* Fixed donut chart with proper segments */}
          <svg width={180} height={180} viewBox="0 0 180 180">
            {(() => {
              // Prepare chart data - ONLY the segments, no total
              const chartData = [
                { name: "Critical", value: issueDistribution?.critical || 0, color: '#EF4444' },
                { name: "Medium", value: issueDistribution?.medium || 0, color: '#F59E0B' },
                { name: "Info", value: issueDistribution?.info || 0, color: '#4F6EF7' }
              ];
              
              console.log("CHART DATA:", chartData);
              
              // Calculate total for proportions
              const total = chartData.reduce((sum, item) => sum + item.value, 0);
              
              if (total === 0) {
                // Show empty state
                return (
                  <>
                    <circle cx={90} cy={90} r={70} fill="none" stroke="#E5E7EB" strokeWidth={22} />
                    <circle cx={90} cy={90} r={50} fill="white" />
                  </>
                );
              }
              
              // Calculate cumulative offsets for proper segment positioning
              let cumulativeOffset = 0;
              const r = 70;
              const circumference = 2 * Math.PI * r;
              
              return chartData.map((item, index) => {
                const percentage = item.value / total;
                const dashLength = circumference * percentage;
                const dashOffset = -circumference * cumulativeOffset;
                
                cumulativeOffset += percentage;
                
                return (
                  <circle
                    key={item.name}
                    cx={90}
                    cy={90}
                    r={r}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={22}
                    strokeDasharray={`${dashLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 90 90)"
                  />
                );
              });
            })()}
            <circle cx={90} cy={90} r={50} fill="white" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { color: '#EF4444', label: `Critical (${issueDistribution?.critical || 0})` },
              { color: '#F59E0B', label: `Medium (${issueDistribution?.medium || 0})` },
              { color: '#4F6EF7', label: `Info (${issueDistribution?.info || 0})` },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 14, color: '#374151' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PageFooter page={3} />
    </div>
  );
}
