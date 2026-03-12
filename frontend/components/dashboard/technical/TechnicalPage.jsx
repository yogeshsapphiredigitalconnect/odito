"use client"

import { useState, useEffect } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import CheckList from "@/components/dashboard/technical/CheckList"
import StatusBreakdown from "@/components/dashboard/technical/StatusBreakdown"
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function TechnicalPage() {
  const { activeProject } = useProject()
  const [hasError, setHasError] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
    setHasError(false)
  }

  if (!activeProject) {
    return (
      <div className="glass-card">
        <div className="p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-3">No Project Selected</h3>
          <p className="text-muted-foreground mb-4">
            Please select a project to view technical checks.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Technical Checks
            </h1>
            <p className="text-muted-foreground">
              Homepage technical SEO analysis for {activeProject.project_name}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="two-col" style={{
        gridTemplateColumns: "1fr 320px",
        alignItems: "start"
      }}>
        <CheckList key={`checklist-${refreshKey}`} />
        <StatusBreakdown key={`status-${refreshKey}`} />
      </div>
    </div>
  )
}
