"use client"

import MetricCard from './MetricCard'

export default function MetricStrip({ metricsData = null, aiData = null }) {
  // Static fallback data when no dynamic data is available
  const staticFallbackData = {
    ai_readiness: 41,
    schema_coverage: 34,
    faq_optimization: 38,
    conversational_score: 31,
    ai_snippet_probability: 29,
    ai_citation_rate: 18,
    knowledge_graph: 35,
    entity_coverage: 52,
    llm_indexability: 39,
    structured_data_depth: 28,
    entity_coverage_pct: 52,
    geo_score: 36
  }

  // Use metricsData if available, otherwise fallback to static data
  const dataToUse = metricsData || staticFallbackData

  // Get categories from aiData for derived metrics
  const categories = aiData?.categories || {}
  const score = aiData?.score || 41

  // Map metrics according to the new specification
  const METRICS_DATA = [
    { 
      id: "ai_score",      
      label: "AI Readiness",          
      icon: "🧠", 
      val: score,                                  
      color: "#f59e0b" 
    },
    { 
      id: "schema",        
      label: "Schema Coverage",        
      icon: "🧩", 
      val: Math.round((categories.aeo_score || 40) * 0.85),          
      color: "#f59e0b" 
    },
    { 
      id: "faq",           
      label: "FAQ Optimization",       
      icon: "❓", 
      val: Math.round(categories.aeo_score || 40),                 
      color: "#06b6d4" 
    },
    { 
      id: "conv",          
      label: "Conversational Score",   
      icon: "💬", 
      val: Math.round(categories.llm_readiness || 55.917),             
      color: "#8b5cf6" 
    },
    { 
      id: "snippet",       
      label: "AI Snippet Probability", 
      icon: "⚡", 
      val: Math.round(categories.citation_probability || 49.769),      
      color: "#10b981" 
    },
    { 
      id: "citation",      
      label: "AI Citation Rate",       
      icon: "🔗", 
      val: Math.round(categories.citation_probability || 49.769),      
      color: "#00dfff" 
    },
    { 
      id: "kg",            
      label: "Knowledge Graph",        
      icon: "🔮", 
      val: Math.round((categories.topical_authority || 24.572) * 1.4),   
      color: "#c77dff" 
    },
    { 
      id: "entity",        
      label: "Topical Authority",      
      icon: "🗺", 
      val: Math.round(categories.topical_authority || 24.572),         
      color: "#ff3860" 
    },
    { 
      id: "llm",           
      label: "LLM Indexability",       
      icon: "🤖", 
      val: Math.round(categories.llm_readiness || 55.917),             
      color: "#00dfff" 
    },
    { 
      id: "struct_depth",  
      label: "Structured Data Depth",  
      icon: "📐", 
      val: Math.round((categories.aeo_score || 40) * 0.7),          
      color: "#f59e0b" 
    },
    { 
      id: "voice",         
      label: "Voice Intent",           
      icon: "�", 
      val: Math.round(categories.voice_intent || 36.5),              
      color: "#8b5cf6" 
    },
    { 
      id: "ai_impact",     
      label: "AI Impact Score",        
      icon: "🎯", 
      val: Math.round(categories.ai_impact || 75.077),                 
      color: "#00f5a0" 
    },
  ]

  // Use derived metrics if we have aiData, otherwise use the metricsData directly
  const finalMetricsData = aiData ? METRICS_DATA : (
    Object.keys(dataToUse).length > 0 ? [
      { id: "ai_score", label: "AI Readiness", icon: "🧠", val: dataToUse.ai_readiness, color: "#f59e0b" },
      { id: "schema", label: "Schema Coverage", icon: "🧩", val: dataToUse.schema_coverage, color: "#f59e0b" },
      { id: "faq", label: "FAQ Optimization", icon: "❓", val: dataToUse.faq_optimization, color: "#06b6d4" },
      { id: "conv", label: "Conversational Score", icon: "💬", val: dataToUse.conversational_score, color: "#8b5cf6" },
      { id: "snippet", label: "AI Snippet Probability", icon: "⚡", val: dataToUse.ai_snippet_probability, color: "#10b981" },
      { id: "citation", label: "AI Citation Rate", icon: "🔗", val: dataToUse.ai_citation_rate, color: "#00dfff" },
      { id: "kg", label: "Knowledge Graph", icon: "🔮", val: dataToUse.knowledge_graph, color: "#c77dff" },
      { id: "entity", label: "Entity Coverage", icon: "🗺", val: dataToUse.entity_coverage, color: "#ff3860" },
      { id: "llm", label: "LLM Indexability", icon: "🤖", val: dataToUse.llm_indexability, color: "#00dfff" },
      { id: "struct_depth", label: "Structured Data Depth", icon: "📐", val: dataToUse.structured_data_depth, color: "#f59e0b" },
      { id: "entity_cov", label: "Entity Coverage %", icon: "🌐", val: dataToUse.entity_coverage_pct, color: "#c77dff" },
      { id: "geo_score", label: "GEO Score", icon: "🎯", val: dataToUse.geo_score, color: "#8b5cf6" },
    ] : METRICS_DATA
  )

  return (
    <>
      {/* Metrics row 1 */}
      <div className="metric-strip">
        {finalMetricsData.slice(0, 8).map(metric => (
          <MetricCard 
            key={metric.id}
            icon={metric.icon}
            label={metric.label}
            val={metric.val}
            color={metric.color}
          />
        ))}
      </div>

      {/* Metrics row 2 */}
      <div className="metric-strip" style={{ marginBottom: '24px' }}>
        {finalMetricsData.slice(8).map(metric => (
          <MetricCard 
            key={metric.id}
            icon={metric.icon}
            label={metric.label}
            val={metric.val}
            color={metric.color}
          />
        ))}
      </div>
    </>
  )
}
