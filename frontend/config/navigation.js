export const navigation = {
  // AUDIT section
  audit: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: "dashboard"
    },
    {
      title: "On-Page Issues",
      url: "/onpage",
      icon: "folder"
    },
    {
      title: "Technical Checks",
      url: "/technicalchecks",
      icon: "settings"
    },
    {
      title: "PageSpeed",
      url: "/pagespeed",
      icon: "zap"
    },
    {
      title: "Keywords",
      url: "/keywords",
      icon: "key"
    },
    {
      title: "Off-Page & Links",
      url: "/off-page-links",
      icon: "link"
    }
  ],

  // AI INTELLIGENCE section
  aiIntelligence: [
    {
      title: "AI Search Audit",
      url: "/ai-search-audit",
      icon: "fileAi"
    },
    {
      title: "7-Day Growth Plan",
      url: "/7-day-growth-plan",
      icon: "camera"
    }
  ],

  // Secondary navigation items (utility links)
  clouds: []
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
  fileAi: "IconFileAi",
  zap: "IconBolt",
  key: "IconKey",
  link: "IconLink"
}
