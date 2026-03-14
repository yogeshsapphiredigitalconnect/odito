export const CAT_COLORS = { 
  GEO:"#8b5cf6", 
  AEO:"#06b6d4", 
  AISEO:"#00dfff", 
  LLM:"#f59e0b", 
  Voice:"#ef4444", 
  Knowledge:"#ec4899",
  ai_impact:"#8b5cf6",
  citation_probability:"#06b6d4", 
  llm_readiness:"#00dfff",
  aeo_score:"#f59e0b",
  topical_authority:"#ef4444",
  voice_intent:"#ec4899"
};

// Fallback color function for unknown categories
export function getCategoryColor(category) {
  return CAT_COLORS[category] || "#6b7280"; // Gray fallback
}

// Icon function for categories
export function getCategoryIcon(category) {
  const iconMap = {
    'GEO': '🌍',
    'AEO': '💬',
    'AISEO': '🤖',
    'topical_authority': '💡',
    'citation_probability': '🎓',
    'ai_impact': '🧠',
    'voice_intent': '🗣️',
    'llm_readiness': '✨',
    'aeo_score': '🎯'
  };
  return iconMap[category] || '🔍'; // Default fallback icon
}

export const ISSUES = [
  {
    id:"schema-missing", sev:"crit", cat:"GEO", icon:"🧩",
    title:"Schema Markup Missing",
    desc:"47 pages have no structured data. AI models can't extract entities or facts — reducing AI citation probability by ~60%.",
    pages:47, impact:"+38% AI Visibility", diff:"Medium",
    urls:[
      { url:"/blog/seo-audit-guide",       sub:"Suggested: Article schema" },
      { url:"/features/technical-seo",     sub:"Suggested: WebPage + BreadcrumbList" },
      { url:"/pricing",                    sub:"Suggested: PriceSpecification" },
      { url:"/case-studies/ecommerce",     sub:"Suggested: Article schema" },
      { url:"/about",                      sub:"Suggested: Organization schema" },
      { url:"/blog/ai-seo-2025",           sub:"Suggested: Article + FAQPage" },
      { url:"/features/rank-tracking",     sub:"Suggested: SoftwareApplication" },
    ],
    steps:[
      { t:"Find the right schema type",   d:"Blog posts → Article. Service pages → Service. Products → Product." },
      { t:"Write the JSON-LD block",       d:"Place inside a script type='application/ld+json' tag in <head>." },
      { t:"Add required fields only first",d:"Article needs: headline, author, datePublished, publisher." },
      { t:"Validate with Google's tool",   d:"Paste your URL into search.google.com/test/rich-results." },
    ],
    prompt:"My page at [URL] is a [type]. Generate complete Schema.org JSON-LD with required and recommended fields for maximum AI citation probability.",
    aria:"Without schema markup, AI models treat your pages as anonymous text. Adding Article or WebPage schema is the fastest way to improve AI citation rate.",
  },
  {
    id:"faq-schema", sev:"crit", cat:"AEO", icon:"❓",
    title:"FAQ Schema Missing on 31 Pages",
    desc:"31 pages have question-answer content but no FAQPage schema. AI assistants directly extract FAQ pairs to answer user questions.",
    pages:31, impact:"+29% AI Snippets", diff:"Easy",
    urls:[
      { url:"/blog/seo-audit-guide",         sub:"5 FAQ questions detected · no schema" },
      { url:"/blog/technical-seo-checklist", sub:"8 FAQ questions detected · no schema" },
      { url:"/features/rank-tracking",       sub:"How does X work? section · no schema" },
      { url:"/pricing",                      sub:"Pricing FAQ section · no schema" },
      { url:"/blog/core-web-vitals-guide",   sub:"3 Q&A pairs detected · no schema" },
    ],
    steps:[
      { t:"Identify pages with Q&A content", d:"Any page with accordion sections or H3 questions followed by paragraph answers." },
      { t:"Copy question text exactly",       d:"Use the exact H3/H4 text for the name field. Keep answers under 300 characters." },
      { t:"Generate FAQPage JSON-LD",         d:"Wrap all pairs in FAQPage > mainEntity > Question > acceptedAnswer." },
      { t:"Add to head alongside existing schema", d:"Multiple JSON-LD blocks on one page are valid." },
    ],
    prompt:"Here is my FAQ content: [paste Q&A]. Generate complete FAQPage JSON-LD. Also suggest 5 conversational questions to add for AI snippet capture on [topic].",
    aria:"FAQPage schema is the easiest AEO win. Each FAQ pair becomes a potential direct answer in ChatGPT, Perplexity, and Google AI Overviews.",
  },
  {
    id:"conv-content", sev:"crit", cat:"GEO", icon:"💬",
    title:"Conversational Content Too Low (31%)",
    desc:"Your content is written for keywords, not conversational AI queries. AI models prefer content that answers questions directly in the first paragraph.",
    pages:38, impact:"+24% GEO", diff:"Medium",
    urls:[
      { url:"/blog/seo-audit-guide",   sub:"Definition buried 400 words in · needs P1 answer" },
      { url:"/features/ai-visibility", sub:"Feature list only · no conversational explanation" },
      { url:"/about",                  sub:"Corporate language · low entity density" },
      { url:"/blog/what-is-seo",       sub:"Keyword-dense intro · no direct question answer" },
      { url:"/blog/ai-seo-tools",      sub:"List format only · no narrative prose" },
    ],
    steps:[
      { t:"Rewrite the intro to answer in <60 words", d:"AI models weight the first 50-100 words most heavily." },
      { t:"Use question-based H2/H3 headings",        d:"How does X work? What is Y? — match how users query AI." },
      { t:"Name specific entities in every paragraph",d:"Replace vague phrases with specifics." },
      { t:"Add a TL;DR summary at the top",           d:"3-5 bullets — the most-cited element in AI answer extraction." },
    ],
    prompt:"Rewrite this intro for GEO: [paste content]. Answer the main query in <60 words. Then add a 4-bullet TL;DR summary for AI extraction.",
    aria:"38 of your pages have keyword-dense intros that AI models skip. The fix: move the answer to the first paragraph.",
  },
  {
    id:"kg-entity", sev:"crit", cat:"AISEO", icon:"🔮",
    title:"Knowledge Graph Entity Not Claimed",
    desc:"Your brand has no verified Knowledge Graph entity. AI models use the KG as a primary source — without it your business info may be fabricated in AI answers.",
    pages:1, impact:"+45% Brand Accuracy", diff:"Hard",
    urls:[
      { url:"agencyplatform.com",   sub:"No Google Knowledge Panel found" },
      { url:"linkedin.com/company/",sub:"sameAs not linked in schema" },
      { url:"crunchbase.com/org/",  sub:"No profile linked" },
    ],
    steps:[
      { t:"Verify Google Business Profile",    d:"Go to business.google.com and complete verification." },
      { t:"Add sameAs links to homepage schema",d:"Point to LinkedIn, Twitter/X, Crunchbase, Wikipedia." },
      { t:"Make your NAP consistent everywhere",d:"Name, Address, Phone must be identical on all platforms." },
      { t:"Claim the panel once it appears",    d:"Search your brand in Google and click Claim this Knowledge Panel." },
    ],
    prompt:"Help me establish a Google Knowledge Graph entity for [Business Name]. Generate Organization schema with all sameAs targets.",
    aria:"Without a verified KG entity, ChatGPT and Gemini are guessing when they mention your business. Highest long-term impact fix.",
  },
  {
    id:"llm-index", sev:"warn", cat:"AISEO", icon:"🤖",
    title:"LLM Indexability: 39%",
    desc:"24 pages have content AI crawlers can't read — JS-rendered text, missing author signals, no summary elements.",
    pages:24, impact:"+21% LLM Discovery", diff:"Medium",
    urls:[
      { url:"/blog/seo-audit-guide",   sub:"Content in JS div · not readable by LLM crawlers" },
      { url:"/features/technical-seo", sub:"No author markup · E-E-A-T missing" },
      { url:"/case-studies/ecommerce", sub:"No summary block · LLMs skip long pages" },
    ],
    steps:[
      { t:"Server-render all key content",  d:"JS-rendered content is invisible to AI crawlers. Enable SSR." },
      { t:"Use semantic HTML elements",      d:"Replace div with article, section, address, time." },
      { t:"Add author and date markup",      d:"Add rel=author and datetime attributes." },
      { t:"Add a summary in first paragraph",d:"Bold first-paragraph summary improves AI extraction." },
    ],
    prompt:"Audit [URL] for LLM indexability. Check server rendering, semantic HTML, author signals, summary block.",
    aria:"LLM crawlers read HTML directly and cannot execute JavaScript. 24 pages have content locked inside JS that AI crawlers cannot see.",
  },
  {
    id:"snippet-opt", sev:"warn", cat:"AEO", icon:"⚡",
    title:"AI Snippet Probability: 29%",
    desc:"29 pages lack content patterns AI models use for direct answer extraction — no definition in P1, no ordered lists, no comparison tables.",
    pages:29, impact:"+31% Answer Inclusions", diff:"Medium",
    urls:[
      { url:"/blog/what-is-seo-audit",       sub:"Answer buried 300 words in · needs P1 definition" },
      { url:"/blog/technical-seo-checklist", sub:"Steps in prose · needs ol list" },
      { url:"/features/vs-competitors",      sub:"Comparison in prose · needs table" },
    ],
    steps:[
      { t:"Start every page with a direct definition",d:"First paragraph = direct answer in <60 words." },
      { t:"Convert steps to ordered lists",           d:"Prose steps have 4x lower AI extraction rate than ol lists." },
      { t:"Add comparison tables",                    d:"AI models extract tables verbatim." },
      { t:"Add HowTo schema for process pages",       d:"HowTo JSON-LD gets used directly by Google AI Overviews." },
    ],
    prompt:"Optimize [URL] for AI snippet extraction. Rewrite intro as direct definition, convert steps to ol, generate HowTo schema.",
    aria:"AI snippet probability at 29% means AI models are passing over most of your pages in favour of better-structured competitors.",
  },
  {
    id:"entity-gaps", sev:"warn", cat:"AISEO", icon:"🗺",
    title:"14 Entity Coverage Gaps",
    desc:"14 key topics in your niche have no dedicated pages. AI models can't associate your brand with these topics.",
    pages:14, impact:"+18% Topical Authority", diff:"Medium",
    urls:[
      { url:"/blog/ (missing)", sub:"No page: E-E-A-T — high AI query volume" },
      { url:"/blog/ (missing)", sub:"No page: AI Overviews — growing fast" },
      { url:"/blog/ (missing)", sub:"No page: Generative Engine Optimization" },
      { url:"/blog/ (missing)", sub:"No page: Answer Engine Optimization" },
      { url:"/blog/ (missing)", sub:"No page: Perplexity SEO" },
    ],
    steps:[
      { t:"Map gaps vs top-ranking competitors",d:"Compare topic coverage vs Semrush Blog, Moz Blog, SEJ." },
      { t:"Create a hub page per missing entity",d:"Each entity: definition <60 words, how it works, 5 FAQ pairs." },
      { t:"Add Article + FAQPage schema",        d:"Every entity hub page needs both schema types." },
      { t:"Interlink entity pages",              d:"Link from commercial pages to entity hubs and back." },
    ],
    prompt:"I'm missing entity pages for: [list]. For each write a 200-word outline, schema types to use, and 5 FAQ pairs.",
    aria:"If you don't have a page about E-E-A-T or AI Overviews, AI models won't associate you with these topics. 14 missed citation opportunities.",
  },
];
