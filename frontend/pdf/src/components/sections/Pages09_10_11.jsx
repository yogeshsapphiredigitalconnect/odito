'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, Badge, InsightBox } from '../layout';
import API_BASE_URL from "@/lib/apiConfig";

// ---- Page 9: Structured Data Analysis ----
export function StructuredDataPage({ projectId }) {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[STRUCTURED DATA] useEffect triggered with projectId:', projectId);
    
    if (!projectId) {
      console.error('[STRUCTURED DATA] Project ID is missing or undefined');
      setError('Project ID is required');
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      try {
        console.log('[STRUCTURED DATA] Fetching page data for projectId:', projectId);
        
        const token = localStorage.getItem('token');
        console.log('[STRUCTURED DATA] Token from localStorage:', token ? 'Present' : 'Missing');
        
        if (!token) {
          console.error('[STRUCTURED DATA] No authentication token found');
          setError('Authentication required - please login again');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/pdf/${projectId}/page09`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('[STRUCTURED DATA] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[STRUCTURED DATA] API Error:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('[STRUCTURED DATA] API response:', result);
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch page data');
        }

        console.log('[STRUCTURED DATA] Page data loaded successfully:', result.data);
        setPageData(result.data);
      } catch (err) {
        console.error('[STRUCTURED DATA] Error fetching page data:', err);
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
        <div style={{ color: '#6B7280', fontSize: 16 }}>Loading Structured Data analysis...</div>
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

  const { withSchema, withoutSchema, coverage, errors, schemaTypes, mode } = pageData || {
    withSchema: 0,
    withoutSchema: 0,
    coverage: 0,
    errors: 0,
    schemaTypes: [],
    mode: 'coverage'
  };

  const whyRows = [
    ['Google Rich Results', 'Eligible for rich results', 'Plain blue link only', withoutSchema > 0 ? 'Missing' : 'Achieved'],
    ['Google AI Overviews', 'Entities extracted & cited', 'Anonymous — skipped', withoutSchema > 0 ? 'Critical' : 'Optimized'],
    ['ChatGPT / Perplexity', 'High citation probability', 'Low citation probability', withoutSchema > 0 ? '12% vs 43%' : 'Maximized'],
    ['LLM Training Index', 'Structured facts indexed', 'Unstructured — low priority', withoutSchema > 0 ? 'Impact' : 'Indexed'],
  ];

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={9} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="07" title="Structured Data Analysis" subtitle={mode === 'distribution' ? 'Schema type distribution and AI search readiness' : 'JSON-LD coverage and AI search impact'} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={withSchema} label="With Schema" sub="JSON-LD detected" color="#10B981" borderColor="#10B981" />
          <StatCard value={withoutSchema} label="Missing Schema" sub="No structured data" color={withoutSchema > 0 ? '#EF4444' : '#10B981'} borderColor={withoutSchema > 0 ? '#EF4444' : '#10B981'} />
          <StatCard value={`${coverage}%`} label="Coverage" sub="of all pages" color={coverage === 100 ? '#10B981' : '#F59E0B'} borderColor={coverage === 100 ? '#10B981' : '#F59E0B'} />
          <StatCard value={errors} label="Errors" sub="Validation issues" color={errors > 0 ? '#F97316' : '#10B981'} borderColor={errors > 0 ? '#F97316' : '#10B981'} />
        </div>

        {mode === 'distribution' ? (
          // Schema Distribution View (100% coverage case)
          <>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Schema Type Distribution</h3>
            <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 28 }}>
              <svg width={180} height={180} viewBox="0 0 180 180">
                {schemaTypes.slice(0, 5).map((type, i) => {
                  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444'];
                  const total = schemaTypes.reduce((sum, t) => sum + t.count, 0);
                  let offset = 0;
                  
                  for (let j = 0; j < i; j++) {
                    offset += (schemaTypes[j].count / total);
                  }
                  
                  const r = 70; const c = 2 * Math.PI * r;
                  const pct = type.count / total;
                  
                  return (
                    <circle key={i} cx={90} cy={90} r={r} fill="none" stroke={colors[i]} strokeWidth={24}
                      strokeDasharray={`${c * pct} ${c}`} strokeDashoffset={-c * offset} transform="rotate(-90 90 90)" />
                  );
                })}
                <circle cx={90} cy={90} r={56} fill="white" />
              </svg>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 2 }}>
                <div><span style={{ color: '#10B981' }}>■</span> {withSchema} pages with schema ({coverage}%)</div>
                <div><span style={{ color: '#10B981' }}>■</span> {schemaTypes.length} schema types detected</div>
                <div style={{ marginTop: 12, fontWeight: 600 }}>Detected types:</div>
                {schemaTypes.map((type, i) => (
                  <div key={type.type} style={{ color: '#6B7280' }}>— {type.type} — {type.pages} pages</div>
                ))}
              </div>
            </div>
          </>
        ) : (
          // Coverage Breakdown View (normal case)
          <>
            <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Schema Coverage Breakdown</h3>
            <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 28 }}>
              <svg width={180} height={180} viewBox="0 0 180 180">
                {[
                  { pct: coverage / 100, color: '#10B981', offset: 0 },
                  { pct: (100 - coverage) / 100, color: '#EF4444', offset: coverage / 100 },
                ].map(({ pct, color, offset }, i) => {
                  const r = 70; const c = 2 * Math.PI * r;
                  return <circle key={i} cx={90} cy={90} r={r} fill="none" stroke={color} strokeWidth={24}
                    strokeDasharray={`${c * pct} ${c}`} strokeDashoffset={-c * offset} transform="rotate(-90 90 90)" />;
                })}
                <circle cx={90} cy={90} r={56} fill="white" />
              </svg>
              <div style={{ fontSize: 13, color: '#374151', lineHeight: 2 }}>
                <div><span style={{ color: '#10B981' }}>■</span> {withSchema} pages with schema ({coverage}%)</div>
                <div><span style={{ color: '#EF4444' }}>■</span> {withoutSchema} pages missing schema ({100 - coverage}%)</div>
                <div style={{ marginTop: 12, fontWeight: 600 }}>Detected types:</div>
                {schemaTypes.slice(0, 4).map((type) => (
                  <div key={type.type} style={{ color: '#6B7280' }}>— {type.type} — {type.pages} pages</div>
                ))}
              </div>
            </div>
          </>
        )}

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Why Structured Data Matters</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 16 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Platform', 'With Schema', 'Without Schema', 'Your Gap'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {whyRows.map(([platform, with_, without, gap], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111827' }}>{platform}</td>
                  <td style={{ padding: '11px 14px', color: '#10B981' }}>{with_}</td>
                  <td style={{ padding: '11px 14px', color: '#EF4444' }}>{without}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <Badge 
                      label={gap} 
                      type={
                        gap === 'Missing' || gap === 'Critical' ? 'critical' : 
                        gap === 'Impact' ? 'warn' : 
                        gap === 'Achieved' || gap === 'Optimized' || gap === 'Maximized' || gap === 'Indexed' ? 'pass' : 
                        'medium'
                      } 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Structured Data Impact">
          {mode === 'distribution' ? 
            `Excellent! All ${withSchema} pages have comprehensive schema with ${schemaTypes.length} different types detected. This maximizes AI search visibility and rich result eligibility. Focus now on schema quality and advanced types like FAQ, HowTo, and Event schemas for additional opportunities.` :
            `JSON-LD is the primary mechanism AI search engines use to understand content. ${withoutSchema > 0 ? `Adding schema to ${withoutSchema} pages is the fastest path to lifting LLM citation rate from 12% to 28-35%.` : 'All pages are optimized for maximum AI search visibility.'}`
          }
        </InsightBox>
      </div>
      <PageFooter page={9} />
    </div>
  );
}

// ---- Page 10: Technical SEO Health ----
export function TechnicalSEOPage({ projectId }) {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[TECHNICAL SEO] useEffect triggered with projectId:', projectId);
    
    if (!projectId) {
      console.error('[TECHNICAL SEO] Project ID is missing or undefined');
      setError('Project ID is required');
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      try {
        console.log('[TECHNICAL SEO] Fetching page data for projectId:', projectId);
        
        const token = localStorage.getItem('token');
        console.log('[TECHNICAL SEO] Token from localStorage:', token ? 'Present' : 'Missing');
        
        if (!token) {
          console.error('[TECHNICAL SEO] No authentication token found');
          setError('Authentication required - please login again');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/pdf/${projectId}/page10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('[TECHNICAL SEO] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[TECHNICAL SEO] API Error:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('[TECHNICAL SEO] API response:', result);
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch page data');
        }

        console.log('[TECHNICAL SEO] Page data loaded successfully:', result.data);
        setPageData(result.data);
      } catch (err) {
        console.error('[TECHNICAL SEO] Error fetching page data:', err);
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
        <div style={{ color: '#6B7280', fontSize: 16 }}>Loading Technical SEO Health analysis...</div>
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

  const { checks, summary } = pageData || {
    checks: [],
    summary: { passing: 0, warnings: 0, critical: 0, techHealth: 0 }
  };

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={10} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="08" title="Technical SEO Health" subtitle="Server, crawlability and indexation audit" score={summary.techHealth} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={summary.passing} label="Passed" sub={`of ${checks.length} checks`} color="#10B981" borderColor="#10B981" />
          <StatCard value={summary.warnings} label="Warnings" sub="Need attention" color="#F59E0B" borderColor="#F59E0B" />
          <StatCard value={summary.critical} label="Failed" sub="Urgent fixes" color="#EF4444" borderColor="#EF4444" />
          <StatCard value={`${summary.techHealth}%`} label="Tech Health" sub="Overall" color="#4F6EF7" borderColor="#4F6EF7" />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 16, fontFamily: "'Syne', sans-serif" }}>Technical Check Results</h3>

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Technical Check', 'Status', 'Finding / Detail'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {checks.map((check, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{check.name}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <Badge
                      label={check.status === 'PASS' ? '✓ PASS' : check.status === 'WARN' ? '▲ WARN' : '✗ FAIL'}
                      type={check.status === 'PASS' ? 'pass' : check.status === 'WARN' ? 'warn' : 'fail'}
                    />
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>{check.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Technical Priority Analysis">
          {summary.critical > 0 ? 
            `Critical issues found: ${checks.filter(c => c.status === 'FAIL').map(c => c.name).join(', ')}. Address these immediately as they directly impact search visibility and user experience.` :
            summary.warnings > 0 ?
            `Warning issues need attention: ${checks.filter(c => c.status === 'WARN').map(c => c.name).join(', ')}. Monitor these and fix if they escalate.` :
            `Excellent technical health! All ${summary.passing} checks are passing. Maintain regular monitoring to ensure continued optimal performance.`
          }
        </InsightBox>
      </div>
      <PageFooter page={10} />
    </div>
  );
}

// ---- Page 11: Crawlability Analysis ----
export function CrawlabilityPage({ projectId }) {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('[CRAWLABILITY] useEffect triggered with projectId:', projectId);
    
    if (!projectId) {
      console.error('[CRAWLABILITY] Project ID is missing or undefined');
      setError('Project ID is required');
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      try {
        console.log('[CRAWLABILITY] Fetching page data for projectId:', projectId);
        
        const token = localStorage.getItem('token');
        console.log('[CRAWLABILITY] Token from localStorage:', token ? 'Present' : 'Missing');
        
        if (!token) {
          console.error('[CRAWLABILITY] No authentication token found');
          setError('Authentication required - please login again');
          setLoading(false);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/pdf/${projectId}/page11`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('[CRAWLABILITY] Response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('[CRAWLABILITY] API Error:', errorData);
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('[CRAWLABILITY] API response:', result);
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to fetch page data');
        }

        console.log('[CRAWLABILITY] Page data loaded successfully:', result.data);
        setPageData(result.data);
      } catch (err) {
        console.error('[CRAWLABILITY] Error fetching page data:', err);
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
        <div style={{ color: '#6B7280', fontSize: 16 }}>Loading Crawlability analysis...</div>
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

  const { metrics, chartData, blockedReasons } = pageData || {
    metrics: { totalPages: 0, indexedPages: 0, blockedPages: 0, indexRate: 0 },
    chartData: [],
    blockedReasons: []
  };

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={11} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="09" title="Crawlability Analysis" subtitle="Indexation status and crawl budget analysis" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={metrics.totalPages} label="Pages Crawled" sub="Discovered" color="#4F6EF7" borderColor="#4F6EF7" />
          <StatCard value={metrics.indexedPages} label="Pages Indexed" sub="In Google" color="#10B981" borderColor="#10B981" />
          <StatCard value={metrics.blockedPages} label="Pages Blocked" sub="Noindex/robots" color="#EF4444" borderColor="#EF4444" />
          <StatCard value={`${metrics.indexRate}%`} label="Index Rate" sub="Indexed/Crawled" color={metrics.indexRate >= 90 ? '#10B981' : metrics.indexRate >= 70 ? '#F59E0B' : '#EF4444'} borderColor={metrics.indexRate >= 90 ? '#10B981' : metrics.indexRate >= 70 ? '#F59E0B' : '#EF4444'} />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Crawl Status Distribution</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 28 }}>
          <svg width={180} height={180} viewBox="0 0 180 180">
            {chartData.map((item, i) => {
              const colors = ['#10B981', '#EF4444'];
              const r = 70; const c = 2 * Math.PI * r;
              let offset = 0;
              
              for (let j = 0; j < i; j++) {
                offset += (chartData[j].percentage / 100);
              }
              
              return (
                <circle key={i} cx={90} cy={90} r={r} fill="none" stroke={colors[i]} strokeWidth={24}
                  strokeDasharray={`${c * (item.percentage / 100)} ${c}`} strokeDashoffset={-c * offset} transform="rotate(-90 90 90)" />
              );
            })}
            <circle cx={90} cy={90} r={56} fill="white" />
          </svg>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 2.2 }}>
            {chartData.map((item, i) => (
              <div key={i}>
                <span style={{ color: item.label === 'Indexed' ? '#10B981' : '#EF4444' }}>■</span> {item.value} {item.label.toLowerCase()} ({item.percentage}%)
              </div>
            ))}
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 12 }}>
              {metrics.blockedPages > 0 ? 
                `${metrics.blockedPages} blocked pages = lost ranking potential on ${metrics.indexRate < 100 ? Math.round((metrics.blockedPages / metrics.totalPages) * 100) : 0}% of site content.` :
                'All pages are successfully indexed and accessible to search engines.'
              }
            </p>
          </div>
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Blocked Pages Breakdown</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 16 }} />

        <div style={{ borderRadius: 8, border: '1px solid #E5E7EB', overflow: 'hidden', marginBottom: 24 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#111827' }}>
                {['Reason', 'Affected', 'SEO Impact', 'Fix'].map((h, i) => (
                  <th key={i} style={{ padding: '11px 14px', color: '#fff', fontWeight: 600, textAlign: 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {blockedReasons.length > 0 ? (
                blockedReasons.map((reason, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111827' }}>{reason.reason}</td>
                    <td style={{ padding: '11px 14px', color: '#374151', textAlign: 'center' }}>{reason.affected}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <Badge 
                        label={reason.impact} 
                        type={reason.impact.toLowerCase() === 'critical' ? 'critical' : 
                              reason.impact.toLowerCase() === 'high' ? 'warn' : 
                              reason.impact.toLowerCase() === 'medium' ? 'medium' : 'pass'} 
                      />
                    </td>
                    <td style={{ padding: '11px 14px', color: '#6B7280' }}>{reason.fix}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#10B981' }}>
                    ✅ No crawlability issues detected - all pages are properly indexed
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <InsightBox title="Crawlability Insight">
          {blockedReasons.length > 0 ? 
            `${blockedReasons[0]?.reason || 'Crawlability issues'} affecting ${blockedReasons[0]?.affected || 0} pages should be prioritized. ${blockedReasons.find(r => r.reason.includes('noindex')) ? 'Noindex issues are typically the most critical as they directly prevent search engine indexing.' : 'Review the blocked reasons above and implement fixes to improve indexation rate.'}` :
            `Excellent crawlability! All ${metrics.totalPages} pages are indexed with a ${metrics.indexRate}% index rate. Maintain current crawlability practices and monitor for any future issues.`
          }
        </InsightBox>
      </div>
      <PageFooter page={11} />
    </div>
  );
}
