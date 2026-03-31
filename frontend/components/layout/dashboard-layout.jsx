"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { useAuth } from '@/contexts/AuthContext'
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

export function DashboardLayout({ 
  children, 
  user,
  sidebarProps = {},
  headerProps = {},
  showHeader = true 
}) {
  const { user: authUser, isLoading } = useAuth()
  
  // Use auth user if no user prop provided (preferred approach)
  const currentUser = user || authUser
  
  // Show loading skeleton if auth is still loading
  if (isLoading) {
    return (
      <SidebarProvider>
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="animate-pulse flex flex-col items-center space-y-4">
              <div className="h-8 w-8 bg-muted rounded"></div>
              <div className="h-4 w-32 bg-muted rounded"></div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }



  // Default sidebar width and header height to maintain consistency
  const defaultStyles = {
    "--sidebar-width": "16rem", // Increased from 14rem to accommodate longer menu items
    "--header-height": "calc(var(--spacing) * 12)"
  }

  return (
    <SidebarProvider style={defaultStyles}>
      <AppSidebar user={currentUser} variant="inset" {...sidebarProps} />
      <SidebarInset>
        {showHeader && <SiteHeader user={currentUser} {...headerProps} />}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default DashboardLayout

