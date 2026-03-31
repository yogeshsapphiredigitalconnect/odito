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
    
  ],

  // AI INTELLIGENCE section
  aiIntelligence: [
    {
      title: "AI Search Audit",
      url: "/ai-search-audit",
      icon: "fileAi"
    },
    {
      title: "AI Video Report",
      url: "/ai-video",
      icon: "video"
    }
  ],

  // RECOMMENDATIONS section
  recommendations: [
    {
      title: "AI Recommendations",
      url: "/future-plans/ai-recommendations",
      icon: "fileAi"
    },
    {
      title: "Implementation",
      url: "/future-plans/implementation",
      icon: "settings"
    },
    {
      title: "Script & Webhook",
      url: "/future-plans/script-webhook",
      icon: "settings"
    }
  ],

  // LINK GROWTH ENGINE section
  linkGrowthEngine: [
    {
      title: "AI Link Growth Engine",
      url: "/future-plans/ai-link-growth-engine",
      icon: "link"
    },
    {
      title: "Directory Submission",
      url: "/future-plans/directory-submission",
      icon: "folder"
    },
    {
      title: "Article Publisher",
      url: "/future-plans/article-publisher",
      icon: "fileDescription"
    },
    {
      title: "Citation Builder",
      url: "/future-plans/citation-builder",
      icon: "fileWord"
    },
    {
      title: "Indexing Automation",
      url: "/future-plans/indexing-automation",
      icon: "database"
    },
    {
      title: "Link Velocity Manager",
      url: "/future-plans/link-velocity-manager",
      icon: "chartBar"
    },
    {
      title: "Anchor Optimizer",
      url: "/future-plans/anchor-optimizer",
      icon: "settings"
    },
    {
      title: "Internal Linking",
      url: "/future-plans/internal-linking",
      icon: "link"
    }
  ],

  // MONITORING section
  monitoring: [
    {
      title: "Index Monitoring",
      url: "/future-plans/index-monitoring",
      icon: "eye"
    },
    {
      title: "Index Recovery",
      url: "/future-plans/index-recovery",
      icon: "database"
    },
    {
      title: "Pipeline & Workers",
      url: "/future-plans/pipeline-workers",
      icon: "settings"
    }
  ],

  // AGENCY section
  agency: [
    {
      title: "Packages & Pricing",
      url: "/future-plans/packages-pricing",
      icon: "fileDescription"
    },
    {
      title: "White Label",
      url: "/future-plans/white-label",
      icon: "folder"
    },
    {
      title: "PDF Reports",
      url: "/future-plans/pdf-reports",
      icon: "fileWord"
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
  video: "IconVideo",
  zap: "IconBolt",
  key: "IconKey",
  link: "IconLink"
}
