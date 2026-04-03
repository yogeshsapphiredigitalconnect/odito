// ─── Interfaces ──────────────────────────────────────────────

export interface Metric {
  metric: string;
  value: string;
  status: "poor" | "moderate" | "good";
}

export interface TechnicalCheck {
  name: string;
  status: "PASS" | "FAIL" | "WARN";
  detail: string;
}

export interface AuditData {
  projectName: string;
  url: string;
  scores: {
    overall: number;
    performance: number;
    seo: number;
    aiVisibility: number;
  };
  issueDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
  topIssues: {
    high: string[];
    medium: string[];
    low: string[];
  };
  performanceMetrics: {
    mobileScore: number;
    desktopScore: number;
    mobile: Metric[];
    desktop: Metric[];
  };
  technicalChecks: TechnicalCheck[];
  aiVisibility: {
    score: number;
    recommendations: string[];
  };
  keywordData?: {
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
  };
}

// ─── Data ────────────────────────────────────────────────────

export const auditData: AuditData = {
  projectName: "Sapphiredigitalconnect-Com",
  url: "https://www.sapphiredigitalconnect.com/",
  scores: {
    overall: 50,
    performance: 52,
    seo: 50,
    aiVisibility: 46,
  },
  issueDistribution: {
    critical: 0,
    high: 521,
    medium: 185,
    low: 142,
    total: 848,
  },
  topIssues: {
    high: [
      "5 below-fold image(s) missing lazy loading",
      "3 accessibility violation(s) found",
      "1 critical accessibility violation(s)",
    ],
    medium: [
      "3 duplicate image URL(s) on page",
      "7 image(s) missing role attribute",
    ],
    low: ["Theme color meta tag is missing"],
  },
  performanceMetrics: {
    mobileScore: 40,
    desktopScore: 64,
    mobile: [
      { metric: "Largest Contentful Paint", value: "5.1 s", status: "poor" },
      { metric: "Total Blocking Time", value: "1,960 ms", status: "poor" },
      { metric: "First Contentful Paint", value: "4.4 s", status: "poor" },
      { metric: "Cumulative Layout Shift", value: "0.002", status: "good" },
    ],
    desktop: [
      { metric: "Largest Contentful Paint", value: "1.4 s", status: "good" },
      { metric: "Total Blocking Time", value: "420 ms", status: "moderate" },
      { metric: "First Contentful Paint", value: "1.0 s", status: "good" },
      { metric: "Cumulative Layout Shift", value: "0.116", status: "poor" },
    ],
  },
  technicalChecks: [
    { name: "SSL Certificate", status: "PASS", detail: "Valid and properly configured" },
    { name: "Security Headers", status: "FAIL", detail: "20 pages missing critical security headers" },
    { name: "Canonical Tags", status: "PASS", detail: "Properly configured" },
    { name: "Robots.txt", status: "PASS", detail: "Accessible and properly configured" },
    { name: "Noindex on Key Pages", status: "PASS", detail: "All important pages are indexable" },
    { name: "H1 Tags", status: "WARN", detail: "1 page missing H1, 1 with multiple H1s" },
    { name: "Structured Data", status: "PASS", detail: "20 pages with valid structured data" },
    { name: "Mobile Friendliness", status: "PASS", detail: "Mobile-friendly configuration detected" },
    { name: "Broken Links (404)", status: "PASS", detail: "No broken links detected" },
    { name: "XML Sitemap", status: "PASS", detail: "Accessible with 2 URLs" },
    { name: "Redirect Chains", status: "WARN", detail: "Chain detected with 2 hops" },
    { name: "OG / Social Tags", status: "WARN", detail: "2 pages missing Open Graph tags" },
  ],
  aiVisibility: {
    score: 46,
    recommendations: [
      "Add structured data markup to improve AI understanding",
      "Implement schema.org for better context",
      "Optimize content for AI-powered search engines",
    ],
  },
};

// ─── Design System Colors ────────────────────────────────────

export const colors = {
  bg: "#080c14",
  bgCard: "#0d1220",
  bgCardHi: "#111827",
  bgGlass: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.06)",
  borderHi: "rgba(255,255,255,0.12)",
  text: "#f0f4ff",
  textMuted: "#6b7a9e",
  textDim: "#3a4468",
  pass: "#10b981",
  passGlow: "rgba(16,185,129,0.15)",
  fail: "#ef4444",
  failGlow: "rgba(239,68,68,0.15)",
  warn: "#f59e0b",
  warnGlow: "rgba(245,158,11,0.15)",
  scoreHigh: "#ef4444",
  scoreMid: "#f59e0b",
  scoreGood: "#10b981",
  high: "#ef4444",
  highGlow: "rgba(239,68,68,0.12)",
  medium: "#f97316",
  mediumGlow: "rgba(249,115,22,0.12)",
  low: "#eab308",
  lowGlow: "rgba(234,179,8,0.12)",
  ai: "#8b5cf6",
  aiGlow: "rgba(139,92,246,0.2)",
  accent: "#3b82f6",
  accentGlow: "rgba(59,130,246,0.15)",
  poor: "#ef4444",
  moderate: "#f59e0b",
  good: "#10b981",
} as const;
