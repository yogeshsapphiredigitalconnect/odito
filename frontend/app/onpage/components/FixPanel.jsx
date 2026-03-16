"use client"

import { useState } from "react"

export default function FixPanel({ issue, url, onFixed, onClose }) {
  const [mode, setMode] = useState("ai")
  const [phase, setPhase] = useState("idle")
  const [lines, setLines] = useState([])

  function startFix() {
    setPhase("streaming")
    setLines([])
    
    const msgs = [
      { t: 0, l: "🔍 Scanning page…" },
      { t: 600, l: `🧩 Analysing ${issue.category === "AEO" ? "snippet & FAQ signals" : issue.category === "GEO" ? "conversational patterns" : "AI entity signals"}…` },
      { t: 1300, l: `✦ Issue confirmed: ${issue.title || issue.issue_message}` },
      { t: 2100, l: "🧠 Generating optimised fix…" },
      { t: 2800, l: `✅ Fix ready — +${issue.impact || issue.impact_percentage || 0}% Impact` },
    ]
    
    msgs.forEach(m => setTimeout(() => setLines(l => [...l, m.l]), m.t))
    setTimeout(() => setPhase("done"), 3000)
  }

  return (
    <div 
      className="fix-overlay" 
      onClick={e => { if (e.target === e.currentTarget) onClose() } }
    >
      <div className="fix-panel">
        {/* Header */}
        <div className="fp-hd">
          <div className="fp-hd-row">
            <div className={`fp-hd-icon ${issue.severity === "critical" || issue.severity === "high" ? "crit" : issue.severity === "warning" || issue.severity === "medium" ? "warn" : "low"}`}>
              {issue.category === "GEO" ? "🧩" : issue.category === "AEO" ? "⚡" : issue.category === "AISEO" ? "🤖" : "⚠"}
            </div>
            <div className="fp-hd-title">
              {issue.title || issue.issue_message || issue.issue}
            </div>
          </div>
          
          <div className="fp-chips">
            <span className={`fp-chip ${issue.severity === "critical" || issue.severity === "high" ? "crit" : issue.severity === "warning" || issue.severity === "medium" ? "warn" : "low"}`}>
              {issue.severity === "critical" || issue.severity === "high" ? "● Critical" : issue.severity === "warning" || issue.severity === "medium" ? "◆ Medium" : "○ Low"}
            </span>
            <span className="fp-chip impact">
              ▲ +{issue.impact || issue.impact_percentage || 0}% Impact
            </span>
            <span 
              className="fp-chip" 
              style={{ 
                background: "rgba(0,223,255,0.07)", 
                color: "var(--cy)", 
                borderColor: "rgba(0,223,255,0.18)" 
              }}
            >
              {issue.category || "GENERAL"}
            </span>
          </div>
          
          <div className="fp-close" onClick={onClose}>✕</div>
        </div>

        {/* Body */}
        <div className="fp-body">
          {/* Mode Tabs */}
          <div className="mode-tabs">
            <button 
              className={`mode-tab${mode === "ai" ? " on" : ""}`}
              onClick={() => { setMode("ai"); setPhase("idle"); setLines([]); }}
            >
              ✦ AI Fix
            </button>
            <button 
              className={`mode-tab${mode === "diy" ? " on" : ""}`}
              onClick={() => setMode("diy")}
            >
              🛠 DIY
            </button>
            <button 
              className={`mode-tab${mode === "help" ? " on" : ""}`}
              onClick={() => setMode("help")}
            >
              🤝 Expert Help
            </button>
          </div>

          {/* AI Fix Tab */}
          {mode === "ai" && phase === "idle" && (
            <div>
              <div className="aria-box">
                <div className="aria-lbl">✦ ARIA</div>
                <div className="aria-body">
                  {issue.description || issue.message || "This issue affects your page's SEO performance and AI visibility."}
                </div>
              </div>
              
              <div className="diff">
                <div className="diff-box">
                  <div className="diff-lbl">❌ Current</div>
                  <pre>{issue.before || `<!-- Current implementation -->\n<!-- Issue detected on ${url} -->`}</pre>
                </div>
                <div className="diff-box">
                  <div className="diff-lbl">✅ Fixed</div>
                  <pre>{issue.after || `<!-- Optimized implementation -->\n<!-- Fix applied to ${url} -->`}</pre>
                </div>
              </div>
              
              <button className="act pr" onClick={startFix}>
                ✦ Generate AI Fix
              </button>
            </div>
          )}

          {mode === "ai" && phase === "streaming" && (
            <div>
              <div className="stream-box">
                {lines.map((l, i) => (
                  <div key={i} className="sl">{l}</div>
                ))}
                <span className="cur"></span>
              </div>
            </div>
          )}

          {mode === "ai" && phase === "done" && (
            <div style={{ animation: "fadeIn 0.3s forwards" }}>
              <div className="stream-box">
                {lines.map((l, i) => (
                  <div key={i} className="sl">{l}</div>
                ))}
              </div>
              
              <div className="aria-box" style={{ padding: "9px 12px", marginBottom: 10 }}>
                <div className="aria-lbl">✦ ARIA</div>
                <div className="aria-body" style={{ fontSize: 11 }}>
                  Fix applied — estimated <strong style={{ color: "var(--gr)" }}>+{issue.impact || issue.impact_percentage || 0}% Impact</strong>
                </div>
              </div>
              
              <div className="diff">
                <div className="diff-box">
                  <div className="diff-lbl">❌ Before</div>
                  <pre>{issue.before || `<!-- Current implementation -->`}</pre>
                </div>
                <div className="diff-box">
                  <div className="diff-lbl">✅ After</div>
                  <pre>{issue.after || `<!-- Optimized implementation -->`}</pre>
                </div>
              </div>
              
              <button className="act pr" onClick={onFixed}>
                ✓ Mark as Fixed
              </button>
              <button className="act gh" onClick={() => { setPhase("idle"); setLines([]); }}>
                ← Back
              </button>
            </div>
          )}

          {/* DIY Tab */}
          {mode === "diy" && (
            <div style={{ animation: "fadeIn 0.3s forwards" }}>
              <div className="aria-box">
                <div className="aria-lbl">🛠 Steps to Fix</div>
                <div className="aria-body">
                  {issue.description || issue.message || "Follow these steps to resolve this issue manually."}
                </div>
              </div>
              
              {issue.steps && issue.steps.map((step, i) => (
                <div key={i} className="step">
                  <div className="step-n">{i + 1}</div>
                  <div>
                    <div className="step-t">{step.title || step.t}</div>
                    <div className="step-d">{step.description || step.d}</div>
                  </div>
                </div>
              ))}
              
              <div className="diff">
                <div className="diff-box">
                  <div className="diff-lbl">❌ Before</div>
                  <pre>{issue.before || `<!-- Current implementation -->`}</pre>
                </div>
                <div className="diff-box">
                  <div className="diff-lbl">✅ After</div>
                  <pre>{issue.after || `<!-- Optimized implementation -->`}</pre>
                </div>
              </div>
              
              <button className="act pr">📥 Download Checklist</button>
              <button className="act gh">📋 Copy Code</button>
            </div>
          )}

          {/* Expert Help Tab */}
          {mode === "help" && (
            <div style={{ animation: "fadeIn 0.3s forwards" }}>
              <div style={{ textAlign: "center", padding: "12px 0 14px" }}>
                <div style={{ 
                  width: 44, 
                  height: 44, 
                  borderRadius: 12, 
                  background: "var(--g1)", 
                  display: "grid", 
                  placeItems: "center", 
                  fontSize: 21, 
                  margin: "0 auto 9px" 
                }}>
                  🤝
                </div>
                <div style={{ 
                  fontFamily: "var(--fd)", 
                  fontSize: 14, 
                  fontWeight: 800, 
                  marginBottom: 4 
                }}>
                  Let Our Experts Fix It
                </div>
                <div style={{ 
                  fontSize: 11.5, 
                  color: "var(--t2)", 
                  lineHeight: 1.6 
                }}>
                  Specialists fix <strong style={{ color: "var(--t)" }}>{issue.title || issue.issue_message}</strong> with before/after proof.
                </div>
              </div>
              
              {[
                { icon: "⚡", title: "Express Fix", desc: "Fixed in 24h", tag: "Popular", tc: "var(--cy)" },
                { icon: "🔍", title: "Full Audit + Fix", desc: "All issues on this page", tag: "Thorough", tc: "var(--pu)" },
                { icon: "♾", title: "Monthly Monitoring", desc: "Auto-fix on every scan", tag: "Best Value", tc: "var(--gr)" }
              ].map((tier, i) => (
                <div key={i} className="tier">
                  <div className="tier-icon" style={{ background: `${tier.tc}14` }}>
                    {tier.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>
                      {tier.title}
                    </div>
                    <div style={{ fontSize: 10, color: "var(--t3)" }}>
                      {tier.desc}
                    </div>
                  </div>
                  <span 
                    className="pill" 
                    style={{ 
                      color: tier.tc, 
                      borderColor: `${tier.tc}44`, 
                      background: `${tier.tc}11`, 
                      fontSize: 9 
                    }}
                  >
                    {tier.tag}
                  </span>
                </div>
              ))}
              
              <button className="act pr" style={{ marginTop: 6 }}>
                🚀 Request Expert Fix
              </button>
              <button className="act pu">
                📅 Book Strategy Call
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
