"use client"
import { useState, useEffect } from "react"

export default function PerformanceRing({ score, color, color2, label }) {
  const [current, setCurrent] = useState(0)
  
  useEffect(() => {
    const t = setTimeout(() => setCurrent(score), 300)
    return () => clearTimeout(t)
  }, [score])
  
  const size = 120
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const offset = circ - (current / 100) * circ
  
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle 
          cx={size/2} 
          cy={size/2} 
          r={r} 
          fill="none" 
          stroke="rgba(255,255,255,0.06)" 
          strokeWidth="7" 
        />
        <defs>
          <linearGradient id={`g${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color2} />
          </linearGradient>
        </defs>
        <circle
          cx={size/2} 
          cy={size/2} 
          r={r} 
          fill="none"
          stroke={`url(#g${color.replace('#','')})`} 
          strokeWidth="7"
          strokeDasharray={circ} 
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
        />
      </svg>
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center" 
      }}>
        <div style={{ 
          fontFamily: "var(--font-display)", 
          fontSize: 32, 
          fontWeight: 800, 
          color: color,
          lineHeight: 1 
        }}>
          {current}
        </div>
      </div>
    </div>
  )
}
