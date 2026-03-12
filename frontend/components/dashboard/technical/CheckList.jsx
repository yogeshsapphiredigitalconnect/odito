"use client"

import { useState, useEffect } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import apiService from '@/lib/apiService'
import { Skeleton } from '@/components/ui/skeleton'

function StatusIcon({ status }) {
  if (status === "pass") return (
    <span style={{ color:"var(--green)", fontSize:16 }}>✓</span>
  )
  if (status === "warning") return (
    <span style={{ color:"var(--amber)", fontSize:16 }}>⚠</span>
  )
  return (
    <span style={{ color:"var(--red)", fontSize:16 }}>✗</span>
  )
}

export default function CheckList() {
  const { activeProject } = useProject()
  const [checks, setChecks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!activeProject) return

    const fetchTechnicalChecks = async () => {
      try {
        setLoading(true)
        const response = await apiService.getTechnicalChecks(activeProject._id)
        
        if (response.success) {
          setChecks(response.data.checks || [])
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
      <div className="glass-card">
        <div className="card-header">
          <span className="section-title">
            Homepage Technical Checks
          </span>
          <span className="section-tag">
            Loading...
          </span>
        </div>
        <div className="check-list">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="check-item">
              <Skeleton className="w-4 h-4 rounded" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="glass-card">
        <div className="card-header">
          <span className="section-title">
            Homepage Technical Checks
          </span>
          <span className="section-tag">
            Error
          </span>
        </div>
        <div className="p-4 text-center">
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
    <div className="glass-card">
      <div className="card-header">
        <span className="section-title">
          Homepage Technical Checks
        </span>
        <span className="section-tag">
          {checks.length} CHECKS
        </span>
      </div>
      <div className="check-list">
        {checks.map((check, i) => (
          <div key={i} className="check-item">
            <StatusIcon status={check.status} />
            <div>
              <div className="check-name">{check.name}</div>
              <div className="check-desc">{check.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
