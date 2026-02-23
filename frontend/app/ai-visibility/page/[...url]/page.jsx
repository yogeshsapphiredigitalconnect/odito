"use client";

import React, { use, useState, useEffect } from 'react';
import apiService from '@/lib/apiService';
import { AI_CATEGORY_COLOR_MAP } from "@/utils/aiCategoryColors";

export default function AIPageDetailDeepDive(props) {
  const params = use(props.params);
  const slugArray = params?.url || [];
  const slugPath = Array.isArray(slugArray)
    ? slugArray.join('/')
    : slugArray;
  const slug = decodeURIComponent(slugPath);
  const [pageScore, setPageScore] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const pageUrl = slug.startsWith("http") 
    ? slug 
    : `https://www.sapphiredigitalagency.com/${slug.replace(/^\/+/, "")}`;
  const displayUrl = pageUrl.replace(/^(https?:\/\/(www\.)?)/, "");
  const pagePath = new URL(pageUrl).pathname;

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        const projectsResponse = await apiService.request('/ai-visibility/projects');
        const currentProject = projectsResponse?.data;

        if (!currentProject?._id) {
          setError('No AI visibility project found');
          return;
        }

        const pageScoreRes = await apiService.request(`/ai-visibility/page-score?projectId=${currentProject._id}&url=${encodeURIComponent(pageUrl)}`);
        
        if (!pageScoreRes.success || !pageScoreRes.data) {
          throw new Error(pageScoreRes.message || 'Failed to load page score data');
        }
        
        setPageScore(pageScoreRes.data);

        const issuesRes = await apiService.request(`/ai-visibility/page-issues?projectId=${currentProject._id}&page_url=${encodeURIComponent(pageUrl)}`);
        
        if (issuesRes.success && issuesRes.data) {
          setIssues(issuesRes.data);
        }
      } catch (e) {
        console.error("Failed to fetch page data:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPageData();
  }, [slug, pageUrl]);

  if (loading) {
    return (
      <main className="max-w-[1600px] mx-auto p-6 md:p-8 w-full flex flex-col gap-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading page analysis...</p>
        </div>
      </main>
    );
  }

  if (error || !pageScore) {
    return (
      <main className="max-w-[1600px] mx-auto p-6 md:p-8 w-full flex flex-col gap-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-danger">Page Not Found</h1>
          <p className="text-text-muted mb-6">{error || 'This page was not found in AI visibility data.'}</p>
          <button onClick={() => window.history.back()} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90">
            Go Back
          </button>
        </div>
      </main>
    );
  }

  const getScoreColor = (score) => {
    if (score >= 70) return "text-success";
    if (score >= 40) return "text-warning";
    return "text-danger";
  };

  const getProgressBarColor = (score) => {
    if (score >= 70) return "bg-success";
    if (score >= 40) return "bg-warning";
    return "bg-danger";
  };

  const calculateStrokeDashoffset = (score) => {
    const circumference = 2 * Math.PI * 45;
    return circumference - (score / 100) * circumference;
  };

  const categoryScores = pageScore.categoryScores || {};
  console.log("categoryScores:", categoryScores);
  console.log("pageScore:", pageScore);
  const finalScore = Math.round(pageScore.finalScore || 0);
  const statusBadge = finalScore >= 70 ? 
    { text: 'Good', color: 'bg-success/10 text-success border-success/20' } :
    finalScore >= 40 ? 
    { text: 'Needs Fix', color: 'bg-warning/10 text-warning border-warning/20' } :
    { text: 'Critical', color: 'bg-danger/10 text-danger border-danger/20' };

  return (
    <main className="max-w-[1600px] mx-auto p-6 md:p-8 w-full flex flex-col gap-8">
      {/* Header Section */}
      <section className="flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
        <div className="flex items-start gap-6">
          {/* Circular Gauge with glow effect */}
          <div className="relative size-24 shrink-0 group">
            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <svg className="size-full transform -rotate-90 relative z-10" viewBox="0 0 100 100">
              <circle className="text-surface-highlight" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeWidth="6"></circle>
              <circle className="text-primary transition-all duration-1000 ease-out" cx="50" cy="50" fill="transparent" r="45" stroke="currentColor" strokeDasharray="282.7" strokeDashoffset={calculateStrokeDashoffset(finalScore)} strokeWidth="6"></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
              <span className="text-2xl font-bold text-white">{finalScore}%</span>
            </div>
            <div className="absolute -bottom-1 -right-1 size-8 bg-surface border border-border rounded-full flex items-center justify-center z-30 shadow-lg">
              <span className="text-sm font-bold text-warning">{finalScore >= 40 ? 'C' : 'F'}</span>
            </div>
          </div>
          <div className="flex flex-col pt-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold tracking-tight">{pagePath}</h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${statusBadge.color} border`}>
                {statusBadge.text}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted font-mono">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">globe</span>
                {pageUrl}
              </span>
              <span className="size-1 bg-border rounded-full"></span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">schedule</span>
                Last analyzed: {pageScore.updatedAt ? new Date(pageScore.updatedAt).toLocaleDateString() : 'Unknown'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="h-9 px-4 rounded border border-border bg-surface hover:bg-surface-highlight text-xs font-medium transition-colors">
            Recrawl Page
          </button>
          <button className="h-9 px-4 rounded bg-white text-background hover:bg-gray-200 text-xs font-bold transition-colors shadow-[0_0_15px_-3px_rgba(255,255,255,0.3)]">
            AI Suggestions
          </button>
        </div>
      </section>

      {/* Score Strip - with colored numbers */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'AI Impact', value: Math.round(categoryScores?.ai_impact || 0) },
          { label: 'Citation Probability', value: Math.round(categoryScores.citation_probability || 0) },
          { label: 'LLM Readiness', value: Math.round(categoryScores.llm_readiness || 0) },
          { label: 'AEO Score', value: Math.round(categoryScores.aeo_score || 0) },
          { label: 'Topical Authority', value: Math.round(categoryScores.topical_authority || 0) },
          { label: 'Voice Intent', value: Math.round(categoryScores.voice_intent || 0) },
        ].map(({ label, value }) => {
          console.log(`Score card - ${label}: ${value}`);
          return (
          <div key={label} className="bg-surface border border-border p-3 rounded flex flex-col gap-2 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-muted font-medium">{label}</span>
              <span className={`font-bold ${AI_CATEGORY_COLOR_MAP[label]?.text || "text-white"}`}>{value}</span>
            </div>
            <div className="h-1 w-full bg-surface-highlight rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${AI_CATEGORY_COLOR_MAP[label]?.gradient} rounded-full`}
                style={{ width: `${value}%` }}
              ></div>
            </div>
          </div>
        )})}
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Category Breakdown</h2>
            <button className="text-xs text-primary hover:text-white transition-colors">Expand All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* AI Impact */}
            <details className="group bg-surface border border-border rounded-lg open">
              <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded flex items-center justify-center bg-surface-highlight text-primary">
                    <span className="material-symbols-outlined">auto_awesome</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">AI Impact</h3>
                    <p className="text-[10px] text-text-muted">Direct influence on generative results</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${
                    (categoryScores?.ai_impact || 0) >= 70 ? 'text-success' : 
                    (categoryScores?.ai_impact || 0) >= 40 ? 'text-warning' : 
                    'text-danger'
                  }`}>{Math.round(categoryScores?.ai_impact || 0)}</span>
                  <span className="material-symbols-outlined text-text-muted transition-transform group-open:rotate-180">expand_more</span>
                </div>
              </summary>
              <div className="px-4 pb-4 border-t border-border/50 pt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs group/row">
                    <span className="text-text-muted group-hover/row:text-white transition-colors">Entity Clarity</span>
                    <div className="flex items-center gap-3 w-1/2">
                      <div className="h-1.5 w-full bg-surface-highlight rounded-full overflow-hidden">
                        <div className="h-full bg-success rounded-full" style={{width: '85%'}}></div>
                      </div>
                      <span className="w-8 text-right font-mono text-success">85%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs group/row">
                    <span className="text-text-muted group-hover/row:text-white transition-colors">Semantic Density</span>
                    <div className="flex items-center gap-3 w-1/2">
                      <div className="h-1.5 w-full bg-surface-highlight rounded-full overflow-hidden">
                        <div className="h-full bg-warning rounded-full" style={{width: '45%'}}></div>
                      </div>
                      <span className="w-8 text-right font-mono text-warning">45%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs group/row">
                    <span className="text-text-muted group-hover/row:text-white transition-colors">Fact Checkable</span>
                    <div className="flex items-center gap-3 w-1/2">
                      <div className="h-1.5 w-full bg-surface-highlight rounded-full overflow-hidden">
                        <div className="h-full bg-danger rounded-full" style={{width: '32%'}}></div>
                      </div>
                      <span className="w-8 text-right font-mono text-danger">32%</span>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* Topical Authority */}
            <details className="group bg-surface border border-border rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded flex items-center justify-center bg-surface-highlight ${AI_CATEGORY_COLOR_MAP["Topical Authority"]?.text || "text-pink-400"}`}>
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Topical Authority</h3>
                    <p className="text-[10px] text-text-muted">Depth of subject matter expertise</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${
                    (categoryScores.topical_authority || 0) >= 70 ? 'text-success' : 
                    (categoryScores.topical_authority || 0) >= 40 ? 'text-warning' : 
                    'text-danger'
                  }`}>{Math.round(categoryScores.topical_authority || 0)}</span>
                  <span className="material-symbols-outlined text-text-muted transition-transform group-open:rotate-180">expand_more</span>
                </div>
              </summary>
              <div className="px-4 pb-4 border-t border-border/50 pt-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs group/row">
                    <span className="text-text-muted">Cluster Coverage</span>
                    <div className="flex items-center gap-3 w-1/2">
                      <div className="h-1.5 w-full bg-surface-highlight rounded-full overflow-hidden">
                        <div className="h-full bg-danger rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span className="w-8 text-right font-mono text-danger">25%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs group/row">
                    <span className="text-text-muted">Information Gain</span>
                    <div className="flex items-center gap-3 w-1/2">
                      <div className="h-1.5 w-full bg-surface-highlight rounded-full overflow-hidden">
                        <div className="h-full bg-warning rounded-full" style={{width: '55%'}}></div>
                      </div>
                      <span className="w-8 text-right font-mono text-warning">55%</span>
                    </div>
                  </div>
                </div>
              </div>
            </details>

            {/* LLM Readiness */}
            <details className="group bg-surface border border-border rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded flex items-center justify-center bg-surface-highlight text-emerald-400">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">LLM Readiness</h3>
                    <p className="text-[10px] text-text-muted">Technical parseability for bots</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${
                    (categoryScores.llm_readiness || 0) >= 70 ? 'text-success' : 
                    (categoryScores.llm_readiness || 0) >= 40 ? 'text-warning' : 
                    'text-danger'
                  }`}>{Math.round(categoryScores.llm_readiness || 0)}</span>
                  <span className="material-symbols-outlined text-text-muted transition-transform group-open:rotate-180">expand_more</span>
                </div>
              </summary>
              <div className="px-4 pb-4 border-t border-border/50 pt-4"></div>
            </details>

            {/* Citation Prob */}
            <details className="group bg-surface border border-border rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <div className={`size-8 rounded flex items-center justify-center bg-surface-highlight ${AI_CATEGORY_COLOR_MAP["Citation Probability"]?.text || "text-green-400"}`}>
                    <span className="material-symbols-outlined">link</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Citation Probability</h3>
                    <p className="text-[10px] text-text-muted">Likelihood of being referenced</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${
                    (categoryScores.citation_probability || 0) >= 70 ? 'text-success' : 
                    (categoryScores.citation_probability || 0) >= 40 ? 'text-warning' : 
                    'text-danger'
                  }`}>{Math.round(categoryScores.citation_probability || 0)}</span>
                  <span className="material-symbols-outlined text-text-muted transition-transform group-open:rotate-180">expand_more</span>
                </div>
              </summary>
              <div className="px-4 pb-4 border-t border-border/50 pt-4"></div>
            </details>

            {/* AEO Score */}
            <details className="group bg-surface border border-border rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded flex items-center justify-center bg-surface-highlight text-blue-400">
                    <span className="material-symbols-outlined">search_check</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">AEO Score</h3>
                    <p className="text-[10px] text-text-muted">Answer Engine Optimization</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${
                    (categoryScores.aeo_score || 0) >= 70 ? 'text-success' : 
                    (categoryScores.aeo_score || 0) >= 40 ? 'text-warning' : 
                    'text-danger'
                  }`}>{Math.round(categoryScores.aeo_score || 0)}</span>
                  <span className="material-symbols-outlined text-text-muted transition-transform group-open:rotate-180">expand_more</span>
                </div>
              </summary>
              <div className="px-4 pb-4 border-t border-border/50 pt-4"></div>
            </details>

            {/* Voice Intent */}
            <details className="group bg-surface border border-border rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded flex items-center justify-center bg-surface-highlight text-pink-400">
                    <span className="material-symbols-outlined">mic</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Voice Intent</h3>
                    <p className="text-[10px] text-text-muted">Conversational query matching</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xl font-bold ${
                    (categoryScores.voice_intent || 0) >= 70 ? 'text-success' : 
                    (categoryScores.voice_intent || 0) >= 40 ? 'text-warning' : 
                    'text-danger'
                  }`}>{Math.round(categoryScores.voice_intent || 0)}</span>
                  <span className="material-symbols-outlined text-text-muted transition-transform group-open:rotate-180">expand_more</span>
                </div>
              </summary>
              <div className="px-4 pb-4 border-t border-border/50 pt-4"></div>
            </details>

          </div>
        </div>

        {/* AI Insights Panel - with glow background */}
        <div className="lg:col-span-1">
          <div className="bg-surface border border-border rounded-lg p-5 h-full relative overflow-hidden">
            {/* Glow decoration */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-3xl rounded-full pointer-events-none"></div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">psychology</span>
              <h2 className="text-lg font-semibold">AI Insights</h2>
            </div>
            <div className="space-y-6 relative z-10">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-green-500 font-bold mb-3 flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-green-500"></span> Strengths
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm bg-surface-highlight/50 p-2 rounded border border-border/50">
                    <div className="font-medium text-white mb-0.5">Entity Clarity</div>
                    <div className="text-xs text-text-muted">Excellent named entity recognition signals for LLMs.</div>
                  </li>
                  <li className="text-sm bg-surface-highlight/50 p-2 rounded border border-border/50">
                    <div className="font-medium text-white mb-0.5">Mobile Formatting</div>
                    <div className="text-xs text-text-muted">Content structure is highly digestible on mobile viewports.</div>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs uppercase tracking-wider text-red-500 font-bold mb-3 flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-red-500"></span> Weak Areas
                </h4>
                <ul className="space-y-2">
                  <li className="text-sm bg-surface-highlight/50 p-2 rounded border border-border/50">
                    <div className="font-medium text-white mb-0.5">Schema Markup</div>
                    <div className="text-xs text-text-muted">Missing critical Organization schema for Knowledge Graph.</div>
                  </li>
                  <li className="text-sm bg-surface-highlight/50 p-2 rounded border border-border/50">
                    <div className="font-medium text-white mb-0.5">Content Depth</div>
                    <div className="text-xs text-text-muted">Word count is 60% below the topical average.</div>
                  </li>
                </ul>
              </div>
              <div className="pt-4 border-t border-border">
                <h4 className="text-xs uppercase tracking-wider text-blue-400 font-bold mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">bolt</span> AI Quick Fix
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Your <span className="text-white font-medium">Topical Authority</span> is critical. To immediately boost your score, implement the <span className="font-mono text-primary bg-primary/10 px-1 rounded">Organization</span> JSON-LD schema provided in the export panel, and expand the "History" section by approximately 400 words to match competitor density.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority Issues Table */}
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Priority Issues</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-highlight text-text-muted text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Rule Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Severity</th>
                <th className="px-6 py-4 w-1/3">Recommended Fix</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {issues.length > 0 ? (
                issues.map((issue, index) => (
                  <tr key={index} className="hover:bg-surface-highlight/50 transition-colors group">
                    <td className="px-6 py-4 relative">
                      {/* Colored left border only on high severity */}
                      {issue.severity === 'high' && (
                        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-danger opacity-50"></div>
                      )}
                      <div className="font-medium text-white">{issue.rule_name || 'Unknown Issue'}</div>
                      <div className="text-xs text-text-muted mt-0.5">{issue.issue_code || 'ISSUE-' + index}</div>
                    </td>
                    <td className="px-6 py-4 text-text-muted">{issue.category || 'General'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                        issue.severity === 'high' ? 'bg-danger/10 text-danger border-danger/20' :
                        issue.severity === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                        'bg-primary/10 text-primary border-primary/20'
                      }`}>
                        {issue.severity?.toUpperCase() || 'LOW'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-muted leading-relaxed">
                      {issue.recommended_fix || 'No specific fix available'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-primary text-xs font-semibold hover:text-white transition-colors">
                        {issue.severity === 'high' ? 'Generate Code' : issue.severity === 'medium' ? 'Draft Content' : 'Details'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-text-muted">
                    No issues found for this page. Great job!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
