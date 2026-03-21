"use client"

import * as React from "react"
import {
  IconBolt,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconEye,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconKey,
  IconLink,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconVideo,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navigation, iconMap } from "@/config/navigation"

// Icon component mapping
const iconComponents = {
  IconBolt,
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconEye,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconKey,
  IconLink,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconVideo,
}

// Helper function to get icon component by name
const getIcon = (iconName) => {
  const componentKey = iconMap[iconName]
  return componentKey ? iconComponents[componentKey] : null
}

// Transform navigation config to match existing data structure
const getNavigationData = () => {
  return {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    audit: navigation.audit.map(item => ({
      title: item.title,
      url: item.url,
      icon: getIcon(item.icon),
      items: item.children?.map(child => ({
        title: child.title,
        url: child.url
      }))
    })),
    aiIntelligence: navigation.aiIntelligence.map(item => ({
      title: item.title,
      url: item.url,
      icon: getIcon(item.icon),
      items: item.children?.map(child => ({
        title: child.title,
        url: child.url
      }))
    })),
    navClouds: navigation.clouds.map(item => ({
      title: item.title,
      url: item.url,
      icon: getIcon(item.icon),
      isActive: item.isActive,
      items: item.items?.map(child => ({
        title: child.title,
        url: child.url
      }))
    }))
  }
}

export function AppSidebar({
  user,
  ...props
}) {
  const data = getNavigationData()
  
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Odito AI</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>AUDIT</SidebarGroupLabel>
          <NavMain items={data.audit} />
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>AI INTELLIGENCE</SidebarGroupLabel>
          <NavMain items={data.aiIntelligence} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
