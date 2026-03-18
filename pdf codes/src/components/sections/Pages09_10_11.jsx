import React from 'react';
import { PageHeader, PageFooter, SectionHeader, StatCard, Badge, InsightBox } from '../layout';

// ---- Page 9: Structured Data Analysis ----
export function StructuredDataPage() {
  const whyRows = [
    ['Google Rich Results', 'Eligible for rich results', 'Plain blue link only', 'Missing'],
    ['Google AI Overviews', 'Entities extracted & cited', 'Anonymous — skipped', 'Critical'],
    ['ChatGPT / Perplexity', 'High citation probability', 'Low citation probability', '12% vs 43%'],
    ['LLM Training Index', 'Structured facts indexed', 'Unstructured — low priority', 'Impact'],
  ];

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={9} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="07" title="Structured Data Analysis" subtitle="JSON-LD coverage and AI search impact" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={106} label="With Schema" sub="JSON-LD detected" color="#10B981" borderColor="#10B981" />
          <StatCard value={206} label="Missing Schema" sub="No structured data" color="#EF4444" borderColor="#EF4444" />
          <StatCard value="34%" label="Coverage" sub="of all pages" color="#F59E0B" borderColor="#F59E0B" />
          <StatCard value={47} label="Errors" sub="Validation issues" color="#F97316" borderColor="#F97316" />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Schema Coverage Breakdown</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 28 }}>
          <svg width={180} height={180} viewBox="0 0 180 180">
            {[
              { pct: 0.34, color: '#10B981', offset: 0 },
              { pct: 0.66, color: '#EF4444', offset: 0.34 },
            ].map(({ pct, color, offset }, i) => {
              const r = 70; const c = 2 * Math.PI * r;
              return <circle key={i} cx={90} cy={90} r={r} fill="none" stroke={color} strokeWidth={24}
                strokeDasharray={`${c * pct} ${c}`} strokeDashoffset={-c * offset} transform="rotate(-90 90 90)" />;
            })}
            <circle cx={90} cy={90} r={56} fill="white" />
          </svg>
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 2 }}>
            <div><span style={{ color: '#10B981' }}>■</span> 106 pages with schema (34%)</div>
            <div><span style={{ color: '#EF4444' }}>■</span> 206 pages missing schema (66%)</div>
            <div style={{ marginTop: 12, fontWeight: 600 }}>Detected types:</div>
            {[['Article', 48], ['WebPage', 31], ['Organization', 1], ['FAQPage', 0]].map(([t, n]) => (
              <div key={t} style={{ color: '#6B7280' }}>— {t} — {n} pages{t === 'FAQPage' ? ' (needed: 31)' : ''}</div>
            ))}
          </div>
        </div>

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
                  <td style={{ padding: '11px 14px' }}><Badge label={gap} type={gap === 'Missing' || gap === 'Critical' ? 'critical' : gap === 'Impact' ? 'warn' : 'medium'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Structured Data Impact">
          JSON-LD is the primary mechanism AI search engines use to understand content. Without it, pages are anonymous text with no entity associations. Adding schema to 47 pages is the fastest path to lifting LLM citation rate from 12% to 28-35%.
        </InsightBox>
      </div>
      <PageFooter page={9} />
    </div>
  );
}

// ---- Page 10: Technical SEO Health ----
export function TechnicalSEOPage() {
  const checks = [
    ['SSL Certificate', 'PASS', 'Valid TLS 1.3, expires 2026-01-20'],
    ['Robots.txt', 'PASS', 'Valid, sitemap correctly declared'],
    ['XML Sitemap', 'PASS', '298 URLs, correct format'],
    ['Mobile Friendly', 'PASS', 'Responsive layout confirmed'],
    ['Page Indexability', 'PASS', 'Homepage correctly indexed'],
    ['Core Web Vitals', 'WARN', 'Mobile LCP 3.2s > 2.5s threshold'],
    ['Redirect Chains', 'WARN', '8 URLs with 3+ hop chains'],
    ['Canonical Tags', 'WARN', '23 pages missing canonical tags'],
    ['Security Headers', 'WARN', 'CSP and X-Frame-Options absent'],
    ['Noindex Key Pages', 'FAIL', '5 revenue pages blocked from Google'],
    ['Broken Links (404)', 'FAIL', '14 internal links returning 404'],
    ['Schema Validation', 'FAIL', '23 pages have structured data errors'],
    ['Structured Data', 'FAIL', '47 pages have no JSON-LD schema'],
  ];

  return (
    <div style={{
      width: 960, minHeight: 1280, background: '#fff', display: 'flex',
      flexDirection: 'column', boxShadow: '0 4px 40px rgba(0,0,0,0.12)',
      margin: '0 auto', fontFamily: "'DM Sans', sans-serif"
    }}>
      <PageHeader page={10} />
      <div style={{ padding: '32px 40px', flex: 1 }}>
        <SectionHeader num="08" title="Technical SEO Health" subtitle="Server, crawlability and indexation audit" score={38} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 28 }}>
          <StatCard value={5} label="Passed" sub="of 13 checks" color="#10B981" borderColor="#10B981" />
          <StatCard value={4} label="Warnings" sub="Need attention" color="#F59E0B" borderColor="#F59E0B" />
          <StatCard value={4} label="Failed" sub="Urgent fixes" color="#EF4444" borderColor="#EF4444" />
          <StatCard value="38%" label="Tech Health" sub="Overall" color="#4F6EF7" borderColor="#4F6EF7" />
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
              {checks.map(([check, status, finding], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600, color: '#111827' }}>{check}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <Badge
                      label={status === 'PASS' ? '✓ PASS' : status === 'WARN' ? '▲ WARN' : '✗ FAIL'}
                      type={status === 'PASS' ? 'pass' : status === 'WARN' ? 'warn' : 'fail'}
                    />
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6B7280' }}>{finding}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Technical Priority Analysis">
          Failed: Noindex Key Pages, Broken Links (404), Schema Validation, Structured Data. Noindex on 5 revenue pages is most urgent — removal takes 30 minutes and restores ranking access within days. Fix broken links and schema validation errors next.
        </InsightBox>
      </div>
      <PageFooter page={10} />
    </div>
  );
}

// ---- Page 11: Crawlability Analysis ----
export function CrawlabilityPage() {
  const blocked = [
    ['Noindex meta tag', 5, 'Critical', 'Remove noindex from revenue pages'],
    ['Robots.txt block', 12, 'High', 'Review robots.txt disallow rules'],
    ['Redirect to blocked page', 5, 'Medium', 'Fix destination page indexation'],
    ['Canonical mismatch', 3, 'Low', 'Correct canonical tag URLs'],
  ];

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
          <StatCard value={312} label="Pages Crawled" sub="Discovered" color="#4F6EF7" borderColor="#4F6EF7" />
          <StatCard value={287} label="Pages Indexed" sub="In Google" color="#10B981" borderColor="#10B981" />
          <StatCard value={25} label="Pages Blocked" sub="Noindex/robots" color="#EF4444" borderColor="#EF4444" />
          <StatCard value="92%" label="Index Rate" sub="Indexed/Crawled" color="#F59E0B" borderColor="#F59E0B" />
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, fontFamily: "'Syne', sans-serif" }}>Crawl Status Distribution</h3>
        <div style={{ borderBottom: '2px solid #4F6EF7', marginBottom: 20 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 28 }}>
          <svg width={180} height={180} viewBox="0 0 180 180">
            {[
              { pct: 0.92, color: '#10B981', offset: 0 },
              { pct: 0.08, color: '#EF4444', offset: 0.92 },
            ].map(({ pct, color, offset }, i) => {
              const r = 70; const c = 2 * Math.PI * r;
              return <circle key={i} cx={90} cy={90} r={r} fill="none" stroke={color} strokeWidth={24}
                strokeDasharray={`${c * pct} ${c}`} strokeDashoffset={-c * offset} transform="rotate(-90 90 90)" />;
            })}
            <circle cx={90} cy={90} r={56} fill="white" />
          </svg>
          <div style={{ fontSize: 14, color: '#374151', lineHeight: 2.2 }}>
            <div><span style={{ color: '#10B981' }}>■</span> 287 indexed (92%)</div>
            <div><span style={{ color: '#EF4444' }}>■</span> 25 blocked (8%)</div>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 12 }}>25 blocked pages = lost ranking potential on 8% of site content.</p>
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
              {blocked.map(([reason, affected, impact, fix], i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F3F4F6', background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: '#111827' }}>{reason}</td>
                  <td style={{ padding: '11px 14px', color: '#374151', textAlign: 'center' }}>{affected}</td>
                  <td style={{ padding: '11px 14px' }}><Badge label={impact} type={impact.toLowerCase()} /></td>
                  <td style={{ padding: '11px 14px', color: '#6B7280' }}>{fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <InsightBox title="Crawlability Insight">
          The 5 noindex revenue pages are highest priority — they appear to be accidentally tagged during a CMS update. Removal is estimated to restore ~15% of lost organic sessions within 3-7 days.
        </InsightBox>
      </div>
      <PageFooter page={11} />
    </div>
  );
}
