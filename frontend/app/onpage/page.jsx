"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useProject } from "@/contexts/ProjectContext"
import apiService from "@/lib/apiService"
import DashboardLayout from "@/components/layout/dashboard-layout"
import IssueTable from "@/components/dashboard/issues/IssueTable"
import IssueDetailPanel from "@/components/dashboard/issues/IssueDetailPanel"

export default function OnPagePage() {
  const { user, isLoading: authLoading } = useAuth()
  const { activeProject, isLoading: projectLoading } = useProject()

  const [issues, setIssues] = useState([])
  const [summary, setSummary] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!activeProject) return

    setLoading(true)
    setError(null)

    apiService
      .getOnPageIssues(activeProject._id)
      .then((res) => {
        setIssues(res.data.issues || [])
        setSummary(res.data.summary || null)
      })
      .catch((err) => {
        console.error("Failed to load on-page issues:", err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [activeProject])

  if (authLoading || projectLoading) {
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

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold">On-Page SEO Issues</h1>
                    <p className="text-muted-foreground">
                      {summary
                        ? `${summary.total_issue_types} issue types · ${summary.total_issues_found} total issues · ${summary.total_pages_analyzed} pages analyzed`
                        : "View and manage on-page SEO issues"}
                    </p>
                  </div>
                  {issues.length > 0 && (
                    <span className="text-xs font-bold px-2 py-1 rounded bg-primary/10 text-primary">
                      {issues.length} FOUND
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="bg-card rounded-lg border p-6">
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
                      <span className="text-muted-foreground">Loading issues...</span>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12 text-red-500">
                      Failed to load issues: {error}
                    </div>
                  ) : issues.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No on-page issues found. Your site looks great!
                    </div>
                  ) : (
                    <div className="flex gap-6">
                      <div className="flex-1 min-w-0">
                        <IssueTable
                          issues={issues}
                          selected={selected}
                          onSelect={setSelected}
                        />
                      </div>
                      {selected !== null && issues[selected] && (
                        <div className="w-80 shrink-0">
                          <IssueDetailPanel issue={issues[selected]} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
