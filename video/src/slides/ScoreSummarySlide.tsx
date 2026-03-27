// remotion/slides/ScoreSummarySlide.tsx
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { debugInterpolate } from "../debugInterpolate";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    scores: {
      technicalHealth: number;
      performance: number;
      seo: number;
      aiVisibility: number;
    };
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const ScoreSummarySlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const scores = [
    { score: data.scores.technicalHealth, label: "Technical", color: "#7730ed", delay: 10 },
    { score: data.scores.performance, label: "Performance", color: "#00dfff", delay: 20 },
    { score: data.scores.seo, label: "SEO", color: "#00f5a0", delay: 30 },
    { score: data.scores.aiVisibility, label: "AI Visibility", color: "#c77dff", delay: 40 },
  ];

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Background gradient pulse */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${brandColor}${Math.round(debugInterpolate(frame, [0, 60], [0, 0.15], { extrapolateRight: "clamp" }) * 255).toString(16).padStart(2, "0")}, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={2}
        totalSlides={11}
        slideTitle="Score Summary"
      />

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
          opacity,
        }}
      >
        {/* Headline */}
        <div
          style={{
            opacity: childOpacity(0),
            transform: `translateY(${childY(0)}px)`,
            textAlign: "center",
            marginBottom: 60,
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
            ✦ Performance Metrics
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
            Score Summary
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            Key performance indicators at a glance
          </div>
        </div>

        {/* Score Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 60,
            opacity: childOpacity(1),
          }}
        >
          {scores.map((s) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <GaugeScore
                score={s.score}
                label={s.label}
                size={180}
                color={s.color}
                startFrame={s.delay}
              />
              <div
                style={{
                  marginTop: 16,
                  fontSize: 18,
                  fontWeight: 700,
                  color: s.score >= 80 ? "#00f5a0" : s.score >= 60 ? "#ffb703" : "#ff3860",
                  fontFamily: "sans-serif",
                }}
              >
                {s.score >= 80 ? "Excellent" : s.score >= 60 ? "Good" : "Needs Work"}
              </div>
            </div>
          ))}
        </div>

        {/* Overall Assessment */}
        <div
          style={{
            opacity: childOpacity(2),
            marginTop: 50,
            padding: "20px 30px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            textAlign: "center",
            maxWidth: 600,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.6)",
              fontFamily: "sans-serif",
              lineHeight: 1.5,
            }}
          >
            Overall performance is <strong style={{ color: data.scores.technicalHealth >= 80 ? "#00f5a0" : data.scores.technicalHealth >= 60 ? "#ffb703" : "#ff3860" }}>
              {data.scores.technicalHealth >= 80 ? "strong" : data.scores.technicalHealth >= 60 ? "moderate" : "developing"}
            </strong> with key opportunities in"{" "}
            {data.scores.performance < 70 && "performance optimization"}
            {data.scores.performance < 70 && data.scores.aiVisibility < 70 && " and "}
            {data.scores.aiVisibility < 70 && "AI visibility enhancement"}
            {data.scores.performance >= 70 && data.scores.aiVisibility >= 70 && " maintaining current standards"}
          </div>
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
        02 / 11
      </div>
    </AbsoluteFill>
  );
};
