// remotion/slides/AIScoreBreakdownSlide.tsx
import React from "react";
import { AbsoluteFill } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { ChartBar } from "../components_new/ChartBar";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    categories: {
      aiImpact?: number;
      citationProbability?: number;
      llmReadiness?: number;
      aeoScore?: number;
      topicalAuthority?: number;
      voiceIntent?: number;
    };
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  aiImpact: "#c77dff",
  citationProbability: "#00f5a0", 
  conversationalScore: "#00dfff",
  faqOptimization: "#ffb703",
  schemaCoverage: "#7730ed",
  knowledgeGraph: "#06b6d4"
};

export const AIScoreBreakdownSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("AIScoreBreakdownSlide: Missing slide data");
    return (
      <AbsoluteFill style={{ background: "#030912", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 24, opacity: 0.7 }}>Loading AI Category Breakdown...</div>
      </AbsoluteFill>
    );
  }

  console.log("AI Score Breakdown Data:", data);
  
  const { opacity, childOpacity, childY } = useSlideTiming();

  // Convert categories object to array for rendering
  const categoriesArray = Object.entries(data.categories || {}).map(([label, score]) => ({
    label,
    score: score || 0
  }));

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${brandColor}15, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={11}
        totalSlides={13}
        slideTitle="AI Category Breakdown"
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
            ✦ AI Performance Analysis
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
            AI Category Breakdown
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            Performance scores across AI visibility categories
          </div>
        </div>

        {/* Category Bars */}
        <div
          style={{
            opacity: childOpacity(1),
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {categoriesArray.map((category, i) => {
            const color = CATEGORY_COLORS[category.label] || brandColor;
            return (
              <ChartBar
                key={category.label}
                label={category.label}
                value={category.score}
                maxValue={100}
                color={color}
                startFrame={20}
                index={i}
                unit="%"
                height={12}
              />
            );
          })}
        </div>

        {/* Summary Insight */}
        <div
          style={{
            opacity: childOpacity(2),
            marginTop: 40,
            padding: "20px 28px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            maxWidth: 700,
            margin: "40px auto 0",
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
            🎯 <strong style={{ color: "#eef2ff" }}>Key Insight:</strong> Categories scoring below 60% need immediate attention for optimal AI visibility performance
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
        11 / 13
      </div>
    </AbsoluteFill>
  );
};
