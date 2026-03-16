"use client"

import { useState } from "react"
import PageInfoCard from "./PageInfoCard"
import PagePreviewCard from "./PagePreviewCard"
import IssuePalette from "./IssuePalette"
import IssueRow from "./IssueRow"
import FixPanel from "./FixPanel"
import "./PageDetailStyles.css"

export default function PageDetailView({ url, pageData, loading, error, onBack }) {
  const [sevFilter, setSevFilter] = useState("all")
  const [selIssue, setSelIssue] = useState(null)
  const [fixedIds, setFixedIds] = useState([])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          Failed to load page details: {error}
        </div>
      </div>
    )
  }

  if (!pageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          No page data available
        </div>
      </div>
    )
  }

  const { issues, issues_list } = pageData
  const totalIssues = issues.crit + issues.warn + issues.low
  const filtered = sevFilter === "all" ? issues_list : issues_list.filter(i => {
    if (sevFilter === "crit") return i.severity === "critical" || i.severity === "high"
    if (sevFilter === "warn") return i.severity === "warning" || i.severity === "medium"
    if (sevFilter === "low") return i.severity === "low"
    return true
  })

  const markFixed = () => {
    if (selIssue) {
      setFixedIds(prev => [...prev, selIssue.id])
      setSelIssue(null)
    }
  }

  return (
    <div className="page-detail">
      {/* Page Header */}
      <div className="page-hd">
        <button className="btn sm" onClick={onBack}>← Back</button>
        <div className="page-hd-div"></div>
        <div>
          <div className="page-hd-name">{pageData.name}</div>
          <div className="page-hd-url">{pageData.url}</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          <span className={`sb-status ${pageData.statusCode === 200 ? 's200' : 's404'}`}>
            {pageData.statusCode === 200 ? "✓ 200 OK" : `✗ ${pageData.statusCode}`}
          </span>
          <button className="btn sm">📤 Export</button>
          <button className="btn sm pr">⟳ Re-scan</button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="pd-body">
        {/* SECTION 1 — 2-column grid */}
        <div className="s1-grid">
          <PageInfoCard pageData={pageData} />
          <PagePreviewCard url={pageData.url} issues={issues} />
        </div>

        {/* SECTION 2 — Issue Palette */}
        <div className="sec-ttl">
          Issue Summary
          <span className="sec-ttl-ct">{totalIssues} Issues Found</span>
        </div>
        <IssuePalette
          counts={issues}
          active={sevFilter}
          onChange={setSevFilter}
        />

        {/* SECTION 3 — Issues List */}
        <div className="issues-hd">
          <div className="sec-ttl" style={{ margin: 0 }}>
            Page Issues
            <span className="sec-ttl-ct">{filtered.length} found</span>
          </div>
          <button className="btn sm">📋 Export Issues</button>
        </div>

        {filtered.map((issue, index) => {
          const isDone = fixedIds.includes(issue.id)
          const isSel = selIssue && selIssue.id === issue.id
          
          return (
            <IssueRow
              key={issue.id || index}
              issue={issue}
              isSelected={isSel}
              isFixed={isDone}
              onSelect={() => !isDone && setSelIssue(isSel ? null : issue)}
            />
          )
        })}
        
        <div style={{ height: 40 }} />
      </div>

      {/* Fix Panel */}
      {selIssue && (
        <FixPanel
          issue={selIssue}
          url={url}
          onFixed={markFixed}
          onClose={() => setSelIssue(null)}
        />
      )}
    </div>
  )
}
