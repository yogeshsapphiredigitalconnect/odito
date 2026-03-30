import { useState, useCallback, useRef } from 'react';
import PDFRenderer from '../utils/pdfRenderer';

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

    // NEW APPROACH: No need to preload fonts - iframe handles font loading

    const renderer = new PDFRenderer();

    try {
      console.log('[PDF EXPORT] Starting PDF export for project:', projectId);

      // Verify projectId is available
      console.log("PDF projectId in useExportPDF:", projectId);

      // Initialize renderer
      renderer.initialize();

      // Create pages with projectId passed to Executive Summary
      const pagesWithProjectId = [
        { id: 'p01', component: <CoverPage projectId={projectId} /> },
        { id: 'p02', component: <SectionDivider pageNum={2} sectionNum={1} title="Executive Summary" subtitle="Scores, issue overview and AI-generated analysis" /> },
        { id: 'p03', component: <ExecutiveSummaryPage projectId={projectId} /> },
        { id: 'p04', component: <KeyStrengthsPage /> },
        { id: 'p05', component: <PriorityRoadmapPage /> },
        { id: 'p06', component: <SEOHealthOverviewPage projectId={projectId} /> },
        { id: 'p07', component: <SectionDivider pageNum={7} sectionNum={2} title="SEO Audit" subtitle="On-page, schema, technical and crawlability" /> },
        { id: 'p08', component: <OnPageSEOPage projectId={projectId} /> },
        { id: 'p09', component: <StructuredDataPage projectId={projectId} /> },
        { id: 'p10', component: <TechnicalSEOPage projectId={projectId} /> },
        { id: 'p11', component: <CrawlabilityPage projectId={projectId} /> },
        { id: 'p12', component: <SectionDivider pageNum={12} sectionNum={3} title="Performance Analysis" subtitle="Core Web Vitals, Lighthouse and optimisation roadmap" /> },
        { id: 'p13', component: <CoreWebVitalsPage projectId={projectId} /> },
        { id: 'p14', component: <PerformanceOpportunitiesPage /> },
        { id: 'p15', component: <SectionDivider pageNum={15} sectionNum={4} title="Keyword Analysis" subtitle="Rankings, positions and near-page-1 opportunities" /> },
        { id: 'p16', component: <KeywordRankingPage projectId={projectId} /> },
        { id: 'p17', component: <KeywordOpportunityPage /> },
        { id: 'p18', component: <SectionDivider pageNum={18} sectionNum={5} title="AI Visibility" subtitle="GEO, AEO, AISEO — visibility across AI search platforms" /> },
        { id: 'p19', component: <AIVisibilityOverviewPage projectId={projectId} /> },
        { id: 'p20', component: <LLMVisibilityPage /> },
        { id: 'p21', component: <LLMCitationForecastPage /> },
        { id: 'p22', component: <AIContentReadinessPage projectId={projectId} /> },
        { id: 'p23', component: <AIContentStrategyPage /> },
        { id: 'p24', component: <KnowledgeGraphPage /> },
        { id: 'p25', component: <SectionDivider pageNum={25} sectionNum={6} title="Action Plan & Forecast" subtitle="30-day roadmap, growth projection and methodology" /> },
        { id: 'p26', component: <AIOptimisationPage /> },
        { id: 'p27', component: <AIGrowthForecastPage /> },
        { id: 'p28', component: <ActionPlanPage /> },
        { id: 'p29', component: <AuditMethodologyPage /> },
        { id: 'p30', component: <AboutOditoPage /> },
      ];

      // Render each page
      for (let i = 0; i < pagesWithProjectId.length; i++) {
        // Check if export was aborted
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Export aborted');
        }

        const page = pagesWithProjectId[i];
        
        // Update progress
        setProgress(Math.round(((i + 1) / pagesWithProjectId.length) * 100));

        console.log(`[PDF EXPORT] Rendering page ${i + 1}/${pagesWithProjectId.length}`);

        // Render component to canvas
        const canvas = await renderer.renderComponent(page.component, i, pagesWithProjectId.length);

        // Add to PDF
        renderer.addCanvasToPDF(canvas, i === 0);

        console.log(`[PDF EXPORT] Page ${i + 1}/${pagesWithProjectId.length} completed`);
      }

      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `report-export-${projectId}-${timestamp}.pdf`;

      // Save PDF
      renderer.save(filename);

      console.log('[PDF EXPORT] PDF export completed successfully');

      return {
        success: true,
        filename,
        pages: pagesWithProjectId.length
      };

    } catch (err) {
      // Handle abort gracefully
      if (err.message === 'Export aborted') {
        console.log('[PDF EXPORT] Export cancelled');
        return { success: false, cancelled: true };
      }

      console.error('[PDF EXPORT] PDF export failed:', err.message);
      setError(err.message);
      throw err;

    } finally {
      // Clean up renderer
      renderer.cleanup();
      
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
