"use client"

import { useState, useMemo } from 'react';
import CircularProgress from '@/components/CircularProgress';
import { AI_CATEGORY_COLOR_MAP } from "@/utils/aiCategoryColors";
import { useWebsiteOptimization } from '@/hooks/useWebsiteOptimization';

export default function AIOptimization({ project }) {
  const [activeCategory, setActiveCategory] = useState('aeo_score');

  // Get projectId from project prop (handle both standalone and existing projects)
  const projectId = project?.projectId || project?._id;

  // Fetch website optimization data
  const { loading, error, data } = useWebsiteOptimization(projectId);

  // Category mapping for tabs
  const categoryTabs = [
    { id: 'aeo_score', label: 'AEO' },
    { id: 'ai_impact', label: 'AI IMPACT' },
    { id: 'llm_readiness', label: 'LLM READINESS' },
    { id: 'topical_authority', label: 'TOPICAL AUTHORITY' },
    { id: 'voice_intent', label: 'VOICE INTENT' },
    { id: 'citation_probability', label: 'CITATION PROBABILITY' }
  ];

  // Get current score for active category from project summary (stored truth)
  const score = Math.round(project?.summary?.categoryAverages?.[activeCategory] || 0);
  const radius = 88;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Filter rules for active category
  const categoryRules = useMemo(() => {
    if (!data?.ruleSummary) return [];
    return data.ruleSummary.filter(rule => rule.category === activeCategory);
  }, [data, activeCategory]);

  // Calculate strengths and weaknesses from filtered rules
  const strengths = useMemo(() => {
    return categoryRules.filter(rule => rule.avg_score >= 70);
  }, [categoryRules]);

  const weaknesses = useMemo(() => {
    return categoryRules.filter(rule => rule.avg_score < 40);
  }, [categoryRules]);

  // Get prioritized actions (weakest rules)
  const prioritizedActions = useMemo(() => {
    return [...categoryRules]
      .sort((a, b) => a.avg_score - b.avg_score)
      .slice(0, 2);
  }, [categoryRules]);

  // Helper functions
  const formatRuleName = (ruleId) => {
    return ruleId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-primary';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getHealthLabel = (score) => {
    if (score >= 80) return 'EXCELLENT HEALTH';
    if (score >= 60) return 'GOOD HEALTH';
    if (score >= 40) return 'MODERATE HEALTH';
    return 'POOR HEALTH';
  };

  const getHealthColor = (score) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-primary';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBgColor = (score) => {
    if (score >= 80) return 'bg-emerald-500/10';
    if (score >= 60) return 'bg-blue-500/10';
    if (score >= 40) return 'bg-yellow-500/10';
    return 'bg-red-500/10';
  };

  const getHealthBorderColor = (score) => {
    if (score >= 80) return 'border-emerald-500/20';
    if (score >= 60) return 'border-blue-500/20';
    if (score >= 40) return 'border-yellow-500/20';
    return 'border-red-500/20';
  };

  const healthLabel = getHealthLabel(score);
  const healthColorClass = getHealthColor(score);
  const healthBgClass = getHealthBgColor(score);
  const healthBorderClass = getHealthBorderColor(score);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading optimization data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <h3 className="text-red-800 font-semibold mb-2">Error loading data</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
            Framework v4.2
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-600"></span>
          <span className="text-slate-500 text-xs font-medium">
            Last processed: {data?.total_pages || 0} pages analyzed
          </span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          AI Optimization Framework
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
          Enhance your website visibility across AI systems and answer engines by optimizing for semantic relevance and LLM interpretability.
        </p>
      </div>

      {/* Horizontal Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/5 mb-10 overflow-x-auto">
        {categoryTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-6 py-4 text-sm font-bold transition-all relative ${
              activeCategory === tab.id
                ? 'text-white border-b-2 border-primary'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            {activeCategory === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary blur-[4px]"></div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* LEFT COLUMN (40%) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
          {/* Score Overview Card */}
          <div className="bg-slate-800/60 backdrop-blur-lg border border-white/8 rounded-2xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4">
              <span className="material-symbols-outlined text-slate-700 group-hover:text-primary transition-colors cursor-help">
                info
              </span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="relative size-48 flex items-center justify-center mb-6">
                {/* Circular Gauge */}
                <svg className="size-full transform -rotate-90">
                  <circle 
                    className="text-white/5" 
                    cx="96" 
                    cy="96" 
                    fill="transparent" 
                    r="88" 
                    stroke="currentColor" 
                    strokeWidth="12"
                  />
                  <circle 
                    className="text-primary drop-shadow-[0_0_8px_rgba(37,175,244,0.4)]" 
                    cx="96" 
                    cy="96" 
                    fill="transparent" 
                    r="88" 
                    stroke="currentColor" 
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    strokeWidth="12"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-white">{score}%</span>
                  <span className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-1">
                    Overall Score
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${healthBgClass} border ${healthBorderClass} ${healthColorClass} text-xs font-bold mb-4`}>
                <span className="size-2 rounded-full bg-current animate-pulse"></span>
                {healthLabel}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {categoryTabs.find(tab => tab.id === activeCategory)?.label} Index
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Your content is currently processed with {score >= 60 ? 'good' : 'moderate'} efficiency by AI systems. 
                {score < 80 && ' Improving structured data and entity relationships will increase AI extraction probability.'}
              </p>
            </div>
          </div>

          {/* Performance Breakdown Card */}
          <div className="bg-slate-800/60 backdrop-blur-lg border border-white/8 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Performance Breakdown
            </h3>
            <div className="space-y-6">
              {categoryRules.length > 0 ? (
                categoryRules.map((rule) => (
                  <div key={rule.rule_id}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm text-slate-400">quiz</span>
                        <span className="text-sm font-medium text-slate-300">
                          {formatRuleName(rule.rule_id)}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-white">{rule.avg_score}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`${getScoreColor(rule.avg_score)} h-full rounded-full`}
                        style={{ width: `${rule.avg_score}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-8">
                  No rule data available for this category.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (60%) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
          {/* AI Insights Card */}
          <div className="bg-slate-800/60 backdrop-blur-lg border border-white/8 rounded-2xl p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">psychology</span>
              AI Reasoning Insights
            </h3>
            <div className="grid md:grid-cols-2 gap-8 mb-6">
              <div>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-4">
                  Core Strengths
                </p>
                <ul className="space-y-3">
                  {strengths.length > 0 ? (
                    strengths.slice(0, 3).map((rule) => (
                      <li key={rule.rule_id} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="material-symbols-outlined text-emerald-500 text-lg">check_circle</span>
                        {formatRuleName(rule.rule_id)} ({rule.avg_score}%)
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500">No significant strengths detected</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">
                  Weak Exposure
                </p>
                <ul className="space-y-3">
                  {weaknesses.length > 0 ? (
                    weaknesses.slice(0, 3).map((rule) => (
                      <li key={rule.rule_id} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="material-symbols-outlined text-red-400 text-lg">cancel</span>
                        {formatRuleName(rule.rule_id)} ({rule.weak_pages} pages affected)
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-slate-500">No critical weaknesses detected</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex gap-4">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <div>
                <p className="text-sm font-bold text-white mb-1">Why This Matters</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Large Language Models (LLMs) prioritize content that is formatted for high-certainty extraction. 
                  By resolving ambiguities and improving structured data, your site becomes the "Single Source of Truth" 
                  for generative search queries.
                </p>
              </div>
            </div>
          </div>

          {/* Action Recommendations Card */}
          <div className="bg-slate-800/60 backdrop-blur-lg border border-white/8 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">bolt</span>
                Prioritized Actions
              </h3>
              <button className="text-xs font-bold text-primary hover:underline">
                View All Actions
              </button>
            </div>
            <div className="space-y-4">
              {prioritizedActions.length > 0 ? (
                prioritizedActions.map((rule) => (
                  <div key={rule.rule_id} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined">schema</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Improve {formatRuleName(rule.rule_id)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Address performance issues in {formatRuleName(rule.rule_id)}.
                        </p>
                      </div>
                    </div>
                    <button className="bg-primary text-slate-900 px-4 py-1.5 rounded-lg text-xs font-bold hover:brightness-110 transition-all shadow-[0_4px_12px_-2px_rgba(37,175,244,0.5)]">
                      Improve Now
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center text-slate-500 py-8">
                  <span className="material-symbols-outlined text-3xl mb-2">check_circle</span>
                  <p className="text-sm">No immediate actions required for this category</p>
                </div>
              )}
            </div>
          </div>

          {/* AI Simulation Preview Card */}
          <div className="bg-slate-800/60 backdrop-blur-lg border border-white/8 rounded-2xl p-6 border-t-2 border-t-primary/20">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">smart_toy</span>
              <h3 className="text-lg font-bold">Live AI Response Simulation</h3>
            </div>
            <div className="bg-slate-900/80 rounded-xl p-5 border border-white/5 space-y-4 shadow-inner">
              <div className="flex gap-3">
                <div className="size-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-sm">person</span>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-2xl rounded-tl-none text-sm text-slate-200">
                  What are the core benefits of your {activeCategory.replace('_', ' ')} strategy?
                </div>
              </div>
              <div className="flex gap-3">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20">
                  <span className="material-symbols-outlined text-sm text-primary">auto_awesome</span>
                </div>
                <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl rounded-tl-none">
                  <p className="text-sm text-slate-300 leading-relaxed italic">
                    "Your current content results in a {score >= 60 ? 'comprehensive' : 'fragmented'} answer. 
                    I found {categoryRules.length} distinct points, but the relationships between concepts are {score >= 60 ? 'well' : 'weakly'} linked..."
                  </p>
                  <div className="mt-4 flex gap-2">
                    <span className={`px-2 py-1 rounded ${
                      score >= 80 ? 'bg-emerald-400/10 text-emerald-400' :
                      score >= 60 ? 'bg-yellow-400/10 text-yellow-400' :
                      'bg-red-400/10 text-red-400'
                    } text-[10px] font-bold border ${
                      score >= 80 ? 'border-emerald-400/20' :
                      score >= 60 ? 'border-yellow-400/20' :
                      'border-red-400/20'
                    }`}>
                      {score >= 80 ? 'HIGH CONFIDENCE' :
                       score >= 60 ? 'MEDIUM CONFIDENCE' :
                       'LOW CONFIDENCE'}
                    </span>
                    <span className="px-2 py-1 rounded bg-slate-700/50 text-slate-400 text-[10px] font-bold">
                      SOURCE: INDEXED DATA
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-3 bg-gradient-to-r from-primary/80 to-primary text-slate-900 font-black text-sm rounded-xl hover:shadow-[0_0_20px_rgba(37,175,244,0.3)] transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xl">temp_preferences_custom</span>
              OPTIMIZE FOR BETTER ANSWERS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
