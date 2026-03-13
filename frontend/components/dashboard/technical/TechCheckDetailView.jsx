"use client"

import { useState, useEffect } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import apiService from '@/lib/apiService'
import { Skeleton } from '@/components/ui/skeleton'

export default function TechCheckDetailView({ check, onBack }) {
  const { activeProject } = useProject()
  const [mode, setMode] = useState("ai")
  const [selUrl, setSelUrl] = useState(null)
  const [fixingUrl, setFixingUrl] = useState(null)
  const [fixedUrls, setFixedUrls] = useState([])
  const [checked, setChecked] = useState([])
  const [streamLines, setStreamLines] = useState([])
  const [streamDone, setStreamDone] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [checkDetail, setCheckDetail] = useState(null)
  const [affectedPages, setAffectedPages] = useState([])

  // Fetch detailed data for this check
  useEffect(() => {
    if (!activeProject || !check?.id) return

    const fetchCheckDetail = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await apiService.getTechnicalCheckDetail(activeProject._id, check.id)
        
        if (response.success) {
          setCheckDetail(response.data.check)
          setAffectedPages(response.data.pages || [])
          console.log(`📊 Loaded ${check.name} detail:`, {
            affectedPages: response.data.pages?.length || 0,
            status: response.data.check?.status
          })
        } else {
          setError(response?.message || 'Failed to load check details')
        }
      } catch (err) {
        console.error('Error fetching check detail:', err)
        setError('Failed to load check details')
      } finally {
        setLoading(false)
      }
    }

    fetchCheckDetail()
  }, [activeProject, check?.id, check?.name])

  // Use API data or fallback to check prop for backward compatibility
  const currentCheck = checkDetail || check
  const pages = affectedPages

  const openUrls = pages.filter(p => !fixedUrls.includes(p.url))
  const allFixed = fixedUrls.length
  const progress = pages.length > 0 ? (allFixed / pages.length) * 100 : 100

  function toggleCheck(url) {
    setChecked(c => c.includes(url) ? c.filter(x => x !== url) : [...c, url])
  }

  function startStream(url) {
    setFixingUrl(url)
    setStreamLines([])
    setStreamDone(false)
    const msgs = [
      { t: 0, l: `🔍 Scanning ${url}…` },
      { t: 700, l: `⚙️ Analysing ${currentCheck.name} configuration…` },
      { t: 1500, l: `✦ Root cause: ${currentCheck.detail || currentCheck.message || currentCheck.description}` },
      { t: 2300, l: `🧠 Generating targeted fix code…` },
      { t: 3100, l: `✅ Fix ready — +${currentCheck.impact}% SEO impact` },
    ]
    msgs.forEach(m =>
      setTimeout(() => setStreamLines(l => [...l, m.l]), m.t)
    )
    setTimeout(() => setStreamDone(true), 3400)
  }

  function markFixed() {
    if (fixingUrl) {
      setFixedUrls(prev => [...prev, fixingUrl])
      setFixingUrl(null)
      setStreamLines([])
      setStreamDone(false)
    }
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  // Loading state
  if (loading) {
    return (
      <div className="slide-up">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <button onClick={onBack} className="tb-btn">← Technical Checks</button>
          <span style={{ color: "var(--t3)", fontSize: 12 }}>›</span>
          <span style={{ fontSize: 12, color: "var(--t2)" }}>{check?.name || 'Loading...'}</span>
        </div>
        <div style={{ padding: "40px 20px" }}>
          <div style={{ textAlign: "center" }}>
            <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
            <Skeleton className="h-6 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto mb-6" />
            <div className="stats-row">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="stat-tile">
                  <Skeleton className="h-8 w-12 mx-auto mb-2" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="slide-up">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <button onClick={onBack} className="tb-btn">← Technical Checks</button>
          <span style={{ color: "var(--t3)", fontSize: 12 }}>›</span>
          <span style={{ fontSize: 12, color: "var(--t2)" }}>{check?.name || 'Error'}</span>
        </div>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16, color: "var(--red)" }}>⚠️</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>
            Failed to Load
          </div>
          <div style={{ fontSize: 14, color: "var(--t2)", maxWidth: 400, margin: "0 auto 24px" }}>
            {error}
          </div>
          <button onClick={onBack} className="tb-btn primary">← Back to Technical Checks</button>
        </div>
      </div>
    )
  }

  // Special case: Passed check
  if (currentCheck?.status === "passed" || currentCheck?.status === "OK") {
    return (
      <div className="slide-up">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <button onClick={onBack} className="tb-btn">← Technical Checks</button>
          <span style={{ color: "var(--t3)", fontSize: 12 }}>›</span>
          <span style={{ fontSize: 12, color: "var(--t2)" }}>{currentCheck.name}</span>
        </div>
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 8, color: "var(--green)" }}>
            All Clear!
          </div>
          <div style={{ fontSize: 14, color: "var(--t2)", maxWidth: 400, margin: "0 auto 24px" }}>
            {currentCheck.what || currentCheck.message || 'No issues detected.'}
          </div>
          <div className="ai-card" style={{ maxWidth: 480, margin: "0 auto 20px", textAlign: "left" }}>
            <div className="ai-label">✦ ARIA Insight</div>
            <div className="ai-body">
              {currentCheck.name} is correctly configured. No action needed. Monitor this check on every re-audit to ensure it stays green.
            </div>
          </div>
          <button onClick={onBack} className="tb-btn primary">← Back to Technical Checks</button>
        </div>
      </div>
    )
  }

  return (
    <div className="slide-up">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button onClick={onBack} className="tb-btn">← Technical Checks</button>
        <span style={{ color: "var(--t3)", fontSize: 12 }}>›</span>
        <span style={{ fontSize: 12, color: "var(--t2)", fontWeight: 500 }}>{currentCheck.name}</span>
        <span className={`badge ${currentCheck.status}`}>
          {currentCheck.status === "critical" ? "● CRITICAL" : currentCheck.status === "warning" ? "◆ WARNING" : "✔ PASSED"}
        </span>
      </div>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ 
            width: 42, 
            height: 42, 
            borderRadius: 11, 
            display: "grid", 
            placeItems: "center", 
            fontSize: 20, 
            background: currentCheck.status === "critical" ? "rgba(255,56,96,0.12)" : "rgba(255,183,3,0.1)", 
            flexShrink: 0 
          }}>
            {currentCheck.icon}
          </div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 800, flex: 1 }}>
            {currentCheck.name}
          </h2>
          <span className="pill c">🗂 Indexability</span>
        </div>
      </div>

      {/* 4 Stat Tiles */}
      <div className="stats-row">
        <div className="stat-tile">
          <div className="stat-tile-lbl">PAGES AFFECTED</div>
          <div className="stat-tile-val" style={{ color: "var(--red)" }}>
            {openUrls.length}
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-lbl">SEO IMPACT</div>
          <div className="stat-tile-val" style={{ color: "var(--cyan)" }}>
            +{currentCheck.impact || 0}%
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-lbl">DIFFICULTY</div>
          <div className="stat-tile-val" style={{ 
            color: currentCheck.difficulty === "Easy" ? "var(--green)" : 
                   currentCheck.difficulty === "Medium" ? "var(--amber)" : "var(--red)" 
          }}>
            {currentCheck.difficulty || "Medium"}
          </div>
        </div>
        <div className="stat-tile">
          <div className="stat-tile-lbl">FIXED</div>
          <div className="stat-tile-val" style={{ color: "var(--purple)" }}>
            {allFixed}/{pages.length}
          </div>
        </div>
      </div>

      {/* ARIA Issue Breakdown */}
      <div className="ai-card" style={{ marginBottom: 20 }}>
        <div className="ai-label">✦ ARIA — Issue Breakdown</div>
        <div className="ai-body">{currentCheck.what || currentCheck.message || 'No description available.'}</div>
      </div>

      {/* Two Column Layout */}
      <div className="detail-layout">
        {/* Left Column - Affected Pages */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="section-head" style={{ margin: 0 }}>
              <div className="section-title">Affected Pages</div>
              <div className="section-tag">{openUrls.length} OPEN</div>
            </div>
            {openUrls.length > 1 && (
              <button 
                className="tb-btn"
                onClick={() => setChecked(openUrls.length === checked.length ? [] : openUrls.map(u => u.url))}
              >
                {openUrls.length === checked.length ? "☐ Deselect All" : "☑ Select All"}
              </button>
            )}
          </div>

          {checked.length > 0 && (
            <div className="bulk-bar">
              {checked.length} pages selected
              <button 
                className="tb-btn primary"
                onClick={() => setShowBulkModal(true)}
                style={{ marginLeft: "auto" }}
              >
                ✦ Fix {checked.length} with AI
              </button>
              <button 
                className="tb-btn"
                onClick={() => setChecked([])}
              >
                Clear
              </button>
            </div>
          )}

          {/* URL Rows */}
          {pages.map((page, i) => {
            const isFixed = fixedUrls.includes(page.url)
            const isSelected = checked.includes(page.url)
            
            return (
              <div 
                key={i}
                className={`url-row ${isFixed ? "fixed-row" : ""} ${isSelected ? "selected" : ""}`}
              >
                {!isFixed && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCheck(page.url)}
                    style={{ marginRight: 10 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <div className="url-path">{page.url}</div>
                  <div className="url-sub">{page.issue}</div>
                </div>
                {isFixed ? (
                  <span className="chip-fixed">✓ Fixed</span>
                ) : (
                  <span className="chip-open">Open</span>
                )}
                {!isFixed && (
                  <button 
                    className="fix-ai-btn"
                    onClick={() => {
                      setSelUrl(page.url)
                      setMode("ai")
                      startStream(page.url)
                    }}
                  >
                    ✦ Fix
                  </button>
                )}
              </div>
            )
          })}

          {/* Progress Card */}
          <div className="glass-card" style={{ marginTop: 20 }}>
            <div className="card-header">
              <span className="section-title">Remediation Progress</span>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>
                  {allFixed}/{pages.length} Fixed
                </span>
                <span style={{ color: "var(--t3)", fontSize: 12 }}>
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <div className="prog-bar">
                <div 
                  className="prog-fill" 
                  style={{ 
                    width: `${progress}%`, 
                    background: "var(--green)" 
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Fix Panel */}
        <div className="fix-panel">
          <div className="fix-panel-head">
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--t)" }}>
                Fix Assistant
              </div>
              {fixingUrl && <div style={{ fontSize: 11, color: "var(--cyan)" }}>🔧 AI Fixing</div>}
              {selUrl && !fixingUrl && <div style={{ fontSize: 11, color: "var(--cyan)" }}>🔍 Selected</div>}
            </div>
            {(selUrl || fixingUrl) && (
              <button 
                className="tb-btn"
                onClick={() => {
                  setSelUrl(null)
                  setFixingUrl(null)
                  setStreamLines([])
                  setStreamDone(false)
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          <div className="fix-panel-body">
            {/* 3-Tab Switcher */}
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
                🤝 AuditIQ
              </button>
            </div>

            {/* Tab 1: AI Fix */}
            {mode === "ai" && (
              <div>
                {fixingUrl ? (
                  <div>
                    {/* Stream Animation */}
                    <div className="stream-box">
                      {streamLines.map((line, i) => (
                        <div key={i} className="stream-line fade-in">{line}</div>
                      ))}
                      {!streamDone && <span className="cursor" />}
                    </div>

                    {streamDone && (
                      <div className="fade-in">
                        {/* Before/After */}
                        <div className="ba-grid">
                          <div className="ba-box before">
                            <div className="ba-label">❌ Before</div>
                            <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                              {check.before}
                            </pre>
                          </div>
                          <div className="ba-box after">
                            <div className="ba-label">✅ After</div>
                            <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                              {check.after}
                            </pre>
                          </div>
                        </div>

                        {/* ARIA Explanation */}
                        <div className="ai-card" style={{ marginBottom: 12, padding: "12px 14px" }}>
                          <div className="ai-label">✦ ARIA Explanation</div>
                          <div className="ai-body" style={{ fontSize: 11.5 }}>
                            This fix resolves {currentCheck.name} on {fixingUrl}. 
                            Estimated recovery: +{currentCheck.impact || 0}% SEO impact. 
                            Difficulty: {currentCheck.difficulty || "Medium"}.
                          </div>
                        </div>

                        <button className="act-btn success" onClick={markFixed}>
                          ✓ Mark as Fixed
                        </button>
                        <button 
                          className="act-btn se" 
                          onClick={() => copyToClipboard(currentCheck.after)}
                        >
                          {copiedPrompt ? "✓ Copied!" : "📋 Copy Code"}
                        </button>
                        <button className="act-btn se">
                          👥 Send to Dev Team
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Default State */}
                    <div className="glass-card" style={{ padding: 16, marginBottom: 16 }}>
                      <div style={{ fontSize: 12, color: "var(--t3)" }}>
                        {selUrl ? `Selected: ${selUrl}` : "👆 Select a page to generate a fix"}
                      </div>
                    </div>

                    {/* AI Prompt Template */}
                    <div className="ai-card" style={{ marginBottom: 16 }}>
                      <div className="ai-label">✦ AI PROMPT TEMPLATE</div>
                      <div className="ai-body" style={{ fontSize: 11.5 }}>
                        {currentCheck.aiPrompt}
                      </div>
                      <button 
                        className="tb-btn" 
                        style={{ marginTop: 8, fontSize: 10 }}
                        onClick={() => copyToClipboard(currentCheck.aiPrompt)}
                      >
                        {copiedPrompt ? "✓ Copied!" : "📋 Copy Prompt"}
                      </button>
                    </div>

                    {/* Before/After */}
                    <div className="ba-grid">
                      <div className="ba-box before">
                        <div className="ba-label">❌ Before</div>
                        <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                          {currentCheck.before}
                        </pre>
                      </div>
                      <div className="ba-box after">
                        <div className="ba-label">✅ After</div>
                        <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                          {currentCheck.after}
                        </pre>
                      </div>
                    </div>

                    <button 
                      className="act-btn pr"
                      onClick={() => selUrl && startStream(selUrl)}
                      style={{ opacity: selUrl ? 1 : 0.5 }}
                    >
                      ✦ Generate Fix for {selUrl || 'URL'}
                    </button>
                    <button 
                      className="act-btn vi"
                      onClick={() => checked.length > 0 && setShowBulkModal(true)}
                      style={{ opacity: checked.length > 0 ? 1 : 0.5 }}
                    >
                      ✦ Bulk Fix ({checked.length} pages)
                    </button>
                    <button className="act-btn se">
                      👥 Assign to Dev Team
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: DIY Guide */}
            {mode === "diy" && (
              <div>
                <div className="ai-card" style={{ marginBottom: 16 }}>
                  <div className="ai-label">What to do</div>
                  <div className="ai-body">{currentCheck.whatToDo}</div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 12 }}>
                  Step-by-Step
                </div>

                {currentCheck.diySteps?.map((step, i) => (
                  <div key={i} className="step-item">
                    <div className="step-num">{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div className="step-title">{step.title}</div>
                      <div className="step-desc">{step.desc}</div>
                    </div>
                  </div>
                ))}

                <div className="ba-grid">
                  <div className="ba-box before">
                    <div className="ba-label">❌ Before</div>
                    <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                      {currentCheck.before}
                    </pre>
                  </div>
                  <div className="ba-box after">
                    <div className="ba-label">✅ After</div>
                    <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                      {currentCheck.after}
                    </pre>
                  </div>
                </div>

                <button className="act-btn pr">
                  📥 Download Full Checklist
                </button>
                <button 
                  className="act-btn se"
                  onClick={() => copyToClipboard(currentCheck.after)}
                >
                  📋 Copy Code Fix
                </button>
                <button 
                  className="act-btn se"
                  onClick={() => setMode("ai")}
                >
                  ✦ Switch to AI Fix
                </button>
              </div>
            )}

            {/* Tab 3: AuditIQ Help */}
            {mode === "help" && (
              <div>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                  <div style={{ 
                    width: 52, 
                    height: 52, 
                    borderRadius: 13, 
                    background: "var(--grad1)", 
                    display: "grid", 
                    placeItems: "center", 
                    fontSize: 24, 
                    margin: "0 auto 16px" 
                  }}>
                    🤝
                  </div>
                  <div style={{ 
                    fontFamily: "'Syne', sans-serif", 
                    fontSize: 18, 
                    fontWeight: 800, 
                    marginBottom: 8 
                  }}>
                    Let AuditIQ Fix It
                  </div>
                  <div style={{ fontSize: 14, marginBottom: 16 }}>
                    Our expert team will resolve {currentCheck.name} across all {openUrls.length} affected pages with QA verification and a before/after report.
                  </div>
                </div>

                {/* Service Options */}
                <div className="help-opt">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>⚡ Express Fix</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>Fix all pages in 24 hours</div>
                  </div>
                  <span className="pill c">Most Popular</span>
                </div>

                <div className="help-opt">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>🔍 Technical Audit + Fix</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>Full review then implement with docs</div>
                  </div>
                  <span className="pill v">Comprehensive</span>
                </div>

                <div className="help-opt">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>♾ Monthly Maintenance</div>
                    <div style={{ fontSize: 11, color: "var(--t3)" }}>Ongoing fixes + monitoring + alerts</div>
                  </div>
                  <span className="pill g">Best Value</span>
                </div>

                <button className="act-btn pr">
                  🚀 Request Expert Fix
                </button>
                <button className="act-btn vi">
                  📅 Book a Strategy Call
                </button>
                <button 
                  className="act-btn se"
                  onClick={() => setMode("ai")}
                >
                  ← Back to AI Fix
                </button>

                <div style={{ 
                  background: "rgba(0,245,160,0.1)", 
                  border: "1px solid rgba(0,245,160,0.2)", 
                  borderRadius: 8, 
                  padding: 12, 
                  marginTop: 16, 
                  fontSize: 11, 
                  color: "var(--green)" 
                }}>
                  ✓ Includes before/after screenshots + 30-day rank tracking
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Fix Modal */}
      {showBulkModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div className="glass-card" style={{ maxWidth: 480, width: "100%", margin: 20 }}>
            <div className="card-header">
              <span className="section-title">✦ Bulk AI Fix</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 14, marginBottom: 16 }}>
                {checked.length} pages selected — {currentCheck.name}
              </div>
              <div style={{ marginBottom: 20 }}>
                {checked.map((url, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <span style={{ color: "var(--green)" }}>✓</span>
                    <span style={{ fontSize: 12, color: "var(--t2)" }}>{url}</span>
                    <span style={{ fontSize: 10, color: "var(--green)" }}>Fix ready</span>
                  </div>
                ))}
              </div>
              <button 
                className="act-btn pr"
                onClick={() => {
                  setFixedUrls(prev => [...prev, ...checked])
                  setChecked([])
                  setShowBulkModal(false)
                }}
              >
                ✓ Apply All Fixes ({checked.length} pages)
              </button>
              <button 
                className="act-btn se"
                onClick={() => setShowBulkModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
