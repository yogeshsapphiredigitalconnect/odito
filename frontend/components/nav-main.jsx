"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconChevronDown, IconChevronRight } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items
}) {
  const pathname = usePathname()
  const [openItems, setOpenItems] = useState(new Set())

  // Auto-open dropdown when inside projects routes (replicating old behavior)
  useEffect(() => {
    const newOpenItems = new Set(openItems)
    let hasChanges = false
    
    items.forEach((item) => {
      if (item.items && item.items.length > 0) {
        // Auto-open if pathname starts with the base link (e.g., /projects)
        const shouldAutoOpen = pathname.startsWith(item.url + '/') || pathname === item.url
        const hasActiveChild = item.items.some(subItem => pathname === subItem.url)
        
        if ((shouldAutoOpen || hasActiveChild) && !newOpenItems.has(item.title)) {
          newOpenItems.add(item.title)
          hasChanges = true
        }
      }
    })
    
    if (hasChanges) {
      setOpenItems(newOpenItems)
    }
  }, [pathname, items, openItems])

  const toggleItem = (title, e) => {
    e.preventDefault()
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(title)) {
      newOpenItems.delete(title)
    } else {
      newOpenItems.add(title)
    }
    setOpenItems(newOpenItems)
  }

  // Check if sub-item is active (exact match only)
  const isSubItemActive = (url) => {
    return pathname === url
  }

  // Check if regular item is active (exact match only)
  const isItemActive = (item) => {
    // For items with sub-items, parent should NOT be highlighted
    if (item.items && item.items.length > 0) {
      return false
    }
    return pathname === item.url
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const hasItems = item.items && item.items.length > 0
            const isOpen = openItems.has(item.title)
            const isActive = isItemActive(item)

            return (
              <SidebarMenuItem key={item.title}>
                {hasItems ? (
                  <>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      className={isActive ? "!bg-sidebar-primary !text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 ease-in-out"}
                      onClick={(e) => toggleItem(item.title, e)}
                    >
                      {item.icon && <item.icon className="transition-transform duration-200" />}
                      <span className="transition-colors duration-200">{item.title}</span>
                      {isOpen ? (
                        <IconChevronDown className="ml-auto transition-transform duration-300 ease-in-out" />
                      ) : (
                        <IconChevronRight className="ml-auto transition-transform duration-300 ease-in-out" />
                      )}
                    </SidebarMenuButton>
                    {isOpen && (
                      <SidebarMenuSub className="animate-in slide-in-from-top-1 duration-300 ease-out">
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={isSubItemActive(subItem.url)}
                              className={isSubItemActive(subItem.url) ? "!bg-sidebar-primary !text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 ease-in-out"}
                            >
                              <Link href={subItem.url} className="transition-transform duration-200 hover:translate-x-1">
                                <span className="transition-colors duration-200">{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive}
                    className={isActive ? "!bg-sidebar-primary !text-sidebar-primary-foreground" : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 ease-in-out"}
                  >
                    <Link href={item.url} className="flex items-center gap-2 transition-transform duration-200 hover:translate-x-1">
                      {item.icon && <item.icon className="transition-transform duration-200" />}
                      <span className="transition-colors duration-200">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
