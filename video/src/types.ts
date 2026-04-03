// Type definitions for new components
export interface SlideNarration {
  title: string;
  voice_over: string;
  highlights: string[];
}

export interface OverviewData {
  projectName: string;
  url: string;
  pagesCrawled: number;
  scores: {
    overall: number;
    seo: number;
    aiVisibility: number;
    performance: number;
    authority: number;
  };
  issueDistribution: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
  audit_date?: string;
}

export interface PageSpeedData {
  performance_score: number;
  seo_score: number;
  accessibility_score: number;
  best_practices_score: number;
  fcp_ms: number;
  lcp_ms: number;
  tbt_ms: number;
  si_ms: number;
  ttfb_ms: number;
  cls: number;
  device: "mobile" | "desktop";
  url: string;
  top_opportunities: Array<{
    title: string;
    impact: string;
    savings: string;
    savings_ms: number;
  }>;
}

export interface OnPageData {
  total_issues: number;
  issues: Array<{
    title: string;
    affected_count: number;
    severity: "critical" | "warning" | "info";
    impact?: string;
  }>;
  quick_wins: Array<{
    title: string;
    impact: string;
    effort: "low" | "medium" | "high";
  }>;
}

export interface TechnicalData {
  health_score: number;
  critical_count: number;
  warning_count: number;
  checks: Array<{
    name: string;
    status: "critical" | "warning" | "passed";
    detail: string;
    affected_urls?: number;
  }>;
}

export interface KeywordData {
  totalKeywords: number;
  topRankings: Array<{
    keyword: string;
    rank: number;
    status: string;
  }>;
  opportunities: Array<{
    keyword: string;
    rank: number;
    status: string;
  }>;
  notRanking: Array<{
    keyword: string;
    rank: number | null;
    status: string;
  }>;
}

export interface AIVisibilityData {
  overall_ai_score: number;
  ai_score: number;
  geo_score: number;
  aeo_score: number;
  aiseo_score: number;
  schema_coverage_pct: number;
  faq_optimization_pct: number;
  conversational_score: number;
  ai_snippet_probability: number;
  ai_citation_rate: number;
  kg_status: "linked" | "partial" | "missing";
  llm_citations: Array<{
    platform: string;
    count: number;
    growth: number;
  }>;
  entity_map: Array<{
    entity: string;
    status: "linked" | "partial" | "missing";
    confidence: number;
  }>;
}

export interface FinalRecommendationData {
  estimated_improvement: {
    seo_health: number;
    ai_visibility: number;
    performance: number;
  };
  top_priorities: Array<{
    title: string;
    difficulty: "easy" | "medium" | "hard";
    impact: string;
    timeframe: string;
  }>;
  next_steps: Array<{
    step: string;
    status: string;
  }>;
}
