// remotion/slides/PageSpeedSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PageSpeedData, SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: PageSpeedData;
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

function cwvColor(metric: string, value: number) {
  const thresholds: Record<string, [number, number]> = {
    fcp:  [1800, 3000],
    lcp:  [2500, 4000],
    tbt:  [200,  600],
    cls:  [0.1,  0.25],
    si:   [3400, 5800],
    ttfb: [800,  1800],
  };
  const t = thresholds[metric];
  if (!t) return "#00dfff";
  if (value <= t[0]) return "#00f5a0";
  if (value <= t[1]) return "#ffb703";
  return "#ff3860";
}

function msLabel(ms: number) {
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

export const PageSpeedSlide: React.FC<Props> = ({ data, narration, brandColor = "#7730ed", agencyName = "AuditIQ" }) => {
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const cwv = [
    { id: "fcp",  label: "First Contentful Paint", value: data.fcp_ms,  max: 4000, display: msLabel(data.fcp_ms) },
    { id: "lcp",  label: "Largest Contentful Paint",value: data.lcp_ms,  max: 5000, display: msLabel(data.lcp_ms) },
    { id: "tbt",  label: "Total Blocking Time",     value: data.tbt_ms,  max: 800,  display: msLabel(data.tbt_ms) },
    { id: "si",   label: "Speed Index",             value: data.si_ms,   max: 6000, display: msLabel(data.si_ms) },
    { id: "ttfb", label: "Time to First Byte",      value: data.ttfb_ms, max: 2000, display: msLabel(data.ttfb_ms) },
  ];

  const lighthouseScores = [
    { label: "Performance",    score: data.performance_score,    color: data.performance_score >= 90 ? "#00f5a0" : data.performance_score >= 50 ? "#ffb703" : "#ff3860" },
    { label: "Accessibility",  score: data.accessibility_score,  color: data.accessibility_score >= 90 ? "#00f5a0" : "#ffb703" },
    { label: "Best Practices", score: data.best_practices_score, color: data.best_practices_score >= 90 ? "#00f5a0" : "#ffb703" },
    { label: "SEO",            score: data.seo_score,            color: data.seo_score >= 90 ? "#00f5a0" : "#ffb703" },
  ];

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      <div style={{ position: "absolute", bottom: -200, right: -100, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,223,255,0.05), transparent 70%)", pointerEvents: "none" }} />

      <LogoHeader agencyName={agencyName} brandColor={brandColor} slideNumber={4} totalSlides={7} slideTitle="PageSpeed" />

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, bottom: 0, display: "grid", gridTemplateColumns: "340px 1fr", opacity }}>

        {/* LEFT: Performance ring + Lighthouse scores */}
        <div style={{ padding: "45px 30px 45px 80px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#00dfff", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 16 }}>
              ⚡ {data.device === "mobile" ? "Mobile" : "Desktop"} Performance
            </div>
          </div>

          <div style={{ opacity: childOpacity(1), display: "flex", justifyContent: "center", marginBottom: 30 }}>
            <GaugeScore
              score={data.performance_score}
              label="Performance"
              size={200}
              color={data.performance_score >= 90 ? "#00f5a0" : data.performance_score >= 50 ? "#ffb703" : "#ff3860"}
              startFrame={12}
            />
          </div>

          {/* Lighthouse mini scores */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: childOpacity(2) }}>
            {lighthouseScores.map((ls, i) => {
              const w = interpolate(frame, [20 + i * 8, 60 + i * 8], [0, ls.score], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={ls.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)", width: 120, flexShrink: 0 }}>{ls.label}</div>
                  <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${w}%`, height: "100%", background: ls.color, borderRadius: 3 }} />
                  </div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: ls.color, width: 36, textAlign: "right" }}>{ls.score}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Core Web Vitals + opportunities */}
        <div style={{ padding: "45px 80px 45px 50px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 28 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#eef2ff", fontFamily: "sans-serif", lineHeight: 1.1, letterSpacing: "-0.03em" }}>Core Web Vitals</div>
            <div style={{ fontSize: 18, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", marginTop: 6 }}>Measured on {data.url}</div>
          </div>

          {/* CWV bars */}
          <div style={{ marginBottom: 32 }}>
            {cwv.map((v, i) => {
              const color = cwvColor(v.id, v.value);
              const barW = interpolate(frame, [18 + i * 10, 58 + i * 10], [0, Math.min((v.value / v.max) * 100, 100)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              const op = interpolate(frame, [15 + i * 10, 30 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={v.id} style={{ opacity: op, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontFamily: "sans-serif" }}>
                    <span style={{ fontSize: 18, color: "rgba(255,255,255,0.65)" }}>{v.label}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color }}>{v.display}</span>
                  </div>
                  <div style={{ height: 10, background: "rgba(255,255,255,0.06)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ width: `${barW}%`, height: "100%", background: color, borderRadius: 5, boxShadow: `0 0 10px ${color}60` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* CLS special display */}
          <div style={{ opacity: childOpacity(4), display: "flex", gap: 14, marginBottom: 28 }}>
            <div style={{ padding: "14px 20px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
              <div style={{ fontFamily: "sans-serif", fontSize: 12, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>CLS</div>
              <div style={{ fontFamily: "sans-serif", fontSize: 28, fontWeight: 800, color: data.cls <= 0.1 ? "#00f5a0" : data.cls <= 0.25 ? "#ffb703" : "#ff3860" }}>{data.cls.toFixed(3)}</div>
            </div>
          </div>

          {/* Top opportunities */}
          <div style={{ opacity: childOpacity(5) }}>
            <div style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Top Opportunities</div>
            {data.top_opportunities.map((opp, i) => {
              const op = interpolate(frame, [50 + i * 8, 65 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={opp.title} style={{ opacity: op, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,183,3,0.05)", border: "1px solid rgba(255,183,3,0.15)", borderRadius: 10, marginBottom: 8 }}>
                  <span style={{ fontFamily: "sans-serif", fontSize: 17, color: "rgba(255,255,255,0.7)" }}>{opp.title}</span>
                  <span style={{ fontFamily: "sans-serif", fontSize: 16, fontWeight: 700, color: "#00f5a0", flexShrink: 0, marginLeft: 16 }}>-{opp.savings}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>04 / 07</div>
    </AbsoluteFill>
  );
};
