// remotion/slides/PerformanceSummarySlide.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    performanceMetrics: {
      pageSpeed: number;
      mobileScore: number;
      desktopScore: number;
    };
    scores: {
      performance: number;
    };
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
  const { opacity, childOpacity, childY } = useSlideTiming();

  const performanceData = {
    pageSpeed: data.performanceMetrics?.pageSpeed || data.scores?.performance || 75,
    mobileScore: data.performanceMetrics?.mobileScore || 75,
    desktopScore: data.performanceMetrics?.desktopScore || 85,
  };

  const performanceScores = [
    { score: performanceData.pageSpeed, label: "PageSpeed", color: "#00dfff", delay: 10 },
    { score: performanceData.mobileScore, label: "Mobile", color: "#00f5a0", delay: 20 },
    { score: performanceData.desktopScore, label: "Desktop", color: "#ffb703", delay: 30 },
  ];

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: "A", color: "#00f5a0" };
    if (score >= 80) return { grade: "B", color: "#00dfff" };
    if (score >= 70) return { grade: "C", color: "#ffb703" };
    return { grade: "D", color: "#ff3860" };
  };

  const overallGrade = getPerformanceGrade(
    Math.round((performanceData.pageSpeed + performanceData.mobileScore + performanceData.desktopScore) / 3)
  );

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
              background: `${overallGrade.color}10`,
              border: `2px solid ${overallGrade.color}30`,
              borderRadius: 20,
            }}
          >
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: overallGrade.color,
                fontFamily: "sans-serif",
                lineHeight: 1,
              }}
            >
              {overallGrade.grade}
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
                {overallGrade.grade === "A" ? "Excellent" :
                 overallGrade.grade === "B" ? "Good" :
                 overallGrade.grade === "C" ? "Fair" : "Needs Improvement"}
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
                  color: metric.score >= 80 ? "#00f5a0" : metric.score >= 60 ? "#ffb703" : "#ff3860",
                  fontFamily: "sans-serif",
                }}
              >
                {metric.score >= 90 ? "Excellent" : 
                 metric.score >= 80 ? "Good" : 
                 metric.score >= 70 ? "Fair" : "Poor"}
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
              {performanceData.mobileScore < performanceData.desktopScore 
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
