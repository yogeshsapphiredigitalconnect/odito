'use client';

import { Suspense } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function PDFViewContent() {
  const searchParams = useSearchParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const projectId = searchParams.get('projectId');
  const reportType = searchParams.get('type') || 'seo';

  // For now, use static data to match reference design
  const staticData = {
    project: {
      project_name: 'example.com',
      main_url: 'https://example.com'
    },
    score: 58,
    metrics: {
      seo: 67,
      ai: 41,
      performance: 72,
      authority: 45
    },
    issues: {
      critical: 12,
      warnings: 28,
      passed: 156,
      pages: 89
    }
  };

  useEffect(() => {
    // Use static data for now
    setReportData(staticData);
    setLoading(false);
  }, [projectId, reportType]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        background: '#0f172a'
      }}>
        Loading report data...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        color: '#dc2626',
        background: '#0f172a'
      }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="pdf-container">
      <CoverPage data={staticData} />
      <SectionPage sectionNumber="01" title="Executive Summary" />
      <SummaryPage data={staticData} />
    </div>
  );
}

// Export the page wrapped in Suspense
export default function PDFView() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PDFViewContent />
    </Suspense>
  );
}

function CoverPage({ data }) {
  return (
    <div className="pdf-page cover-page">
      <div className="cover-content">
        {/* Domain Name */}
        <div className="domain-name">{data.project.main_url}</div>
        
        {/* Score Circle */}
        <div className="score-circle">
          <div className="score-value">{data.score}</div>
          <div className="score-label">Overall Score</div>
        </div>
        
        {/* Metric Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-label">SEO Health</div>
            <div className="metric-value">{data.metrics.seo}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">AI Visibility</div>
            <div className="metric-value">{data.metrics.ai}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Performance</div>
            <div className="metric-value">{data.metrics.performance}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Authority</div>
            <div className="metric-value">{data.metrics.authority}</div>
          </div>
        </div>
        
        {/* Bottom Stats */}
        <div className="bottom-stats">
          <div className="stat-item">
            <div className="stat-value">{data.issues.critical}</div>
            <div className="stat-label">Critical Issues</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{data.issues.warnings}</div>
            <div className="stat-label">Warnings</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{data.issues.passed}</div>
            <div className="stat-label">Passed</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{data.issues.pages}</div>
            <div className="stat-label">Pages Crawled</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionPage({ sectionNumber, title }) {
  return (
    <div className="pdf-page section-page">
      <div className="section-content">
        <div className="section-number">{sectionNumber}</div>
        <div className="section-title">{title}</div>
      </div>
    </div>
  );
}

function SummaryPage({ data }) {
  return (
    <div className="pdf-page summary-page">
      <div className="summary-content">
        <h2>Performance Overview</h2>
        
        {/* Score Cards */}
        <div className="summary-metrics">
          <div className="summary-card">
            <div className="card-title">SEO Health</div>
            <div className="card-score">{data.metrics.seo}%</div>
            <div className="card-status warning">Needs Improvement</div>
          </div>
          <div className="summary-card">
            <div className="card-title">AI Visibility</div>
            <div className="card-score">{data.metrics.ai}%</div>
            <div className="card-status critical">Critical Issues</div>
          </div>
          <div className="summary-card">
            <div className="card-title">Performance</div>
            <div className="card-score">{data.metrics.performance}%</div>
            <div className="card-status good">Good</div>
          </div>
        </div>
        
        {/* Issue Summary */}
        <div className="issue-summary">
          <h3>Issue Breakdown</h3>
          <div className="issue-stats">
            <div className="issue-stat critical">
              <div className="issue-count">{data.issues.critical}</div>
              <div className="issue-label">Critical</div>
            </div>
            <div className="issue-stat warning">
              <div className="issue-count">{data.issues.warnings}</div>
              <div className="issue-label">Warnings</div>
            </div>
            <div className="issue-stat passed">
              <div className="issue-count">{data.issues.passed}</div>
              <div className="issue-label">Passed</div>
            </div>
          </div>
        </div>
        
        {/* AI Insight */}
        <div className="ai-insight">
          <h3>AI Insight</h3>
          <p>
            Your website has significant opportunities for improvement in AI visibility. 
            The low AI score ({data.metrics.ai}%) suggests that search engines may struggle 
            to understand your content structure and entity relationships. Focus on implementing 
            structured data and improving content clarity to enhance AI comprehension.
          </p>
        </div>
      </div>
    </div>
  );
}

// Global styles for the PDF document
const styles = `
  .pdf-container {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0f172a;
  }

  .pdf-page {
    width: 794px;
    min-height: 1123px;
    page-break-after: always;
    position: relative;
    overflow: hidden;
  }

  /* Cover Page Styles */
  .cover-page {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
  }

  .cover-content {
    text-align: center;
    max-width: 600px;
    width: 100%;
  }

  .domain-name {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 60px;
    color: #e2e8f0;
    letter-spacing: -0.5px;
  }

  .score-circle {
    width: 280px;
    height: 280px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 auto 60px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    box-shadow: 
      0 0 60px rgba(59, 130, 246, 0.3),
      0 20px 40px rgba(0, 0, 0, 0.2),
      inset 0 0 20px rgba(255, 255, 255, 0.1);
    position: relative;
  }

  .score-circle::before {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    background: linear-gradient(135deg, #60a5fa, #34d399, #fbbf24);
    z-index: -1;
    opacity: 0.3;
    filter: blur(20px);
  }

  .score-value {
    font-size: 72px;
    font-weight: 800;
    color: white;
    line-height: 1;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .score-label {
    font-size: 14px;
    color: #e2e8f0;
    text-transform: uppercase;
    letter-spacing: 2px;
    margin-top: 8px;
    font-weight: 500;
  }

  .metrics-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 60px;
  }

  .metric-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s ease;
  }

  .metric-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .metric-label {
    font-size: 12px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .metric-value {
    font-size: 36px;
    font-weight: 700;
    color: #60a5fa;
    text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
  }

  .bottom-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .stat-item {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #fbbf24;
    margin-bottom: 4px;
    text-shadow: 0 0 10px rgba(251, 191, 36, 0.3);
  }

  .stat-label {
    font-size: 11px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
  }

  /* Section Page Styles */
  .section-page {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 60px;
  }

  .section-content {
    text-align: center;
    max-width: 600px;
  }

  .section-number {
    font-size: 120px;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.1);
    line-height: 1;
    margin-bottom: 20px;
    letter-spacing: -2px;
  }

  .section-title {
    font-size: 48px;
    font-weight: 700;
    color: #e2e8f0;
    line-height: 1.2;
    letter-spacing: -1px;
  }

  /* Summary Page Styles */
  .summary-page {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
    color: white;
    padding: 60px;
  }

  .summary-content h2 {
    font-size: 36px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 40px;
    text-align: center;
    letter-spacing: -0.5px;
  }

  .summary-metrics {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 24px;
    margin-bottom: 40px;
  }

  .summary-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 24px;
    text-align: center;
    transition: all 0.3s ease;
  }

  .summary-card:hover {
    background: rgba(255, 255, 255, 0.08);
    transform: translateY(-2px);
  }

  .card-title {
    font-size: 14px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 12px;
    font-weight: 500;
  }

  .card-score {
    font-size: 42px;
    font-weight: 800;
    color: #60a5fa;
    margin-bottom: 8px;
    text-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
  }

  .card-status {
    font-size: 12px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .card-status.good {
    background: rgba(34, 197, 94, 0.2);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .card-status.warning {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.3);
  }

  .card-status.critical {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
  }

  .issue-summary {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 32px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .issue-summary h3 {
    font-size: 24px;
    font-weight: 600;
    color: #e2e8f0;
    margin-bottom: 24px;
    text-align: center;
  }

  .issue-stats {
    display: flex;
    justify-content: space-around;
    gap: 20px;
  }

  .issue-stat {
    text-align: center;
    flex: 1;
  }

  .issue-count {
    font-size: 36px;
    font-weight: 800;
    margin-bottom: 8px;
  }

  .issue-stat.critical .issue-count {
    color: #ef4444;
    text-shadow: 0 0 20px rgba(239, 68, 68, 0.5);
  }

  .issue-stat.warning .issue-count {
    color: #f59e0b;
    text-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
  }

  .issue-stat.passed .issue-count {
    color: #22c55e;
    text-shadow: 0 0 20px rgba(34, 197, 94, 0.5);
  }

  .issue-label {
    font-size: 12px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
  }

  .ai-insight {
    background: rgba(96, 165, 250, 0.1);
    border-radius: 16px;
    padding: 32px;
    border: 1px solid rgba(96, 165, 250, 0.2);
  }

  .ai-insight h3 {
    font-size: 20px;
    font-weight: 600;
    color: #60a5fa;
    margin-bottom: 16px;
  }

  .ai-insight p {
    font-size: 14px;
    line-height: 1.6;
    color: #e2e8f0;
    margin: 0;
  }

  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    .pdf-page {
      page-break-after: always;
    }
  }
`;

// Inject styles into the document
if (typeof window !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
