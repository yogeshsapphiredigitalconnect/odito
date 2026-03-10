"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
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
  // Default sidebar width and header height to maintain consistency
  const defaultStyles = {
    "--sidebar-width": "14rem",
    "--header-height": "calc(var(--spacing) * 12)"
  }

  return (
    <SidebarProvider style={defaultStyles}>
      <AppSidebar user={user} variant="inset" {...sidebarProps} />
      <SidebarInset>
        {showHeader && <SiteHeader user={user} {...headerProps} />}
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

// Default export for easier usage
export default DashboardLayout
