"use client";

import ScoreRing from "@/components/ui/ScoreRing";

export default function ScoreGrid({ seoHealth = 0, aiVisibility = 0, performance = 0, technicalHealth = 0 }) {
  const scores = {
    seo: { val: seoHealth, prev: seoHealth - 6, label: "SEO Health", color: "#7c3aed", color2: "#a855f7" },
    ai: { val: aiVisibility, prev: aiVisibility - 6, label: "AI Visibility", color: "#00e5ff", color2: "#0ea5e9" },
    perf: { val: performance, prev: performance, label: "Performance", color: "#10ffa0", color2: "#059669" },
    tech: { val: technicalHealth, prev: technicalHealth, label: "Technical Health", color: "#ff6b6b", color2: "#ee5a24" },
  };
  
  return (
    <div className="score-grid">
      {Object.entries(scores).map(([k, s]) => (
        <div key={k} className="score-card" style={{ "--grad": `linear-gradient(90deg, ${s.color}, ${s.color2})` }}>
          <div className="score-label">{s.label}</div>
          
          {/* Ring + number overlaid */}
          <div style={{ position: "relative" }}>
            <ScoreRing val={s.val} color={s.color} color2={s.color2} />
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
                fontWeight: 800,
                fontSize: 28,
                color: s.color
              }}>
                {s.val}
              </div>
              <div style={{ fontSize: 10, color: "var(--text3)" }}>
                /100
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
