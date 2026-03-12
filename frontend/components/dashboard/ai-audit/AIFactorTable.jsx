"use client"

import { useState, useEffect } from "react"

export default function AIFactorTable({ aiData }) {
  function ProgressBar({ val, color = "var(--cyan)", animated = true }) {
    const [w, setW] = useState(0);
    useEffect(() => { const t = setTimeout(() => setW(val), 400); return () => clearTimeout(t); }, [val]);
    return (
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: animated ? `${w}%` : `${val}%`, background: color }} />
      </div>
    );
  }

  // Map database categories to display names and recommendations
  const getFactorMapping = () => ({
    ai_impact: {
      name: "AI Impact",
      getRecommendation: (score) => score < 50 ? "Optimize content for AI discovery and relevance" : "Good AI impact, maintain current strategy"
    },
    citation_probability: {
      name: "AI Citation Probability", 
      getRecommendation: (score) => score < 50 ? "Add structured data and clear answers to increase citation chances" : "Good citation probability, enhance with more schema markup"
    },
    llm_readiness: {
      name: "LLM Readability Score",
      getRecommendation: (score) => score < 60 ? "Improve content structure and clarity for LLM processing" : "Content is well-structured for LLM consumption"
    },
    aeo_score: {
      name: "AEO / GEO Optimization",
      getRecommendation: (score) => score < 50 ? "Focus on answer engine optimization and conversational queries" : "Good AEO optimization, expand to more question-based content"
    },
    topical_authority: {
      name: "Topical Authority",
      getRecommendation: (score) => score < 50 ? "Develop comprehensive topic coverage and expertise signals" : "Strong topical authority, expand to related subtopics"
    },
    voice_intent: {
      name: "Voice Search Intent",
      getRecommendation: (score) => score < 50 ? "Optimize for natural language and voice search queries" : "Well-optimized for voice search, continue current approach"
    }
  })

  // Generate factors from real data
  const generateFactors = () => {
    if (!aiData?.categories) return []

    const mapping = getFactorMapping()
    const factors = []

    Object.entries(aiData.categories).forEach(([key, value]) => {
      const factorConfig = mapping[key]
      if (factorConfig) {
        const score = Math.round(value) // Round to integer
        factors.push({
          name: factorConfig.name,
          score: score,
          rec: factorConfig.getRecommendation(score)
        })
      }
    })

    return factors
  }

  const factors = generateFactors()

  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <table className="issue-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>AI Factor</th>
            <th>Score</th>
            <th>Progress</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {factors.map((f, i) => {
            const col = f.score < 30 ? "var(--red)"
                      : f.score < 60 ? "var(--amber)"
                      : "var(--green)"
            return (
              <tr key={i}>
                <td style={{ fontWeight: 600, fontSize: 13 }}>
                  {f.name}
                </td>
                <td>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800, fontSize: 20,
                    color: col
                  }}>
                    {f.score}
                  </span>
                </td>
                <td style={{ width: 120 }}>
                  <ProgressBar val={f.score} color={col} />
                </td>
                <td style={{
                  fontSize: 12, color: "var(--text2)",
                  lineHeight: 1.5
                }}>
                  {f.rec}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
