export const DATA = {
  client: { name: "Agency Platform Inc.", url: "agencyplatform.com", logo: "A", date: "Feb 26, 2026" },
  scores: {
    seo: { val: 67, prev: 61, label: "SEO Health", color: "#7c3aed", color2: "#a855f7" },
    ai: { val: 54, prev: 48, label: "AI Visibility", color: "#00e5ff", color2: "#0ea5e9" },
    perf: { val: 71, prev: 75, label: "Performance", color: "#10ffa0", color2: "#059669" },
    auth: { val: 43, prev: 40, label: "Authority", color: "#ffbb33", color2: "#f97316" },
  },
  summary: {
    pagesCrawled: 247, totalIssues: 84, criticalIssues: 23, indexed: 68,
    aiReadiness: 54, schemaData: 22, entityCoverage: 31, faqOptimized: 8, aiSnippetProb: 29,
  },
};

export const ISSUES = [
  { issue: "Images missing ALT text", sev: "high", pages: 133, impact: 18, difficulty: "Easy", ai: 94 },
  { issue: "Meta descriptions missing / empty", sev: "high", pages: 12, impact: 14, difficulty: "Easy", ai: 91 },
  { issue: "H1 missing or empty", sev: "high", pages: 9, impact: 12, difficulty: "Easy", ai: 88 },
  { issue: "Schema markup missing / invalid", sev: "high", pages: 18, impact: 22, difficulty: "Medium", ai: 96 },
  { issue: "Broken links (404)", sev: "high", pages: 12, impact: 9, difficulty: "Medium", ai: 85 },
  { issue: "Noindex on key pages", sev: "high", pages: 3, impact: 19, difficulty: "Easy", ai: 99 },
  { issue: "Canonical misconfigurations", sev: "high", pages: 14, impact: 11, difficulty: "Medium", ai: 82 },
  { issue: "Multiple title tags", sev: "high", pages: 7, impact: 8, difficulty: "Easy", ai: 80 },
  { issue: "Low word count (<150 words)", sev: "medium", pages: 22, impact: 7, difficulty: "Hard", ai: 73 },
  { issue: "Slow homepage LCP > 2.5s", sev: "medium", pages: 1, impact: 15, difficulty: "Hard", ai: 70 },
  { issue: "301/302 redirect chains", sev: "medium", pages: 17, impact: 5, difficulty: "Medium", ai: 65 },
  { issue: "OG tags incomplete", sev: "low", pages: 31, impact: 3, difficulty: "Easy", ai: 55 },
];

export const TECH_CHECKS = [
  { name: "SSL Certificate",   desc: "Valid, expires in 289 days",          status: "pass" },
  { name: "Security Headers",  desc: "Missing X-Frame-Options, CSP",        status: "warn" },
  { name: "Canonical Tags",    desc: "Mispointed on 14 pages — equity split",status: "warn" },
  { name: "Robots Meta",       desc: "Correctly configured sitewide",        status: "pass" },
  { name: "Indexability",      desc: "Noindex found on 3 key pages",         status: "warn" },
  { name: "H1 Presence",       desc: "H1 missing on 9 pages",               status: "fail" },
  { name: "Structured Data",   desc: "Schema missing / invalid on 18 pages", status: "fail" },
  { name: "Mobile Friendly",   desc: "Passes Google mobile test",            status: "pass" },
  { name: "Broken Links (404)",desc: "12 broken links — equity leaks",       status: "fail" },
  { name: "Page Speed",        desc: "LCP 2.8s — above 2.5s threshold",     status: "warn" },
  { name: "HTTPS Redirect",    desc: "Some pages missing www redirect",      status: "warn" },
  { name: "Sitemap",           desc: "XML sitemap found and valid",          status: "pass" },
];

export const PAGESPEED = {
  mobile: {
    score: 58,
    ringColor:  "#ffbb33",
    ringColor2: "#ff4560",
    metrics: [
      { name: "LCP",         val: "3.9s", status: "warn" },
      { name: "CLS",         val: "0.18", status: "warn" },
      { name: "FCP",         val: "2.1s", status: "pass" },
      { name: "TTFB",        val: "0.8s", status: "pass" },
      { name: "SPEED INDEX", val: "4.2s", status: "warn" },
    ],
    insight: "Your mobile LCP of 3.9s exceeds Google's 2.5s threshold. Estimated traffic loss:",
    insightBold: "-12–18% of mobile sessions.",
    insightBoldColor: "var(--red)",
  },
  desktop: {
    score: 74,
    ringColor:  "#10ffa0",
    ringColor2: "#00e5ff",
    metrics: [
      { name: "LCP",         val: "1.8s", status: "pass" },
      { name: "CLS",         val: "0.05", status: "pass" },
      { name: "FCP",         val: "0.9s", status: "pass" },
      { name: "TTFB",        val: "0.4s", status: "pass" },
      { name: "SPEED INDEX", val: "2.1s", status: "pass" },
    ],
    insight: "Your desktop performance is solid. Focus on mobile improvements to recover traffic.",
    insightBold: "+8–12% mobile traffic recovery possible.",
    insightBoldColor: "var(--green)",
  },
}

export const KEYWORDS = [
  { kw:"ai seo audit tool",          rank:4,  vol:2900, comp:"High",      change:+2, ai:18, url:"/features/ai-audit"   },
  { kw:"seo audit software",         rank:11, vol:8100, comp:"Very High", change:-3, ai:5,  url:"/solutions"           },
  { kw:"white label seo platform",   rank:7,  vol:1300, comp:"Medium",    change:+5, ai:12, url:"/white-label"         },
  { kw:"ai content optimization",    rank:22, vol:4400, comp:"High",      change:-1, ai:2,  url:"/blog/ai-content"     },
  { kw:"technical seo audit",        rank:3,  vol:3600, comp:"High",      change:+1, ai:24, url:"/audit"               },
  { kw:"seo reporting tool",         rank:18, vol:5400, comp:"Very High", change:-6, ai:3,  url:"/reports"             },
  { kw:"ai visibility score",        rank:2,  vol:590,  comp:"Low",       change:+8, ai:31, url:"/features"            },
]

export const AI_AUDIT = {
  score: 54,
  label: "Moderate AI Readiness",
  desc: "Your content is partially structured for AI discovery, but missing schema markup and sparse FAQ structure significantly reduce your chances of being cited by ChatGPT, Gemini, and Perplexity.",
  target: "75+",
  factors: [
    { name:"Schema Coverage",           score:22, rec:"Add FAQ, Article, BreadcrumbList schema"               },
    { name:"FAQ Structure",             score:14, rec:"Only 2/24 key pages have FAQ blocks"                   },
    { name:"Conversational Readiness",  score:48, rec:"Content answers questions but lacks direct answers"    },
    { name:"Entity Optimization",       score:31, rec:"Named entities are sparse — add KG links"             },
    { name:"AI Citation Probability",   score:29, rec:"Low structured data reduces AI citation odds"         },
    { name:"LLM Readability Score",     score:58, rec:"Good paragraph structure, needs list formatting"      },
  ]
}
