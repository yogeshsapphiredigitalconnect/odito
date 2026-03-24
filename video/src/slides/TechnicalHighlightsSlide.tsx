// remotion/slides/TechnicalHighlightsSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    criticalIssues?: Array<{
      title: string;
      severity?: string;
      pages?: number;
      count?: number;
      recommendation?: string;
    }>;
    topRecommendations?: Array<{
      title: string;
      severity?: string;
      pages?: number;
      count?: number;
      recommendation?: string;
    }>;
    scores?: {
      technical: number;
    };
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const TechnicalHighlightsSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("TechnicalHighlightsSlide: Missing slide data");
    return null;
  }

  console.log("TechnicalHighlightsSlide Data:", data);
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const criticalIssues = data?.criticalIssues || [];
  const recommendations = data?.topRecommendations || [];

  // Safety checks - ensure we have arrays
  if (!Array.isArray(criticalIssues)) {
    console.warn("TechnicalHighlightsSlide: data.criticalIssues is not an array, using fallback");
  }
  if (!Array.isArray(recommendations)) {
    console.warn("TechnicalHighlightsSlide: data.topRecommendations is not an array, using fallback");
  }

  // Fallback data if none provided
  const fallbackCriticalIssues = [
    "XML Sitemap Missing",
    "Robots.txt Configuration",
    "Canonical Tag Implementation"
  ];

  const fallbackRecommendations = [
    "Implement HTTPS Everywhere",
    "Optimize Crawl Budget",
    "Add Structured Data Markup",
    "Improve Page Load Speed"
  ];

  const issuesToShow = criticalIssues.length > 0 ? criticalIssues : fallbackCriticalIssues;
  const recommendationsToShow = recommendations.length > 0 ? recommendations : fallbackRecommendations;

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: "50%",
          width: 900,
          height: 900,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,183,3,0.05), transparent 70%)",
          pointerEvents: "none",
          transform: "translateX(-50%)",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={7}
        totalSlides={11}
        slideTitle="Technical Highlights"
      />

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          bottom: 0,
          display: "grid",
          gridTemplateColumns: "320px 1fr",
          gap: 0,
          opacity,
        }}
      >
        {/* LEFT: Technical Score + Critical Issues */}
        <div style={{ padding: "50px 30px 50px 80px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, textAlign: "center", marginBottom: 30 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffb703", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 16 }}>
              🔧 Technical Health
            </div>
            <GaugeScore 
              score={data.scores?.technical || 75} 
              label="Tech Score" 
              size={170} 
              color={(data.scores?.technical || 75) >= 80 ? "#00f5a0" : (data.scores?.technical || 75) >= 60 ? "#ffb703" : "#ff3860"} 
              startFrame={12} 
            />
          </div>

          <div style={{ opacity: childOpacity(2), marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "sans-serif", marginBottom: 12 }}>
              Critical Issues ({issuesToShow.length})
            </div>
            {issuesToShow.slice(0, 3).map((issue, i) => {
            const issueTitle = typeof issue === 'string' ? issue : issue.title;
            const itemDelay = 25 + i * 8;
              const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 15], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              });
              return (
                <div
                  key={i}
                  style={{
                    opacity: itemOpacity,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    background: "rgba(255,56,96,0.08)",
                    border: "1px solid rgba(255,56,96,0.2)",
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff3860", flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif" }}>
                    {issueTitle}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Top Recommendations */}
        <div style={{ padding: "50px 80px 50px 50px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 30 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#eef2ff", fontFamily: "sans-serif", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              Technical Recommendations
            </div>
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif", marginTop: 6 }}>
              Priority improvements for technical SEO
            </div>
          </div>

          {recommendationsToShow.map((recommendation, i) => {
            const recommendationTitle = typeof recommendation === 'string' ? recommendation : recommendation.title;
            const delay = 18 + i * 10;
            const op = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const tx = interpolate(frame, [delay, delay + 18], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            return (
              <div
                key={i}
                style={{
                  opacity: op,
                  transform: `translateX(${tx}px)`,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "18px 22px",
                  background: "rgba(255,183,3,0.06)",
                  border: "1px solid rgba(255,183,3,0.15)",
                  borderRadius: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,183,3,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", fontWeight: 800, fontSize: 18, color: "#ffb703", flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 20, color: "#eef2ff", marginBottom: 4 }}>{recommendationTitle}</div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
                    {i === 0 && "Essential for security and search rankings"}
                    {i === 1 && "Improve crawling efficiency and index coverage"}
                    {i === 2 && "Enhance search result appearance and CTR"}
                    {i === 3 && "Direct impact on user experience and rankings"}
                  </div>
                </div>
                <div style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, padding: "5px 12px", background: "rgba(255,183,3,0.12)", color: "#ffb703", borderRadius: 8, flexShrink: 0 }}>
                  {i === 0 ? "Critical" : i === 1 ? "High" : "Medium"}
                </div>
              </div>
            );
          })}

          {/* Technical insight */}
          <div style={{ opacity: childOpacity(5), marginTop: 20, padding: "18px 22px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 }}>
            <div style={{ fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.5 }}>
              ⚙️ <strong style={{ color: "#eef2ff" }}>Technical Foundation:</strong> Strong technical SEO ensures search engines can efficiently crawl, index, and understand your content
            </div>
          </div>
        </div>
      </div>

      {/* Slide number */}
      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>
        07 / 11
      </div>
    </AbsoluteFill>
  );
};
