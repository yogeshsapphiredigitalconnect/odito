// remotion/slides/AIAnalysisSlide.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    score: number;
    summary: string;
    hasKnowledgeGraph: boolean;
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const AIAnalysisSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  const { opacity, childOpacity, childY } = useSlideTiming();

  const aiData = {
    score: data.score || 70,
    summary: data.summary || "AI analysis data unavailable",
    hasKnowledgeGraph: data.hasKnowledgeGraph || false,
  };

  const aiMetrics = [
    { 
      score: aiData.score, 
      label: "AI Score", 
      color: aiData.score >= 80 ? "#00f5a0" : aiData.score >= 60 ? "#ffb703" : "#ff3860",
      delay: 10 
    }
  ];

  const aiReadinessLevel = aiData.score >= 80 ? "Advanced" : 
                          aiData.score >= 60 ? "Developing" : 
                          aiData.score >= 40 ? "Basic" : "Limited";

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* AI-themed gradient */}
      <div
        style={{
          position: "absolute",
          top: -150,
          right: -150,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(199,125,255,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={10}
        totalSlides={13}
        slideTitle="AI Analysis"
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
              color: "#c77dff",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontFamily: "sans-serif",
              marginBottom: 14,
            }}
          >
            🤖 AI Search Readiness
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
            AI Analysis
          </div>
          <div
            style={{
              fontSize: 28,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            {aiReadinessLevel} AI search optimization
          </div>
        </div>

        {/* AI Score Circle - Centered */}
        <div
          style={{
            opacity: childOpacity(1),
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          {aiMetrics.map((metric) => (
            <div key={metric.label} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <GaugeScore
                score={metric.score}
                label={metric.label}
                size={180}
                color={metric.color}
                startFrame={metric.delay}
              />
              <div
                style={{
                  marginTop: 12,
                  fontSize: 16,
                  fontWeight: 700,
                  color: metric.color,
                  fontFamily: "sans-serif",
                }}
              >
                {aiReadinessLevel}
              </div>
            </div>
          ))}
          
          {/* Knowledge Graph Text */}
          <div
            style={{
              marginTop: 20,
              fontSize: 18,
              fontWeight: 600,
              color: aiData.hasKnowledgeGraph ? "#00f5a0" : "#ff3860",
              fontFamily: "sans-serif",
              textAlign: "center",
            }}
          >
            {aiData.hasKnowledgeGraph 
              ? "Your brand is verified in the Knowledge Graph" 
              : "Your brand is not yet established in the Knowledge Graph"}
          </div>
        </div>

        {/* AI Summary */}
        <div
          style={{
            opacity: childOpacity(2),
            padding: "32px 36px",
            background: "rgba(199,125,255,0.08)",
            border: "1px solid rgba(199,125,255,0.2)",
            borderRadius: 16,
            textAlign: "center",
            maxWidth: 700,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#c77dff",
              fontFamily: "sans-serif",
              marginBottom: 12,
            }}
          >
            📝 AI Analysis Summary
          </div>
          <div
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.85)",
              fontFamily: "sans-serif",
              lineHeight: 1.5,
            }}
          >
            {aiData.summary}
          </div>
        </div>

      </div>

      {/* Slide number */}
      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>
        10 / 13
      </div>
    </AbsoluteFill>
  );
};
