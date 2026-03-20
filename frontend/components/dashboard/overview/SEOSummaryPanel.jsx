"use client";

import ProgressBar from "@/components/ui/ProgressBar";

export default function SEOSummaryPanel({ pagesCrawled = 0, totalIssues = 0, criticalIssues = 0 }) {
  return (
    <div>
      <div className="section-head">
        <div className="section-title">SEO Summary</div>
        <div className="section-tag">LIVE</div>
      </div>
      <div className="stat-grid" style={{ marginBottom: 16 }}>
        {[
          { l: "Pages Crawled", v: pagesCrawled, c: "var(--cyan)" },
          { l: "Total Issues", v: totalIssues, c: "var(--purple)" },
          { l: "Critical", v: criticalIssues, c: "var(--red)" },
        ].map((s, i) => (
          <div key={i} className="stat-tile">
            <div className="stat-tile-label">{s.l}</div>
            <div className="stat-tile-value" style={{ color: s.c }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div className="glass-card" style={{ padding: 16 }}>
        {[
          { l: "Indexing Coverage", v: 68 },
          { l: "Content Score", v: 72 },
          { l: "Internal Linking", v: 60 },
        ].map((item, i) => (
          <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, color: "var(--text2)" }}>
              <span>{item.l}</span><span style={{ fontWeight: 600 }}>{item.v}%</span>
            </div>
            <ProgressBar val={item.v} color={item.v > 70 ? "var(--green)" : item.v > 50 ? "var(--amber)" : "var(--red)"} />
          </div>
        ))}
      </div>
    </div>
  );
}
