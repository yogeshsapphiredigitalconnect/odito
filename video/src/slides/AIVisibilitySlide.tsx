// remotion/slides/AIVisibilitySlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { AIVisibilityData, SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { ChartBar } from "../components_new/ChartBar";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: AIVisibilityData;
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

const ENTITY_COLOR: Record<string, string> = { linked: "#00f5a0", partial: "#ffb703", missing: "#ff3860" };
const ENTITY_ICON: Record<string, string> = { linked: "✓", partial: "◑", missing: "✗" };

export const AIVisibilitySlide: React.FC<Props> = ({ data, narration, brandColor = "#7730ed", agencyName = "AuditIQ" }) => {
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const geoScores = [
    { label: "GEO Score",   value: data.geo_score,   color: "#8b5cf6", startFrame: 15 },
    { label: "AEO Score",   value: data.aeo_score,   color: "#06b6d4", startFrame: 25 },
    { label: "AISEO Score", value: data.aiseo_score,  color: "#00dfff", startFrame: 35 },
  ];

  const aiMetrics = [
    { label: "Schema Coverage",       value: data.schema_coverage_pct,    color: "#f59e0b" },
    { label: "FAQ Optimization",      value: data.faq_optimization_pct,   color: "#06b6d4" },
    { label: "Conversational Score",  value: data.conversational_score,   color: "#8b5cf6" },
    { label: "AI Snippet Probability",value: data.ai_snippet_probability, color: "#10b981" },
    { label: "AI Citation Rate",      value: data.ai_citation_rate,       color: "#10b981" },
  ];

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(119,48,237,0.08), transparent 60%)", pointerEvents: "none" }} />

      <LogoHeader agencyName={agencyName} brandColor={brandColor} slideNumber={6} totalSlides={7} slideTitle="AI Visibility" />

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, bottom: 0, display: "grid", gridTemplateColumns: "1fr 1fr", opacity }}>

        {/* LEFT: Big score + GEO/AEO/AISEO rings + metrics */}
        <div style={{ padding: "40px 40px 40px 80px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Headline + main ring */}
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 28 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#c77dff", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 14 }}>
              ✦ GEO · AEO · AISEO
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <GaugeScore score={data.overall_ai_score} label="AI Readiness" size={170} color={data.overall_ai_score >= 70 ? "#00f5a0" : data.overall_ai_score >= 50 ? "#ffb703" : "#ff3860"} startFrame={12} />
              <div>
                <div style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 44, color: "#eef2ff", letterSpacing: "-0.03em", lineHeight: 1 }}>
                  {data.overall_ai_score < 50 ? "Poor" : data.overall_ai_score < 70 ? "Fair" : "Good"}
                </div>
                <div style={{ fontFamily: "sans-serif", fontSize: 18, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
                  AI Visibility
                </div>
                <div style={{ marginTop: 14, padding: "8px 14px", background: "rgba(255,56,96,0.08)", border: "1px solid rgba(255,56,96,0.2)", borderRadius: 8 }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 15, color: "#ff3860" }}>
                    KG Status: {data.kg_status === "linked" ? "✅ Verified" : data.kg_status === "partial" ? "⚠️ Partial" : "❌ Missing"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GEO / AEO / AISEO mini rings */}
          <div style={{ display: "flex", gap: 20, marginBottom: 28, opacity: childOpacity(2) }}>
            {geoScores.map((s) => (
              <div key={s.label} style={{ flex: 1, padding: "14px 12px", background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{s.label}</div>
                {(() => {
                  const safeValue = typeof s.value === "number" && !isNaN(s.value) ? s.value : 0;
                  const v = Math.round(interpolate(frame, [s.startFrame, s.startFrame + 40], [0, safeValue], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
                  return <div style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 34, color: s.color }}>{v}</div>;
                })()}
              </div>
            ))}
          </div>

          {/* AI Metric bars */}
          <div style={{ opacity: childOpacity(3) }}>
            {aiMetrics.map((m, i) => (
              <ChartBar key={m.label} label={m.label} value={m.value} maxValue={100} color={m.color} startFrame={35} index={i} unit="%" height={10} />
            ))}
          </div>
        </div>

        {/* RIGHT: LLM citations + entity map */}
        <div style={{ padding: "40px 80px 40px 40px", display: "flex", flexDirection: "column", justifyContent: "center" }}>

          {/* LLM Citation rates */}
          <div style={{ opacity: childOpacity(1), marginBottom: 30 }}>
            <div style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
              LLM Citation Rate
            </div>
            {(data?.llm_citations || []).map((citation, i) => {
              const safeGrowth = typeof citation.growth === "number" && !isNaN(citation.growth) ? citation.growth : 0;
              const barW = interpolate(frame, [20 + i * 10, 60 + i * 10], [0, safeGrowth], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const op = interpolate(frame, [18 + i * 10, 33 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={citation.platform} style={{ opacity: op, display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: "#7730ed", border: "1px solid #7730ed30", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", fontWeight: 800, fontSize: 14, color: "#7730ed", flexShrink: 0 }}>
                    {citation.platform.charAt(0)}
                  </div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 17, color: "rgba(255,255,255,0.65)", width: 100, flexShrink: 0 }}>{citation.platform}</div>
                  <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: `${barW}%`, height: "100%", background: "#7730ed", borderRadius: 5 }} />
                  </div>
                  <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 18, color: "#7730ed", width: 42, textAlign: "right" }}>{citation.count}</div>
                </div>
              );
            })}
          </div>

          {/* Entity map */}
          <div style={{ opacity: childOpacity(3) }}>
            <div style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>
              Entity Coverage
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {(data?.entity_map || []).map((e, i) => {
                const color = ENTITY_COLOR[e.status];
                const icon = ENTITY_ICON[e.status];
                const op = interpolate(frame, [40 + i * 5, 55 + i * 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                return (
                  <div key={e.entity} style={{ opacity: op, display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", background: `${color}0d`, border: `1px solid ${color}25`, borderRadius: 8, fontFamily: "sans-serif", fontSize: 15, color }}>
                    <span>{icon}</span>
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>{e.entity}</span>
                  </div>
                );
              })}
            </div>

            {/* Entity legend */}
            <div style={{ display: "flex", gap: 16 }}>
              {[["✓", "#00f5a0", "Linked"], ["◑", "#ffb703", "Partial"], ["✗", "#ff3860", "Missing"]].map(([icon, color, label]) => (
                <div key={label as string} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontFamily: "sans-serif", fontSize: 15, color: color as string }}>{icon as string}</span>
                  <span style={{ fontFamily: "sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{label as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI insight */}
          <div style={{ opacity: childOpacity(5), marginTop: 24, padding: "18px 20px", background: "linear-gradient(135deg, rgba(119,48,237,0.1), rgba(0,223,255,0.04))", border: "1px solid rgba(119,48,237,0.2)", borderRadius: 14 }}>
            <div style={{ fontFamily: "sans-serif", fontSize: 12, fontWeight: 700, color: "#c77dff", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>✦ ARIA Insight</div>
            <div style={{ fontFamily: "sans-serif", fontSize: 17, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
              Fixing schema + claiming your Knowledge Graph entity could push AI visibility from <strong style={{ color: "#ff3860" }}>{data.overall_ai_score}</strong> to <strong style={{ color: "#00f5a0" }}>68+</strong>
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>06 / 07</div>
    </AbsoluteFill>
  );
};
