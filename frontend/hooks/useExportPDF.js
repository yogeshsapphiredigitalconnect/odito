import { useState, useCallback, useRef } from 'react';
import pdfGeneratorService from '../services/pdfGeneratorService';

// Import all PDF page components
import CoverPage from '../pdf/src/components/sections/Page01Cover';
import SectionDivider from '../pdf/src/components/sections/SectionDivider';
import ExecutiveSummaryPage from '../pdf/src/components/sections/Page03ExecutiveSummary';
import KeyStrengthsPage from '../pdf/src/components/sections/Page04KeyStrengths';
import PriorityRoadmapPage from '../pdf/src/components/sections/Page05Roadmap';
import SEOHealthOverviewPage from '../pdf/src/components/sections/Page06SEOHealth';
import OnPageSEOPage from '../pdf/src/components/sections/Page08OnPageSEO';
import { StructuredDataPage, TechnicalSEOPage, CrawlabilityPage } from '../pdf/src/components/sections/Pages09_10_11';
import { CoreWebVitalsPage, PerformanceOpportunitiesPage } from '../pdf/src/components/sections/Pages13_14';
import { KeywordRankingPage, KeywordOpportunityPage } from '../pdf/src/components/sections/Pages16_17';
import { AIVisibilityOverviewPage, LLMCitationForecastPage } from '../pdf/src/components/sections/Pages19_21';
import { LLMVisibilityPage, AIContentReadinessPage, AIContentStrategyPage } from '../pdf/src/components/sections/Pages20_22_23';
import KnowledgeGraphPage from '../pdf/src/components/sections/Page24KnowledgeGraph';
import AIOptimisationPage from '../pdf/src/components/sections/Page26AIOptimisation';
import AIGrowthForecastPage from '../pdf/src/components/sections/Page27GrowthForecast';
import ActionPlanPage from '../pdf/src/components/sections/Page28ActionPlan';
import AuditMethodologyPage from '../pdf/src/components/sections/Page29Methodology';
import AboutOditoPage from '../pdf/src/components/sections/Page30About';

// Define all 30 pages in order
const pages = [
  { id: 'p01', component: <CoverPage /> },
  { id: 'p02', component: <SectionDivider pageNum={2} sectionNum={1} title="Executive Summary" subtitle="Scores, issue overview and AI-generated analysis" /> },
  { id: 'p03', component: <ExecutiveSummaryPage /> },
  { id: 'p04', component: <KeyStrengthsPage /> },
  { id: 'p05', component: <PriorityRoadmapPage /> },
  { id: 'p06', component: <SEOHealthOverviewPage /> },
  { id: 'p07', component: <SectionDivider pageNum={7} sectionNum={2} title="SEO Audit" subtitle="On-page, schema, technical and crawlability" /> },
  { id: 'p08', component: <OnPageSEOPage /> },
  { id: 'p09', component: <StructuredDataPage /> },
  { id: 'p10', component: <TechnicalSEOPage /> },
  { id: 'p11', component: <CrawlabilityPage /> },
  { id: 'p12', component: <SectionDivider pageNum={12} sectionNum={3} title="Performance Analysis" subtitle="Core Web Vitals, Lighthouse and optimisation roadmap" /> },
  { id: 'p13', component: <CoreWebVitalsPage /> },
  { id: 'p14', component: <PerformanceOpportunitiesPage /> },
  { id: 'p15', component: <SectionDivider pageNum={15} sectionNum={4} title="Keyword Analysis" subtitle="Rankings, positions and near-page-1 opportunities" /> },
  { id: 'p16', component: <KeywordRankingPage /> },
  { id: 'p17', component: <KeywordOpportunityPage /> },
  { id: 'p18', component: <SectionDivider pageNum={18} sectionNum={5} title="AI Visibility" subtitle="GEO, AEO, AISEO — visibility across AI search platforms" /> },
  { id: 'p19', component: <AIVisibilityOverviewPage /> },
  { id: 'p20', component: <LLMVisibilityPage /> },
  { id: 'p21', component: <LLMCitationForecastPage /> },
  { id: 'p22', component: <AIContentReadinessPage /> },
  { id: 'p23', component: <AIContentStrategyPage /> },
  { id: 'p24', component: <KnowledgeGraphPage /> },
  { id: 'p25', component: <SectionDivider pageNum={25} sectionNum={6} title="Action Plan & Forecast" subtitle="30-day roadmap, growth projection and methodology" /> },
  { id: 'p26', component: <AIOptimisationPage /> },
  { id: 'p27', component: <AIGrowthForecastPage /> },
  { id: 'p28', component: <ActionPlanPage /> },
  { id: 'p29', component: <AuditMethodologyPage /> },
  { id: 'p30', component: <AboutOditoPage /> },
];

/**
 * Hook for exporting PDF reports using React components + html2canvas + jsPDF
 * @returns {object} - { exportPDF, loading, error, progress }
 */
export function useExportPDF() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const abortControllerRef = useRef(null);
  const isExportingRef = useRef(false);

  const exportPDF = useCallback(async (projectId, reportType) => {
    // Prevent concurrent exports
    if (isExportingRef.current) {
      console.warn('[PDF EXPORT] Export already in progress, ignoring duplicate request');
      return;
    }

    // Validate inputs
    if (!projectId || projectId === 'undefined' || projectId === 'all') {
      const err = new Error('Invalid project ID');
      setError(err.message);
      throw err;
    }

    // Set loading state
    isExportingRef.current = true;
    setLoading(true);
    setError(null);
    setProgress(0);
    abortControllerRef.current = new AbortController();

    try {
      console.log('[PDF EXPORT] Starting PDF export for project:', projectId);

      // Use the service to generate PDF
      const result = await pdfGeneratorService.generatePDF(projectId, reportType, (progress) => {
        setProgress(progress);
      });

      // Convert blob to download
      const url = URL.createObjectURL(result.blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `report-export-${projectId}-${timestamp}.pdf`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up URL
      URL.revokeObjectURL(url);

      console.log('[PDF EXPORT] PDF export completed successfully');

      return {
        success: true,
        filename,
        pages: result.pages
      };

    } catch (err) {
      console.error('[PDF EXPORT] PDF export failed:', err.message);
      setError(err.message);
      throw err;

    } finally {
      setLoading(false);
      setProgress(0);
      isExportingRef.current = false;
      abortControllerRef.current = null;
    }
  }, []);

  const cancelExport = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isExportingRef.current = false;
    setLoading(false);
    setProgress(0);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    exportPDF,
    cancelExport,
    clearError,
    loading,
    error,
    progress
  };
}

export default useExportPDF;
