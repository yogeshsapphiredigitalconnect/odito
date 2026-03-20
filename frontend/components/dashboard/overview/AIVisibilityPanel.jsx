"use client";

import ProgressBar from "@/components/ui/ProgressBar";

export default function AIVisibilityPanel({ aiReadiness = 0, aiCitation = 0, topicalAuthority = 0 }) {
  return (
    <div>
      <div className="section-head">
        <div className="section-title">AI Visibility Summary</div>
        <div className="glow-pill cyan">✦ AI-FIRST</div>
      </div>
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        {[
          { l: "AI Readiness", v: `${aiReadiness}%`, c: "var(--purple)" },
          { l: "AI Citation", v: `${aiCitation}%`, c: "var(--cyan)" },
          { l: "Topical Authority", v: `${topicalAuthority}%`, c: "var(--amber)" },
        ].map((s, i) => (
          <div key={i} className="stat-tile">
            <div className="stat-tile-label">{s.l}</div>
            <div className="stat-tile-value" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: 16 }}>
        {[
          { l: "AI Readiness", v: aiReadiness, c: "var(--purple)" },
          { l: "AI Citation", v: aiCitation, c: "var(--cyan)" },
          { l: "Topical Authority", v: topicalAuthority, c: "var(--amber)" },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "var(--text2)" }}>
              <span>{item.l}</span><span style={{ fontWeight: 600 }}>{item.v}%</span>
            </div>
            <ProgressBar val={item.v} color={item.c} />
          </div>
        ))}
      </div>
    </div>
  );
}
