// remotion/slides/FinalRecommendationSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FinalRecommendationData, OverviewData, SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: FinalRecommendationData;
  narration: SlideNarration;
  overview: OverviewData;
  brandColor?: string;
  agencyName?: string;
  logoUrl?: string;
}

const DIFF_COLOR = { easy: "#00f5a0", medium: "#ffb703", hard: "#ff3860" };
const DIFF_LABEL = { easy: "Easy", medium: "Medium", hard: "Hard" };

export const FinalRecommendationSlide: React.FC<Props> = ({
  data,
  narration,
  overview,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
  logoUrl,
}) => {
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const projected = [
    { label: "SEO Health",    current: overview.scores.seo_health,    target: data.estimated_improvement.seo_health,    color: "#00f5a0" },
    { label: "AI Visibility", current: overview.scores.ai_visibility, target: data.estimated_improvement.ai_visibility, color: "#c77dff" },
    { label: "Performance",   current: overview.scores.performance,   target: data.estimated_improvement.performance,   color: "#00dfff" },
  ];

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Radial background glow */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 100%, ${brandColor}12, transparent 60%)`, pointerEvents: "none" }} />

      <LogoHeader agencyName={agencyName} logoUrl={logoUrl} brandColor={brandColor} slideNumber={7} totalSlides={7} slideTitle="Action Plan" />

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, bottom: 0, display: "grid", gridTemplateColumns: "1fr 420px", opacity }}>

        {/* LEFT: Priorities */}
        <div style={{ padding: "44px 40px 44px 80px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 30 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: brandColor, textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 12 }}>
              🚀 Your Action Plan
            </div>
            <div style={{ fontSize: 50, fontWeight: 800, color: "#eef2ff", fontFamily: "sans-serif", letterSpacing: "-0.03em", lineHeight: 1.05 }}>
              Top Priorities
            </div>
            <div style={{ fontSize: 19, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", marginTop: 6 }}>
              Highest impact actions to take this week
            </div>
          </div>

          {/* Priority rows */}
          {(data?.top_priorities || []).map((p, i) => {
            const delay = 18 + i * 13;
            const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const tx = interpolate(frame, [delay, delay + 20], [-28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const diffColor = DIFF_COLOR[p.difficulty];
            const diffLabel = DIFF_LABEL[p.difficulty];

            return (
              <div
                key={p.title}
                style={{
                  opacity: op,
                  transform: `translateX(${tx}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "20px 22px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderLeft: `4px solid ${diffColor}`,
                  borderRadius: 14,
                  marginBottom: 12,
                }}
              >
                {/* Step number */}
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${diffColor}15`, border: `1px solid ${diffColor}30`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", fontWeight: 800, fontSize: 18, color: diffColor, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 20, color: "#eef2ff", marginBottom: 5 }}>{p.title}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ fontFamily: "sans-serif", fontSize: 14, color: "#00f5a0", background: "rgba(0,245,160,0.08)", padding: "2px 8px", borderRadius: 6, fontWeight: 600 }}>▲ {p.impact}</span>
                    <span style={{ fontFamily: "sans-serif", fontSize: 14, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 6 }}>{p.difficulty}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, padding: "5px 12px", background: `${diffColor}12`, border: `1px solid ${diffColor}25`, borderRadius: 8, color: diffColor, flexShrink: 0 }}>
                  {diffLabel}
                </div>
              </div>
            );
          })}

          {/* Next steps */}
          <div style={{ opacity: childOpacity(5), marginTop: 16 }}>
            <div style={{ fontFamily: "sans-serif", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Week 1 Schedule</div>
            {(data?.next_steps || []).map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 8 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: `${brandColor}20`, border: `1px solid ${brandColor}35`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", fontWeight: 700, fontSize: 12, color: brandColor, flexShrink: 0, marginTop: 2 }}>
                  {i + 1}
                </div>
                <div style={{ fontFamily: "sans-serif", fontSize: 17, color: "rgba(255,255,255,0.55)", lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 600, color: "#eef2ff", marginBottom: 2 }}>{step.step}</div>
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }}>{step.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Projected scores + CTA */}
        <div style={{ padding: "44px 80px 44px 30px", display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>

          {/* Projected improvement */}
          <div style={{ opacity: childOpacity(1), marginBottom: 30 }}>
            <div style={{ fontFamily: "sans-serif", fontSize: 14, fontWeight: 700, color: "#00f5a0", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 18 }}>📈 Projected After Fixes</div>
            {projected.map((p, i) => {
              const currentAnim = Math.round(interpolate(frame, [15 + i * 8, 55 + i * 8], [0, Number(p.current) || 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
              const targetAnim  = Math.round(interpolate(frame, [35 + i * 8, 80 + i * 8], [Number(p.current) || 0, Number(p.target) || 0],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
              const barNow    = interpolate(frame, [15 + i * 8, 55 + i * 8], [0, Number(p.current) || 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const barTarget = interpolate(frame, [35 + i * 8, 80 + i * 8], [Number(p.current) || 0, Number(p.target) || 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

              return (
                <div key={p.label} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontFamily: "sans-serif" }}>
                    <span style={{ fontSize: 17, color: "rgba(255,255,255,0.6)" }}>{p.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16, color: "rgba(255,255,255,0.35)" }}>{currentAnim}</span>
                      <span style={{ fontSize: 14, color: "rgba(255,255,255,0.2)" }}>→</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: p.color }}>{targetAnim}</span>
                    </div>
                  </div>
                  {/* Stacked bar: current (dim) + projected overlay */}
                  <div style={{ height: 12, background: "rgba(255,255,255,0.05)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barNow}%`, background: `${p.color}40`, borderRadius: 6 }} />
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barTarget}%`, background: p.color, borderRadius: 6, boxShadow: `0 0 12px ${p.color}60` }} />
                  </div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 13, color: "#00f5a0", marginTop: 4, fontWeight: 600 }}>
                    +{p.target - p.current} points improvement
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA card */}
          <div style={{ opacity: childOpacity(4), padding: "26px 24px", background: `linear-gradient(135deg, ${brandColor}18, rgba(0,223,255,0.06))`, border: `1px solid ${brandColor}30`, borderRadius: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `linear-gradient(135deg, ${brandColor}, #00dfff)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>
                {agencyName.charAt(0)}
              </div>
              <div style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 22, color: "#eef2ff" }}>{agencyName}</div>
            </div>
            <div style={{ fontFamily: "sans-serif", fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, marginBottom: 16 }}>
              Use the <strong style={{ color: "#eef2ff" }}>Fix with AI</strong> button on each issue to auto-generate the correct code fix in seconds.
            </div>
            {["✦ AI Fix assistant on every issue", "🛠 DIY step-by-step guides", "🤝 Expert help available"].map((f) => (
              <div key={f} style={{ fontFamily: "sans-serif", fontSize: 15, color: "#00f5a0", marginBottom: 6 }}>{f}</div>
            ))}
          </div>

          {/* Domain */}
          <div style={{ opacity: childOpacity(6), marginTop: 20, textAlign: "center" }}>
            <div style={{ fontFamily: "sans-serif", fontSize: 16, color: "rgba(255,255,255,0.25)" }}>
              Report for <span style={{ color: "rgba(255,255,255,0.5)" }}>{overview.site.domain}</span> · {overview.audit_date}
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>07 / 07</div>
    </AbsoluteFill>
  );
};
