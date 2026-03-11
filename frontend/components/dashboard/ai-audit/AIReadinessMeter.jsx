"use client"

import { useState, useEffect } from "react"
import { AI_AUDIT } from "@/lib/constants/mockData"

export default function AIReadinessMeter() {
  function AnimatedRing() {
    const [cur, setCur] = useState(0)
    useEffect(() => {
      const t = setTimeout(() => setCur(AI_AUDIT.score), 300)
      return () => clearTimeout(t)
    }, [])
    const size = 120, r = 46
    const circ = 2 * Math.PI * r
    const offset = circ - (cur / 100) * circ
    return (
      <svg width={size} height={size}
        style={{ transform: "rotate(-90deg)" }}>
        <circle cx={60} cy={60} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth="7"/>
        <defs>
          <linearGradient id="aiGrad"
            x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed"/>
            <stop offset="100%" stopColor="#00e5ff"/>
          </linearGradient>
        </defs>
        <circle cx={60} cy={60} r={r} fill="none"
          stroke="url(#aiGrad)" strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition:
            "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)"
          }}/>
      </svg>
    )
  }

  return (
    <div className="ai-card" style={{ marginBottom: 24 }}>
      {/* Top row: label + sparkle */}
      <div style={{ display: "flex",
        justifyContent: "space-between", marginBottom: 16 }}>
        <div className="ai-card-label">✦ AI Readiness Meter</div>
        <span style={{ color: "var(--cyan)", fontSize: 14 }}>✦</span>
      </div>

      {/* Content row: ring left, text right */}
      <div style={{ display: "flex", gap: 24,
        alignItems: "center" }}>
        
        {/* Ring with score inside */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <AnimatedRing />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center"
          }}>
            <div style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800, fontSize: 32,
              color: "var(--purple)"
            }}>
              {AI_AUDIT.score}
            </div>
            <div style={{ fontSize: 10, color: "var(--text3)" }}>
              /100
            </div>
          </div>
        </div>

        {/* Text block */}
        <div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700, fontSize: 20,
            color: "var(--text)", marginBottom: 8
          }}>
            {AI_AUDIT.label}
          </div>
          <div className="ai-card-text" style={{ marginBottom: 10 }}>
            {AI_AUDIT.desc}
          </div>
          <div style={{ fontSize: 13, color: "var(--text2)" }}>
            Target score:{" "}
            <strong style={{ color: "var(--cyan)" }}>
              {AI_AUDIT.target}
            </strong>
          </div>
        </div>
      </div>
    </div>
  )
}
