"use client"

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import PageDetailsContent from '@/components/pages/PageDetailsContent'
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function PageDetailsPage() {
  const { user, isLoading } = useAuth()
  const params = useParams()
  const router = useRouter()
  
  // Handle different Next.js param formats
  const projectId = typeof params.id === 'string' ? params.id : params.id?.id || params.id
  const pageId = typeof params.pageId === 'string' ? params.pageId : params.pageId?.pageId || params.pageId
  
  // Decode the page URL from URL parameter
  const pageUrl = pageId ? decodeURIComponent(pageId) : null

  console.log('🔍 Page params:', params)
  console.log('🔍 Project ID:', projectId, 'Type:', typeof projectId)
  console.log('🔍 Page ID:', pageId, 'Type:', typeof pageId)
  console.log('🔍 Decoded Page URL:', pageUrl)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page details...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access page details</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  if (!projectId || !pageUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid page URL</h1>
          <p className="text-muted-foreground mb-4">Missing project ID or page URL</p>
          <Button onClick={() => router.push('/projects')}>
            Back to Projects
          </Button>
        </div>
      </div>
    )
  }

  const handleBack = () => {
    console.log('Back button clicked, navigating to /projects')
    try {
      router.push(`/projects/${projectId}`)
    } catch (error) {
      console.error('Router navigation failed, trying window.location:', error)
      window.location.href = `/projects/${projectId}`
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              {/* Back Button */}
              <div className="flex items-center gap-4 mb-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Project
                </Button>
              </div>
              
              {/* Page Details Content */}
              <PageDetailsContent 
                projectId={projectId} 
                pageUrl={pageUrl} 
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
