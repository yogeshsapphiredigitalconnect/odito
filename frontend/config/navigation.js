export const navigation = {
  // Main navigation items (primary navigation)
  main: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: "dashboard"
    },
    {
      title: "Projects",
      url: "/projects",
      icon: "folder",
      children: [
        {
          title: "All Projects",
          url: "/projects"
        },
        {
          title: "New Project",
          url: "/projects/new"
        }
      ]
    },
    {
      title: "AI Visibility",
      url: "/ai-visibility",
      icon: "eye"
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: "chartBar"
    }
  ],

  // Secondary navigation items (utility links)
  secondary: [
    {
      title: "Settings",
      url: "#",
      icon: "settings"
    },
    {
      title: "Get Help",
      url: "#",
      icon: "help"
    },
    {
      title: "Search",
      url: "#",
      icon: "search"
    }
  ],

  // Documents section (with actions)
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: "database"
    },
    {
      name: "Reports",
      url: "#",
      icon: "report"
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: "fileWord"
    }
  ],

  // Cloud services section (currently unused but kept for structure)
  clouds: [
    {
      title: "Capture",
      icon: "camera",
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#"
        },
        {
          title: "Archived",
          url: "#"
        }
      ]
    },
    {
      title: "Proposal",
      icon: "fileDescription",
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#"
        },
        {
          title: "Archived",
          url: "#"
        }
      ]
    },
    {
      title: "Prompts",
      icon: "fileAi",
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#"
        },
        {
          title: "Archived",
          url: "#"
        }
      ]
    }
  ]
}

// Icon mapping to convert string names to actual icon components
export const iconMap = {
  dashboard: "IconDashboard",
  folder: "IconFolder",
  eye: "IconEye",
  chartBar: "IconChartBar",
  settings: "IconSettings",
  help: "IconHelp",
  search: "IconSearch",
  database: "IconDatabase",
  report: "IconReport",
  fileWord: "IconFileWord",
  camera: "IconCamera",
  fileDescription: "IconFileDescription",
  fileAi: "IconFileAi"
}
