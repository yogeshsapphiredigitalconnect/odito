"use client"

import { useState, useEffect } from "react"
import { useProject } from "@/contexts/ProjectContext"
import apiService from "@/lib/apiService"

export default function IssueDetailView({ issue, onBack }) {
  const { activeProject } = useProject()
  const [mode, setMode] = useState("ai")
  const [selUrl, setSelUrl] = useState(null)
  const [fixedUrls, setFixedUrls] = useState(["/features/white-label"])
  const [streaming, setStreaming] = useState(false)
  const [streamLines, setStreamLines] = useState([])
  const [streamDone, setStreamDone] = useState(false)
  const [urls, setUrls] = useState([])

  useEffect(() => {
    if (!activeProject || !issue) return

    const fetchIssueUrls = async () => {
      try {
        // Try to get issue_code from real data first, otherwise use mock mapping
        let issueCode = issue.issue_code
        if (!issueCode) {
          // Map mock issue titles to issue codes (you may need to expand this)
          const codeMap = {
            "Images missing ALT text": "missing_alt",
            "Meta descriptions missing / empty": "missing_meta_description",
            "H1 missing or empty": "missing_h1",
            "Schema markup missing / invalid": "missing_schema",
            "Broken links (404)": "broken_links",
            "Noindex on key pages": "noindex_key_pages",
            "Canonical misconfigurations": "canonical_issues",
            "Multiple title tags": "multiple_titles"
          }
          issueCode = codeMap[issue.issue] || issue.issue
        }

        if (issueCode) {
          const response = await apiService.getIssueUrls(activeProject._id, issueCode)
          if (response.success) {
            setUrls(response.data)
          }
        }
      } catch (err) {
        console.error('Failed to fetch issue URLs:', err)
        // Fallback to mock data
        setUrls([
          "/about-us",
          "/services/seo-audit", 
          "/blog/ai-search-2025",
          "/team",
          "/case-studies/techcorp",
          "/pricing",
          "/contact",
          "/features/white-label"
        ])
      }
    }

    fetchIssueUrls()
  }, [activeProject, issue])

  function startStream(url) {
    setSelUrl(url)
    setStreaming(true)
    setStreamLines([])
    setStreamDone(false)

    const messages = [
      `Analysing ${url}…`,
      `✦ Issue detected: ${issue.title || issue.issue || issue.issue_message}`,
      `Generating targeted fix code…`,
      `✅ Fix ready. High SEO impact recovered.`
    ]

    messages.forEach((msg, i) => {
      setTimeout(() => {
        setStreamLines(prev => [...prev, msg])
        if (i === messages.length - 1) {
          setTimeout(() => setStreamDone(true), 500)
        }
      }, i * 900)
    })
  }

  function markFixed() {
    if (selUrl) {
      setFixedUrls(prev => [...prev, selUrl])
      setSelUrl(null)
      setStreamLines([])
      setStreamDone(false)
      setStreaming(false)
    }
  }

  function selectUrl(url) {
    setSelUrl(url)
    setStreamLines([])
    setStreamDone(false)
    setStreaming(false)
  }

  const isFixed = (url) => fixedUrls.includes(url)
  const fixedCount = fixedUrls.length

  return (
    <div className="fi">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "18px" }}>
        <button 
          className="task-btn secondary"
          style={{ fontSize: "11.5px" }}
          onClick={onBack}
        >
          ← On-Page Issues
        </button>
        <span style={{ color: "var(--text3)", fontSize: "12px" }}>›</span>
        <span style={{ fontSize: "12px", color: "var(--text2)", fontWeight: "500" }}>
          {issue.title || issue.issue || issue.issue_message}
        </span>
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 800 }}>
          {issue.title || issue.issue || issue.issue_message}
        </div>
        <span className={`sev-badge ${issue.severity || issue.sev}`}>
          {issue.severity === "high" ? "● " : issue.severity === "medium" ? "◆ " : "▸ "}
          {(issue.severity || issue.sev || "medium").toUpperCase()}
        </span>
      </div>

      {/* 3 Stat Tiles */}
      <div className="stat-grid" style={{ marginBottom: "18px" }}>
        <div className="stat-tile">
          <div className="stat-tile-label">PAGES AFFECTED</div>
          <div className="stat-tile-value" style={{ color: "var(--red)" }}>
            {issue.pages || issue.pages_affected || 0}
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">SEO IMPACT</div>
          <div className="stat-tile-value" style={{ color: "var(--cyan)" }}>
            +{issue.impact || issue.impact_percentage || 0}%
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-label">FIX DIFFICULTY</div>
          <div className="stat-tile-value" style={{ color: "var(--green)" }}>
            {issue.difficulty || "Medium"}
          </div>
        </div>
      </div>

      {/* ARIA Card */}
      <div className="ai-card">
        <div className="ai-card-label">✦ ARIA — WHAT & WHY</div>
        <div className="ai-card-text">
          This issue affects {issue.pages || issue.pages_affected || 0} pages. 
          Missing or empty attributes reduce both search engine understanding and AI citation probability. 
          Fixing this is rated {issue.difficulty || "Medium"} difficulty and can recover an estimated 
          +{issue.impact || issue.impact_percentage || 0}% SEO impact.
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="detail-wrap">
        {/* Left Column - URLs */}
        <div>
          <div className="section-head">
            <div className="section-title">Affected URLs</div>
            <div className="section-tag">{urls.length} OPEN</div>
          </div>
          
          {urls.map(url => (
            <div 
              key={url}
              className={`url-row ${selUrl === url ? "sel" : ""}`}
              onClick={() => selectUrl(url)}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "11.5px", fontFamily: "monospace", color: "var(--cyan)" }}>
                  {url}
                </div>
                <div style={{ fontSize: "10.5px", color: "var(--text3)", marginTop: "2px" }}>
                  Issue detected on this page
                </div>
              </div>
              <span style={{
                fontSize: "9.5px",
                fontWeight: 700,
                padding: "2px 7px",
                borderRadius: "5px",
                background: isFixed(url) ? "rgba(16,255,160,.1)" : "rgba(255,69,96,.12)",
                color: isFixed(url) ? "var(--green)" : "var(--red)"
              }}>
                {isFixed(url) ? "✓ Fixed" : "Open"}
              </span>
              {!isFixed(url) && (
                <button 
                  className="fix-ai-btn"
                  style={{ fontSize: "10px", padding: "4px 9px" }}
                  onClick={(e) => {
                    e.stopPropagation()
                    startStream(url)
                  }}
                >
                  ✦ Fix
                </button>
              )}
            </div>
          ))}

          <div className="glass-card" style={{ padding: "14px", marginTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "7px" }}>
              <span style={{ color: "var(--text2)" }}>Fix Progress</span>
              <span style={{ fontWeight: 700, color: "var(--green)" }}>
                {fixedCount}/{urls.length} Fixed
              </span>
            </div>
            <div className="prog-bar">
              <div 
                className="prog-fill" 
                style={{ 
                  width: `${(fixedCount / urls.length) * 100}%`,
                  background: "var(--green)"
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column - Fix Panel */}
        <div className="fix-panel">
          {/* Mode Switcher */}
          <div className="mode-sw">
            <button 
              className={`mode-btn ${mode === "ai" ? "on" : ""}`}
              onClick={() => setMode("ai")}
            >
              ✦ Fix with AI
            </button>
            <button 
              className={`mode-btn ${mode === "diy" ? "on" : ""}`}
              onClick={() => setMode("diy")}
            >
              🛠 DIY Guide
            </button>
            <button 
              className={`mode-btn ${mode === "help" ? "on" : ""}`}
              onClick={() => setMode("help")}
            >
              🤝 Help
            </button>
          </div>

          {/* Tab Content */}
          {mode === "ai" && (
            <div>
              {selUrl && (
                <div style={{ fontSize: "11.5px", color: "var(--text3)", marginBottom: "12px" }}>
                  Selected: <span style={{ color: "var(--cyan)", fontFamily: "monospace", fontSize: "10.5px" }}>
                    {selUrl}
                  </span>
                </div>
              )}
              
              {!streaming && streamLines.length === 0 && (
                <>
                  <div className="ai-card" style={{ marginBottom: "14px" }}>
                    <div className="ai-card-label">✦ AI PROMPT TEMPLATE</div>
                    <div className="ai-card-text" style={{ fontSize: "11.5px", marginBottom: "10px" }}>
                      Write SEO-optimised ALT text for this image. Include the target keyword and keep under 125 characters.
                    </div>
                    <button className="task-btn secondary" style={{ marginBottom: "0", padding: "6px 12px", fontSize: "11px", width: "auto" }}>
                      📋 Copy Prompt
                    </button>
                  </div>

                  <div className="ba-wrap">
                    <div className="ba-box before">
                      <div className="ba-label">BEFORE</div>
                      <pre style={{ whiteSpace: "pre-wrap", fontSize: "9.5px" }}>
                        {`<img src="/photo.jpg">`}
                      </pre>
                    </div>
                    <div className="ba-box after">
                      <div className="ba-label">AFTER</div>
                      <pre style={{ whiteSpace: "pre-wrap", fontSize: "9.5px" }}>
                        {`<img src="/photo.jpg"\n  alt="Description here">`}
                      </pre>
                    </div>
                  </div>

                  <button 
                    className="act-btn pr"
                    style={{ marginTop: "10px" }}
                    onClick={() => startStream(selUrl || urls[0])}
                  >
                    ✦ Generate Fix{selUrl ? ` for ${selUrl}` : ""}
                  </button>
                  <button className="act-btn se">
                    👥 Assign to Dev Team
                  </button>
                </>
              )}

              {(streaming || streamLines.length > 0) && (
                <div>
                  <div className="stream-box">
                    {streamLines.map((line, i) => (
                      <div key={i} className="stream-line fade-in" style={{ marginBottom: "2px" }}>
                        {line}
                      </div>
                    ))}
                    {!streamDone && <span className="cursor"></span>}
                  </div>

                  {streamDone && (
                    <div className="fi" style={{ marginTop: "13px" }}>
                      <div className="ba-wrap">
                        <div className="ba-box before">
                          <div className="ba-label">BEFORE</div>
                          <pre style={{ whiteSpace: "pre-wrap", fontSize: "9.5px" }}>
                            {`<img src="/photo.jpg">`}
                          </pre>
                        </div>
                        <div className="ba-box after">
                          <div className="ba-label">AFTER</div>
                          <pre style={{ whiteSpace: "pre-wrap", fontSize: "9.5px" }}>
                            {`<img src="/photo.jpg"\n  alt="Description here">`}
                          </pre>
                        </div>
                      </div>
                      <button className="act-btn pr" onClick={markFixed}>
                        ✓ Mark as Fixed
                      </button>
                      <button className="act-btn se">
                        📋 Copy Code
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {mode === "diy" && (
            <div>
              <div className="ai-card" style={{ marginBottom: "14px" }}>
                <div className="ai-card-label">🛠 WHAT TO DO</div>
                <div className="ai-card-text">
                  Add descriptive, keyword-rich ALT attributes to every image. For decorative images use alt=""
                </div>
              </div>

              <div style={{ fontSize: "9.5px", fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: "12px" }}>
                STEP-BY-STEP GUIDE
              </div>

              {[
                { title: "Identify all images", desc: "Use browser DevTools → Elements tab → search for img tags without alt attribute." },
                { title: "Write descriptive ALT text", desc: "Describe the image in 5–15 words. Include the target keyword naturally where relevant." },
                { title: "Update via CMS or code", desc: "WordPress: Media Library → Edit → Alt text. In HTML: add alt attribute to img tags." },
                { title: "Validate with Screaming Frog", desc: "Re-crawl after fixing to confirm all alt attributes are populated and correct." }
              ].map((step, i) => (
                <div key={i} className="step-row">
                  <div className="step-num">{i + 1}</div>
                  <div>
                    <div className="step-title">{step.title}</div>
                    <div className="step-desc">{step.desc}</div>
                  </div>
                </div>
              ))}

              <button className="act-btn pr" style={{ marginTop: "8px" }}>
                📥 Download DIY Checklist
              </button>
              <button className="act-btn se">
                📋 Copy Fix Code
              </button>
            </div>
          )}

          {mode === "help" && (
            <div>
              <div style={{ textAlign: "center", padding: "18px 0 14px" }}>
                <div style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "15px",
                  background: "var(--grad1)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "24px",
                  margin: "0 auto 12px"
                }}>
                  🤝
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "17px", fontWeight: 800, marginBottom: "7px" }}>
                  Let AuditIQ Fix This
                </div>
                <div style={{ fontSize: "12.5px", color: "var(--text2)", lineHeight: "1.6" }}>
                  Our expert team will fix {issue.title || issue.issue || issue.issue_message} across all {issue.pages || issue.pages_affected || 0} affected pages with full QA.
                </div>
              </div>

              {[
                { icon: "⚡", title: "Express Fix", desc: "Fix all pages in 24 hours", tag: "Most Popular" },
                { icon: "🔍", title: "Audit + Fix", desc: "Full review then implement", tag: "Comprehensive" },
                { icon: "♾", title: "Monthly Retainer", desc: "Ongoing fixes + monitoring", tag: "Best Value" }
              ].map((option, i) => (
                <div key={i} className="url-row" style={{ marginBottom: "9px", padding: "13px 15px" }}>
                  <span style={{ fontSize: "20px" }}>{option.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "3px" }}>{option.title}</div>
                    <div style={{ fontSize: "11.5px", color: "var(--text3)" }}>{option.desc}</div>
                  </div>
                  <span className="glow-pill cyan">{option.tag}</span>
                </div>
              ))}

              <button className="act-btn pr" style={{ marginTop: "9px" }}>
                🚀 Request Expert Fix
              </button>
              <button className="act-btn vi">
                📅 Book Strategy Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
