// remotion/slides/OverviewSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { OverviewData, SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: OverviewData;
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
  logoUrl?: string;
}

export const OverviewSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
  logoUrl,
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("OverviewSlide: Missing slide data");
    return null;
  }

  console.log("OverviewSlide Data:", data);
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  // Background gradient pulse
  const glowOpacity = interpolate(frame, [0, 60, 120], [0, 0.15, 0.08], {
    extrapolateRight: "clamp",
  });

  const scores = [
    { score: data.scores?.seo_health || 0,    label: "SEO Health",    color: "#00f5a0", delay: 10 },
    { score: data.scores?.ai_visibility || 0, label: "AI Visibility", color: "#c77dff", delay: 20 },
    { score: data.scores?.performance || 0,   label: "Performance",   color: "#00dfff", delay: 30 },
    { score: data.scores?.authority || 0,     label: "Authority",     color: "#ffb703", delay: 40 },
  ];

  const issuePills = [
    { label: "Critical",  count: data?.issues_summary?.critical || 0, color: "#ff3860" },
    { label: "Warnings",  count: data?.issues_summary?.warning || 0, color: "#ffb703" },
    { label: "Info",      count: data?.issues_summary?.info || 0, color: "#00dfff" },
    { label: "Passed",    count: data?.issues_summary?.passed || 0, color: "#00f5a0" },
  ];

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${brandColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        logoUrl={logoUrl}
        brandColor={brandColor}
        slideNumber={1}
        totalSlides={7}
        slideTitle="Overview"
      />

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          padding: "60px 80px",
          gap: 60,
          opacity,
        }}
      >
        {/* LEFT: Headline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div
            style={{
              opacity: childOpacity(0),
              transform: `translateY(${childY(0)}px)`,
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: brandColor,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontFamily: "sans-serif",
                marginBottom: 14,
              }}
            >
              ✦ SEO Audit Report
            </div>
            <div
              style={{
                fontSize: 64,
                fontWeight: 800,
                color: "#eef2ff",
                fontFamily: "sans-serif",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                marginBottom: 12,
              }}
            >
              {data.site?.name || "Unknown Site"}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.45)",
                fontFamily: "sans-serif",
                marginBottom: 36,
              }}
            >
              {data.site?.domain || "localhost"}
            </div>
          </div>

          {/* Issue pills */}
          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              opacity: childOpacity(2),
              transform: `translateY(${childY(2)}px)`,
              marginBottom: 36,
            }}
          >
            {issuePills.map((p) => (
              <div
                key={p.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 18px",
                  background: `${p.color}12`,
                  border: `1px solid ${p.color}30`,
                  borderRadius: 10,
                }}
              >
                <span style={{ color: p.color, fontWeight: 800, fontSize: 22, fontFamily: "sans-serif" }}>
                  {p.count}
                </span>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, fontFamily: "sans-serif" }}>
                  {p.label}
                </span>
              </div>
            ))}
          </div>

          {/* Meta info */}
          <div
            style={{
              opacity: childOpacity(3),
              transform: `translateY(${childY(3)}px)`,
              display: "flex",
              gap: 28,
            }}
          >
            {[
              { label: "Pages Crawled", value: String(data.pages_crawled || "N/A") },
              { label: "Audit Date",    value: data.audit_date || new Date().toLocaleDateString() },
            ].map((m) => (
              <div key={m.label} style={{ fontFamily: "sans-serif" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#eef2ff" }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: 4 Score rings */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 32,
            alignContent: "center",
            opacity: childOpacity(1),
          }}
        >
          {scores.map((s) => (
            <GaugeScore
              key={s.label}
              score={s.score}
              label={s.label}
              size={210}
              color={s.color}
              startFrame={s.delay}
            />
          ))}
        </div>
      </div>

      {/* Slide number */}
      <div
        style={{
          position: "absolute",
          bottom: 28,
          right: 60,
          fontFamily: "sans-serif",
          fontSize: 15,
          color: "rgba(255,255,255,0.2)",
        }}
      >
        01 / 07
      </div>
    </AbsoluteFill>
  );
};
