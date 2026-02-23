"use client"

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Eye, 
  Search, 
  BarChart3, 
  Building,
  Plus,
  RefreshCw,
  AlertTriangle as ErrorIcon,
  CheckCircle
} from 'lucide-react'
import apiService from '@/lib/apiService'
import SearchConsoleTab from './SearchConsoleTab'
import AnalyticsTab from './AnalyticsTab'
import BusinessProfileTab from './BusinessProfileTab'

export default function ProjectGoogleVisibility({ projectId, projectName, onBack }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connectionState, setConnectionState] = useState({
    connected: false,
    google_email: null,
    google_name: null,
    connected_at: null
  })

  useEffect(() => {
    if (projectId) {
      checkConnectionStatus()
    }
  }, [projectId])

  const checkConnectionStatus = async () => {
    if (!projectId) {
      console.log('Skipping API call - projectId is null')
      return
    }
    
    const endpoint = `/app_user/projects/${projectId}/google-visibility/status` 
    console.log('STATUS API ENDPOINT →', endpoint)
    
    try {
      setLoading(true)
      const data = await apiService.request(endpoint)
      
      if (data.success) {
        setConnectionState(data.data)
      } else {
        setError(data.message || 'Failed to check connection status')
      }
    } catch (error) {
      console.error('Failed to check connection status:', error)
      setError('Failed to check Google connection status')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectGoogle = async () => {
    if (!projectId) {
      console.log('Cannot connect Google - projectId is null')
      return
    }
    
    try {
      const data = await apiService.request(`/app_user/projects/${projectId}/google-visibility/connect`)
      
      if (data.success && data.data.authUrl) {
        window.location.href = data.data.authUrl
      } else {
        setError(data.message || 'Failed to initiate Google connection')
      }
    } catch (error) {
      console.error('Failed to initiate Google connection:', error)
      setError('Failed to connect Google account')
    }
  }

  const handleDisconnect = async () => {
    if (!projectId) {
      console.log('Cannot disconnect Google - projectId is null')
      return
    }
    
    try {
      const data = await apiService.request(`/app_user/projects/${projectId}/google-visibility/disconnect`, {
        method: 'DELETE'
      })
      
      if (data.success) {
        await checkConnectionStatus()
      } else {
        setError(data.message || 'Failed to disconnect Google account')
      }
    } catch (error) {
      console.error('Failed to disconnect Google:', error)
      // Show more detailed error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to disconnect Google account'
      setError(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
        
        <Card className="p-6">
          <Skeleton className="h-8 w-full mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center gap-3">
          <ErrorIcon className="h-5 w-5 text-red-500" />
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Google Visibility</h3>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-center mt-4">
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!connectionState.connected) {
    // Disconnected state - Show empty state
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{projectName} - Google Visibility</h1>
            <p className="text-muted-foreground">Monitor your Google search presence and performance</p>
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkConnectionStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Empty State */}
        <Card className="p-12">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="h-10 w-10 text-blue-600" />
            </div>
            <div className="max-w-md">
              <h2 className="text-2xl font-semibold mb-3">Connect Your Google Account</h2>
              <p className="text-muted-foreground text-lg">
                Connect your Google account to view Search Console, Analytics, and Business Profile data for this project.
              </p>
            </div>
            <Button 
              onClick={handleConnectGoogle}
              className="flex items-center gap-2"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Connect Google Account
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Connected state - Show tabs
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{projectName} - Google Visibility</h1>
          <p className="text-muted-foreground">
            Connected as {connectionState.google_name} ({connectionState.google_email})
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Connected
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={checkConnectionStatus}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDisconnect}
          >
            Disconnect
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="search-console" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search-console">Search Console</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="business-profile">Business Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search-console" className="space-y-4">
          <SearchConsoleTab projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsTab projectId={projectId} />
        </TabsContent>
        
        <TabsContent value="business-profile" className="space-y-4">
          <BusinessProfileTab projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
