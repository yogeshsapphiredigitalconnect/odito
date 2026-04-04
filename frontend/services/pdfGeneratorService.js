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

/**
 * Reusable PDF Generator Service
 * Extracted from useExportPDF hook for API usage
 */
class PDFGeneratorService {
  constructor() {
    this.renderer = null;
  }

  /**
   * Generate 30-page PDF report for a project
   * @param {string} projectId - Project ID
   * @param {string} reportType - Type of report (seo/ai)
   * @param {function} onProgress - Progress callback (optional)
   * @returns {Promise<Blob>} PDF blob
   */
  async generatePDF(projectId, reportType = 'seo', onProgress = null) {
    // Validate inputs
    if (!projectId || projectId === 'undefined' || projectId === 'all') {
      throw new Error('Invalid project ID');
    }

    console.log('[PDF SERVICE] Starting PDF generation for project:', projectId);

    // Initialize renderer
    this.renderer = new PDFRenderer();
    this.renderer.initialize();

    try {
      // Create pages with projectId passed to components
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
        const page = pagesWithProjectId[i];
        
        // Update progress
        const progress = Math.round(((i + 1) / pagesWithProjectId.length) * 100);
        if (onProgress) {
          onProgress(progress);
        }

        console.log(`[PDF SERVICE] Rendering page ${i + 1}/${pagesWithProjectId.length}`);

        // Render component to canvas
        const canvas = await this.renderer.renderComponent(page.component, i, pagesWithProjectId.length);

        // Add to PDF
        this.renderer.addCanvasToPDF(canvas, i === 0);

        console.log(`[PDF SERVICE] Page ${i + 1}/${pagesWithProjectId.length} completed`);
      }

      // Generate PDF blob instead of saving
      const pdfBlob = this.renderer.getBlob();
      
      console.log('[PDF SERVICE] PDF generation completed successfully');

      return {
        success: true,
        blob: pdfBlob,
        pages: pagesWithProjectId.length
      };

    } catch (error) {
      console.error('[PDF SERVICE] PDF generation failed:', error.message);
      throw error;
    } finally {
      // Clean up renderer
      if (this.renderer) {
        this.renderer.cleanup();
        this.renderer = null;
      }
    }
  }

  /**
   * Generate PDF and return as buffer (for API response) with retry logic
   * @param {string} projectId - Project ID
   * @param {string} reportType - Type of report
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generatePDFBuffer(projectId, reportType = 'seo') {
    let lastError = null;
    
    // Retry logic for network safety
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[PDF SERVICE] Buffer generation attempt ${attempt}/2 for project: ${projectId}`);
        
        const result = await this.generatePDF(projectId, reportType);
        
        // Validate result before converting to buffer
        if (!result || !result.blob) {
          throw new Error('PDF generation returned invalid result');
        }
        
        const arrayBuffer = await result.blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Validate buffer
        if (!buffer || buffer.length === 0) {
          throw new Error('Generated PDF buffer is empty');
        }
        
        console.log(`[PDF SERVICE] Buffer generation successful on attempt ${attempt}, size: ${buffer.length} bytes`);
        return buffer;
        
      } catch (error) {
        lastError = error;
        console.error(`[PDF SERVICE] Buffer generation attempt ${attempt} failed:`, error.message);
        
        if (attempt < 2) {
          console.log(`[PDF SERVICE] Retrying buffer generation after 2 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    // All attempts failed
    console.error(`[PDF SERVICE] All buffer generation attempts failed for project: ${projectId}`);
    throw lastError;
  }
}

// Singleton instance
const pdfGeneratorService = new PDFGeneratorService();

export default pdfGeneratorService;
