"use client"

import { useState, useEffect } from "react"
import { useProject } from '@/contexts/ProjectContext'
import apiService from '@/lib/apiService'
import ScoreHero from "@/app/ai-search-audit/components/ScoreHero"
import CategoryGrid from "@/app/ai-search-audit/components/CategoryGrid"
import MetricGrid from "@/app/ai-search-audit/components/MetricGrid"
import IssueCard from "@/app/ai-search-audit/components/IssueCard"
import TopSection from "@/app/ai-search-audit/components/TopSection"
import { CAT_COLORS, getCategoryColor } from "@/app/ai-search-audit/data/issuesData";
import styles from "@/app/ai-search-audit/ai-search-audit.module.css"

export default function AIAuditPageContent({ projectId }) {
  const [projectData, setProjectData] = useState(null)
  const [metricsData, setMetricsData] = useState(null)
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [catFilter, setCatFilter] = useState("all")

  // Fetch project data (existing functionality)
  const loadData = async () => {
    if (!projectId) return

    try {
      setLoading(true)
      const response = await apiService.getProjectById(projectId)
      
      if (response.success) {
        setProjectData(response.data)
      } else {
        setError(response?.message || 'Failed to load project data')
      }
    } catch (err) {
      console.error('Error fetching project data:', err)
      setError('Failed to load project data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch AI Search Audit metrics (existing functionality)
  const loadMetrics = async () => {
    if (!projectId) return

    try {
      const response = await apiService.getAISearchAudit(projectId)
      
      if (response.success) {
        setMetricsData(response.data)
        console.log('✅ AI Search Audit metrics loaded:', response.data)
      } else {
        console.warn('⚠️ AI Search Audit metrics not available:', response?.message)
      }
    } catch (err) {
      console.error('Error fetching AI Search Audit metrics:', err)
    }
  }

  // Fetch AI Search Audit issues (new dynamic functionality)
  const loadIssues = async () => {
    if (!projectId) return

    try {
      const response = await apiService.getAISearchAuditIssues(projectId)
      
      if (response.success) {
        setIssues(response.data || [])
        console.log('✅ AI Search Audit issues loaded:', response.data?.length || 0, 'issues')
      } else {
        console.warn('⚠️ AI Search Audit issues not available:', response?.message)
        // Fallback to static data if API fails
        setIssues(ISSUES)
      }
    } catch (err) {
      console.error('Error fetching AI Search Audit issues:', err)
      // Fallback to static data if API fails
      setIssues(ISSUES)
    }
  }

  // Load data on mount
  useEffect(() => {
    loadData()
    loadMetrics()
    loadIssues()
  }, [projectId])

  // Transform dynamic issues to match static data structure
  const transformedIssues = issues.map(issue => ({
    id: issue.issueId,
    title: issue.title,
    sev: issue.severity === 'critical' ? 'crit' : issue.severity === 'warning' ? 'warn' : 'info',
    cat: issue.category,
    desc: `This issue affects ${issue.pagesAffected} pages. +${issue.impact_percentage || 0}% impact. Difficulty: ${issue.difficulty}.`,
    pages: issue.pagesAffected,
    impact: `+${issue.impact_percentage || 0}%`,
    diff: issue.difficulty,
    urls: issue.sampleUrls?.map((url, index) => ({ key: index, url, sub: 'Affected by this issue' })) || []
  }))

  // Dynamically generate categories from the data
  const uniqueCategories = [...new Set(transformedIssues.map(i => i.cat))];
  const cats = [
    { id:"all",   label:"All Issues", count: transformedIssues.length },
    ...uniqueCategories.map(cat => ({
      id: cat,
      label: cat,
      count: transformedIssues.filter(i => i.cat === cat).length
    }))
  ]
  const shown = catFilter === "all" ? transformedIssues : transformedIssues.filter(i => i.cat === catFilter)

  if (loading) {
    return (
      <div className="glass-card">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading AI audit data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card">
        <div className="p-8 text-center">
          <div className="text-red-500 mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-3">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
        </div>
      </div>
    )
  }

  if (!projectData?.ai_visibility) {
    return (
      <div className="glass-card">
        <div className="p-8 text-center">
          <div className="text-yellow-500 mb-4">📊</div>
          <h3 className="text-lg font-semibold mb-3">No AI Visibility Data</h3>
          <p className="text-muted-foreground mb-4">
            AI visibility analysis hasn't been performed for this project yet.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="section-head" style={{ marginBottom: 20 }}>
        <div className="section-title">
          AI Search Optimization Audit
        </div>
        <span className="glow-pill violet">
          ✦ AEO / GEO ANALYSIS
        </span>
      </div>

      {/* Our New AI Search Audit Implementation with Real Data */}
      <div className={styles.page}>
        <TopSection aiData={projectData.ai_visibility} metricsData={metricsData} />

        {/* Issues Section */}
        <div className={styles.sec}>
          <div className={styles.secL}>
            <div className={styles.secTtl}>Issues to Fix</div>
            <div className={styles.secCt}>{shown.length} FOUND</div>
          </div>
          <button className={`${styles.btn} ${styles.btnSm} ${styles.btnPr}`}>📤 Export Report</button>
        </div>

        {/* Category Filter */}
        <div className={styles.catFilter}>
          {cats.map(c => (
            <div
              key={c.id}
              className={`${styles.cf} ${catFilter === c.id ? styles.cfOn : ""}`}
              onClick={() => setCatFilter(c.id)}
            >
              {c.id !== "all" && (
                <span style={{ width:7, height:7, borderRadius:"50%", background:getCategoryColor(c.id), display:"inline-block", flexShrink:0 }} />
              )}
              {c.label}
              <span style={{ fontSize:10, opacity:.6 }}>({c.count})</span>
            </div>
          ))}
        </div>

        {/* Issue Cards with Static Data */}
        {shown.map(issue => <IssueCard key={issue.id} issue={issue} />)}
      </div>
    </div>
  )
}
