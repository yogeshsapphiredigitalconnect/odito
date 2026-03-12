"use client"

import { useState, useEffect } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import apiService from '@/lib/apiService'
import { Skeleton } from '@/components/ui/skeleton'

export default function StatusBreakdown() {
  const { activeProject } = useProject()
  const [summary, setSummary] = useState({ passing: 0, warnings: 0, critical: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!activeProject) return

    const fetchTechnicalChecks = async () => {
      try {
        setLoading(true)
        const response = await apiService.getTechnicalChecks(activeProject._id)
        
        if (response.success) {
          setSummary(response.data.summary || { passing: 0, warnings: 0, critical: 0 })
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

  if (loading) {
    return (
      <div>
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>
            Status Breakdown
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
        
        <div className="ai-card">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
          <div className="section-title" style={{ marginBottom: 16 }}>
            Status Breakdown
          </div>
          <div className="text-center text-red-500">
            {error}
          </div>
        </div>
      </div>
    )
  }

  const { passing, warnings, critical } = summary

  return (
    <div>
      <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>
          Status Breakdown
        </div>
        <div className="breakdown-row">
          <span style={{ color: "var(--green)" }}>
            ✓ Passing
          </span>
          <span className="breakdown-count" style={{ color: "var(--green)" }}>
            {passing}
          </span>
        </div>
        <div className="breakdown-row">
          <span style={{ color: "var(--amber)" }}>
            ⚠ Warnings
          </span>
          <span className="breakdown-count" style={{ color: "var(--amber)" }}>
            {warnings}
          </span>
        </div>
        <div className="breakdown-row">
          <span style={{ color: "var(--red)" }}>
            ✗ Critical
          </span>
          <span className="breakdown-count" style={{ color: "var(--red)" }}>
            {critical}
          </span>
        </div>
      </div>
      
      <div className="ai-card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="ai-card-label">✦ ARIA Technical Insight</div>
          <span style={{ color: "var(--cyan)", fontSize: 14 }}>✦</span>
        </div>
        <div className="ai-card-text">
          {critical > 0 && (
            <>
              {critical} critical issue{critical > 1 ? 's' : ''} require{critical > 1 ? '' : 's'} immediate attention. 
            </>
          )}
          {warnings > 0 && (
            <>
              {critical > 0 && ' Additionally, '}
              {warnings} warning{warnings > 1 ? 's' : ''} need{warnings > 1 ? '' : 's'} review.
            </>
          )}
          {critical === 0 && warnings === 0 && (
            <>Great technical health! All checks are passing.</>
          )}
          {critical > 0 && (
            <>
              {" "}These fix{critical > 1 ? 'es' : ''} alone can recover an estimated{" "}
              <strong style={{ color: "var(--cyan)", cursor: "pointer" }}>
                +{critical * 3 + warnings * 1} SEO Health points.
              </strong>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
