// remotion/slides/PerformanceSummarySlide.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    pageSpeed: number;
    mobileScore: number;
    desktopScore: number;
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const PerformanceSummarySlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  console.log("Performance Data:", data);
  
  const { opacity, childOpacity, childY } = useSlideTiming();

  // Correct mapping with fallbacks
  const overall = data?.pageSpeed ?? 0;
  const mobile = data?.mobileScore ?? 0;
  const desktop = data?.desktopScore ?? 0;

  // Dynamic grade logic
  const getGrade = (score: number) => {
    if (score >= 90) return "A";
    if (score >= 75) return "B";
    if (score >= 50) return "C";
    return "D";
  };

  // Dynamic color logic
  const getColor = (score: number) => {
    if (score >= 75) return "green";
    if (score >= 50) return "yellow";
    return "red";
  };

  const grade = getGrade(overall);
  const gradeColor = getColor(overall);

  const performanceScores = [
    { score: overall, label: "PageSpeed", color: "#00dfff", delay: 10 },
    { score: mobile, label: "Mobile", color: "#00f5a0", delay: 20 },
    { score: desktop, label: "Desktop", color: "#ffb703", delay: 30 },
  ];

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Performance gradient */}
      <div
        style={{
          position: "absolute",
          bottom: -200,
          left: -200,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,223,255,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={9}
        totalSlides={11}
        slideTitle="Performance Summary"
      />

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          bottom: 0,
          padding: "60px 80px",
          opacity,
        }}
      >
        {/* Header */}
        <div
          style={{
            opacity: childOpacity(0),
            transform: `translateY(${childY(0)}px)`,
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#00dfff",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontFamily: "sans-serif",
              marginBottom: 14,
            }}
          >
            ⚡ Performance Metrics
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
            Performance Summary
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            Speed and user experience across devices
          </div>
        </div>

        {/* Performance Grade */}
        <div
          style={{
            opacity: childOpacity(1),
            display: "flex",
            justifyContent: "center",
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "20px 30px",
              background: `${gradeColor === 'green' ? '#00f5a0' : gradeColor === 'yellow' ? '#ffb703' : '#ff3860'}10`,
              border: `2px solid ${gradeColor === 'green' ? '#00f5a0' : gradeColor === 'yellow' ? '#ffb703' : '#ff3860'}30`,
              borderRadius: 20,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: gradeColor === 'green' ? '#00f5a0' : gradeColor === 'yellow' ? '#ffb703' : '#ff3860',
                fontFamily: "sans-serif",
                lineHeight: 1,
              }}
            >
              {grade}
            </div>
            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: "#eef2ff",
                  fontFamily: "sans-serif",
                  marginBottom: 4,
                }}
              >
                Overall Performance
              </div>
              <div
                style={{
                  fontSize: 16,
                  color: "rgba(255,255,255,0.5)",
                  fontFamily: "sans-serif",
                }}
              >
                {grade === "A" ? "Excellent" :
                 grade === "B" ? "Good" :
                 grade === "C" ? "Fair" : "Needs Improvement"}
              </div>
            </div>
          </div>
        </div>

        {/* Performance Scores Grid */}
        <div
          style={{
            opacity: childOpacity(2),
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 40,
            marginBottom: 40,
          }}
        >
          {performanceScores.map((metric) => (
            <div key={metric.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <GaugeScore
                score={metric.score}
                label={metric.label}
                size={140}
                color={metric.color}
                startFrame={metric.delay}
              />
              <div
                style={{
                  marginTop: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: metric.score >= 75 ? "#00f5a0" : metric.score >= 50 ? "#ffb703" : "#ff3860",
                  fontFamily: "sans-serif",
                }}
              >
                {metric.score >= 90 ? "Excellent" : 
                 metric.score >= 75 ? "Good" : 
                 metric.score >= 50 ? "Fair" : "Poor"}
              </div>
            </div>
          ))}
        </div>

        {/* Performance Insights */}
        <div
          style={{
            opacity: childOpacity(3),
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          <div
            style={{
              padding: "20px 24px",
              background: "rgba(0,223,255,0.06)",
              border: "1px solid rgba(0,223,255,0.15)",
              borderRadius: 14,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#00dfff",
                fontFamily: "sans-serif",
                marginBottom: 8,
              }}
            >
              📊 Key Insights
            </div>
            <div
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "sans-serif",
                lineHeight: 1.4,
              }}
            >
              {mobile < desktop 
                ? "Mobile performance needs optimization - 60% of traffic is mobile"
                : "Consistent performance across devices provides good user experience"}
            </div>
          </div>

          <div
            style={{
              padding: "20px 24px",
              background: "rgba(0,245,160,0.06)",
              border: "1px solid rgba(0,245,160,0.15)",
              borderRadius: 14,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#00f5a0",
                fontFamily: "sans-serif",
                marginBottom: 8,
              }}
            >
              🎯 Quick Wins
            </div>
            <div
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "sans-serif",
                lineHeight: 1.4,
              }}
            >
              Optimize images and enable compression to improve PageSpeed by 10-15 points
            </div>
          </div>
        </div>
      </div>

      {/* Slide number */}
      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>
        09 / 11
      </div>
    </AbsoluteFill>
  );
};
