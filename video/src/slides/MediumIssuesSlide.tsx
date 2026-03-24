// remotion/slides/MediumIssuesSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    issues: Array<{
      title: string;
      affected_count?: number;
      severity?: string;
      impact?: string;
    }>;
    count?: number;
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const MediumIssuesSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("MediumIssuesSlide: Missing slide data");
    return null;
  }

  if (!narration) {
    console.warn("MediumIssuesSlide: Missing slide narration");
    return null;
  }

  console.log("MediumIssuesSlide Data:", data);
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const mediumIssues = data?.issues || [];

  // Safety check - ensure we have an array
  if (!Array.isArray(mediumIssues)) {
    console.warn("MediumIssuesSlide: data.issues is not an array, using fallback");
    return null;
  }

  // Fallback issues if none provided
  const fallbackIssues = [
    "Title Tag Length Issues",
    "Meta Description Optimization",
    "Content Length Variations",
    "Heading Structure (H2-H6)",
    "Image File Names Not SEO-Friendly",
    "Missing Structured Data"
  ];

  const issuesToShow = mediumIssues.length > 0 ? mediumIssues : fallbackIssues.slice(0, 6);

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: -150,
          left: -150,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,183,3,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={5}
        totalSlides={11}
        slideTitle="Medium Priority Issues"
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
            marginBottom: 40,
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#ffb703",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontFamily: "sans-serif",
              marginBottom: 14,
            }}
          >
            ⚡ Medium Priority
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
            Medium Issues
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            {issuesToShow.length} issue{issuesToShow.length !== 1 ? 's' : ''} for optimization
          </div>
        </div>

        {/* Issues Grid */}
        <div
          style={{
            opacity: childOpacity(1),
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          {issuesToShow.map((issue, i) => {
            const issueTitle = typeof issue === 'string' ? issue : issue.title;
            const itemDelay = 12 + i * 6;
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 18], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemY = interpolate(frame, [itemDelay, itemDelay + 18], [15, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  transform: `translateY(${itemY}px)`,
                  padding: "20px 24px",
                  background: "rgba(255,183,3,0.06)",
                  border: "1px solid rgba(255,183,3,0.15)",
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(255,183,3,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ffb703",
                    fontWeight: 700,
                    fontSize: 16,
                    fontFamily: "sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#eef2ff",
                      fontFamily: "sans-serif",
                      marginBottom: 6,
                      lineHeight: 1.3,
                    }}
                  >
                    {issueTitle}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "sans-serif",
                      lineHeight: 1.4,
                    }}
                  >
                    Moderate impact on SEO performance
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom insight */}
        <div
          style={{
            opacity: childOpacity(3),
            marginTop: 30,
            padding: "18px 24px",
            background: "rgba(255,183,3,0.08)",
            border: "1px solid rgba(255,183,3,0.2)",
            borderRadius: 14,
          }}
        >
          <div
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.6)",
              fontFamily: "sans-serif",
              lineHeight: 1.5,
            }}
          >
            📈 <strong style={{ color: "#eef2ff" }}>Optimization Opportunity:</strong> These medium-priority fixes can provide steady SEO improvements when addressed over the next 2-4 weeks
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
        05 / 11
      </div>
    </AbsoluteFill>
  );
};
