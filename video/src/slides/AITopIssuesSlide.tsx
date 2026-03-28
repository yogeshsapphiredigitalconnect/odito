// remotion/slides/AITopIssuesSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    topIssues: Array<{
      title: string;
      score: number;
      severity?: string;
      recommendation?: string;
    }>;
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

const getSeverityColor = (score: number): string => {
  if (score <= 30) return "#ff3860";  // Critical - Red
  if (score <= 50) return "#ff6b35";  // High - Orange-Red
  return "#ffb703";                   // Medium - Yellow
};

const getSeverityLabel = (score: number): string => {
  if (score <= 30) return "Critical";
  if (score <= 50) return "High";
  return "Medium";
};

const getSeverityIcon = (score: number): string => {
  if (score <= 30) return "🚨";
  if (score <= 50) return "⚠️";
  return "⚡";
};

export const AITopIssuesSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("AITopIssuesSlide: Missing slide data");
    return (
      <AbsoluteFill style={{ background: "#030912", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 24, opacity: 0.7 }}>Loading AI Top Issues...</div>
      </AbsoluteFill>
    );
  }

  console.log("AI Top Issues Data:", data);
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const issues = data.topIssues || [];

  // Safety check - ensure we have exactly 3 issues max
  const displayIssues = issues.slice(0, 3);

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: -150,
          right: -150,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,56,96,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={13}
        totalSlides={13}
        slideTitle="AI Top Issues"
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
              color: "#ff3860",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontFamily: "sans-serif",
              marginBottom: 14,
            }}
          >
            🚨 Priority Issues
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
            AI Top Issues
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            Top {displayIssues.length} critical issues impacting AI visibility
          </div>
        </div>

        {/* Issues List */}
        <div
          style={{
            opacity: childOpacity(1),
            maxWidth: 800,
            margin: "0 auto",
          }}
        >
          {displayIssues.map((issue, i) => {
            const severityColor = getSeverityColor(issue.score);
            const severityLabel = getSeverityLabel(issue.score);
            const severityIcon = getSeverityIcon(issue.score);
            
            const itemDelay = 15 + i * 10;
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 25], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemY = interpolate(frame, [itemDelay, itemDelay + 25], [30, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  transform: `translateY(${itemY}px)`,
                  padding: "28px 32px",
                  background: `${severityColor}08`,
                  border: `1px solid ${severityColor}25`,
                  borderRadius: 16,
                  marginBottom: i < displayIssues.length - 1 ? 20 : 0,
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                }}
              >
                {/* Issue Number */}
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: `${severityColor}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: severityColor,
                    fontWeight: 800,
                    fontSize: 20,
                    fontFamily: "sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>

                {/* Issue Content */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 700,
                      color: "#eef2ff",
                      fontFamily: "sans-serif",
                      marginBottom: 8,
                      lineHeight: 1.3,
                    }}
                  >
                    {issue.title}
                  </div>
                  
                  {/* Recommendation */}
                  {issue.recommendation && (
                    <p
                      className="recommendation"
                      style={{
                        fontSize: 15,
                        color: "rgba(255,255,255,0.5)",
                        fontFamily: "sans-serif",
                        lineHeight: 1.4,
                        marginBottom: 12,
                        fontStyle: "italic"
                      }}
                    >
                      {issue.recommendation}
                    </p>
                  )}
                  
                  {/* Severity Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 18,
                      }}
                    >
                      {severityIcon}
                    </span>
                    <span
                      style={{
                        padding: "6px 14px",
                        background: `${severityColor}15`,
                        color: severityColor,
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: "sans-serif",
                        borderRadius: 8,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {severityLabel}
                    </span>
                    <span
                      style={{
                        padding: "6px 14px",
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 14,
                        fontWeight: 600,
                        fontFamily: "sans-serif",
                        borderRadius: 8,
                      }}
                    >
                      Score: {issue.score}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Recommendation */}
        <div
          style={{
            opacity: childOpacity(3),
            marginTop: 40,
            padding: "20px 28px",
            background: "rgba(255,56,96,0.08)",
            border: "1px solid rgba(255,56,96,0.2)",
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
            🎯 <strong style={{ color: "#eef2ff" }}>Immediate Action Required:</strong> {displayIssues[0]?.recommendation || "Addressing these top issues could improve AI visibility by 20-35%"}
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
        13 / 13
      </div>
    </AbsoluteFill>
  );
};
