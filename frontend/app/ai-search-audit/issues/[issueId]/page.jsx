"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/contexts/ProjectContext'
import apiService from '@/lib/apiService'
import { ISSUES, getCategoryIcon } from '../../data/issuesData'
import styles from '../../ai-search-audit.module.css'
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function AISearchAuditIssuePage() {
  const { user, isLoading } = useAuth()
  const { activeProject } = useProject()
  const params = useParams()
  const router = useRouter()
  const [issue, setIssue] = useState(null)
  const [affectedPages, setAffectedPages] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch issue details and affected pages
  useEffect(() => {
    const fetchIssueData = async () => {
      if (!activeProject?._id || !params.issueId) return

      try {
        setLoading(true)
        
        // Try to get issue details from API first
        let issueData = null
        try {
          const response = await apiService.getAISearchAuditIssues(activeProject._id)
          if (response.success && response.data) {
            issueData = response.data.find(i => i.issueId === params.issueId)
          }
        } catch (err) {
          console.log('API not available, falling back to static data')
        }

        // Fallback to static data if needed
        if (!issueData) {
          issueData = ISSUES.find(i => i.id === params.issueId)
        }

        if (!issueData) {
          setError("Issue not found")
          setLoading(false)
          return
        }

        // Transform issue data to expected format
        const transformedIssue = {
          id: issueData.issueId || issueData.id,
          title: issueData.title,
          severity: issueData.severity === 'crit' ? 'critical' : 
                   issueData.severity === 'warn' ? 'warning' : 'info',
          category: issueData.cat || issueData.category,
          description: issueData.desc || `This issue affects ${issueData.pagesAffected || issueData.pages} pages. ${issueData.impact} impact. Difficulty: ${issueData.difficulty || issueData.diff}.`,
          pagesAffected: issueData.pagesAffected || issueData.pages,
          impact: issueData.impact,
          difficulty: issueData.difficulty || issueData.diff,
          pages: issueData.pagesAffected || issueData.pages, // Add pages property for display
          diff: issueData.difficulty || issueData.diff, // Add diff property for display
          icon: getCategoryIcon(issueData.cat || issueData.category), // Add icon based on category
          fixProgress: Math.floor(Math.random() * 30), // Mock progress
          affectedUrlsCount: issueData.pagesAffected || issueData.pages
        }

        setIssue(transformedIssue)

        // Fetch affected pages
        await fetchAffectedPages(params.issueId, 1)

      } catch (err) {
        console.error('Error fetching issue data:', err)
        setError("Failed to load issue data")
      } finally {
        setLoading(false)
      }
    }

    fetchIssueData()
  }, [params.issueId, activeProject])

  // Fetch affected pages with pagination
  const fetchAffectedPages = async (issueId, pageNum = 1) => {
    if (!activeProject?._id || !issueId) return

    try {
      const response = await apiService.getAISearchAuditIssuePages(activeProject._id, issueId, {
        page: pageNum,
        limit: 50
      })

      if (response.success) {
        const pages = response.data.pages.map(page => ({
          url: page.url,
          title: page.title,
          status: 'affected',
          lastChecked: new Date().toISOString(),
          issueCount: 1
        }))

        setAffectedPages(pages)
        setTotalPages(response.data.pagination.totalPages)
        setPage(pageNum)
      } else {
        // Fallback to static data
        const staticIssue = ISSUES.find(i => i.id === issueId)
        if (staticIssue?.urls) {
          setAffectedPages(staticIssue.urls.map(url => ({
            url: url.url,
            title: url.sub || 'No title',
            status: 'affected',
            lastChecked: new Date().toISOString(),
            issueCount: 1
          })))
          setTotalPages(1)
        }
      }
    } catch (err) {
      console.error('Error fetching affected pages:', err)
      // Fallback to static data
      const staticIssue = ISSUES.find(i => i.id === issueId)
      if (staticIssue?.urls) {
        setAffectedPages(staticIssue.urls.map(url => ({
          url: url.url,
          title: url.sub || 'No title',
          status: 'affected',
          lastChecked: new Date().toISOString(),
          issueCount: 1
        })))
        setTotalPages(1)
      }
    }
  }

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchAffectedPages(params.issueId, newPage)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access this page</h1>
          <button onClick={() => window.location.href = '/login'} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="glass-card">
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading issue details...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !issue) {
    return (
      <DashboardLayout user={user}>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="glass-card">
                  <div className="p-8 text-center">
                    <div className="text-red-500 mb-4">⚠️</div>
                    <h3 className="text-lg font-semibold mb-3">Issue Not Found</h3>
                    <p className="text-muted-foreground mb-4">{error || "The requested issue could not be found."}</p>
                    <button 
                      onClick={() => router.push('/ai-search-audit')}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Back to AI Search Audit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <AIssueDetailView issue={issue} onBack={() => router.push('/ai-search-audit')} />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

// Reuse the same IssueDetailView component but adapted for AI Search Audit
function AIssueDetailView({ issue, onBack }) {
  const { activeProject } = useProject()
  const [mode, setMode] = useState("ai")
  const [selUrl, setSelUrl] = useState(null)
  const [fixedUrls, setFixedUrls] = useState([])
  const [streaming, setStreaming] = useState(false)
  const [streamLines, setStreamLines] = useState([])
  const [streamDone, setStreamDone] = useState(false)
  const [urls, setUrls] = useState([])
  const [loadingUrls, setLoadingUrls] = useState(true)

  // Fetch affected URLs when component mounts
  useEffect(() => {
    const fetchUrls = async () => {
      if (!activeProject?._id || !issue?.id) return

      try {
        setLoadingUrls(true)
        const response = await apiService.getAISearchAuditIssuePages(activeProject._id, issue.id, {
          page: 1,
          limit: 50
        })

        if (response.success) {
          const transformedUrls = response.data.pages.map(page => ({
            url: page.url,
            sub: page.title || 'Affected by this issue'
          }))
          setUrls(transformedUrls)
        } else {
          // Fallback to static data
          setUrls(issue.urls || [])
        }
      } catch (err) {
        console.error('Error fetching affected URLs:', err)
        // Fallback to static data
        setUrls(issue.urls || [])
      } finally {
        setLoadingUrls(false)
      }
    }

    fetchUrls()
  }, [activeProject._id, issue?.id])

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

  function startStream(url) {
    setSelUrl(url)
    setStreaming(true)
    setStreamLines([])
    setStreamDone(false)

    const messages = [
      `Analysing ${url}…`,
      `✦ Issue detected: ${issue.title}`,
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
          ← AI Search Audit
        </button>
        <span style={{ color: "var(--text3)", fontSize: "12px" }}>›</span>
        <span style={{ fontSize: "12px", color: "var(--text2)", fontWeight: "500" }}>
          {issue.title}
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
          background: issue.sev === "crit" ? "rgba(255,56,96,0.12)" : 
                   issue.sev === "warn" ? "rgba(255,183,3,0.10)" : 
                   "rgba(0,245,160,0.08)", 
          flexShrink: 0 
        }}>
          {issue.icon}
        </div>
        <h2 style={{ 
          fontFamily: "Syne, sans-serif", 
          fontSize: 28, 
          fontWeight: 800, 
          flex: 1, 
          color: "#eef2ff" 
        }}>
          {issue.title}
        </h2>
        <span style={{
          background: "rgba(0,223,255,0.09)",
          border: "1px solid rgba(0,223,255,0.18)",
          color: "#00dfff",
          borderRadius: 20,
          padding: "4px 13px",
          fontSize: 11,
          fontWeight: 600
        }}>🗂 AI Search Audit</span>
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
          }}>{issue.pages}</div>
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
          }}>{issue.impact}</div>
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
            color: issue.diff === "Easy" ? "#00f5a0" : 
                   issue.diff === "Medium" ? "#ffb703" : "#ff3860"
          }}>{issue.diff}</div>
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
          }}>{fixedCount}/{urls.length}</div>
        </div>
      </div>

      {/* AI Issue Breakdown */}
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
        }}>✦ AI SEARCH AUDIT — ISSUE BREAKDOWN</div>
        <div style={{
          fontSize: 13,
          color: "#8494b0",
          lineHeight: 1.65
        }}>
          This issue affects {issue.pages} pages. 
          {issue.desc}
          Fixing this is rated {issue.diff} difficulty and can recover an estimated 
          {issue.impact}.
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
        {/* Left Column - URLs */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                fontFamily: "Syne, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                color: "#eef2ff"
              }}>Affected URLs</div>
              <div style={{
                background: "rgba(0,223,255,0.09)",
                border: "1px solid rgba(0,223,255,0.18)",
                color: "#00dfff",
                borderRadius: 20,
                fontSize: 9,
                fontWeight: 700,
                padding: "3px 10px",
                marginLeft: 8
              }}>{loadingUrls ? "Loading..." : `${urls.length} OPEN`}</div>
            </div>
          </div>
          
          {loadingUrls ? (
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "40px",
              color: "#8494b0",
              fontSize: "14px"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "10px"
              }}>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                Loading affected URLs...
              </div>
            </div>
          ) : (
            urls.map((urlData, index) => {
            const url = typeof urlData === 'string' ? urlData : urlData.url
            const subtitle = typeof urlData === 'object' ? urlData.sub : 'Issue detected on this page'
            const isFixedUrl = isFixed(url)
            const isSelected = selUrl === url
            
            return (
              <div 
                key={index}
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
                  opacity: isFixedUrl ? 0.55 : 1,
                  ...(isSelected && !isFixedUrl && { background: "rgba(119,48,237,0.07)" })
                }}
                onClick={() => !isFixedUrl && setSelUrl(isSelected ? null : url)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: "12.5px",
                    color: "#00dfff",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>{url}</div>
                  <div style={{
                    fontSize: "10.5px",
                    color: "#4e5f7a",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>{subtitle}</div>
                </div>
                <span style={{
                  fontSize: "9.5px",
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 5,
                  flexShrink: 0,
                  background: isFixedUrl ? "rgba(0,245,160,0.09)" : "rgba(255,56,96,0.11)",
                  border: isFixedUrl ? "1px solid rgba(0,245,160,0.18)" : "1px solid rgba(255,56,96,0.2)",
                  color: isFixedUrl ? "#00f5a0" : "#ff3860"
                }}>
                  {isFixedUrl ? "✓ Fixed" : "Open"}
                </span>
                {!isFixedUrl && (
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
                      setSelUrl(url)
                      setMode("ai")
                      startStream(url)
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
          })
          )}
          
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
              <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#00f5a0" }}>{fixedCount}/{urls.length} Fixed</span>
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
                {streaming ? "🔧 AI Fixing" : selUrl ? "🔍 Selected" : "Fix Assistant"}
              </div>
            </div>
            {(selUrl || streaming) && (
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
                              {issue.b4}
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
                              {issue.af}
                            </pre>
                          </div>
                        </div>

                        {/* AI Explanation Card */}
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
                          }}>✦ AI Explanation</div>
                          <div style={{
                            fontSize: 11.5,
                            color: "#8494b0",
                            lineHeight: 1.65
                          }}>
                            This fix resolves <strong style={{ color: "#eef2ff" }}>{issue.title}</strong> on <strong style={{ color: "#00dfff", fontFamily: "'DM Mono', monospace" }}>{selUrl}</strong>. Estimated recovery: <strong style={{ color: "#00f5a0" }}>{issue.impact}</strong>. Difficulty: <strong style={{ color: "#eef2ff" }}>{issue.diff}</strong>.
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
                      color: selUrl ? "#00dfff" : "#4e5f7a",
                      fontFamily: selUrl ? "'DM Mono', monospace" : "'DM Sans', sans-serif"
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
                        fontFamily: "'DM Mono', monospace"
                      }}>
                        {issue.prompt}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: DIY Guide */}
            {mode === "diy" && (
              <div>
                <div style={{
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
                  }}>🛠</div>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#c77dff",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 8
                  }}>🛠 DIY FIX STEPS</div>
                  <div style={{
                    fontSize: "11.5px",
                    color: "#8494b0",
                    lineHeight: 1.65
                  }}>
                    {issue.steps?.map((step, i) => (
                      <div key={i} style={{ marginBottom: 12 }}>
                        <div style={{
                          fontSize: "10.5px",
                          fontWeight: 700,
                          color: "#eef2ff",
                          marginBottom: 4
                        }}>
                          {i + 1}. {step.t}
                        </div>
                        <div style={{
                          fontSize: "10.5px",
                          color: "#8494b0",
                          lineHeight: 1.6
                        }}>
                          {step.d}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: AuditIQ Help */}
            {mode === "help" && (
              <div>
                <div style={{
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
                  }}>🤝</div>
                  <div style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#c77dff",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: 8
                  }}>🤝 ARIA EXPLANATION</div>
                  <div style={{
                    fontSize: "11.5px",
                    color: "#8494b0",
                    lineHeight: 1.65
                  }}>
                    {issue.aria}
                  </div>
                </div>
                
                <div style={{
                  marginTop: 16,
                  background: "rgba(255,255,255,0.038)",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: "11.5px",
                  color: "#8494b0",
                  textAlign: "center"
                }}>
                  Need expert help? Our AuditIQ team can implement these fixes for you.
                  <br />
                  <button style={{
                    marginTop: 8,
                    padding: "6px 12px",
                    background: "linear-gradient(135deg,#7730ed,#00dfff)",
                    border: "none",
                    borderRadius: 6,
                    fontSize: "10.5px",
                    fontWeight: 600,
                    color: "#fff",
                    cursor: "pointer"
                  }}>
                    Contact AuditIQ Team
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
