"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Eye, 
  Search, 
  BarChart3, 
  Building,
  Plus,
  RefreshCw,
  AlertTriangle as ErrorIcon
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import DashboardLayout from "@/components/layout/dashboard-layout"

export default function GoogleVisibility() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Set loading to false immediately
    setLoading(false)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      window.location.href = '/login'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading Google Visibility...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm">
        <div className="p-8 text-center">
          <ErrorIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-3">Oops! Something went wrong</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </Card>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to access Google Visibility</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="flex-1 space-y-6 p-6">
        {/* Breadcrumb equivalent */}
        <div className="border-b pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Google Visibility</h1>
              <p className="text-muted-foreground">Monitor your Google search presence and performance</p>
            </div>
          </div>
        </div>
        
        {/* Google Visibility Content */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Google Visibility Overview</h2>
              <p className="text-muted-foreground">Connect your Google account to view Search Console, Analytics, and Business Profile data.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button 
                onClick={() => router.push('/projects/new')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Connect Google
              </Button>
            </div>
          </div>

          {/* Placeholder content for future Google integrations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search Console Card */}
            <Card className="p-6 border-dashed border-2">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold">Search Console</h3>
                <p className="text-sm text-muted-foreground">View search rankings and performance</p>
                <Button variant="outline" className="w-full">
                  Coming Soon
                </Button>
              </div>
            </Card>

            {/* Analytics Card */}
            <Card className="p-6 border-dashed border-2">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold">Analytics</h3>
                <p className="text-sm text-muted-foreground">Track website traffic and user behavior</p>
                <Button variant="outline" className="w-full">
                  Coming Soon
                </Button>
              </div>
            </Card>

            {/* Business Profile Card */}
            <Card className="p-6 border-dashed border-2">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold">Business Profile</h3>
                <p className="text-sm text-muted-foreground">Manage your Google Business listing</p>
                <Button variant="outline" className="w-full">
                  Coming Soon
                </Button>
              </div>
            </Card>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
