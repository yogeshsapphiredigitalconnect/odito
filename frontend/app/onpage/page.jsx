"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from 'next/navigation'

import { useAuth } from "@/contexts/AuthContext"

import { useProject } from "@/contexts/ProjectContext"

import apiService from "@/lib/apiService"

import DashboardLayout from "@/components/layout/dashboard-layout"

import IssueTable from "@/components/dashboard/issues/IssueTable"

import IssueDetailView from "@/components/dashboard/issues/IssueDetailView"

import PageDetailView from "./components/PageDetailView"

function OnPagePageContent() {

  const { user, isLoading: authLoading } = useAuth()

  const { activeProject, isLoading: projectLoading } = useProject()

  const router = useRouter()
  const searchParams = useSearchParams()



  const [issues, setIssues] = useState([])

  const [summary, setSummary] = useState(null)

  const [selectedUrl, setSelectedUrl] = useState(null)

  const [pageData, setPageData] = useState(null)

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState(null)

  // Derive selected issue from URL
  const issueCode = searchParams.get('issue')
  const selectedIssue = issueCode ? issues.find(issue => issue.issue_code === issueCode) : null
  const selected = selectedIssue ? issues.findIndex(issue => issue.issue_code === issueCode) : null



  const handleIssueSelect = (index) => {
    const issue = issues[index]
    if (selected === index) {
      // Navigate back to list view
      router.push('/onpage')
    } else {
      // Navigate to issue detail view
      router.push(`/onpage?issue=${issue.issue_code}`)
    }
  }



  const handleBack = () => {
    router.push('/onpage')
  }



  const handleUrlSelect = async (url) => {

    setSelectedUrl(url)

    setLoading(true)

    setError(null)



    try {

      // Use the same API call as PageDetailsContent

      const response = await apiService.getPageIssues(activeProject._id, url)

      console.log('🔍 Page Issues API Response:', response)

      

      if (response.success) {

        const issuesData = response.data

        const pageIssues = issuesData.issues || []

        const pageData = issuesData.page_data || {}

        const pageMetadata = issuesData.page_metadata || {}

        

        console.log('📊 Issues Data:', issuesData)

        console.log('📄 Page Data:', pageData)

        console.log('📋 Page Metadata:', pageMetadata)

        

        const finalPageData = {

          url: url,

          name: pageData.title ? pageData.title.split(' | ')[0] : derivePageNameFromUrl(url),

          title: pageData.title || deriveTitleFromUrl(url),

          description: pageData.meta_description || pageMetadata.meta_description || 'No meta description available',

          statusCode: pageData.status_code || pageMetadata.http_status_code || 200,

          wordCount: pageData.word_count || 0,

          loadTime: pageData.response_time ? `${Math.round(pageData.response_time)}ms` : '0s',

          issues: {

            crit: pageIssues.filter(i => i.severity === 'critical' || i.severity === 'high').length,

            warn: pageIssues.filter(i => i.severity === 'warning' || i.severity === 'medium').length,

            low: pageIssues.filter(i => i.severity === 'low').length,

            pass: pageIssues.filter(i => i.severity === 'pass' || i.severity === 'info').length,

          },

          issues_list: pageIssues

        }

        

        console.log('🎯 Final Page Data:', finalPageData)

        setPageData(finalPageData)

      }

    } catch (err) {

      console.error('Failed to load page details:', err)

      setError(err.message)

    } finally {

      setLoading(false)

    }

  }



  const handlePageDetailBack = () => {

    setSelectedUrl(null)

    setPageData(null)

  }



  // Helper functions to derive values from URL when API doesn't provide them

  const derivePageNameFromUrl = (url) => {

    if (url === '/' || url === '') return 'Home'

    const segments = url.split('/').filter(Boolean)

    const lastSegment = segments[segments.length - 1]

    return lastSegment ? lastSegment.split('-').map(word => 

      word.charAt(0).toUpperCase() + word.slice(1)

    ).join(' ') : 'Page'

  }



  const deriveTitleFromUrl = (url) => {

    const name = derivePageNameFromUrl(url)

    return name

  }



  useEffect(() => {

    if (!activeProject) return



    setLoading(true)

    setError(null)



    apiService

      .getOnPageIssues(activeProject._id)

      .then((res) => {

        console.log('🔍 OnPage Issues API Response:', res)

        console.log('📊 Response data structure:', res.data)

        console.log('📈 Issues count:', res.data.issues?.length || 0)

        console.log('📋 Summary data:', res.data.summary)

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

                {selectedUrl ? (

                  <PageDetailView 

                    url={selectedUrl}

                    pageData={pageData}

                    loading={loading}

                    error={error}

                    onBack={handlePageDetailBack}

                  />

                ) : selectedIssue ? (

                  <IssueDetailView issue={selectedIssue} onBack={handleBack} onOpenUrl={handleUrlSelect} />

                ) : (

                  <>

                    {/* Header */}

                    <div className="flex items-center justify-between">

                      <div>

                        <h1 className="text-2xl font-bold">On-Page SEO Issues</h1>

                        <p className="text-muted-foreground">
                          {summary
                            ? `${summary.total_issue_types ?? 0} issue types · ${summary.total_issues_found ?? 0} total issues · ${summary.total_pages_analyzed ?? 0} pages analyzed`
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

                        <IssueTable

                          issues={issues}

                          selected={selected}

                          onSelect={handleIssueSelect}

                        />

                      )}

                    </div>

                  </>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>

  )

}

// Export the page wrapped in Suspense
export default function OnPagePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnPagePageContent />
    </Suspense>
  )
}

