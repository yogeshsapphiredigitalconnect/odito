"use client"

import { useState, useEffect } from 'react'

export default function CategoryCards({ aiData = null }) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Get categories from aiData or use defaults
  const categories = aiData?.categories || {}

  const CATEGORIES_DATA = [
    { 
      id: "ai_impact",           
      label: "AI Impact",            
      icon: "🧠", 
      val: Math.round(categories.ai_impact || 75.077),            
      color: "#00f5a0", 
      desc: "How much AI models surface your content" 
    },
    { 
      id: "citation_probability",
      label: "Citation Probability",  
      icon: "🔗", 
      val: Math.round(categories.citation_probability || 49.769), 
      color: "#00dfff", 
      desc: "Likelihood of being cited in AI answers" 
    },
    { 
      id: "llm_readiness",       
      label: "LLM Readiness",        
      icon: "🤖", 
      val: Math.round(categories.llm_readiness || 55.917),        
      color: "#c77dff", 
      desc: "How well LLMs can parse your content" 
    },
    { 
      id: "aeo_score",           
      label: "AEO Score",            
      icon: "❓", 
      val: Math.round(categories.aeo_score || 40),            
      color: "#f59e0b", 
      desc: "Answer Engine Optimization quality" 
    },
    { 
      id: "topical_authority",   
      label: "Topical Authority",    
      icon: "🎯", 
      val: Math.round(categories.topical_authority || 24.572),    
      color: "#ff3860", 
      desc: "Depth of topic coverage in your niche" 
    },
    { 
      id: "voice_intent",        
      label: "Voice Intent",         
      icon: "🎙", 
      val: Math.round(categories.voice_intent || 36.5),         
      color: "#8b5cf6", 
      desc: "Alignment with voice & conversational queries" 
    },
  ]

  return (
    <div className="cat-strip">
      {CATEGORIES_DATA.map((category, index) => {
        const col = category.val >= 70 ? "var(--gr)" : category.val >= 50 ? "var(--am)" : "var(--re)"
        return (
          <div 
            key={category.id} 
            className="cat-card" 
            style={{ animationDelay: (index * 0.06) + "s" }}
          >
            <div className="cat-card-top">
              <div 
                className="cat-card-icon" 
                style={{ background: category.color + "18" }}
              >
                {category.icon}
              </div>
              <div style={{ textAlign: "right" }}>
                <div 
                  className="cat-card-val" 
                  style={{ color: col }}
                >
                  {category.val}
                </div>
                <div style={{ fontSize: "9px", color: col, fontWeight: "600" }}>
                  / 100
                </div>
              </div>
            </div>
            <div className="cat-card-label">{category.label}</div>
            <div className="cat-card-desc">{category.desc}</div>
            <div className="cat-card-bar">
              <div 
                className="cat-card-fill" 
                style={{ 
                  width: animated ? category.val + "%" : "0%", 
                  background: category.color 
                }}
              />
            </div>
            <div 
              className="cat-card-stripe" 
              style={{ background: category.color }}
            />
          </div>
        )
      })}
    </div>
  )
}
