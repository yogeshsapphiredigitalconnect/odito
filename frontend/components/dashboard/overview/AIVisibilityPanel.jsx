"use client";

import ProgressBar from "@/components/ui/ProgressBar";

export default function AIVisibilityPanel({ aiReadiness = 0, schemaData = 0, aiSnippetProbability = 0 }) {
  return (
    <div>
      <div className="section-head">
        <div className="section-title">AI Visibility Summary</div>
        <div className="glow-pill cyan">✦ AI-FIRST</div>
      </div>
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        {[
          { l: "AI Readiness", v: `${aiReadiness}%`, c: "var(--purple)" },
          { l: "Schema Data", v: `${schemaData}%`, c: "var(--cyan)" },
          { l: "AI Snippet Prob.", v: `${aiSnippetProbability}%`, c: "var(--amber)" },
        ].map((s, i) => (
          <div key={i} className="stat-tile">
            <div className="stat-tile-label">{s.l}</div>
            <div className="stat-tile-value" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: 16 }}>
        {[
          { l: "Entity Coverage", v: 31 },
          { l: "FAQ Optimization", v: 8 },
          { l: "Conversational Query Score", v: 48 },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "var(--text2)" }}>
              <span>{item.l}</span><span style={{ fontWeight: 600 }}>{item.v}%</span>
            </div>
            <ProgressBar val={item.v} color="var(--purple)" />
          </div>
        ))}
      </div>
    </div>
  );
}
