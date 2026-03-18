import { Separator } from "@/components/ui/separator"

import { SidebarTrigger } from "@/components/ui/sidebar"

import { usePathname } from "next/navigation"

import { IconDownload } from "@tabler/icons-react"

import { useExportPDF } from "@/hooks/useExportPDF"

import { useProject } from "@/contexts/ProjectContext"



export function SiteHeader({ user, onLogout }) {

  const pathname = usePathname()

  const { exportPDF, loading, error, progress } = useExportPDF()

  const { activeProjectId } = useProject()

  

  const getPageTitle = () => {

    if (pathname === "/") return "Dashboard"

    if (pathname === "/dashboard") return "Dashboard"

    if (pathname === "/projects") return "Projects"

    if (pathname === "/analytics") return "Analytics"

    if (pathname === "/onpage") return "On-Page Issues"

    if (pathname === "/technicalchecks") return "Technical Checks"

    if (pathname === "/pagespeed") return "PageSpeed Insights"

    if (pathname === "/keywords") return "Keywords"

    if (pathname === "/off-page-links") return "Off-Page & Links"

    return "Dashboard"

  }



  const handleExport = async () => {

    if (!activeProjectId) {

      console.error('No active project found');

      return;

    }



    try {

      // Determine report type based on current page

      let reportType = 'seo'; // default

      

      if (pathname.includes('ai-visibility') || pathname.includes('ai-search')) {

        reportType = 'ai';

      }



      await exportPDF(activeProjectId, reportType);

    } catch (err) {

      console.error('Export failed:', err.message);

    }

  };





  return (

    <header

      className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">

      <div className="flex w-full items-center justify-between gap-1 px-4 lg:gap-2 lg:px-6">

        <div className="flex items-center gap-1">

          <SidebarTrigger className="-ml-1" />

          <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />

          <h1 className="text-base font-medium">{getPageTitle()}</h1>

        </div>

        

        {getPageTitle() !== 'Keywords' && (

          <div className="flex items-center gap-2">

            <button

              onClick={handleExport}

              disabled={loading || !activeProjectId}

              style={{

                background: loading ? '#94a3b8' : 'linear-gradient(135deg,#7c3aed,#00e5ff)',

                border: 'none',

                borderRadius: 9,

                padding: '8px 16px',

                color: '#fff',

                fontSize: 12,

                fontWeight: 700,

                cursor: loading || !activeProjectId ? 'not-allowed' : 'pointer',

                fontFamily: "'DM Sans',sans-serif",

                whiteSpace: 'nowrap',

                display: 'flex',

                alignItems: 'center',

                gap: '6px',

                opacity: loading || !activeProjectId ? 0.7 : 1

              }}

            >

              <IconDownload size={16} />

              <span className="hidden sm:inline">

                {loading ? `Exporting... ${progress}%` : 'Export'}

              </span>

            </button>

            {error && (

              <span className="text-red-500 text-xs hidden sm:inline">

                {error}

              </span>

            )}

          </div>

        )}

      </div>

    </header>

  );

}

