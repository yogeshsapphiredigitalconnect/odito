// Data Adapter: Bridge between existing auditData and new component format
import { AuditData, Metric } from "./auditData";
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
  // Extract performance metrics from existing data
  const getMetricValue = (metrics: Metric[], metricName: string): number => {
    const metric = metrics.find(m => m.metric === metricName);
    if (!metric) {
      console.warn(`Metric "${metricName}" not found, using fallback value`);
      // Return sensible fallbacks for missing metrics
      switch(metricName) {
        case 'Speed Index': return 3500; // 3.5s fallback
        case 'Time to First Byte': return 600; // 600ms fallback
        case 'Cumulative Layout Shift': return 0.1; // CLS fallback
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

  return {
    overview: {
      scores: {
        seo_health: auditData.scores.seo,
        ai_visibility: auditData.scores.aiVisibility,
        performance: auditData.scores.performance,
        authority: 75, // TODO: Add authority data source
      },
      issues_summary: {
        critical: auditData.issueDistribution.critical,
        warning: auditData.issueDistribution.high,
        info: auditData.issueDistribution.medium,
        passed: auditData.issueDistribution.low,
      },
      site: {
        name: auditData.projectName || "Agency Platform",
        domain: new URL(auditData.url).hostname,
      },
      pages_crawled: 312, // TODO: Add pages crawled data
      audit_date: new Date().toLocaleDateString(),
    },

    pagespeed: {
      performance_score: auditData.performanceMetrics.mobileScore,
      seo_score: auditData.scores.seo,
      accessibility_score: 85, // TODO: Add accessibility data
      best_practices_score: 78, // TODO: Add best practices data
      fcp_ms: getMetricValue(auditData.performanceMetrics.mobile, 'First Contentful Paint'),
      lcp_ms: getMetricValue(auditData.performanceMetrics.mobile, 'Largest Contentful Paint'),
      tbt_ms: getMetricValue(auditData.performanceMetrics.mobile, 'Total Blocking Time'),
      si_ms: getMetricValue(auditData.performanceMetrics.mobile, 'Speed Index'),
      ttfb_ms: getMetricValue(auditData.performanceMetrics.mobile, 'Time to First Byte'),
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
      total_issues: auditData.issueDistribution.total,
      issues: [
        ...auditData.topIssues.high.map((title) => ({
          title,
          affected_count: Math.floor((Math.random() * 15) + 5),
          severity: 'critical' as const,
          impact: `+${Math.floor((Math.random() * 20) + 10)}% CTR`
        })),
        ...auditData.topIssues.medium.map((title) => ({
          title,
          affected_count: Math.floor((Math.random() * 10) + 2),
          severity: 'warning' as const,
          impact: `+${Math.floor((Math.random() * 15) + 5)}% CTR`
        })),
        ...auditData.topIssues.low.map((title) => ({
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
      health_score: Math.round((auditData.scores.performance + auditData.scores.seo) / 2),
      critical_count: auditData.issueDistribution.critical,
      warning_count: auditData.issueDistribution.high,
      checks: auditData.technicalChecks.map(check => ({
        name: check.name,
        status: check.status === 'FAIL' ? 'critical' as const : 
                check.status === 'WARN' ? 'warning' as const : 'passed' as const,
        detail: check.detail,
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
      overall_ai_score: auditData.scores.aiVisibility,
      ai_score: auditData.scores.aiVisibility,
      geo_score: Math.round(auditData.scores.aiVisibility * 0.9),
      aeo_score: Math.round(auditData.scores.aiVisibility * 0.8),
      aiseo_score: Math.round(auditData.scores.aiVisibility * 0.85),
      schema_coverage_pct: 34,
      faq_optimization_pct: 28,
      conversational_score: Math.round(auditData.scores.aiVisibility * 0.7),
      ai_snippet_probability: Math.round(auditData.scores.aiVisibility * 0.6),
      ai_citation_rate: Math.round(auditData.scores.aiVisibility * 0.5),
      kg_status: auditData.scores.aiVisibility > 70 ? "linked" as const : 
                auditData.scores.aiVisibility > 40 ? "partial" as const : "missing" as const,
      llm_citations: [
        {
          platform: "ChatGPT",
          count: Math.floor(auditData.scores.aiVisibility * 0.3),
          growth: 15
        },
        {
          platform: "Claude",
          count: Math.floor(auditData.scores.aiVisibility * 0.2),
          growth: 22
        },
        {
          platform: "Gemini",
          count: Math.floor(auditData.scores.aiVisibility * 0.4),
          growth: 8
        }
      ],
      entity_map: [
        {
          entity: "Brand",
          status: auditData.scores.aiVisibility > 60 ? "linked" as const : "partial" as const,
          confidence: auditData.scores.aiVisibility
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
        seo_health: Math.min(100, auditData.scores.seo + 15),
        ai_visibility: Math.min(100, auditData.scores.aiVisibility + 25),
        performance: Math.min(100, auditData.scores.performance + 10),
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
