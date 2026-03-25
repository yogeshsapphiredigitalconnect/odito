// remotion/slides/TechnicalIssuesSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { TechnicalData, SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: TechnicalData;
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

const STATUS_COLOR = { critical: "#ff3860", warning: "#ffb703", passed: "#00f5a0" };
const STATUS_ICON  = { critical: "✗", warning: "⚠", passed: "✓" };

export const TechnicalIssuesSlide: React.FC<Props> = ({ data, narration, brandColor = "#7730ed", agencyName = "AuditIQ" }) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("TechnicalIssuesSlide: Missing slide data");
    return null;
  }

  console.log("TechnicalIssuesSlide Data:", data);
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      <div style={{ position: "absolute", top: -150, left: "50%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,183,3,0.05), transparent 70%)", pointerEvents: "none" }} />

      <LogoHeader agencyName={agencyName} brandColor={brandColor} slideNumber={3} totalSlides={7} slideTitle="Technical SEO" />

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, bottom: 0, display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, opacity }}>

        {/* LEFT: Health score + summary pills */}
        <div style={{ padding: "50px 30px 50px 80px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, textAlign: "center", marginBottom: 30 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffb703", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 16 }}>⚙ Technical Health</div>
            <GaugeScore score={data.health_score || 0} label="Tech Score" size={190} color={(data.health_score || 0) >= 80 ? "#00f5a0" : (data.health_score || 0) >= 60 ? "#ffb703" : "#ff3860"} startFrame={12} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", opacity: childOpacity(2) }}>
            {[
              { label: "Critical", count: data?.critical_count || 0, color: "#ff3860" },
              { label: "Warnings",  count: data.warning_count || 0,  color: "#ffb703" },
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: `${s.color}10`, border: `1px solid ${s.color}25`, borderRadius: 10 }}>
                <span style={{ fontFamily: "sans-serif", fontSize: 16, color: "rgba(255,255,255,0.6)" }}>{s.label}</span>
                <span style={{ fontFamily: "sans-serif", fontSize: 24, fontWeight: 800, color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Checks list */}
        <div style={{ padding: "50px 80px 50px 50px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 30 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: "#eef2ff", fontFamily: "sans-serif", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Technical Checks
            </div>
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", marginTop: 6 }}>
              {data.checks.length} checks run across your site
            </div>
          </div>

          {(data?.checks || []).map((check, i) => {
            const delay = 18 + i * 10;
            const op = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const tx = interpolate(frame, [delay, delay + 18], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const color = STATUS_COLOR[check.status];
            const icon = STATUS_ICON[check.status];

            return (
              <div
                key={check.name}
                style={{
                  opacity: op,
                  transform: `translateX(${tx}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  padding: "18px 22px",
                  background: `${color}08`,
                  border: `1px solid ${color}22`,
                  borderLeft: `3px solid ${color}`,
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", fontWeight: 800, fontSize: 18, color, flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 20, color: "#eef2ff", marginBottom: 3 }}>{check.name}</div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.45)" }}>{check.detail}</div>
                </div>
                {check.affected_urls && check.affected_urls > 0 && (
                  <div style={{ fontFamily: "sans-serif", fontSize: 14, fontWeight: 700, padding: "4px 10px", background: `${color}15`, color, borderRadius: 6, flexShrink: 0 }}>
                    {check.affected_urls} URLs
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>03 / 07</div>
    </AbsoluteFill>
  );
};
