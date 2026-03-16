"use client"

import { useState, useEffect } from 'react'

export default function FixComponent({ 
  // Core props
  title,
  category,
  status,
  icon,
  severity,
  
  // Data props
  items = [], // Can be pages or URLs
  stats = {}, // Pages affected, SEO impact, difficulty, etc.
  
  // Content props
  description,
  whatToDo,
  diySteps = [],
  aiPrompt,
  beforeCode,
  afterCode,
  
  // Event handlers
  onBack,
  onFix,
  onMarkFixed,
  onCopyCode,
  
  // Customization props
  type = "technical", // "technical" or "issues"
  showBulkActions = true,
  
  // Initial state
  initialFixedItems = [],
  initialMode = "ai"
}) {
  const [mode, setMode] = useState(initialMode)
  const [selItem, setSelItem] = useState(null)
  const [fixedItems, setFixedItems] = useState(initialFixedItems)
  const [checked, setChecked] = useState([])
  const [streamLines, setStreamLines] = useState([])
  const [streamDone, setStreamDone] = useState(false)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [streaming, setStreaming] = useState(false)

  // Calculate derived values
  const openItems = items.filter(item => !fixedItems.includes(item.url || item))
  const fixedCount = fixedItems.length
  const progress = items.length > 0 ? Math.round((fixedCount / items.length) * 100) : 0

  // Helper functions
  const isFixed = (item) => fixedItems.includes(item.url || item)
  const toggleCheck = (url) => {
    setChecked(prev => 
      prev.includes(url) 
        ? prev.filter(u => u !== url)
        : [...prev, url]
    )
  }

  const markFixed = () => {
    if (selItem) {
      setFixedItems(prev => [...prev, selItem.url || selItem])
      setSelItem(null)
      onMarkFixed && onMarkFixed(selItem)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2000)
  }

  const startStream = (item) => {
    setStreaming(true)
    setSelItem(item)
    setStreamLines([])
    setStreamDone(false)
    
    // Simulate streaming response
    const lines = [
      `Analyzing ${item.url || item}...`,
      `Identifying the specific issue...`,
      `Generating optimized solution...`,
      `Creating code implementation...`,
      `Validating fix effectiveness...`
    ]
    
    lines.forEach((line, index) => {
      setTimeout(() => {
        setStreamLines(prev => [...prev, line])
        if (index === lines.length - 1) {
          setStreamDone(true)
          setStreaming(false)
        }
      }, (index + 1) * 800)
    })
  }

  const applyBulkFix = () => {
    setFixedItems(prev => [...prev, ...checked])
    setChecked([])
    setShowBulkModal(false)
  }

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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "critical": return "rgba(255,56,96,0.12)"
      case "warning": return "rgba(255,183,3,0.10)"
      case "passed": return "rgba(0,245,160,0.08)"
      default: return "rgba(0,223,255,0.12)"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "critical": return "⚠"
      case "warning": return "⚡"
      case "passed": return "✓"
      default: return "⚙"
    }
  }

  return (
    <div className="fi">
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "18px" }}>
        <button 
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: "11.5px",
            color: "#8494b0",
            cursor: "pointer"
          }}
          onClick={onBack}
        >
          ← {type === "technical" ? "Technical Checks" : "On-Page Issues"}
        </button>
        <span style={{ color: "#8494b0", fontSize: "12px" }}>›</span>
        <span style={{ fontSize: "12px", color: "#eef2ff", fontWeight: "500" }}>
          {title}
        </span>
        <span style={{
          background: getStatusColor(status),
          border: `1px solid ${status === "critical" ? "rgba(255,56,96,0.2)" : status === "warning" ? "rgba(255,183,3,0.18)" : "rgba(0,245,160,0.18)"}`,
          color: status === "critical" ? "#ff3860" : status === "warning" ? "#ffb703" : "#00f5a0",
          borderRadius: 20,
          padding: "4px 13px",
          fontSize: 11,
          fontWeight: 600
        }}>
          {status === "critical" ? "● CRITICAL" : status === "warning" ? "◆ WARNING" : "✔ PASSED"}
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
          background: getStatusColor(status),
          flexShrink: 0 
        }}>
          {icon || getStatusIcon(status)}
        </div>
        <h2 style={{ 
          fontFamily: "Syne, sans-serif", 
          fontSize: 28, 
          fontWeight: 800, 
          flex: 1, 
          color: "#eef2ff" 
        }}>
          {title}
        </h2>
        <span style={{
          background: "rgba(0,223,255,0.09)",
          border: "1px solid rgba(0,223,255,0.18)",
          color: "#00dfff",
          borderRadius: 20,
          padding: "4px 13px",
          fontSize: 11,
          fontWeight: 600
        }}>🗂 {category || (type === "technical" ? "Technical" : "Issues")}</span>
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
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: "#ff3860"
          }}>{stats.pagesAffected || items.length}</div>
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
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: "#00dfff"
          }}>+{stats.seoImpact || 0}%</div>
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
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: stats.difficulty === "Easy" ? "#00f5a0" : 
                   stats.difficulty === "Medium" ? "#ffb703" : "#ff3860"
          }}>{stats.difficulty || "Medium"}</div>
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
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: 32,
            lineHeight: 1,
            color: "#7730ed"
          }}>{fixedCount}/{items.length}</div>
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
          {description || `This issue affects ${items.length} pages. Fixing this is rated ${stats.difficulty || "Medium"} difficulty and can recover an estimated +${stats.seoImpact || 0}% SEO impact.`}
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 460px",
        gap: 20,
        alignItems: "start",
        marginTop: 4
      }}>
        {/* Left Column - Items */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#eef2ff"
              }}>Affected {type === "technical" ? "Pages" : "URLs"}</div>
              <div style={{
                background: "rgba(0,223,255,0.09)",
                border: "1px solid rgba(0,223,255,0.18)",
                color: "#00dfff",
                borderRadius: 20,
                fontSize: 9,
                fontWeight: 700,
                padding: "3px 10px",
                marginLeft: 8
              }}>{openItems.length} OPEN</div>
            </div>
            {showBulkActions && openItems.length > 1 && (
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    padding: "6px 13px",
                    fontSize: 11,
                    color: "#8494b0",
                    cursor: "pointer"
                  }}
                  onClick={() => setChecked(openItems.length === checked.length ? [] : openItems.map(u => u.url || u))}
                >
                  {openItems.length === checked.length ? "☐ Deselect All" : "☑ Select All"}
                </button>
                {checked.length > 0 && (
                  <button 
                    style={{
                      background: "linear-gradient(135deg,#7730ed,#00dfff)",
                      color: "#fff",
                      borderRadius: 8,
                      padding: "6px 13px",
                      fontSize: 11,
                      fontWeight: 700,
                      border: "none",
                      cursor: "pointer"
                    }}
                    onClick={() => setShowBulkModal(true)}
                  >
                    ✦ Fix {checked.length} with AI
                  </button>
                )}
              </div>
            )}
          </div>

          {showBulkActions && checked.length > 0 && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "9px 13px",
              marginBottom: 11,
              background: "rgba(0,223,255,0.05)",
              border: "1px solid rgba(0,223,255,0.16)",
              borderRadius: 9,
              color: "#00dfff",
              fontSize: 12,
              fontWeight: 600
            }}>
              ✦ {checked.length} pages selected
              <button 
                style={{
                  background: "linear-gradient(135deg,#7730ed,#00dfff)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 10,
                  fontWeight: 600,
                  cursor: "pointer",
                  marginLeft: "auto"
                }}
                onClick={() => setShowBulkModal(true)}
              >
                Fix All with AI
              </button>
              <button 
                style={{
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "#8494b0",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 10,
                  cursor: "pointer"
                }}
                onClick={() => setChecked([])}
              >
                Clear
              </button>
            </div>
          )}

          {/* Item Rows */}
          {items.map((item, i) => {
            const itemUrl = item.url || item
            const isItemFixed = isFixed(item)
            const isSelected = selItem === item
            const isChecked = checked.includes(itemUrl)
            
            return (
              <div 
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 14px",
                  marginBottom: 8,
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: 11,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isSelected ? "1px solid rgba(119,48,237,0.4)" : 
                           "1px solid rgba(255,255,255,0.075)",
                  opacity: isItemFixed ? 0.55 : 1,
                  ...(isSelected && !isItemFixed && { background: "rgba(119,48,237,0.07)" })
                }}
                onClick={() => !isItemFixed && setSelItem(isSelected ? null : item)}
              >
                {showBulkActions && !isItemFixed && (
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleCheck(itemUrl)}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      width: 14,
                      height: 14,
                      accentColor: "#7730ed",
                      cursor: "pointer",
                      flexShrink: 0
                    }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "12.5px",
                    color: "#00dfff",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>{itemUrl}</div>
                  <div style={{
                    fontSize: "10.5px",
                    color: "#4e5f7a",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>{item.issue || item.description || 'Issue detected on this page'}</div>
                </div>
                {!isItemFixed && (
                  <button 
                    style={{
                      background: "linear-gradient(135deg,#7730ed,#00dfff)",
                      color: "#fff",
                      border: "none",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "5px 12px",
                      borderRadius: 7,
                      cursor: "pointer",
                      flexShrink: 0,
                      boxShadow: "0 0 12px rgba(0,223,255,0.2)",
                      transition: "all 0.2s ease"
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelItem(item)
                      setMode("ai")
                      startStream(item)
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "translateY(-1px)"
                      e.target.style.boxShadow = "0 3px 16px rgba(0,223,255,0.3)"
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "translateY(0)"
                      e.target.style.boxShadow = "0 0 12px rgba(0,223,255,0.2)"
                    }}
                  >
                    ✦ Fix
                  </button>
                )}
              </div>
            )
          })}

          {/* Progress Card */}
          <div style={{
            marginTop: 14,
            background: "rgba(255,255,255,0.038)",
            border: "1px solid rgba(255,255,255,0.075)",
            borderRadius: 14,
            padding: "15px 18px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: "12.5px", color: "#8494b0" }}>Remediation Progress</span>
              <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#00f5a0" }}>{fixedCount}/{items.length} Fixed</span>
            </div>
            <div style={{
              height: 5,
              background: "rgba(255,255,255,0.06)",
              borderRadius: 3,
              overflow: "hidden",
              marginTop: 8
            }}>
              <div 
                style={{
                  height: "100%",
                  borderRadius: 3,
                  background: "#00f5a0",
                  width: `${progress}%`,
                  transition: "width 1.1s cubic-bezier(.4,0,.2,1)"
                }}
              />
            </div>
            {progress === 100 && (
              <div style={{
                fontSize: 12,
                color: "#00f5a0",
                fontWeight: 600,
                textAlign: "center",
                marginTop: 10
              }}>🎉 All issues resolved! Re-audit to confirm.</div>
            )}
          </div>
        </div>

        {/* Right Column - Fix Panel */}
        <div style={{
          background: "#06101d",
          border: "1px solid rgba(255,255,255,0.075)",
          borderRadius: 20,
          overflow: "hidden",
          position: "sticky",
          top: 0
        }}>
          {/* Panel Header */}
          <div style={{
            padding: "16px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.075)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div>
              <div style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                color: "#eef2ff"
              }}>
                {streaming ? "🔧 AI Fixing" : selItem ? "🔍 Selected" : "Fix Assistant"}
              </div>
            </div>
            {(selItem || streaming) && (
              <button 
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontSize: 10,
                  color: "#8494b0",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setSelItem(null)
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
          <div style={{
            padding: 18,
            maxHeight: "calc(100vh - 180px)",
            overflowY: "auto"
          }}>
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
                      fontFamily: "'DM Mono', monospace",
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
                              {beforeCode || '<!-- Before code -->'}
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
                              {afterCode || '<!-- After code -->'}
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
                            This fix resolves <strong style={{ color: "#eef2ff" }}>{title}</strong> on <strong style={{ color: "#00dfff", fontFamily: "'DM Mono', monospace" }}>{selItem?.url || selItem}</strong>. Estimated recovery: <strong style={{ color: "#00f5a0" }}>+{stats.seoImpact || 0}% SEO</strong>. Difficulty: <strong style={{ color: "#eef2ff" }}>{stats.difficulty || "Medium"}</strong>.
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
                            fontFamily: "'DM Sans', sans-serif",
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
                            fontFamily: "'DM Sans', sans-serif",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 6,
                            marginBottom: 7,
                            background: "rgba(255,255,255,0.065)",
                            color: "#8494b0",
                            border: "1px solid rgba(255,255,255,0.1)"
                          }}
                          onClick={() => copyToClipboard(afterCode)}
                        >
                          {copiedPrompt ? "✓ Copied!" : "📋 Copy Code"}
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
                            fontFamily: "'DM Sans', sans-serif",
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
                      color: selItem ? "#00dfff" : "#4e5f7a",
                      fontFamily: selItem ? "'DM Mono', monospace" : "'DM Sans', sans-serif"
                    }}>
                      {selItem ? `Selected: ${selItem.url || selItem}` : `👆 Select a ${type === "technical" ? "page" : "URL"} from the list to generate a targeted AI fix`}
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
                        {aiPrompt || 'Generate AI prompt for fixing this issue...'}
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
                        onClick={() => copyToClipboard(aiPrompt)}
                      >
                        {copiedPrompt ? "✓ Copied!" : "📋 Copy Prompt"}
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
                          {beforeCode || '<!-- Before code -->'}
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
                          {afterCode || '<!-- After code -->'}
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
                        fontFamily: "'DM Sans', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        marginBottom: 7,
                        background: "linear-gradient(135deg,#7730ed,#00dfff)",
                        color: "#fff",
                        opacity: selItem ? 1 : 0.5,
                        boxShadow: selItem ? "0 0 18px rgba(0,223,255,0.16)" : "none"
                      }}
                      onClick={() => selItem && startStream(selItem)}
                    >
                      ✦ Generate Fix for {selItem?.url || selItem || 'URL'}
                    </button>
                    {showBulkActions && (
                      <button 
                        style={{
                          width: "100%",
                          padding: 10,
                          borderRadius: 9,
                          fontSize: "12.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          border: "none",
                          fontFamily: "'DM Sans', sans-serif",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                          marginBottom: 7,
                          background: "linear-gradient(135deg, rgba(119,48,237,0.28), rgba(157,78,221,0.2))",
                          color: "#c77dff",
                          border: "1px solid rgba(119,48,237,0.28)",
                          opacity: checked.length > 0 ? 1 : 0.5
                        }}
                        onClick={() => checked.length > 0 && setShowBulkModal(true)}
                      >
                        ✦ Bulk Fix ({checked.length} pages)
                      </button>
                    )}
                    <button 
                      style={{
                        width: "100%",
                        padding: 10,
                        borderRadius: 9,
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                        border: "none",
                        fontFamily: "'DM Sans', sans-serif",
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
                    {whatToDo || 'Follow these steps to fix the issue.'}
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
                {(diySteps.length > 0 ? diySteps : [
                  { title: "Identify the issue", desc: "Locate all instances where this problem occurs on your website." },
                  { title: "Apply the fix", desc: "Implement the recommended changes using the provided code examples." },
                  { title: "Test and verify", desc: "Check that the fix works correctly and doesn't break anything else." }
                ]).map((step, i) => (
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
                    fontFamily: "'DM Sans', sans-serif",
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
                  📥 Download Full Checklist
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
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    marginBottom: 7,
                    background: "rgba(255,255,255,0.065)",
                    color: "#8494b0",
                    border: "1px solid rgba(255,255,255,0.1)"
                  }}
                  onClick={() => copyToClipboard(afterCode)}
                >
                  📋 Copy Code Fix
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
                    fontFamily: "'DM Sans', sans-serif",
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
                    fontFamily: "Syne, sans-serif", 
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
                    Our technical team will resolve <strong style={{ color: "#eef2ff" }}>{title}</strong> across all {items.length} affected {type === "technical" ? "pages" : "URLs"} — with QA verification and a before/after report.
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
                    fontFamily: "'DM Sans', sans-serif",
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
                    fontFamily: "'DM Sans', sans-serif",
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
                    fontFamily: "'DM Sans', sans-serif",
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

      {/* Bulk Fix Modal */}
      {showBulkModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(10px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: 20
        }}>
          <div style={{
            background: "#06101d",
            border: "1px solid rgba(119,48,237,0.3)",
            borderRadius: 16,
            padding: 26,
            maxWidth: 520,
            width: "100%",
            animation: "fixSlideUp 0.3s ease"
          }}>
            <div style={{
              fontFamily: "Syne, sans-serif",
              fontSize: 19,
              fontWeight: 800,
              marginBottom: 6
            }}>✦ Bulk AI Fix</div>
            <div style={{
              fontSize: "12.5px",
              color: "#8494b0",
              marginBottom: 18
            }}>Generating fixes for {checked.length} {type === "technical" ? "pages" : "URLs"} — {title}</div>
            
            <div style={{
              maxHeight: 280,
              overflowY: "auto",
              marginBottom: 16
            }}>
              {checked.map((url, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "8px 11px",
                  marginBottom: 7,
                  background: "rgba(255,255,255,0.038)",
                  borderRadius: 8,
                  fontSize: 12
                }}>
                  <span style={{ color: "#00f5a0" }}>✓</span>
                  <span style={{ 
                    fontFamily: "'DM Mono', monospace",
                    color: "#00dfff", 
                    flex: 1, 
                    fontSize: 11 
                  }}>{url}</span>
                  <span style={{
                    background: "rgba(0,245,160,0.09)",
                    border: "1px solid rgba(0,245,160,0.18)",
                    color: "#00f5a0",
                    borderRadius: 20,
                    fontSize: 9,
                    fontWeight: 600,
                    padding: "2px 7px"
                  }}>Fix ready</span>
                </div>
              ))}
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
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                marginBottom: 8,
                background: "linear-gradient(135deg,#7730ed,#00dfff)",
                color: "#fff",
                boxShadow: "0 0 18px rgba(0,223,255,0.16)"
              }}
              onClick={applyBulkFix}
            >
              ✓ Apply All Fixes ({checked.length} {type === "technical" ? "pages" : "URLs"})
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
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                background: "rgba(255,255,255,0.065)",
                color: "#8494b0",
                border: "1px solid rgba(255,255,255,0.1)"
              }}
              onClick={() => setShowBulkModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
