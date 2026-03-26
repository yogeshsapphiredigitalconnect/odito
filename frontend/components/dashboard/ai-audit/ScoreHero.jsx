"use client"



import { useState, useEffect } from 'react'



export default function ScoreHero({ score = 41, aiData = null }) {

  const [animatedScore, setAnimatedScore] = useState(0)

  const ringR = 52

  const ringC = 2 * Math.PI * ringR



  useEffect(() => {

    const timer = setTimeout(() => {

      setAnimatedScore(score)

    }, 200)

    return () => clearTimeout(timer)

  }, [score])



  const getColorByScore = (val) => {

    if (val < 50) return '#ff3860'

    if (val < 70) return '#ffb703'

    return '#00f5a0'

  }



  const scoreColor = getColorByScore(score)

  

  // Get dynamic values from aiData or use defaults

  const citationProbability = aiData?.categories?.citation_probability || 49.769

  const llmReadiness = aiData?.categories?.llm_readiness || 55.917

  const pagesScored = aiData?.pages_scored || 20



  return (

    <div className="score-hero">

      <svg width="130" height="130" viewBox="0 0 120 120">

        <circle

          cx="60"

          cy="60"

          r={ringR}

          fill="none"

          stroke="rgba(255,255,255,.05)"

          strokeWidth="9"

        />

        <circle

          cx="60"

          cy="60"

          r={ringR}

          fill="none"

          stroke={scoreColor}

          strokeWidth="9"

          strokeLinecap="round"

          strokeDasharray={ringC}

          strokeDashoffset={ringC - (ringC * animatedScore / 100)}

          transform="rotate(-90 60 60)"

          style={{

            filter: `drop-shadow(0 0 10px ${scoreColor}80)`,

            transition: 'stroke-dashoffset 1.2s ease'

          }}

        />

        <text

          x="60"

          y="56"

          textAnchor="middle"

          fill={scoreColor}

          fontSize="26"

          fontWeight="800"

          fontFamily="Syne, sans-serif"

        >

          {score}

        </text>

        <text

          x="60"

          y="70"

          textAnchor="middle"

          fill="rgba(255,255,255,.3)"

          fontSize="9"

          fontFamily="DM Sans, sans-serif"

        >

          /100

        </text>

        <text

          x="60"

          y="83"

          textAnchor="middle"

          fill="rgba(255,255,255,.35)"

          fontSize="7.5"

          fontFamily="DM Sans, sans-serif"

        >

          AI READINESS

        </text>

      </svg>

      <div>

        <div style={{ 

          fontFamily: 'Syne, sans-serif', 

          fontSize: '19px', 

          fontWeight: '800', 

          color: scoreColor, 

          marginBottom: '7px' 

        }}>

          {score < 50 ? 'Poor AI Readiness' : score < 70 ? 'Moderate AI Readiness' : 'Good AI Readiness'}

        </div>

        <div style={{ 

          fontSize: '12px', 

          color: 'var(--t2)', 

          lineHeight: '1.6', 

          marginBottom: '12px', 

          maxWidth: '480px' 

        }}>

          {score < 50 

            ? "ChatGPT, Perplexity, and Gemini have limited ability to understand and cite your content. Fix the "

            : score < 70

            ? "AI models can partially understand your content. Key gaps remain in topical authority and schema. Fix the "

            : "Your content is well-optimised for AI citation. Keep monitoring for gaps. Fix the "

          }

          <strong style={{ color: 'var(--am)' }}>4 critical issues</strong> below to reach {' '}

          <strong style={{ color: 'var(--gr)' }}>68+</strong>.

        </div>

        <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>

          <span className="pill r">● 4 Critical</span>

          <span className="pill a">◆ 3 Warnings</span>

          <span className="pill" style={{ 

            color: '#00dfff', 

            borderColor: 'rgba(0,223,255,.2)', 

            background: 'rgba(0,223,255,.07)' 

          }}>

            🔗 {citationProbability.toFixed(1)}% Citation

          </span>

          <span className="pill" style={{ 

            color: '#8b5cf6', 

            borderColor: 'rgba(139,92,246,.2)', 

            background: 'rgba(139,92,246,.07)' 

          }}>

            🤖 {llmReadiness.toFixed(1)}% LLM Ready

          </span>

          <span className="pill" style={{ 

            color: 'var(--gr)', 

            borderColor: 'rgba(0,245,160,.2)', 

            background: 'rgba(0,245,160,.07)' 

          }}>

            📄 {pagesScored} pages scored

          </span>

        </div>

      </div>

    </div>

  )

}

