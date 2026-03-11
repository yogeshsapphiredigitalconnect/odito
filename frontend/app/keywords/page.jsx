"use client"

import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from "@/components/layout/dashboard-layout"
import KeywordPageContent from "@/components/dashboard/keywords/KeywordPageContent"

export default function KeywordsPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
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
              <KeywordPageContent />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
