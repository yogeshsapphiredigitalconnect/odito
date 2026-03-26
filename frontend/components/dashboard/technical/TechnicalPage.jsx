"use client"

import { useState, useEffect } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import CheckList from "@/components/dashboard/technical/CheckList"
import StatusBreakdown from "@/components/dashboard/technical/StatusBreakdown"
import TechCheckDetailView from "@/components/dashboard/technical/TechCheckDetailView"
import PageDetailView from "@/app/onpage/components/PageDetailView"
import { Skeleton } from '@/components/ui/skeleton'
import { AlertTriangle } from 'lucide-react'
import apiService from '@/lib/apiService'

export default function TechnicalPage() {
  const { activeProject } = useProject()
  const [selectedCheck, setSelectedCheck] = useState(null)
  const [selectedUrl, setSelectedUrl] = useState(null)
  const [pageData, setPageData] = useState(null)
  const [pageDetailsLoading, setPageDetailsLoading] = useState(false)
  const [pageDetailsError, setPageDetailsError] = useState(null)

  const handleUrlSelect = async (url) => {
    setSelectedUrl(url)
    setPageDetailsLoading(true)
    setPageDetailsError(null)

    try {
      // Use the same API call as OnPagePage
      const response = await apiService.getPageIssues(activeProject._id, url)
      console.log('🔍 Page Issues API Response:', response)
      
      if (response.success) {
        const issuesData = response.data
        const pageIssues = issuesData.issues || []
        const pData = issuesData.page_data || {}
        const pageMetadata = issuesData.page_metadata || {}
        
        console.log('📊 Issues Data:', issuesData)
        console.log('📄 Page Data:', pData)
        console.log('📋 Page Metadata:', pageMetadata)
        
        const finalPageData = {
          url: url,
          name: pData.title ? pData.title.split(' | ')[0] : derivePageNameFromUrl(url),
          title: pData.title || deriveTitleFromUrl(url),
          description: pData.meta_description || pageMetadata.meta_description || 'No meta description available',
          statusCode: pData.status_code || pageMetadata.http_status_code || 200,
          wordCount: pData.word_count || 0,
          loadTime: pData.response_time ? `${Math.round(pData.response_time)}ms` : '0s',
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
      setPageDetailsError(err.message)
    } finally {
      setPageDetailsLoading(false)
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
            {selectedCheck ? (
              <div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Technical Checks
                </h1>
                <p className="text-gray-400">
                  Homepage technical SEO analysis for {activeProject.project_name}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {selectedUrl ? (
        <PageDetailView 
          url={selectedUrl}
          pageData={pageData}
          loading={pageDetailsLoading}
          error={pageDetailsError}
          onBack={handlePageDetailBack}
        />
      ) : selectedCheck ? (
        <TechCheckDetailView 
          check={selectedCheck} 
          onBack={() => setSelectedCheck(null)}
          onOpenUrl={handleUrlSelect}
        />
      ) : (
        <div className="two-col" style={{
          gridTemplateColumns: "1fr 320px",
          alignItems: "start"
        }}>
          <CheckList 
            onSelectCheck={setSelectedCheck}
          />
          <StatusBreakdown />
        </div>
      )}
    </div>
  )
}
