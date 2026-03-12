"use client"

import { useState, useEffect } from "react"
import { useProject } from '@/contexts/ProjectContext'
import apiService from '@/lib/apiService'
import AIReadinessMeter from "@/components/dashboard/ai-audit/AIReadinessMeter"
import AIFactorTable from "@/components/dashboard/ai-audit/AIFactorTable"

export default function AIAuditPageContent({ projectId }) {
  const [projectData, setProjectData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!projectId) return

    const fetchProjectData = async () => {
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

    fetchProjectData()
  }, [projectId])

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

      {/* AI Readiness Meter */}
      <AIReadinessMeter aiData={projectData.ai_visibility} />

      {/* AI Factor Table */}
      <AIFactorTable aiData={projectData.ai_visibility} />
    </div>
  )
}
