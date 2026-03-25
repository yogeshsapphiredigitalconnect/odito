// remotion/slides/AIDetailedMetricsSlide.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    detailedMetrics: {
      schemaCoverage?: number;
      faqOptimization?: number;
      conversationalScore?: number;
      aiSnippetProbability?: number;
      aiCitationRate?: number;
      knowledgeGraph?: number;
    };
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return "#00f5a0";
  if (score >= 60) return "#ffb703";
  return "#ff3860";
};

const getScoreLabel = (score: number): string => {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  return "Poor";
};

export const AIDetailedMetricsSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("AIDetailedMetricsSlide: Missing slide data");
    return (
      <AbsoluteFill style={{ background: "#030912", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 24, opacity: 0.7 }}>Loading AI Detailed Metrics...</div>
      </AbsoluteFill>
    );
  }

  console.log("AI Detailed Metrics Data:", data);
  
  const { opacity, childOpacity, childY, scoreCounter } = useSlideTiming();

  // Convert detailedMetrics object to array for rendering
  const metricsArray = Object.entries(data.detailedMetrics || {}).map(([name, score]) => ({
    name,
    score: score || 0
  }));

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: -200,
          right: -200,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${brandColor}12, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={12}
        totalSlides={13}
        slideTitle="AI Detailed Metrics"
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
            marginBottom: 50,
            textAlign: "center",
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
              fontSize: 52,
              fontWeight: 800,
              color: "#eef2ff",
              fontFamily: "sans-serif",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 12,
            }}
          >
            AI Detailed Metrics
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            Comprehensive AI visibility performance indicators
          </div>
        </div>

        {/* Metrics Grid */}
        <div
          style={{
            opacity: childOpacity(1),
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 32,
            maxWidth: 900,
            margin: "0 auto",
          }}
        >
          {metricsArray.map((metric, i) => {
            const scoreColor = getScoreColor(metric.score);
            const animatedScore = scoreCounter(metric.score, 15 + i * 5);
            
            return (
              <div
                key={metric.name}
                style={{
                  padding: "32px 24px",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${scoreColor}20`,
                  borderRadius: 16,
                  textAlign: "center",
                  transform: `translateY(${childY(1 + i) * 0.3}px)`,
                }}
              >
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontFamily: "sans-serif",
                    marginBottom: 16,
                  }}
                >
                  {metric.name}
                </div>
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 800,
                    color: scoreColor,
                    fontFamily: "sans-serif",
                    lineHeight: 1,
                    marginBottom: 12,
                  }}
                >
                  {animatedScore}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: scoreColor,
                    fontFamily: "sans-serif",
                    padding: "6px 12px",
                    background: `${scoreColor}15`,
                    borderRadius: 8,
                    display: "inline-block",
                  }}
                >
                  {getScoreLabel(metric.score)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Performance Summary */}
        <div
          style={{
            opacity: childOpacity(4),
            marginTop: 40,
            padding: "20px 28px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            maxWidth: 700,
            margin: "40px auto 0",
            textAlign: "center",
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
            📊 <strong style={{ color: "#eef2ff" }}>Performance Overview:</strong> {metricsArray.filter(m => m.score >= 80).length} excellent, {metricsArray.filter(m => m.score >= 60 && m.score < 80).length} good, {metricsArray.filter(m => m.score < 60).length} needs improvement
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
        12 / 13
      </div>
    </AbsoluteFill>
  );
};
