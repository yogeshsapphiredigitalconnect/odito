"use client"

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { useParams, useRouter } from 'next/navigation'
import ProjectOverview from '../ProjectOverview'
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function ProjectPage() {
  const { user, isLoading } = useAuth()
  const params = useParams()
  const router = useRouter()

  // Handle different Next.js param formats
  const projectId = typeof params.id === 'string' ? params.id : params.id?.id || params.id

  console.log('🔍 Page params:', params)
  console.log('🔍 Project ID:', projectId, 'Type:', typeof projectId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access projects</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const handleBack = () => {
    console.log('Back button clicked, navigating to /projects')
    try {
      router.push('/projects')
    } catch (error) {
      console.error('Router navigation failed, trying window.location:', error)
      window.location.href = '/projects'
    }
  }

  return (
    <DashboardLayout user={user}>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="px-4 lg:px-6">
              <ProjectOverview
                projectId={projectId}
                onBack={handleBack}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
