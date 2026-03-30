"use client"

import { useState, useEffect } from "react"
import { useProject } from "@/contexts/ProjectContext"
import apiService from "@/lib/apiService"

export default function IssueDetailView({ issue, onBack, onOpenUrl }) {
  const { activeProject } = useProject()
  const [mode, setMode] = useState("ai")
  const [selUrl, setSelUrl] = useState(null)
  const [fixedUrls, setFixedUrls] = useState(["/features/white-label"])
  const [streaming, setStreaming] = useState(false)
  const [streamLines, setStreamLines] = useState([])
  const [streamDone, setStreamDone] = useState(false)
  const [urls, setUrls] = useState([])

  // Calculate progress
  const fixedCount = fixedUrls.length
  const progress = urls.length > 0 ? Math.round((fixedCount / urls.length) * 100) : 0

  // Inject custom styles
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
      
      @keyframes fixFadeUp {
        from { opacity: 0; transform: translateY(6px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes fixBlink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0; }
      }
      
      @keyframes fixSlideUp {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    if (!activeProject || !issue) return

    const fetchIssueUrls = async () => {
      try {
        // Try to get issue_code from real data first, otherwise use mock mapping
        let issueCode = issue.issue_code
        console.log('🔍 Original issue object:', issue)
        console.log('📋 Issue fields:', Object.keys(issue))
        console.log('🏷️ Issue issue_code:', issue.issue_code)
        console.log('🏷️ Issue issue:', issue.issue)
        console.log('🏷️ Issue issue_message:', issue.issue_message)
        
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
          console.log('🔄 Mapped issueCode:', issueCode)
        }

        if (issueCode) {
          console.log('🔍 Fetching URLs for issueCode:', issueCode)
          
          // Check if issue already has full affected_urls from main API
          if (issue.affected_urls && Array.isArray(issue.affected_urls)) {
            console.log('✅ Using affected_urls from issue data:', issue.affected_urls.length, 'URLs')
            console.log('🔢 Verification - pages_affected:', issue.pages_affected, 'vs affected_urls.length:', issue.affected_urls.length)
            console.log('📊 Match check:', issue.pages_affected === issue.affected_urls.length ? '✅ MATCH' : '❌ MISMATCH')
            setUrls(issue.affected_urls)
          } else {
            // Fallback to separate API call
            const response = await apiService.getIssueUrls(activeProject._id, issueCode)
            console.log('📊 Issue URLs API Response:', response)
            console.log('📋 Response data:', response.data)
            console.log('📈 URLs length:', response.data?.length || 0)
            if (response.success) {
              setUrls(response.data)
              console.log('✅ URLs set successfully:', response.data)
            }
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
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ 
          width: 50, 
          height: 50, 
          borderRadius: 13, 
          display: "grid", 
          placeItems: "center", 
          fontSize: 22, 
          background: issue.severity === "high" ? "rgba(255,56,96,0.12)" : 
                   issue.severity === "medium" ? "rgba(255,183,3,0.10)" : 
                   "rgba(0,245,160,0.08)", 
          flexShrink: 0 
        }}>
          {issue.severity === "high" ? "⚠" : issue.severity === "medium" ? "⚡" : "✓"}
        </div>
        <h2 style={{ 
          fontFamily: "/dashboard", 
          fontSize: 28, 
          fontWeight: 800, 
          flex: 1, 
          color: "#eef2ff" 
        }}>
          {issue.title || issue.issue || issue.issue_message}
        </h2>
        <span style={{
          background: "rgba(0,223,255,0.09)",
          border: "1px solid rgba(0,223,255,0.18)",
          color: "#00dfff",
          borderRadius: 20,
          padding: "4px 13px",
          fontSize: 11,
          fontWeight: 600
        }}>🗂 On-Page Issues</span>
      </div>

      {/* 4 Stat Tiles */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{
          background: "rgba(255,255,255,0.038)",
          border: "1px solid rgba(255,255,255,0.075)",
          borderRadius: 14,
          padding: "16px 18px"
        }}>
          <div style={{
            fontSize: "9.5px",
            fontWeight: 700,
            color: "#4e5f7a",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8
          }}>PAGES AFFECTED</div>
          <div style={{
            fontFamily: "/dashboard",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: "#ff3860"
          }}>{issue.pages || issue.pages_affected || 0}</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.038)",
          border: "1px solid rgba(255,255,255,0.075)",
          borderRadius: 14,
          padding: "16px 18px"
        }}>
          <div style={{
            fontSize: "9.5px",
            fontWeight: 700,
            color: "#4e5f7a",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8
          }}>SEO IMPACT</div>
          <div style={{
            fontFamily: "/dashboard",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: "#00dfff"
          }}>+{issue.impact || issue.impact_percentage || 0}%</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.038)",
          border: "1px solid rgba(255,255,255,0.075)",
          borderRadius: 14,
          padding: "16px 18px"
        }}>
          <div style={{
            fontSize: "9.5px",
            fontWeight: 700,
            color: "#4e5f7a",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8
          }}>DIFFICULTY</div>
          <div style={{
            fontFamily: "/dashboard",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: issue.difficulty === "Easy" ? "#00f5a0" : 
                   issue.difficulty === "Medium" ? "#ffb703" : "#ff3860"
          }}>{issue.difficulty || "Medium"}</div>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.038)",
          border: "1px solid rgba(255,255,255,0.075)",
          borderRadius: 14,
          padding: "16px 18px"
        }}>
          <div style={{
            fontSize: "9.5px",
            fontWeight: 700,
            color: "#4e5f7a",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8
          }}>FIXED</div>
          <div style={{
            fontFamily: "/dashboard",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: "#7730ed"
          }}>{fixedCount}/{urls.length}</div>
        </div>
      </div>

      {/* ARIA Issue Breakdown */}
      <div style={{
        marginBottom: 22,
        background: "linear-gradient(135deg, rgba(119,48,237,0.11), rgba(0,223,255,0.05))",
        border: "1px solid rgba(119,48,237,0.22)",
        borderRadius: 14,
        padding: "18px 22px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute",
          right: 14,
          top: 12,
          fontSize: 20,
          opacity: 0.1,
          color: "#00dfff",
          pointerEvents: "none"
        }}>✦</div>
        <div style={{
          fontSize: 9,
          fontWeight: 700,
          color: "#c77dff",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 8
        }}>✦ ARIA — ISSUE BREAKDOWN</div>
        <div style={{
          fontSize: 13,
          color: "#8494b0",
          lineHeight: 1.65
        }}>
          This issue affects {issue.pages || issue.pages_affected || 0} pages. 
          Missing or empty attributes reduce both search engine understanding and AI citation probability. 
          Fixing this is rated {issue.difficulty || "Medium"} difficulty and can recover an estimated 
          +{issue.impact || issue.impact_percentage || 0}% SEO impact.
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex flex-col lg:flex-row gap-5 mt-1 min-w-0">
        {/* Left Column - URLs */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <div className="font-dashboard text-base font-bold text-[#eef2ff]">
                Affected URLs
              </div>
              <div className="bg-[rgba(0,223,255,0.09)] border border-[rgba(0,223,255,0.18)] text-[#00dfff] rounded-full text-[9px] font-bold px-2.5 py-0.5 ml-2">
                {urls.length} OPEN
              </div>
            </div>
          </div>
          
          {urls.map(url => {
            const isFixed = fixedUrls.includes(url)
            const isSelected = selUrl === url
            
            return (
              <div 
                key={url}
                className={`
                  flex items-center gap-2.5 p-3 mb-2 bg-[rgba(255,255,255,0.03)] rounded-xl cursor-pointer 
                  transition-all duration-200 border min-w-0
                  ${isSelected && !isFixed ? 'bg-[rgba(119,48,237,0.07)] border-[rgba(119,48,237,0.4)]' : 'border-[rgba(255,255,255,0.075)]'}
                  ${isFixed ? 'opacity-55' : 'hover:bg-[rgba(255,255,255,0.05)]'}
                `}
                onClick={() => !isFixed && setSelUrl(isSelected ? null : url)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-dashboard text-xs text-[#00dfff] font-medium truncate">
                    {url}
                  </div>
                  <div className="text-[10.5px] text-[#4e5f7a] mt-0.5 truncate">
                    {issue.issue || issue.issue_message || 'Issue detected on this page'}
                  </div>
                </div>
                {!isFixed && (
                  <>
                    <button 
                      className="bg-[rgba(255,56,96,0.11)] text-[#ff3860] border border-[rgba(255,56,96,0.2)] 
                               text-[10px] font-medium px-2.5 py-1 rounded-md flex-shrink-0 mr-1.5
                               transition-all duration-200 hover:bg-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.3)]"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenUrl?.(url)
                      }}
                    >
                      Open
                    </button>
                    <button 
                      className="bg-gradient-to-r from-[#7730ed] to-[#00dfff] text-white border-none
                               text-[10px] font-bold px-3 py-1 rounded-md flex-shrink-0
                               shadow-[0_0_12px_rgba(0,223,255,0.2)] transition-all duration-200
                               hover:-translate-y-px hover:shadow-[0_3px_16px_rgba(0,223,255,0.3)]"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelUrl(url)
                        setMode("ai")
                        startStream(url)
                      }}
                    >
                      ✦ Fix
                    </button>
                  </>
                )}
              </div>
            )
          })}
          
          {/* Progress Card */}
          <div className="mt-3.5 bg-[rgba(255,255,255,0.038)] border border-[rgba(255,255,255,0.075)] rounded-xl p-4">
            <div className="flex justify-between mb-2.5">
              <span className="text-xs text-[#8494b0]">Remediation Progress</span>
              <span className="text-xs font-bold text-[#00f5a0]">{fixedCount}/{urls.length} Fixed</span>
            </div>
            <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden mt-2">
              <div 
                className="h-full rounded-full bg-[#00f5a0] transition-all duration-1100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {progress === 100 && (
              <div className="text-xs text-[#00f5a0] font-semibold text-center mt-2.5">
                🎉 All issues resolved! Re-audit to confirm.
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Fix Panel */}
        <div className="w-full lg:w-96 xl:w-[460px] flex-shrink-0">
          <div className="bg-[#06101d] border border-[rgba(255,255,255,0.075)] rounded-2xl overflow-hidden sticky top-0">
          {/* Panel Header */}
            <div className="px-4.5 py-4 border-b border-[rgba(255,255,255,0.075)] flex items-center justify-between">
              <div>
                <div className="font-dashboard text-sm font-bold text-[#eef2ff]">
                  {streaming ? "🔧 AI Fixing" : selUrl ? "🔍 Selected" : "Fix Assistant"}
                </div>
              </div>
              {(selUrl || streaming) && (
                <button 
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] 
                           rounded-md px-2 py-0.5 text-xs text-[#8494b0] cursor-pointer
                           hover:bg-[rgba(255,255,255,0.08)] transition-colors"
                  onClick={() => {
                    setSelUrl(null)
                    setStreaming(false)
                    setStreamLines([])
                    setStreamDone(false)
                  }}
                >
                  ✕ Clear
                </button>
              )}
            </div>

            {/* Panel Body */}
            <div className="p-4.5 max-h-[calc(100vh-180px)] overflow-y-auto">
            {/* 3-Tab Switcher */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              border: "1px solid rgba(255,255,255,0.075)",
              borderRadius: 10,
              overflow: "hidden",
              marginBottom: 18
            }}>
              <button 
                style={{
                  padding: "9px 6px",
                  fontSize: 11,
                  fontWeight: 600,
                  border: "none",
                  background: mode === "ai" ? "linear-gradient(135deg,#7730ed,#00dfff)" : "transparent",
                  color: mode === "ai" ? "#fff" : "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  lineHeight: 1.3,
                  transition: "all 0.2s",
                  borderRight: "1px solid rgba(255,255,255,0.075)"
                }}
                onClick={() => setMode("ai")}
              >
                ✦ Fix with AI
              </button>
              <button 
                style={{
                  padding: "9px 6px",
                  fontSize: 11,
                  fontWeight: 600,
                  border: "none",
                  background: mode === "diy" ? "linear-gradient(135deg,#7730ed,#00dfff)" : "transparent",
                  color: mode === "diy" ? "#fff" : "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  lineHeight: 1.3,
                  transition: "all 0.2s",
                  borderLeft: "1px solid rgba(255,255,255,0.075)",
                  borderRight: "1px solid rgba(255,255,255,0.075)"
                }}
                onClick={() => setMode("diy")}
              >
                🛠 DIY Guide
              </button>
              <button 
                style={{
                  padding: "9px 6px",
                  fontSize: 11,
                  fontWeight: 600,
                  border: "none",
                  background: mode === "help" ? "linear-gradient(135deg,#7730ed,#00dfff)" : "transparent",
                  color: mode === "help" ? "#fff" : "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  lineHeight: 1.3,
                  transition: "all 0.2s",
                  borderLeft: "1px solid rgba(255,255,255,0.075)"
                }}
                onClick={() => setMode("help")}
              >
                🤝 AuditIQ
              </button>
            </div>

            {/* Tab 1: AI Fix */}
            {mode === "ai" && (
              <div>
                {streaming ? (
                  <div>
                    {/* Stream Animation */}
                    <div style={{
                      background: "rgba(0,0,0,0.4)",
                      border: "1px solid rgba(0,223,255,0.12)",
                      borderRadius: 10,
                      padding: "13px 15px",
                      minHeight: 72,
                      marginBottom: 12,
                      fontFamily: "/dashboard",
                      fontSize: 12,
                      lineHeight: 1.7,
                      color: "#8494b0"
                    }}>
                      {streamLines.map((line, i) => (
                        <div key={i} style={{
                          marginBottom: 3,
                          animation: "fixFadeUp 0.3s ease forwards"
                        }}>{line}</div>
                      ))}
                      {!streamDone && (
                        <span style={{
                          display: "inline-block",
                          width: 2,
                          height: 12,
                          background: "#00dfff",
                          marginLeft: 1,
                          animation: "fixBlink 1s infinite",
                          verticalAlign: "middle"
                        }} />
                      )}
                    </div>

                    {streamDone && (
                      <div style={{ animation: "fixFadeUp 0.3s ease forwards" }}>
                        {/* Generated Fix Code Label */}
                        <div style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#4e5f7a",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: 8
                        }}>Generated Fix Code</div>

                        {/* Before/After Grid */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          marginBottom: 12
                        }}>
                          <div style={{
                            background: "rgba(255,56,96,0.06)",
                            border: "1px solid rgba(255,56,96,0.15)",
                            color: "#ffaab5",
                            borderRadius: 9,
                            padding: "11px 13px"
                          }}>
                            <div style={{
                              fontSize: "8.5px",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              marginBottom: 6,
                              textTransform: "uppercase",
                              opacity: 0.6,
                              fontFamily: "'DM Sans', sans-serif"
                            }}>❌ BEFORE</div>
                            <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                              {`<img src="/photo.jpg">`}
                            </pre>
                          </div>
                          <div style={{
                            background: "rgba(0,245,160,0.05)",
                            border: "1px solid rgba(0,245,160,0.15)",
                            color: "#5ef7c0",
                            borderRadius: 9,
                            padding: "11px 13px"
                          }}>
                            <div style={{
                              fontSize: "8.5px",
                              fontWeight: 700,
                              letterSpacing: "0.1em",
                              marginBottom: 6,
                              textTransform: "uppercase",
                              opacity: 0.6,
                              fontFamily: "'DM Sans', sans-serif"
                            }}>✅ AFTER</div>
                            <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                              {`<img src="/photo.jpg"\n  alt="Description here">`}
                            </pre>
                          </div>
                        </div>

                        {/* ARIA Explanation Card */}
                        <div style={{
                          background: "linear-gradient(135deg, rgba(119,48,237,0.11), rgba(0,223,255,0.05))",
                          border: "1px solid rgba(119,48,237,0.22)",
                          borderRadius: 14,
                          padding: "12px 14px",
                          marginBottom: 12,
                          position: "relative",
                          overflow: "hidden"
                        }}>
                          <div style={{
                            position: "absolute",
                            right: 14,
                            top: 12,
                            fontSize: 20,
                            opacity: 0.1,
                            color: "#00dfff",
                            pointerEvents: "none"
                          }}>✦</div>
                          <div style={{
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#c77dff",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            marginBottom: 6
                          }}>✦ ARIA Explanation</div>
                          <div style={{
                            fontSize: 11.5,
                            color: "#8494b0",
                            lineHeight: 1.65
                          }}>
                            This fix resolves <strong style={{ color: "#eef2ff" }}>{issue.title || issue.issue}</strong> on <strong style={{ color: "#00dfff", fontFamily: "/dashboard" }}>{selUrl}</strong>. Estimated recovery: <strong style={{ color: "#00f5a0" }}>+{issue.impact || 0}% SEO</strong>. Difficulty: <strong style={{ color: "#eef2ff" }}>{issue.difficulty || "Medium"}</strong>.
                          </div>
                        </div>

                        <button 
                          style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 9,
                            fontSize: "12.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none",
                            fontFamily: "/dashboard",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            marginBottom: 7,
                            background: "rgba(0,245,160,0.1)",
                            border: "1px solid rgba(0,245,160,0.2)",
                            color: "#00f5a0"
                          }}
                          onClick={markFixed}
                        >
                          ✓ Mark as Fixed
                        </button>
                        <button 
                          style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 9,
                            fontSize: "12.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none",
                            fontFamily: "/dashboard",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            marginBottom: 7,
                            background: "rgba(255,255,255,0.065)",
                            color: "#8494b0",
                            border: "1px solid rgba(255,255,255,0.1)"
                          }}
                        >
                          📋 Copy Code
                        </button>
                        <button 
                          style={{
                            width: "100%",
                            padding: 10,
                            borderRadius: 9,
                            fontSize: "12.5px",
                            fontWeight: 600,
                            cursor: "pointer",
                            border: "none",
                            fontFamily: "/dashboard",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            background: "rgba(255,255,255,0.065)",
                            color: "#8494b0",
                            border: "1px solid rgba(255,255,255,0.1)"
                          }}
                        >
                          👥 Send to Dev Team
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Hint Box */}
                    <div style={{
                      background: "rgba(255,255,255,0.038)",
                      borderRadius: 8,
                      padding: "8px 11px",
                      fontSize: "11.5px",
                      marginBottom: 14,
                      color: selUrl ? "#00dfff" : "#4e5f7a",
                      fontFamily: "/dashboard"
                    }}>
                      {selUrl ? `Selected: ${selUrl}` : "👆 Select a URL from the list to generate a targeted AI fix"}
                    </div>

                    {/* AI Prompt Template Card */}
                    <div style={{
                      background: "linear-gradient(135deg, rgba(119,48,237,0.11), rgba(0,223,255,0.05))",
                      border: "1px solid rgba(119,48,237,0.22)",
                      borderRadius: 14,
                      padding: "18px 22px",
                      marginBottom: 16,
                      position: "relative",
                      overflow: "hidden"
                    }}>
                      <div style={{
                        position: "absolute",
                        right: 14,
                        top: 12,
                        fontSize: 20,
                        opacity: 0.1,
                        color: "#00dfff",
                        pointerEvents: "none"
                      }}>✦</div>
                      <div style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: "#c77dff",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        marginBottom: 8
                      }}>✦ AI PROMPT TEMPLATE</div>
                      <div style={{
                        fontSize: "11.5px",
                        color: "#8494b0",
                        lineHeight: 1.65,
                        marginBottom: 10
                      }}>
                        Write SEO-optimised ALT text for this image. Include the target keyword and keep under 125 characters.
                      </div>
                      <button 
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 6,
                          padding: "4px 10px",
                          fontSize: 10,
                          color: "#8494b0",
                          cursor: "pointer",
                          marginTop: 0
                        }}
                      >
                        📋 Copy Prompt
                      </button>
                    </div>

                    {/* Before/After Code Blocks */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginBottom: 14
                    }}>
                      <div style={{
                        background: "rgba(255,56,96,0.06)",
                        border: "1px solid rgba(255,56,96,0.15)",
                        color: "#ffaab5",
                        borderRadius: 9,
                        padding: "11px 13px"
                      }}>
                        <div style={{
                          fontSize: "8.5px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          marginBottom: 6,
                          textTransform: "uppercase",
                          opacity: 0.6,
                          fontFamily: "'DM Sans', sans-serif"
                        }}>❌ BEFORE</div>
                        <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                          {`<img src="/photo.jpg">`}
                        </pre>
                      </div>
                      <div style={{
                        background: "rgba(0,245,160,0.05)",
                        border: "1px solid rgba(0,245,160,0.15)",
                        color: "#5ef7c0",
                        borderRadius: 9,
                        padding: "11px 13px"
                      }}>
                        <div style={{
                          fontSize: "8.5px",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                          marginBottom: 6,
                          textTransform: "uppercase",
                          opacity: 0.6,
                          fontFamily: "'DM Sans', sans-serif"
                        }}>✅ AFTER</div>
                        <pre style={{ whiteSpace: "pre-wrap", fontSize: 10 }}>
                          {`<img src="/photo.jpg"\n  alt="Description here">`}
                        </pre>
                      </div>
                    </div>

                    <button 
                      style={{
                        width: "100%",
                        padding: 10,
                        borderRadius: 9,
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "none",
                        fontFamily: "/dashboard",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        marginBottom: 7,
                        background: "linear-gradient(135deg,#7730ed,#00dfff)",
                        color: "#fff",
                        opacity: selUrl ? 1 : 0.5,
                        boxShadow: selUrl ? "0 0 18px rgba(0,223,255,0.16)" : "none"
                      }}
                      onClick={() => selUrl && startStream(selUrl)}
                    >
                      ✦ Generate Fix for {selUrl || 'URL'}
                    </button>
                    <button 
                      style={{
                        width: "100%",
                        padding: 10,
                        borderRadius: 9,
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "none",
                        fontFamily: "/dashboard",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        background: "rgba(255,255,255,0.065)",
                        color: "#8494b0",
                        border: "1px solid rgba(255,255,255,0.1)"
                      }}
                    >
                      👥 Assign to Dev Team
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: DIY Guide */}
            {mode === "diy" && (
              <div>
                {/* What to do card */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(119,48,237,0.11), rgba(0,223,255,0.05))",
                  border: "1px solid rgba(119,48,237,0.22)",
                  borderRadius: 14,
                  padding: "18px 22px",
                  marginBottom: 16,
                  position: "relative",
                  overflow: "hidden"
                }}>
                  <div style={{
                    position: "absolute",
                    right: 14,
                    top: 12,
                    fontSize: 20,
                    opacity: 0.1,
                    color: "#00dfff",
                    pointerEvents: "none"
                  }}>✦</div>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#c77dff",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 8
                  }}>🛠 What to do</div>
                  <div style={{
                    fontSize: "11.5px",
                    color: "#8494b0",
                    lineHeight: 1.65
                  }}>
                    Add descriptive, keyword-rich ALT attributes to every image. For decorative images use alt=""
                  </div>
                </div>

                {/* Step-by-Step Guide Label */}
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "#4e5f7a",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: 11
                }}>Step-by-Step Guide</div>

                {/* Steps */}
                {[
                  { title: "Identify all images", desc: "Use browser DevTools → Elements tab → search for img tags without alt attribute." },
                  { title: "Write descriptive ALT text", desc: "Describe the image in 5–15 words. Include the target keyword naturally where relevant." },
                  { title: "Update via CMS or code", desc: "WordPress: Media Library → Edit → Alt text. In HTML: add alt attribute to img tags." },
                  { title: "Validate with Screaming Frog", desc: "Re-crawl after fixing to confirm all alt attributes are populated and correct." }
                ].map((step, i) => (
                  <div key={i} style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    marginBottom: 13
                  }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#7730ed,#00dfff)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#fff",
                      flexShrink: 0,
                      marginTop: 1,
                      fontFamily: "Syne, sans-serif"
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        marginBottom: 2,
                        color: "#eef2ff"
                      }}>{step.title}</div>
                      <div style={{
                        fontSize: "11.5px",
                        color: "#8494b0",
                        lineHeight: 1.55
                      }}>{step.desc}</div>
                    </div>
                  </div>
                ))}

                <button 
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 9,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "/dashboard",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 7,
                    background: "linear-gradient(135deg,#7730ed,#00dfff)",
                    color: "#fff",
                    boxShadow: "0 0 18px rgba(0,223,255,0.16)"
                  }}
                >
                  📥 Download DIY Checklist
                </button>
                <button 
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 9,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "/dashboard",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 7,
                    background: "rgba(255,255,255,0.065)",
                    color: "#8494b0",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                  onClick={() => setMode("ai")}
                >
                  ✦ Switch to AI Fix
                </button>
              </div>
            )}

            {/* Tab 3: AuditIQ Help */}
            {mode === "help" && (
              <div>
                {/* Centered Header Section */}
                <div style={{ 
                  textAlign: "center", 
                  padding: "16px 0 18px" 
                }}>
                  <div style={{ 
                    width: 52, 
                    height: 52, 
                    borderRadius: 14, 
                    background: "linear-gradient(135deg,#7730ed,#00dfff)", 
                    display: "grid", 
                    placeItems: "center", 
                    fontSize: 24, 
                    margin: "0 auto 12px" 
                  }}>
                    🤝
                  </div>
                  <div style={{ 
                    fontFamily: "/dashboard", 
                    fontSize: 17, 
                    fontWeight: 800, 
                    marginBottom: 6 
                  }}>
                    Let AuditIQ Fix It
                  </div>
                  <div style={{ 
                    fontSize: 12, 
                    color: "#8494b0", 
                    lineHeight: 1.6 
                  }}>
                    Our technical team will resolve <strong style={{ color: "#eef2ff" }}>{issue.title || issue.issue}</strong> across all {issue.pages || issue.pages_affected || 0} affected pages — with QA verification and a before/after report.
                  </div>
                </div>

                {/* Service Options */}
                {[
                  { 
                    icon: "⚡", 
                    title: "Express Fix", 
                    desc: "Fix all pages in 24 hours", 
                    tag: "Most Popular",
                    tc: "#00dfff",
                    bg: "rgba(0,223,255,0.12)"
                  },
                  { 
                    icon: "🔍", 
                    title: "Technical Audit + Fix", 
                    desc: "Full review then implement fixes with docs", 
                    tag: "Comprehensive",
                    tc: "#c77dff",
                    bg: "rgba(119,48,237,0.12)"
                  },
                  { 
                    icon: "♾", 
                    title: "Monthly Maintenance", 
                    desc: "Ongoing fixes + monitoring + alerts", 
                    tag: "Best Value",
                    tc: "#00f5a0",
                    bg: "rgba(0,245,160,0.08)"
                  }
                ].map((option, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "13px 14px",
                    marginBottom: 9,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.075)",
                    borderRadius: 11,
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.14)"
                    e.target.style.transform = "translateX(2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.075)"
                    e.target.style.transform = "translateX(0)"
                  }}>
                    <div style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 20,
                      background: option.bg,
                      flexShrink: 0
                    }}>{option.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        fontWeight: 700, 
                        fontSize: 13, 
                        marginBottom: 2 
                      }}>{option.title}</div>
                      <div style={{ 
                        fontSize: 11, 
                        color: "#4e5f7a" 
                      }}>{option.desc}</div>
                    </div>
                    <span style={{
                      borderRadius: 20,
                      padding: "2px 9px",
                      fontSize: "9.5px",
                      fontWeight: 600,
                      color: option.tc,
                      background: `${option.tc}12`,
                      border: `1px solid ${option.tc}18`
                    }}>{option.tag}</span>
                  </div>
                ))}

                <button 
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 9,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "/dashboard",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 7,
                    background: "linear-gradient(135deg,#7730ed,#00dfff)",
                    color: "#fff",
                    boxShadow: "0 0 18px rgba(0,223,255,0.16)"
                  }}
                >
                  🚀 Request Expert Fix
                </button>
                <button 
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 9,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "/dashboard",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 7,
                    background: "linear-gradient(135deg, rgba(119,48,237,0.28), rgba(157,78,221,0.2))",
                    color: "#c77dff",
                    border: "1px solid rgba(119,48,237,0.28)"
                  }}
                >
                  📅 Book a Strategy Call
                </button>
                <button 
                  style={{
                    width: "100%",
                    padding: 10,
                    borderRadius: 9,
                    fontSize: "12.5px",
                    fontWeight: 600,
                    cursor: "pointer",
                    border: "none",
                    fontFamily: "/dashboard",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    background: "rgba(255,255,255,0.065)",
                    color: "#8494b0",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                  onClick={() => setMode("ai")}
                >
                  ← Back to AI Fix
                </button>

                {/* Green Info Strip */}
                <div style={{ 
                  background: "rgba(0,245,160,0.05)", 
                  border: "1px solid rgba(0,245,160,0.14)", 
                  borderRadius: 9, 
                  padding: "10px 12px", 
                  marginTop: 12, 
                  fontSize: 11, 
                  color: "#00f5a0", 
                  textAlign: "center" 
                }}>
                  ✓ Includes before/after screenshots + 30-day rank tracking
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}
