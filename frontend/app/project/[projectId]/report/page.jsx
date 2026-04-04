'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import apiService from '@/lib/apiService';

// Import your actual 30-page PDF components
import CoverPage from '../../../../pdf/src/components/sections/Page01Cover';
import SectionDivider from '../../../../pdf/src/components/sections/SectionDivider';
import ExecutiveSummaryPage from '../../../../pdf/src/components/sections/Page03ExecutiveSummary';
import KeyStrengthsPage from '../../../../pdf/src/components/sections/Page04KeyStrengths';
import PriorityRoadmapPage from '../../../../pdf/src/components/sections/Page05Roadmap';
import SEOHealthOverviewPage from '../../../../pdf/src/components/sections/Page06SEOHealth';
import OnPageSEOPage from '../../../../pdf/src/components/sections/Page08OnPageSEO';
import { StructuredDataPage, TechnicalSEOPage, CrawlabilityPage } from '../../../../pdf/src/components/sections/Pages09_10_11';
import { CoreWebVitalsPage, PerformanceOpportunitiesPage } from '../../../../pdf/src/components/sections/Pages13_14';
import { KeywordRankingPage, KeywordOpportunityPage } from '../../../../pdf/src/components/sections/Pages16_17';
import { AIVisibilityOverviewPage, LLMCitationForecastPage } from '../../../../pdf/src/components/sections/Pages19_21';
import { LLMVisibilityPage, AIContentReadinessPage, AIContentStrategyPage } from '../../../../pdf/src/components/sections/Pages20_22_23';
import KnowledgeGraphPage from '../../../../pdf/src/components/sections/Page24KnowledgeGraph';
import AIOptimisationPage from '../../../../pdf/src/components/sections/Page26AIOptimisation';
import AIGrowthForecastPage from '../../../../pdf/src/components/sections/Page27GrowthForecast';
import ActionPlanPage from '../../../../pdf/src/components/sections/Page28ActionPlan';
import AuditMethodologyPage from '../../../../pdf/src/components/sections/Page29Methodology';
import AboutOditoPage from '../../../../pdf/src/components/sections/Page30About';

export default function ReportPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [isExportMode, setIsExportMode] = useState(false);
  const [reportType, setReportType] = useState('seo');
  const [projectId, setProjectId] = useState(null);
  
  // Real data states
  const [project, setProject] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [issueCounts, setIssueCounts] = useState({
    critical: 0,
    warnings: 0,
    informational: 0,
    passed: 0
  });
  const [technicalHealth, setTechnicalHealth] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (params?.projectId) {
      setProjectId(params.projectId);
    }
    
    // Check if we're in export mode
    setIsExportMode(searchParams.get('export') === 'true');
    setReportType(searchParams.get('type') || 'seo');
  }, [params, searchParams]);

  // Fetch real data when projectId is available
  useEffect(() => {
    if (!projectId) return;
    
    // Check authentication before fetching data
    if (!apiService.isAuthenticated()) {
      console.log('[REPORT] No token found, redirecting to login');
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`[REPORT] Fetching real data for project: ${projectId}`);
        
        // Fetch all data in parallel - same as dashboard
        await Promise.all([
          fetchProjectData(projectId),
          fetchIssueCounts(projectId),
          fetchDashboardData(projectId),
          fetchTechnicalHealth(projectId)
        ]);
        
        console.log(`[REPORT] All data fetched successfully`);
        
        // Add #report-loaded marker for Puppeteer
        if (!document.getElementById('report-loaded')) {
          const marker = document.createElement('div');
          marker.id = 'report-loaded';
          marker.style.display = 'none';
          document.body.appendChild(marker);
          console.log('[REPORT] Added #report-loaded marker for Puppeteer');
        }
        
      } catch (error) {
        console.error('[REPORT] Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [projectId]);

  const fetchProjectData = async (projectId) => {
    try {
      const res = await apiService.getProjectById(projectId);
      if (res.success) {
        setProject(res.data);
        console.log('[REPORT] Project data loaded:', res.data.project_name);
      }
    } catch (err) {
      console.error('[REPORT] Error fetching project data:', err);
      // Check if it's an authentication error
      if (err.message.includes('Access denied') || err.message.includes('No token provided') || err.message.includes('Unauthorized')) {
        console.log('[REPORT] Authentication error, redirecting to login');
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      throw err;
    }
  };

  const fetchIssueCounts = async (projectId) => {
    try {
      const response = await apiService.request(`/pdf/${projectId}/executive`);
      
      if (response && response.success && response.data) {
        const executiveData = response.data;
        
        let issues = null;
        
        if (executiveData.success && executiveData.data && executiveData.data.issues) {
          issues = executiveData.data.issues;
        } else if (executiveData.data && executiveData.data.issues) {
          issues = executiveData.data.issues;
        } else if (executiveData.issues) {
          issues = executiveData.issues;
        }
        
        if (issues && typeof issues === 'object') {
          setIssueCounts({
            critical: issues.critical || 0,
            warnings: issues.warnings || 0,
            informational: issues.informational || 0,
            passed: issues.passed || 0
          });
          console.log('[REPORT] Issue counts loaded:', issues);
        }
      }
    } catch (error) {
      console.error('[REPORT] Error fetching issue counts:', error);
      // Check if it's an authentication error
      if (error.message.includes('Access denied') || error.message.includes('No token provided') || error.message.includes('Unauthorized')) {
        console.log('[REPORT] Authentication error, redirecting to login');
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      throw error;
    }
  };

  const fetchDashboardData = async (projectId) => {
    try {
      const response = await apiService.request(`/app_user/projects/${projectId}/dashboard`);
      if (response.success) {
        setDashboardData(response.data);
        console.log('[REPORT] Dashboard data loaded');
      }
    } catch (error) {
      console.error('[REPORT] Error fetching dashboard data:', error);
      // Check if it's an authentication error
      if (error.message.includes('Access denied') || error.message.includes('No token provided') || error.message.includes('Unauthorized')) {
        console.log('[REPORT] Authentication error, redirecting to login');
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      throw error;
    }
  };

  const fetchTechnicalHealth = async (projectId) => {
    try {
      const response = await apiService.getTechnicalChecks(projectId);
      if (response && response.success) {
        setTechnicalHealth(response.data?.healthScore || 0);
        console.log('[REPORT] Technical health loaded:', response.data?.healthScore);
      }
    } catch (error) {
      console.error('[REPORT] Error fetching technical health:', error);
      // Check if it's an authentication error
      if (error.message.includes('Access denied') || error.message.includes('No token provided') || error.message.includes('Unauthorized')) {
        console.log('[REPORT] Authentication error, redirecting to login');
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        return;
      }
      // Don't throw - technical health is optional
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'Arial, sans-serif',
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#1e293b', marginBottom: '1rem' }}>
            Loading Report Data...
          </h2>
          <p style={{ color: '#64748b' }}>
            Fetching real data from database...
          </p>
        </div>
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
        background: '#f8fafc'
      }}>
        <div style={{ textAlign: 'center', color: '#dc2626' }}>
          <h2>Error Loading Report</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isExportMode) {
    // Export mode: render all 30 pages using your actual components with real data
    return (
      <div style={{ background: '#F1F5F9' }}>
        {/* Page 1: Cover */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm', // A4 height
          width: '210mm', // A4 width
        }}>
          <CoverPage projectId={projectId} />
        </div>

        {/* Page 2: Section Divider */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <SectionDivider pageNum={2} sectionNum={1} title="Executive Summary" subtitle="Scores, issue overview and AI-generated analysis" />
        </div>

        {/* Page 3: Executive Summary */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <ExecutiveSummaryPage projectId={projectId} />
        </div>

        {/* Page 4: Key Strengths */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <KeyStrengthsPage />
        </div>

        {/* Page 5: Priority Roadmap */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <PriorityRoadmapPage />
        </div>

        {/* Page 6: SEO Health Overview */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <SEOHealthOverviewPage projectId={projectId} />
        </div>

        {/* Page 7: Section Divider */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <SectionDivider pageNum={7} sectionNum={2} title="SEO Audit" subtitle="On-page, schema, technical and crawlability" />
        </div>

        {/* Page 8: On-Page SEO */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <OnPageSEOPage projectId={projectId} />
        </div>

        {/* Page 9: Structured Data */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <StructuredDataPage projectId={projectId} />
        </div>

        {/* Page 10: Technical SEO */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <TechnicalSEOPage projectId={projectId} />
        </div>

        {/* Page 11: Crawlability */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <CrawlabilityPage projectId={projectId} />
        </div>

        {/* Page 12: Section Divider */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <SectionDivider pageNum={12} sectionNum={3} title="Performance Analysis" subtitle="Core Web Vitals, Lighthouse and optimisation roadmap" />
        </div>

        {/* Page 13: Core Web Vitals */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <CoreWebVitalsPage projectId={projectId} />
        </div>

        {/* Page 14: Performance Opportunities */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <PerformanceOpportunitiesPage />
        </div>

        {/* Page 15: Section Divider */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <SectionDivider pageNum={15} sectionNum={4} title="Keyword Analysis" subtitle="Rankings, positions and near-page-1 opportunities" />
        </div>

        {/* Page 16: Keyword Ranking */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <KeywordRankingPage projectId={projectId} />
        </div>

        {/* Page 17: Keyword Opportunity */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <KeywordOpportunityPage />
        </div>

        {/* Page 18: Section Divider */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <SectionDivider pageNum={18} sectionNum={5} title="AI Visibility" subtitle="GEO, AEO, AISEO — visibility across AI search platforms" />
        </div>

        {/* Page 19: AI Visibility Overview */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <AIVisibilityOverviewPage projectId={projectId} />
        </div>

        {/* Page 20: LLM Visibility */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <LLMVisibilityPage />
        </div>

        {/* Page 21: LLM Citation Forecast */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <LLMCitationForecastPage />
        </div>

        {/* Page 22: AI Content Readiness */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <AIContentReadinessPage projectId={projectId} />
        </div>

        {/* Page 23: AI Content Strategy */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <AIContentStrategyPage />
        </div>

        {/* Page 24: Knowledge Graph */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <KnowledgeGraphPage />
        </div>

        {/* Page 25: Section Divider */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <SectionDivider pageNum={25} sectionNum={6} title="Action Plan & Forecast" subtitle="30-day roadmap, growth projection and methodology" />
        </div>

        {/* Page 26: AI Optimisation */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <AIOptimisationPage />
        </div>

        {/* Page 27: AI Growth Forecast */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <AIGrowthForecastPage />
        </div>

        {/* Page 28: Action Plan */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <ActionPlanPage />
        </div>

        {/* Page 29: Audit Methodology */}
        <div style={{ 
          pageBreakAfter: 'always',
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <AuditMethodologyPage />
        </div>

        {/* Page 30: About Odito */}
        <div style={{ 
          background: '#fff',
          margin: '0',
          padding: '0',
          minHeight: '297mm',
          width: '210mm',
        }}>
          <AboutOditoPage />
        </div>
      </div>
    );
  }

  // Normal mode: show loading or message
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif',
      background: '#f8fafc'
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1 style={{ color: '#1e293b', marginBottom: '1rem' }}>
          PDF Report Generator
        </h1>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Project ID: {projectId}
        </p>
        <p style={{ color: '#64748b', marginBottom: '1rem' }}>
          Report Type: {reportType}
        </p>
        <p style={{ color: '#059669', fontSize: '0.875rem' }}>
          Using your actual 30-page PDF components with REAL data
        </p>
        <p style={{ color: '#059669', fontSize: '0.875rem' }}>
          Add ?export=true to generate PDF
        </p>
        {project && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#e0f2fe', borderRadius: '8px' }}>
            <p style={{ color: '#0c4a6e', fontSize: '0.875rem' }}>
              Real data loaded for: {project.project_name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
