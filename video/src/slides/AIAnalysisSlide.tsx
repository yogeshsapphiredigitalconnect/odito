// remotion/slides/AIAnalysisSlide.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    aiAnalysis: {
      score: number;
      schemaMarkupCount: number;
      hasKnowledgeGraph: boolean;
    };
    scores: {
      aiVisibility: number;
    };
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
    score: data.aiAnalysis?.score || data.scores?.aiVisibility || 70,
    schemaMarkupCount: data.aiAnalysis?.schemaMarkupCount || 12,
    hasKnowledgeGraph: data.aiAnalysis?.hasKnowledgeGraph || false,
  };

  const aiMetrics = [
    { 
      score: aiData.score, 
      label: "AI Score", 
      color: aiData.score >= 80 ? "#00f5a0" : aiData.score >= 60 ? "#ffb703" : "#ff3860",
      delay: 10 
    },
    { 
      score: Math.min(100, aiData.schemaMarkupCount * 8), 
      label: "Schema Coverage", 
      color: "#c77dff",
      delay: 20 
    },
    { 
      score: aiData.hasKnowledgeGraph ? 85 : 35, 
      label: "Knowledge Graph", 
      color: aiData.hasKnowledgeGraph ? "#00f5a0" : "#ff3860",
      delay: 30 
    },
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
        totalSlides={11}
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

        {/* AI Metrics Grid */}
        <div
          style={{
            opacity: childOpacity(1),
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 40,
            marginBottom: 40,
          }}
        >
          {aiMetrics.map((metric) => (
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
                  color: metric.color,
                  fontFamily: "sans-serif",
                }}
              >
                {metric.label === "AI Score" ? aiReadinessLevel :
                 metric.label === "Schema Coverage" ? `${aiData.schemaMarkupCount} schemas` :
                 metric.label === "Knowledge Graph" ? (aiData.hasKnowledgeGraph ? "Verified" : "Missing") : ""}
              </div>
            </div>
          ))}
        </div>

        {/* AI Insights */}
        <div
          style={{
            opacity: childOpacity(2),
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
            marginBottom: 30,
          }}
        >
          {/* Schema Analysis */}
          <div
            style={{
              padding: "24px 28px",
              background: "rgba(199,125,255,0.08)",
              border: "1px solid rgba(199,125,255,0.2)",
              borderRadius: 16,
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
              📋 Schema Markup
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#eef2ff",
                fontFamily: "sans-serif",
                marginBottom: 8,
              }}
            >
              {aiData.schemaMarkupCount}
            </div>
            <div
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "sans-serif",
                lineHeight: 1.4,
              }}
            >
              Schema types detected. Add Article, Product, and LocalBusiness schemas for better AI understanding.
            </div>
          </div>

          {/* Knowledge Graph Status */}
          <div
            style={{
              padding: "24px 28px",
              background: aiData.hasKnowledgeGraph ? "rgba(0,245,160,0.08)" : "rgba(255,56,96,0.08)",
              border: aiData.hasKnowledgeGraph ? "1px solid rgba(0,245,160,0.2)" : "1px solid rgba(255,56,96,0.2)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: aiData.hasKnowledgeGraph ? "#00f5a0" : "#ff3860",
                fontFamily: "sans-serif",
                marginBottom: 12,
              }}
            >
              {aiData.hasKnowledgeGraph ? "✅ Knowledge Graph" : "❌ Knowledge Graph"}
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: "#eef2ff",
                fontFamily: "sans-serif",
                marginBottom: 8,
              }}
            >
              {aiData.hasKnowledgeGraph ? "Verified" : "Not Found"}
            </div>
            <div
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "sans-serif",
                lineHeight: 1.4,
              }}
            >
              {aiData.hasKnowledgeGraph 
                ? "Your brand entity is established in Google's Knowledge Graph, enhancing AI search visibility."
                : "Claim your Knowledge Graph entity to improve brand recognition and AI search results."}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div
          style={{
            opacity: childOpacity(3),
            padding: "20px 26px",
            background: "linear-gradient(135deg, rgba(199,125,255,0.1), rgba(0,223,255,0.05))",
            border: "1px solid rgba(199,125,255,0.2)",
            borderRadius: 16,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#c77dff",
              fontFamily: "sans-serif",
              marginBottom: 8,
            }}
          >
            🎯 AI Optimization Recommendations
          </div>
          <div
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.7)",
              fontFamily: "sans-serif",
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "#eef2ff" }}>Priority Actions:</strong> 
            {aiData.schemaMarkupCount < 20 && " Implement comprehensive schema markup"}
            {aiData.schemaMarkupCount < 20 && aiData.hasKnowledgeGraph === false && " • "}
            {aiData.hasKnowledgeGraph === false && " Claim and optimize Knowledge Graph entity"}
            {aiData.schemaMarkupCount >= 20 && aiData.hasKnowledgeGraph === true && " Focus on conversational content and FAQ optimization"}
            {" to boost AI search visibility by "}
            <strong style={{ color: "#00f5a0" }}>
              {aiData.score < 60 ? "30-40 points" : aiData.score < 80 ? "15-25 points" : "5-10 points"}
            </strong>
          </div>
        </div>
      </div>

      {/* Slide number */}
      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>
        10 / 11
      </div>
    </AbsoluteFill>
  );
};
