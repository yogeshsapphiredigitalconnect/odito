"use client"

import { useState, useEffect } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import apiService from '@/lib/apiService'
import { Skeleton } from '@/components/ui/skeleton'

// Static lookup table for enriching checks with additional data
const CHECKS_LOOKUP = {
  "SSL Certificate": {
    impact: 0,
    difficulty: "N/A",
    icon: "🔒",
    aiPrompt: "Generate SSL certificate configuration for [domain]. Include certificate setup, renewal, and security best practices.",
    what: "Your SSL certificate is valid and properly configured. HTTPS is enforced sitewide with no mixed content issues detected.",
    whatToDo: "No action needed. Monitor certificate expiration and ensure auto-renewal is configured.",
    diySteps: [],
    before: "",
    after: ""
  },
  "Security Headers": {
    impact: 8,
    difficulty: "Medium",
    icon: "🛡",
    aiPrompt: "Generate complete security headers for Nginx server at [domain]. Include X-Frame-Options, CSP, HSTS, X-Content-Type-Options, and Referrer-Policy.",
    what: "Security headers like Content-Security-Policy (CSP), X-Frame-Options, and HSTS are missing from your server responses.",
    whatToDo: "Add the missing security headers at the server level (Apache/Nginx config or CDN headers).",
    diySteps: [
      { title: "Add headers via Nginx config", desc: "Open your Nginx server block config and add the security headers." },
      { title: "Add headers via Apache .htaccess", desc: "Add the Header set directives in your .htaccess file." },
      { title: "Verify via securityheaders.com", desc: "Test your domain to confirm all headers are returning correctly." }
    ],
    before: "# No security headers set\nserver {\n  listen 443 ssl;\n  server_name yourdomain.com;\n}",
    after: "server {\n  listen 443 ssl;\n  server_name yourdomain.com;\n  add_header X-Frame-Options \"SAMEORIGIN\";\n  add_header X-Content-Type-Options \"nosniff\";\n  add_header Strict-Transport-Security \"max-age=31536000\" always;\n  add_header Content-Security-Policy \"default-src 'self'\" always;\n}"
  },
  "Canonical Tags": {
    impact: 11,
    difficulty: "Medium",
    icon: "🔗",
    aiPrompt: "Generate correct canonical tags for these URLs: [URL list]. Use HTTPS and consistent www format.",
    what: "Canonical tags are pointing to incorrect URLs or using inconsistent domain variants.",
    whatToDo: "Ensure every page has a self-referencing canonical tag pointing to the preferred URL.",
    diySteps: [
      { title: "Audit all canonical tags", desc: "Use Screaming Frog to export all canonical URLs and check for inconsistencies." },
      { title: "Decide preferred domain format", desc: "Choose either https://www.domain.com OR https://domain.com and be consistent." },
      { title: "Update canonical tags in CMS", desc: "Add correct self-referencing canonical tags in the <head> section." }
    ],
    before: "<link rel=\"canonical\" href=\"http://www.domain.com/page/\">",
    after: "<link rel=\"canonical\" href=\"https://www.domain.com/page/\">"
  },
  "Robots.txt": {
    impact: 0,
    difficulty: "N/A",
    icon: "🤖",
    aiPrompt: "Generate robots.txt file for [domain] that allows all crawlers and points to sitemap.",
    what: "Robots.txt is correctly configured. No critical paths are accidentally blocked.",
    whatToDo: "No action needed. Keep robots.txt updated when adding new sections.",
    diySteps: [],
    before: "",
    after: ""
  },
  "Noindex on Key Pages": {
    impact: 19,
    difficulty: "Easy",
    icon: "🚫",
    aiPrompt: "I have noindex tags on these important pages: [URL list]. Generate the correct meta robots tags to remove noindex.",
    what: "Important pages have a noindex directive, meaning Google cannot index or rank them.",
    whatToDo: "Remove the noindex directive from these pages unless they are intentionally excluded.",
    diySteps: [
      { title: "Locate the noindex directive", desc: "Check page source for <meta name=\"robots\" content=\"noindex\"> in the <head>." },
      { title: "Remove from WordPress", desc: "Edit the page → SEO tab → Advanced → set 'Allow search engines to show this page' to Yes." },
      { title: "Request re-indexing in GSC", desc: "Use Google Search Console → URL Inspection → Request Indexing." }
    ],
    before: "<meta name=\"robots\" content=\"noindex, follow\">",
    after: "<meta name=\"robots\" content=\"index, follow\">"
  },
  "H1 Tags": {
    impact: 12,
    difficulty: "Easy",
    icon: "H¹",
    aiPrompt: "Write SEO-optimised H1 tags for these pages: [list page URLs and topics]. Each H1 should be 20–70 characters.",
    what: "Pages are missing their H1 tag entirely or have an empty H1. The H1 is the primary content signal.",
    whatToDo: "Add one descriptive, keyword-rich H1 tag per page.",
    diySteps: [
      { title: "Identify missing H1s", desc: "Use Screaming Frog → H1 tab → filter 'Missing' or 'Empty'." },
      { title: "Write keyword-focused H1s", desc: "Each H1 should be 20–70 chars and contain the primary keyword." },
      { title: "Add H1 in page template or CMS", desc: "Ensure the first heading block is set to H1 type." }
    ],
    before: "<h2>Welcome to our platform</h2>",
    after: "<h1>AI-Powered SEO Audit Tool for Agencies</h1>\n<h2>Welcome to our platform</h2>"
  },
  "Structured Data / Schema": {
    impact: 22,
    difficulty: "Medium",
    icon: "🧩",
    aiPrompt: "Generate complete JSON-LD schema markup for a [page type] for this page: [URL]. Include 3 FAQ pairs.",
    what: "Structured data (schema markup) is missing, which reduces rich results eligibility and AI citation probability.",
    whatToDo: "Implement JSON-LD schema on every key page type: Organization, WebSite, Article, FAQPage.",
    diySteps: [
      { title: "Map schema types to page types", desc: "Homepage → Organization + WebSite. Blog posts → Article. Service pages → Service + FAQPage." },
      { title: "Generate JSON-LD blocks", desc: "Use schema.org or Google's Structured Data Markup Helper." },
      { title: "Add to <head> via CMS or template", desc: "Paste the <script type=\"application/ld+json\"> block inside <head>." }
    ],
    before: "<head>\n  <title>AI SEO Audit | AuditIQ</title>\n</head>",
    after: "<head>\n  <title>AI SEO Audit | AuditIQ</title>\n</head>\n<script type=\"application/ld+json\">\n{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"FAQPage\",\n  \"mainEntity\": [{\n    \"@type\": \"Question\",\n    \"name\": \"What is an AI SEO audit?\",\n    \"acceptedAnswer\": {\n      \"@type\": \"Answer\",\n      \"text\": \"An AI SEO audit analyses...\"\n    }\n  }]\n}\n<\/script>"
  },
  "Mobile Friendliness": {
    impact: 0,
    difficulty: "N/A",
    icon: "📱",
    aiPrompt: "Generate mobile optimization recommendations for [domain] to improve mobile-friendliness.",
    what: "All tested pages pass Google's mobile-friendly test. Viewport meta tag is set correctly.",
    whatToDo: "No action needed. Continue monitoring mobile usability in Google Search Console.",
    diySteps: [],
    before: "",
    after: ""
  },
  "XML Sitemap": {
    impact: 0,
    difficulty: "N/A",
    icon: "🗺",
    aiPrompt: "Generate XML sitemap for [domain] with all important pages and proper priority settings.",
    what: "XML sitemap is present and correctly submitted to Google Search Console.",
    whatToDo: "No action needed. Keep sitemap updated when adding/removing pages.",
    diySteps: [],
    before: "",
    after: ""
  },
  "OG / Social Tags": {
    impact: 3,
    difficulty: "Easy",
    icon: "📣",
    aiPrompt: "Generate complete Open Graph and Twitter Card meta tags for this page: [URL]. Include all required tags.",
    what: "Open Graph (OG) tags are missing or incomplete, hurting social media share previews.",
    whatToDo: "Add complete OG meta tags to every page: og:title, og:description, og:image, og:url, og:type.",
    diySteps: [
      { title: "Audit missing OG tags", desc: "Screaming Frog → Custom Extraction → extract og:title, og:image, og:description." },
      { title: "Create OG images", desc: "Design 1200×630px social preview images for each page category." },
      { title: "Add OG tags to templates", desc: "Add full OG meta tag set to your <head> template with dynamic values." }
    ],
    before: "<head>\n  <title>AI SEO Features | AuditIQ</title>\n</head>",
    after: "<head>\n  <title>AI SEO Features | AuditIQ</title>\n  <meta property=\"og:title\" content=\"AI SEO Audit Features\">\n  <meta property=\"og:description\" content=\"Run a 60-second AI SEO audit\">\n  <meta property=\"og:image\" content=\"https://auditiq.com/og/features.jpg\">\n  <meta property=\"og:type\" content=\"website\">\n</head>"
  }
}

function StatusDot({ status }) {
  const colors = {
    critical: "#ff3860",
    warning: "#ffb703", 
    passed: "#00f5a0",
    OK: "#00f5a0",
    Critical: "#ff3860",
    Warning: "#ffb703"
  }
  const c = colors[status] || "#4e5f7a"
  return (
    <div 
      className="status-dot"
      style={{ 
        background: c, 
        boxShadow: `0 0 6px ${c}60` 
      }}
    />
  )
}

export default function CheckList({ onSelectCheck }) {
  const { activeProject } = useProject()
  const [checks, setChecks] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    if (!activeProject) return

    const fetchTechnicalChecks = async () => {
      try {
        setLoading(true)
        const response = await apiService.getTechnicalChecks(activeProject._id)
        
        if (response.success) {
          // Store summary from backend response
          setSummary(response.data.summary || null)
          
          const enrichedChecks = (response.data.checks || []).map(check => {
            const lookup = CHECKS_LOOKUP[check.name] || {}
            const statusMap = {
              "pass": "passed",
              "fail": "critical", 
              "warning": "warning",
              "OK": "passed",
              "Critical": "critical",
              "Warning": "warning"
            }
            return {
              ...check,
              status: statusMap[check.status] || check.status,
              impact: check.impact_percentage || 0,  // Use backend-calculated impact_percentage
              difficulty: check.difficulty || "Medium", // Use backend-calculated difficulty
              icon: lookup.icon || "⚙",
              aiPrompt: lookup.aiPrompt || "",
              what: lookup.what || check.message || check.description || "",
              whatToDo: lookup.whatToDo || "",
              diySteps: lookup.diySteps || [],
              before: lookup.before || "",
              after: lookup.after || ""
            }
          })
          setChecks(enrichedChecks)
          
          // Debug logging for backend healthScore
          console.log('🔧 Backend Technical Health Score Response:', {
            summary: response.data.summary,
            healthScore: response.data.summary?.healthScore,
            backendCalculation: `Backend calculated: ${response.data.summary?.healthScore}%`
          })
        } else {
          setError(response?.message || 'Failed to load technical checks')
        }
      } catch (err) {
        console.error('Error fetching technical checks:', err)
        setError('Failed to load technical checks')
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicalChecks()
  }, [activeProject])

  const filteredChecks = checks.filter(check => {
    if (filter === "all") return true
    return check.status === filter
  })

  // Use backend summary values instead of calculating in frontend
  const critical = summary?.critical ?? 0
  const warnings = summary?.warnings ?? 0 
  const passed = summary?.passed ?? 0
  const total = summary?.total ?? checks.length
  const healthScore = summary?.healthScore ?? 0
  
  console.log('🔧 Using Backend Summary Values:', {
    backendSummary: summary,
    critical,
    warnings,
    passed,
    total,
    healthScore,
    source: 'Backend API response summary'
  })
  
  // Keep this calculation as it needs impact values from check objects
  const criticalChecks = checks.filter(c => c.status === "critical" || c.status === "Critical")
  const totalCriticalImpact = criticalChecks.reduce((sum, c) => sum + (c.impact || 0), 0)

  if (loading) {
    return (
      <div className="glass-card">
        <div className="p-6">
          <div className="summary-bar">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="sum-tile">
                <Skeleton className="h-8 w-16 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
          <div className="health-row">
            <div className="health-card">
              <Skeleton className="w-20 h-20 rounded-full" />
            </div>
            <div className="aria-card">
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card">
        <div className="p-6 text-center">
          <div className="text-red-500 mb-2">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-500 hover:underline"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Summary Bar */}
      <div className="summary-bar">
        <div className="sum-tile">
          <div className="sum-tile-val" style={{ color: "var(--t)" }}>
            {total}
          </div>
          <div className="sum-tile-lbl">Total Checks</div>
          <div className="sum-tile-sub">across 8 categories</div>
        </div>
        <div className="sum-tile">
          <div className="sum-tile-val" style={{ color: "var(--red)" }}>
            {critical}
          </div>
          <div className="sum-tile-lbl">Critical</div>
          <div className="sum-tile-sub">need immediate fix</div>
        </div>
        <div className="sum-tile">
          <div className="sum-tile-val" style={{ color: "var(--amber)" }}>
            {warnings}
          </div>
          <div className="sum-tile-lbl">Warnings</div>
          <div className="sum-tile-sub">should be addressed</div>
        </div>
        <div className="sum-tile">
          <div className="sum-tile-val" style={{ color: "var(--green)" }}>
            {passed}
          </div>
          <div className="sum-tile-lbl">Passed</div>
          <div className="sum-tile-sub">no action needed</div>
        </div>
      </div>

      {/* Health Row */}
      <div className="health-row">
        <div className="health-card">
          <div style={{ position: "relative", width: 80, height: 80 }}>
            <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
              <defs>
                <linearGradient id="healthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7730ed" />
                  <stop offset="100%" stopColor="#00dfff" />
                </linearGradient>
              </defs>
              <circle 
                cx="40" cy="40" r="33" 
                fill="none" 
                stroke="rgba(255,255,255,0.05)" 
                strokeWidth="5.5"
              />
              <circle 
                cx="40" cy="40" r="33" 
                fill="none" 
                stroke="url(#healthGrad)" 
                strokeWidth="5.5"
                strokeDasharray={`${2 * Math.PI * 33}`}
                strokeDashoffset={`${2 * Math.PI * 33 * (1 - healthScore / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
              />
            </svg>
            <div style={{ 
              position: "absolute", 
              inset: 0, 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              <div style={{ 
                fontFamily: "'Syne', sans-serif", 
                fontSize: 16, 
                fontWeight: 800, 
                color: "var(--cyan)" 
              }}>
                {healthScore}%
              </div>
            </div>
          </div>
          <div>
            <div style={{ 
              fontFamily: "'Syne', sans-serif", 
              fontWeight: 700, 
              fontSize: 15, 
              marginBottom: 3 
            }}>
              Technical Health
            </div>
            <div style={{ fontSize: 12, color: "var(--t3)" }}>
              {passed} passed · {warnings} warnings · {critical} critical
            </div>
          </div>
        </div>
        <div className="aria-card">
          <div className="aria-label">✦ ARIA — Priority Analysis</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--t2)" }}>
            <strong style={{ color: "var(--red)" }}>{critical} critical issues</strong> require immediate action — 
            These fixes can recover an estimated 
            <strong style={{ color: "var(--cyan)" }}> +{totalCriticalImpact}% SEO potential</strong>. 
            Start with the <strong style={{ color: "var(--t)" }}>Noindex fix</strong> (Easy, 30 min) for the fastest ranking recovery.
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div className="section-head" style={{ margin: 0 }}>
          <div className="section-title">All Checks</div>
          <div className="section-tag">{total} TOTAL</div>
        </div>
        <div className="tab-strip">
          {[
            { id: "all", label: `All (${total})` },
            { id: "critical", label: `Critical (${critical})` },
            { id: "warning", label: `Warnings (${warnings})` },
            { id: "passed", label: `Passed (${passed})` }
          ].map(tab => (
            <div 
              key={tab.id}
              className={`tab-item${filter === tab.id ? " on" : ""}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </div>
      </div>

      {/* Check Cards Grid */}
      <div className="check-grid">
        {filteredChecks.map(check => {
          const cardCls = check.status === "critical" || check.status === "Critical" ? "critical-card" : 
                         check.status === "warning" || check.status === "Warning" ? "warning-card" : "passed-card"
          const iconBg = check.status === "critical" || check.status === "Critical" ? "critical-bg" : 
                        check.status === "warning" || check.status === "Warning" ? "warning-bg" : "passed-bg"
          
          return (
            <div 
              key={check.name}
              className={`check-card ${cardCls}`}
              onClick={() => onSelectCheck(check)}
            >
              <div className={`check-icon ${iconBg}`}>
                {check.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{check.name}</div>
                  <StatusDot status={check.status} />
                </div>
                <div style={{ fontSize: 11, color: "var(--t3)", lineHeight: 1.4 }}>
                  {check.message || check.description || "No description available"}
                </div>
                {check.status !== "passed" && (
                  <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                    <span className={`pill-sev-${check.status === "critical" ? "r" : "a"}`} style={{ fontSize: 9 }}>
                      {check.status === "critical" ? "● CRITICAL" : "◆ WARNING"}
                    </span>
                    {check.affected_pages > 0 && (
                      <span className="pill-impact" style={{ fontSize: 9 }}>
                        {check.affected_pages} page{check.affected_pages > 1 ? 's' : ''}
                      </span>
                    )}
                    <span className={`pill-diff`} style={{ fontSize: 9 }}>
                      {check.difficulty}
                    </span>
                  </div>
                )}
              </div>
              {check.status === "passed" || check.status === "OK" ? (
                <span className="ok-chip">✔ OK</span>
              ) : (
                <button 
                  className="fix-ai-btn"
                  onClick={e => {
                    e.stopPropagation()
                    onSelectCheck(check)
                  }}
                >
                  ✦ Fix
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
