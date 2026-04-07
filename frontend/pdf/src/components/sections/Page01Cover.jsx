'use client';

import React, { useState, useEffect } from 'react';
import { PageFooter } from '../layout';
import API_BASE_URL from '@/lib/apiConfig';

function ScoreCard({ value, label }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(79,110,247,0.3)',
      borderRadius: 8, padding: '16px 20px', flex: 1
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: '#4F6EF7', fontFamily: "'Syne', sans-serif" }}>{value}</div>
      <div style={{ fontSize: 11, color: '#8892C4', marginTop: 2 }}>/100</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#fff', marginTop: 6 }}>{label}</div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 10 }}>
        <div style={{ height: '100%', width: `${value}%`, background: '#4F6EF7', borderRadius: 2 }} />
      </div>
    </div>
  );
}

export default function CoverPage({ projectId }) {
  const [coverData, setCoverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[COVER PAGE] useEffect triggered with projectId:', projectId);
    
    if (!projectId) {
      console.error('[COVER PAGE] Project ID is missing or undefined');
      setError('Project ID is required');
      setLoading(false);
      return;
    }

    const fetchCoverData = async () => {
      try {
        console.log('[COVER PAGE] Fetching cover data for projectId:', projectId);
        
        const token = localStorage.getItem('token');
        console.log('[COVER PAGE] Token from localStorage:', token ? 'Present' : 'Missing');
        
        if (!token) {
          console.error('[COVER PAGE] No authentication token found');
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

        console.log('[COVER PAGE] Response status:', response.status);
        console.log('[COVER PAGE] Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[COVER PAGE] API Error:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('[COVER PAGE] API response:', result);
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch cover data');
        }

        console.log('[COVER PAGE] Cover data loaded successfully:', result.data);
        console.log('[COVER PAGE] Technical Health from backend:', result.data.scores?.technicalHealth);
        console.log('[COVER PAGE] All scores:', result.data.scores);
        setCoverData(result.data);
      } catch (err) {
        console.error('[COVER PAGE] Error fetching cover page data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCoverData();
  }, [projectId]);

  if (loading) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: 'var(--bg-dark, #070B1A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: '#8892C4', fontSize: 16 }}>Loading cover page data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: 'var(--bg-dark, #070B1A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: '#FF5A5A', fontSize: 16 }}>Error: {error}</div>
      </div>
    );
  }

  if (!coverData) {
    return (
      <div style={{
        width: 960, minHeight: 1280, background: 'var(--bg-dark, #070B1A)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{ color: '#8892C4', fontSize: 16 }}>No cover data available</div>
      </div>
    );
  }
  return (
    <div style={{
      width: 960, minHeight: 1280, background: 'var(--bg-dark, #070B1A)',
      display: 'flex', flexDirection: 'column', position: 'relative',
      overflow: 'hidden', boxShadow: '0 4px 40px rgba(0,0,0,0.3)', margin: '0 auto',
      fontFamily: "'DM Sans', sans-serif"
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: -80, right: -80, width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(79,110,247,0.25) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: 100, right: -60, width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(123,92,240,0.2) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      {/* Top accent line */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #4F6EF7, #00D4FF)', width: '100%' }} />

      {/* Header bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 40px', background: 'rgba(255,255,255,0.04)',
        borderBottom: '1px solid rgba(255,255,255,0.07)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#4F6EF7' }} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, fontFamily: "'Syne', sans-serif" }}>Odito AI</span>
          <span style={{ color: '#4A5280', fontSize: 13 }}>•</span>
          <span style={{ color: '#8892C4', fontSize: 13 }}>AI-Powered SEO & Visibility Platform</span>
        </div>
        <span style={{
          border: '1px solid rgba(255,255,255,0.2)', color: '#8892C4',
          fontSize: 10, padding: '4px 12px', borderRadius: 4
        }} className="letter-spacing-1">CONFIDENTIAL REPORT</span>
      </div>

      {/* Main content */}
      <div style={{ padding: '50px 40px 0', flex: 1 }}>
        {/* Tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(79,110,247,0.15)', border: '1px solid rgba(79,110,247,0.4)',
          padding: '8px 16px', borderRadius: 6, marginBottom: 30
        }}>
          <span style={{ color: '#4F6EF7', fontSize: 11 }}>✦</span>
          <span style={{ color: '#00D4FF', fontSize: 12, fontWeight: 600 }} className="letter-spacing-1">SEO + AI VISIBILITY AUDIT REPORT</span>
        </div>

        {/* Domain + meta */}
        <h1 style={{
          fontSize: 52, fontWeight: 800, color: '#fff',
          fontFamily: "'Syne', sans-serif", lineHeight: 1.1
        }} className="letter-spacing-neg1">{coverData.domain}</h1>
        <p style={{ color: '#8892C4', fontSize: 15, marginTop: 8, marginBottom: 24 }}>{coverData.companyName}</p>

        {/* Metadata row */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8, overflow: 'hidden', marginBottom: 40
        }}>
          {[
            { label: 'Audit Date', value: coverData.auditDate },
            { label: 'Engine', value: `${coverData.engine} Engine v2` },
            { label: 'Pages Crawled', value: `${coverData.pagesCrawled} pages` },
            { label: 'Prepared for', value: coverData.preparedFor },
          ].map((item, i) => (
            <div key={i} style={{
              padding: '14px 18px',
              borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none'
            }}>
              <div style={{ fontSize: 11, color: '#4A5280', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Browser mockup */}
          <div style={{
            background: '#fff', borderRadius: 12, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            {/* Browser chrome */}
            <div style={{ background: '#F3F4F6', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981' }} />
              <div style={{
                flex: 1, background: '#fff', borderRadius: 4, padding: '3px 10px',
                fontSize: 11, color: '#6B7280', marginLeft: 8
              }}>https://{coverData.domain}</div>
            </div>
            {/* Site preview */}
            <div style={{ padding: '16px', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#4F6EF7', fontFamily: "'Syne', sans-serif" }}>
                  {coverData.domain.split('.')[0]}
                </span>
                <div style={{ display: 'flex', gap: 12 }}>
                  {['Home', 'Services', 'Blog', 'Contact'].map(n => (
                    <span key={n} style={{ fontSize: 10, color: '#6B7280' }}>{n}</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#111827', marginBottom: 4 }}>AI-Powered SEO & Visibility Audit</div>
                <div style={{ fontSize: 10, color: '#6B7280', marginBottom: 12 }}>Rank higher. Get cited by AI search engines.</div>
                <div style={{
                  display: 'inline-block', background: '#4F6EF7', color: '#fff',
                  fontSize: 11, padding: '6px 16px', borderRadius: 20
                }}>Start Free Audit</div>
              </div>
              {/* Score bars */}
              <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, marginTop: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                  {[
                    [coverData.scores.seoHealth || 0, 'SEO Audit'], 
                    [coverData.scores.aiVisibility || 0, 'AI Visibility'], 
                    [coverData.scores.technicalHealth || 0, 'Technical Health']
                  ].map(([v, l]) => (
                    <div key={l} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 800, color: '#4F6EF7', fontFamily: "'Syne', sans-serif" }}>{v}</div>
                      <div style={{ fontSize: 9, color: '#6B7280' }}>{l}</div>
                    </div>
                  ))}
                </div>
                {[
                  ['SEO Health', coverData.scores.seoHealth || 0, '#4F6EF7'], 
                  ['AI Visibility', coverData.scores.aiVisibility || 0, '#00D4FF'], 
                  ['Technical Health', coverData.scores.technicalHealth || 0, '#7B5CF0']
                ].map(([label, pct, color]) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: '#6B7280', width: 80 }}>{label}</span>
                    <div style={{ flex: 1, height: 4, background: '#E5E7EB', borderRadius: 2 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2 }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#6B7280', width: 40, textAlign: 'right' }}>{pct}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Score dial + cards */}
          <div>
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 11, color: '#8892C4', marginBottom: 16 }} className="letter-spacing-1">OVERALL SCORE</div>
              {/* Circular gauge */}
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <svg width={160} height={160} viewBox="0 0 160 160">
                  <circle cx={80} cy={80} r={68} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={14} />
                  <circle cx={80} cy={80} r={68} fill="none" stroke="#4F6EF7" strokeWidth={14}
                    strokeDasharray={`${2 * Math.PI * 68 * (coverData.overallScore/100)} ${2 * Math.PI * 68}`}
                    strokeLinecap="round" strokeDashoffset={2 * Math.PI * 68 * 0.25}
                    transform="rotate(-90 80 80)" />
                </svg>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -55%)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{coverData.overallScore}</div>
                  <div style={{ fontSize: 12, color: '#8892C4' }}>/100</div>
                </div>
                <div style={{
                  position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
                  background: '#4F6EF7', color: '#fff', fontSize: 12, fontWeight: 700,
                  padding: '3px 14px', borderRadius: 20
                }}>{coverData.overallGrade}</div>
              </div>
            </div>

            {/* 4 score cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { v: coverData.scores.performance || 0, l: 'Performance', c: '#4F6EF7' },
                { v: coverData.scores.technicalHealth || 0, l: 'Technical Health', c: '#4F6EF7' },
                { v: coverData.scores.seoHealth || 0, l: 'SEO Health', c: '#4F6EF7' },
                { v: coverData.scores.aiVisibility || 0, l: 'AI Visibility', c: '#00D4FF' },
              ].map(({ v, l, c }) => (
                <div key={l} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(79,110,247,0.3)',
                  borderRadius: 8, padding: '14px 16px'
                }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: c, fontFamily: "'Syne', sans-serif" }}>{v}</div>
                  <div style={{ fontSize: 10, color: '#4A5280' }}>/100</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', marginTop: 4 }}>{l}</div>
                  <div style={{ height: 2, background: 'rgba(255,255,255,0.1)', borderRadius: 1, marginTop: 8 }}>
                    <div style={{ width: `${v}%`, height: '100%', background: c, borderRadius: 1 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom stats bar */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(5,1fr)',
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8, margin: '32px 40px', overflow: 'hidden'
      }}>
        {[
          { v: coverData.issues.critical, l: 'Total Issues', c: '#8B5CF6' },
          { v: coverData.issues.warnings, l: 'Critical Issues', c: '#FF5A5A' },
          { v: coverData.issues.informational, l: 'Medium Issues', c: '#4F6EF7' },
          { v: coverData.issues.passed, l: 'Info Issues', c: '#4F6EF7' },
          { v: coverData.pagesCrawled, l: 'Pages Crawled', c: '#fff' },
        ].map(({ v, l, c }, i) => (
          <div key={l} style={{
            padding: '16px', textAlign: 'center',
            borderRight: i < 4 ? '1px solid rgba(255,255,255,0.07)' : 'none'
          }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: c, fontFamily: "'Syne', sans-serif" }}>{v}</div>
            <div style={{ fontSize: 11, color: '#8892C4', marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #4F6EF7, #00D4FF)', width: '100%' }} />
      <div style={{
        display: 'flex', justifyContent: 'space-between', padding: '12px 40px',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <span style={{ color: '#4A5280', fontSize: 11 }}>Odito AI Audit Report | {coverData.auditDate}</span>
        <span style={{ color: '#4A5280', fontSize: 11 }}>{coverData.domain}</span>
      </div>
    </div>
  );
}
