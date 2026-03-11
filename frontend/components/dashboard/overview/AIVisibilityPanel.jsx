"use client";

import ProgressBar from "@/components/ui/ProgressBar";
import { DATA } from "@/lib/constants/mockData";

export default function AIVisibilityPanel() {
  const { summary } = DATA;
  return (
    <div>
      <div className="section-head">
        <div className="section-title">AI Visibility Summary</div>
        <div className="glow-pill cyan">✦ AI-FIRST</div>
      </div>
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        {[
          { l: "AI Readiness", v: `${summary.aiReadiness}%`, c: "var(--purple)" },
          { l: "Schema Data", v: `${summary.schemaData}%`, c: "var(--cyan)" },
          { l: "AI Snippet Prob.", v: `${summary.aiSnippetProb}%`, c: "var(--amber)" },
        ].map((s, i) => (
          <div key={i} className="stat-tile">
            <div className="stat-tile-label">{s.l}</div>
            <div className="stat-tile-value" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: 16 }}>
        {[
          { l: "Entity Coverage", v: summary.entityCoverage },
          { l: "FAQ Optimization", v: summary.faqOptimized },
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
