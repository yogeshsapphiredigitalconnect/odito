"use client";

import ScoreRing from "@/components/ui/ScoreRing";
import { DATA } from "@/lib/constants/mockData";

export default function ScoreGrid() {
  const { scores } = DATA;
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

          <div className={`score-change ${s.val > s.prev ? "up" : "down"}`}>
            {s.val > s.prev ? "▲" : "▼"} {Math.abs(s.val - s.prev)} pts
          </div>
          <div className="score-sub">vs last audit</div>
        </div>
      ))}
    </div>
  );
}
