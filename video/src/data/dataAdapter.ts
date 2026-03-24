// Data Adapter: Bridge between existing auditData and new component format
import { AuditData, Metric, TechnicalCheck } from "./auditData";
import { SlideNarration } from "../types";

// New format interfaces (matching ll/ components)
export interface OverviewData {
  scores: {
    seo_health: number;
    ai_visibility: number;
    performance: number;
    authority: number;
  };
  issues_summary: {
    critical: number;
    warning: number;
    info: number;
    passed: number;
  };
}

export interface PageSpeedData {
  performance_score: number;
  fcp_ms: number;
  lcp_ms: number;
  tbt_ms: number;
  si_ms: number;
  ttfb_ms: number;
}

export interface OnPageData {
  total_issues: number;
  issues: Array<{
    title: string;
    affected_count: number;
    severity: "critical" | "warning" | "info";
    impact?: string;
  }>;
}

export interface TechnicalData {
  health_score: number;
  critical_count: number;
  warning_count: number;
}

export interface KeywordData {
  opportunities: Array<{
    keyword: string;
    position: number;
    search_volume: number;
    opportunity_type: "improve_rank" | "boost_ctr" | "maintain" | "new";
  }>;
}

export interface AIVisibilityData {
  ai_score: number;
  geo_score: number;
  aeo_score: number;
  aiseo_score: number;
  schema_coverage_pct: number;
  faq_optimization_pct: number;
  conversational_score: number;
  ai_snippet_probability: number;
  ai_citation_rate: number;
}

export interface FinalRecommendationData {
  estimated_improvement: {
    seo_health: number;
    ai_visibility: number;
    performance: number;
  };
  priorities: Array<{
    title: string;
    difficulty: "easy" | "medium" | "hard";
    impact: string;
    timeframe: string;
  }>;
}

// Main adapter function
export const adaptToNewFormat = (auditData: AuditData) => {
  // Add debug logging to help identify data issues
  console.log("VIDEO PROPS:", JSON.stringify(auditData, null, 2));
  
  // Fail safe guard - if no data, return empty structure with all required properties
  if (!auditData) {
    console.warn("No auditData provided, returning empty structure");
    return {
      overview: { 
        scores: { seo_health: 0, ai_visibility: 0, performance: 0, authority: 0 }, 
        issues_summary: { critical: 0, warning: 0, info: 0, passed: 0 },
        site: { name: "Unknown Site", domain: "localhost" },
        pages_crawled: 0,
        audit_date: new Date().toLocaleDateString()
      },
      pagespeed: { 
        performance_score: 0, fcp_ms: 0, lcp_ms: 0, tbt_ms: 0, si_ms: 0, ttfb_ms: 0,
        seo_score: 0, accessibility_score: 0, best_practices_score: 0, cls: 0,
        device: "mobile" as const, url: "", top_opportunities: []
      },
      onpage: { 
        total_issues: 0, issues: [],
        quick_wins: []
      },
      technical: { 
        health_score: 0, critical_count: 0, warning_count: 0,
        checks: []
      },
      keywords: { 
        opportunities: [],
        total_keywords: 0, top3_count: 0, avg_position: 0
      },
      ai: { 
        ai_score: 0, geo_score: 0, aeo_score: 0, aiseo_score: 0, 
        schema_coverage_pct: 0, faq_optimization_pct: 0, conversational_score: 0, 
        ai_snippet_probability: 0, ai_citation_rate: 0,
        overall_ai_score: 0, kg_status: "missing" as const,
        llm_citations: [], entity_map: []
      },
      recommendations: { 
        estimated_improvement: { seo_health: 0, ai_visibility: 0, performance: 0 }, 
        priorities: []
      }
    };
  }

  // Extract performance metrics from existing data with safe defaults
  const getMetricValue = (metrics: Metric[] | undefined, metricName: string): number => {
    // Safe check for undefined metrics array
    if (!metrics || !Array.isArray(metrics)) {
      console.warn(`Metrics array is undefined or not an array for "${metricName}", using fallback value`);
      // Return sensible fallbacks for missing metrics
      switch(metricName) {
        case 'Speed Index': return 3500; // 3.5s fallback
        case 'Time to First Byte': return 600; // 600ms fallback
        case 'Cumulative Layout Shift': return 0.1; // CLS fallback
        case 'First Contentful Paint': return 1800; // 1.8s fallback
        case 'Largest Contentful Paint': return 2500; // 2.5s fallback
        case 'Total Blocking Time': return 300; // 300ms fallback
        default: return 0;
      }
    }
    
    const metric = metrics.find(m => m.metric === metricName);
    if (!metric) {
      console.warn(`Metric "${metricName}" not found in ${metrics.length} metrics, using fallback value`);
      // Return sensible fallbacks for missing metrics
      switch(metricName) {
        case 'Speed Index': return 3500; // 3.5s fallback
        case 'Time to First Byte': return 600; // 600ms fallback
        case 'Cumulative Layout Shift': return 0.1; // CLS fallback
        case 'First Contentful Paint': return 1800; // 1.8s fallback
        case 'Largest Contentful Paint': return 2500; // 2.5s fallback
        case 'Total Blocking Time': return 300; // 300ms fallback
        default: return 0;
      }
    }
    
    // Convert string values like "2.3s" or "150ms" to milliseconds
    const value = metric.value;
    if (typeof value === 'string') {
      if (value.includes('s') && !value.includes('ms')) return parseFloat(value) * 1000;
      if (value.includes('ms')) return parseFloat(value);
    }
    return Number(value) || 0;
  };

  // Safe defaults for topIssues arrays
  const safeTopIssues = auditData.topIssues || {
    critical: [],
    high: [],
    medium: [],
    low: []
  };

  // Safe defaults for technicalChecks (the original data structure)
  const safeTechnicalChecks: TechnicalCheck[] = auditData.technicalChecks || [];

  // Safe defaults for performanceMetrics
  const safePerformance = auditData.performanceMetrics || {
    mobileScore: 75,
    desktopScore: 85,
    pageSpeed: 80,
    mobile: [],
    desktop: []
  };

  // Safe defaults for scores
  const safeScores = auditData.scores || {
    overall: 75,
    performance: 75,
    seo: 80,
    aiVisibility: 70
  };

  // Safe defaults for issueDistribution
  const safeIssueDistribution = auditData.issueDistribution || {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  return {
    overview: {
      scores: {
        seo_health: safeScores.seo || 0,
        ai_visibility: safeScores.aiVisibility || 0,
        performance: safeScores.performance || 0,
        authority: 75, // TODO: Add authority data source
      },
      issues_summary: {
        critical: safeIssueDistribution.critical,
        warning: safeIssueDistribution.high,
        info: safeIssueDistribution.medium,
        passed: safeIssueDistribution.low,
      },
      site: {
        name: auditData.projectName || "Agency Platform",
        domain: auditData.url ? (auditData.url.startsWith('http') ? new URL(auditData.url).hostname : auditData.url) : 'localhost',
      },
      pages_crawled: 312, // TODO: Add pages crawled data
      audit_date: new Date().toLocaleDateString(),
    },

    pagespeed: {
      performance_score: safePerformance.mobileScore,
      seo_score: safeScores.seo,
      accessibility_score: 85, // TODO: Add accessibility data
      best_practices_score: 78, // TODO: Add best practices data
      fcp_ms: getMetricValue(safePerformance.mobile, 'First Contentful Paint'),
      lcp_ms: getMetricValue(safePerformance.mobile, 'Largest Contentful Paint'),
      tbt_ms: getMetricValue(safePerformance.mobile, 'Total Blocking Time'),
      si_ms: getMetricValue(safePerformance.mobile, 'Speed Index'),
      ttfb_ms: getMetricValue(safePerformance.mobile, 'Time to First Byte'),
      cls: 0.15, // TODO: Add CLS metric data
      device: "mobile" as const,
      url: auditData.url,
      top_opportunities: [
        {
          title: "Optimize Images",
          impact: "High",
          savings: "2.3s",
          savings_ms: 2300
        },
        {
          title: "Reduce Server Response Time",
          impact: "Medium", 
          savings: "800ms",
          savings_ms: 800
        },
        {
          title: "Eliminate Render-Blocking Resources",
          impact: "High",
          savings: "1.1s",
          savings_ms: 1100
        }
      ]
    },

    onpage: {
      total_issues: safeIssueDistribution.total,
      issues: [
        ...(safeTopIssues.high || []).map((title) => ({
          title,
          affected_count: Math.floor((Math.random() * 15) + 5),
          severity: 'critical' as const,
          impact: `+${Math.floor((Math.random() * 20) + 10)}% CTR`
        })),
        ...(safeTopIssues.medium || []).map((title) => ({
          title,
          affected_count: Math.floor((Math.random() * 10) + 2),
          severity: 'warning' as const,
          impact: `+${Math.floor((Math.random() * 15) + 5)}% CTR`
        })),
        ...(safeTopIssues.low || []).map((title) => ({
          title,
          affected_count: Math.floor((Math.random() * 8) + 1),
          severity: 'info' as const
        })),
      ],
      quick_wins: [
        {
          title: "Add Meta Descriptions",
          impact: "+15% CTR",
          effort: "low" as const
        },
        {
          title: "Optimize H1 Tags",
          impact: "+10% Rankings",
          effort: "low" as const
        },
        {
          title: "Add ALT Text to Images",
          impact: "+8% Image Search",
          effort: "medium" as const
        }
      ]
    },

    technical: {
      health_score: Math.round((safeScores.performance + safeScores.seo) / 2),
      critical_count: safeIssueDistribution.critical,
      warning_count: safeIssueDistribution.high,
      checks: safeTechnicalChecks.map((check: TechnicalCheck) => ({
        name: check.name || 'Unknown Check',
        status: check.status === 'FAIL' ? 'critical' as const : 
                check.status === 'WARN' ? 'warning' as const : 'passed' as const,
        detail: check.detail || 'No details available',
        affected_urls: Math.floor((Math.random() * 50) + 1) // Placeholder
      }))
    },

    keywords: {
      total_keywords: 156, // TODO: Add keyword data
      top3_count: 12, // TODO: Add keyword ranking data
      avg_position: 18.5, // TODO: Add average position data
      opportunities: [
        {
          keyword: "seo audit software",
          position: 11,
          google_position: 11,
          search_volume: 4400,
          opportunity_type: "improve_rank" as const,
          opportunity_tag: "High Potential",
          google_prev: 15,
          url: auditData.url,
          gsc_ctr: 2.8
        },
        {
          keyword: "website seo checker",
          position: 15,
          google_position: 15,
          search_volume: 3200,
          opportunity_type: "boost_ctr" as const,
          opportunity_tag: "Quick Win",
          google_prev: 22,
          url: auditData.url,
          gsc_ctr: 1.9
        },
        {
          keyword: "technical seo analysis",
          position: 9,
          google_position: 9,
          search_volume: 2100,
          opportunity_type: "maintain" as const,
          opportunity_tag: "Defend",
          google_prev: 8,
          url: auditData.url,
          gsc_ctr: 4.2
        },
      ],
    },

    ai: {
      overall_ai_score: safeScores.aiVisibility,
      ai_score: safeScores.aiVisibility,
      geo_score: Math.round(safeScores.aiVisibility * 0.9),
      aeo_score: Math.round(safeScores.aiVisibility * 0.8),
      aiseo_score: Math.round(safeScores.aiVisibility * 0.85),
      schema_coverage_pct: 34,
      faq_optimization_pct: 28,
      conversational_score: Math.round(safeScores.aiVisibility * 0.7),
      ai_snippet_probability: Math.round(safeScores.aiVisibility * 0.6),
      ai_citation_rate: Math.round(safeScores.aiVisibility * 0.5),
      kg_status: safeScores.aiVisibility > 70 ? "linked" as const : 
                safeScores.aiVisibility > 40 ? "partial" as const : "missing" as const,
      llm_citations: [
        {
          platform: "ChatGPT",
          count: Math.floor(safeScores.aiVisibility * 0.3),
          growth: 15
        },
        {
          platform: "Claude",
          count: Math.floor(safeScores.aiVisibility * 0.2),
          growth: 22
        },
        {
          platform: "Gemini",
          count: Math.floor(safeScores.aiVisibility * 0.4),
          growth: 8
        }
      ],
      entity_map: [
        {
          entity: "Brand",
          status: safeScores.aiVisibility > 60 ? "linked" as const : "partial" as const,
          confidence: safeScores.aiVisibility
        },
        {
          entity: "Products",
          status: "missing" as const,
          confidence: 25
        },
        {
          entity: "Services",
          status: "partial" as const,
          confidence: 45
        }
      ]
    },

    recommendations: {
      estimated_improvement: {
        seo_health: Math.min(100, safeScores.seo + 15),
        ai_visibility: Math.min(100, safeScores.aiVisibility + 25),
        performance: Math.min(100, safeScores.performance + 10),
      },
      top_priorities: [
        {
          title: "Add Schema Markup to Top Pages",
          difficulty: "easy" as const,
          impact: "+15% AI Visibility",
          timeframe: "2-3 days"
        },
        {
          title: "Optimize Core Web Vitals",
          difficulty: "medium" as const,
          impact: "+10% Performance",
          timeframe: "1 week"
        },
        {
          title: "Fix Critical Technical Issues",
          difficulty: "easy" as const,
          impact: "+20% SEO Health",
          timeframe: "3-5 days"
        },
      ],
      next_steps: [
        {
          step: "Week 1: Schema + Noindex fixes",
          status: "Ready to start"
        },
        {
          step: "Week 2: Performance optimization",
          status: "Scheduled"
        },
        {
          step: "Week 3: Content enhancement",
          status: "Planned"
        }
      ]
    },
  };
};

// Sample narration data (can be customized)
export const sampleNarration: SlideNarration[] = [
  {
    title: "Overview",
    voice_over: "Welcome to your SEO audit report. Your overall scores show room for improvement across key areas.",
    highlights: ["SEO Health", "AI Visibility", "Performance"],
  },
  {
    title: "On-Page Issues",
    voice_over: "Several on-page SEO issues are impacting your search visibility and user engagement.",
    highlights: ["Critical Issues", "Missing Elements", "Quick Wins"],
  },
  {
    title: "Technical SEO",
    voice_over: "Technical foundation is solid but some optimizations can boost your performance.",
    highlights: ["Health Score", "Technical Issues", "Recommendations"],
  },
  {
    title: "Page Speed",
    voice_over: "Your page speed metrics need attention to improve user experience and search rankings.",
    highlights: ["Mobile Score", "Core Web Vitals", "Optimization Needed"],
  },
  {
    title: "Keywords",
    voice_over: "Keyword opportunities exist to improve your search rankings and traffic.",
    highlights: ["Near-Top Keywords", "Search Volume", "Growth Potential"],
  },
  {
    title: "AI Visibility",
    voice_over: "AI search visibility is emerging as crucial for future search success.",
    highlights: ["AI Score", "Schema Coverage", "Optimization Opportunities"],
  },
];
