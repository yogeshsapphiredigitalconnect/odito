"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiService from '@/lib/apiService';
import { AI_CATEGORY_COLOR_MAP } from "@/utils/aiCategoryColors";

export default function AIPageIssues({ project }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to generate slug from URL
  const getSlugFromUrl = (url) => {
    try {
      const parsed = new URL(url);
      return parsed.pathname.replace(/^\/+/, '');
    } catch {
      return url.replace(/^https?:\/\/[^\/]+\/?/, '').replace(/^\/+/, '');
    }
  };

  // Helper function to determine status based on score
  const getStatusFromScore = (score) => {
    if (score >= 80) return { text: 'Good', color: 'text-green-500', dot: 'bg-green-500' };
    if (score >= 60) return { text: 'Stable', color: 'text-blue-500', dot: 'bg-blue-500' };
    if (score >= 40) return { text: 'Needs Fix', color: 'text-yellow-500', dot: 'bg-yellow-500' };
    return { text: 'Critical', color: 'text-red-500', dot: 'bg-red-500' };
  };

  // Fetch AI visibility pages data safely
  useEffect(() => {
    const fetchPages = async () => {
      let resolvedId = null;
      
      // Safe guard: Check if we have either projectId or standalone AI visibility project
      if (project?.projectId) {
        // Project-based AI visibility - use SEO project ID
        resolvedId = project.projectId;
        console.log("🔍 Using project-based AI visibility ID:", resolvedId);
      } else if (project?.isStandalone && project?._id) {
        // Standalone AI visibility - use AI visibility project ID directly
        resolvedId = project._id;
        console.log("🔍 Using standalone AI visibility ID:", resolvedId);
      } else {
        console.log("❌ No project ID or standalone visibility ID available");
        setError('No project or visibility ID found');
        setLoading(false);
        return;
      }

      console.log("✅ Resolved visibility ID:", resolvedId);

      try {
        let response;
        
        if (project?.isStandalone) {
          // For standalone records, use the new standalone API endpoint
          console.log("🔍 Fetching standalone AI visibility pages");
          response = await apiService.request(`/ai-visibility/${resolvedId}/pages?limit=50&sortBy=score&sortOrder=asc`);
        } else {
          // Project-based AI visibility - use existing API
          response = await apiService.getAIVisibilityPages(resolvedId, {
            limit: 50,
            sortBy: 'final_score',
            sortOrder: 'asc'
          });
        }

        console.log('📊 Fetched Page Data:', response);
        
        if (response.success && response.data) {
          // Map backend response to frontend format
          const mappedPages = (response.data.pages || []).map(page => ({
            page_url: page.url || page.page_url,
            final_score: page.finalScore || 0,
            aeo_score: page.aeo || 0,
            llm_readiness: page.llm || 0,
            citation_probability: page.cite || 0,
            topical_authority: page.topical_authority || 0,
            voice_intent: page.voice_intent || 0,
            issues_count: page.issuesCount || 0,
            updated_at: page.updated_at
          }));
          
          setPages(mappedPages);
          
          // Update statistics if backend provides them
          if (response.data.avgScore !== undefined) {
            // Backend provided avgScore and totalCritical
            console.log('✅ Pages loaded:', mappedPages.length, 'pages | Avg score:', response.data.avgScore, 'Total critical:', response.data.totalCritical);
          } else {
            // Fallback to calculating from pages (for project-based API)
            console.log('✅ Pages loaded:', mappedPages.length, 'pages');
          }
        } else {
          throw new Error(response.message || 'Failed to fetch pages');
        }
      } catch (err) {
        console.error('❌ Error fetching pages:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (project) {
      fetchPages();
    }
  }, [project]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-white">Loading visibility data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  // Helper function to get color for score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };
  return (
    <>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Page Level AI Analysis</h1>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider border border-primary/20">Beta</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <span>Per-page AI visibility breakdown</span>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-4 font-mono text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  Total Pages: <span className="text-slate-200">{pages.length}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  Avg Score: <span className="text-slate-200">
                    {pages.length > 0 
                      ? (pages.reduce((sum, page) => sum + (page.final_score || 0), 0) / pages.length).toFixed(1)
                      : '0'
                    }
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-danger"></span>
                  Critical: <span className="text-slate-200">
                    {pages.filter(page => (page.final_score || 0) < 40).length}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-slate-500 text-[18px]">search</span>
              </span>
              <input 
                className="block w-64 pl-9 pr-3 py-1.5 border border-border-dark rounded bg-surface-dark text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary transition-all text-sm font-medium" 
                placeholder="Search pages..." 
                type="text"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors">
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Filter</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded border border-border-dark text-slate-300 hover:text-white hover:border-slate-500 transition-colors text-sm font-medium">
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border-dark bg-surface-dark overflow-hidden shadow-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] border-b border-border-dark text-[11px] uppercase text-slate-500 font-semibold tracking-wider">
                <th className="px-6 py-4 w-[30%]">URL</th>
                <th className="px-6 py-4 text-center w-[15%]">Final AI Score</th>
                <th className="px-6 py-4 w-[20%]">Category Snapshot</th>
                <th className="px-6 py-4 text-center w-[10%]">Issues</th>
                <th className="px-6 py-4 w-[15%]">Status</th>
                <th className="px-6 py-4 text-right w-[10%]">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-border-dark">
              {pages.map((page, index) => {
                const status = getStatusFromScore(page.final_score || 0);
                return (
                  <tr key={index} className="hover:bg-white/3 transition-all duration-200 group cursor-pointer bg-background-dark">
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white font-mono text-sm">{page.page_url || '/unknown'}</span>
                          <a className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-primary transition-all" href="#">
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                          </a>
                        </div>
                        <span className="text-xs text-slate-600">
                          Updated {page.updated_at ? new Date(page.updated_at).toLocaleString() : 'Unknown'} • Indexable
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-center">
                        <div className="relative size-12">
                          <svg className="size-full gauge-circle" viewBox="0 0 36 36">
                            <path className="text-slate-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                            <path 
                              className={getScoreColor(page.final_score || 0)} 
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                              fill="none" 
                              stroke="currentColor" 
                              strokeDasharray={`${page.final_score || 0}, 100`} 
                              strokeLinecap="round" 
                              strokeWidth="2.5"
                            ></path>
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                            {Math.round(page.final_score || 0)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500 w-8 text-right">AEO</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`bg-gradient-to-r ${AI_CATEGORY_COLOR_MAP["AEO Score"]?.gradient || "from-blue-400 to-blue-600"} h-full rounded-full`} 
                              style={{width: `${page.aeo_score || 0}%`}}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500 w-8 text-right">LLM</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`bg-gradient-to-r ${AI_CATEGORY_COLOR_MAP["LLM Readiness"]?.gradient || "from-purple-400 to-purple-600"} h-full rounded-full`} 
                              style={{width: `${page.llm_readiness || 0}%`}}
                            ></div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-500 w-8 text-right">Cite</span>
                          <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className={`bg-gradient-to-r ${AI_CATEGORY_COLOR_MAP["Citation Prob."]?.gradient || "from-green-400 to-green-600"} h-full rounded-full`} 
                              style={{width: `${page.citation_probability || 0}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className="inline-flex items-center justify-center h-6 min-w-[24px] px-1.5 rounded bg-slate-800 text-slate-400 text-xs font-bold border border-slate-700">
                        {page.issues_count || 0}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="relative inline-flex rounded-full h-2 w-2 {status.dot}"></span>
                        </span>
                        <span className="text-xs font-medium text-slate-200">{status.text}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <Link href={`/ai-visibility/page/${getSlugFromUrl(page.page_url || '')}`} className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-colors inline-block">
                        View Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-4 border-t border-border-dark flex items-center justify-between bg-surface-dark">
          <span className="text-xs text-slate-500">
            Showing {pages.length > 0 ? '1-' + pages.length : '0'} of {pages.length} results
          </span>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="px-3 py-1 rounded bg-white/10 text-white text-xs font-medium">1</button>
            <button className="p-1.5 rounded hover:bg-white/5 text-slate-500 hover:text-white transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
