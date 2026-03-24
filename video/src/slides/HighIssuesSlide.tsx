// remotion/slides/HighIssuesSlide.tsx
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

export const HighIssuesSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("HighIssuesSlide: Missing slide data");
    return null;
  }

  console.log("HighIssuesSlide Data:", data);
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const highIssues = data?.issues || [];

  // Safety check - ensure we have an array
  if (!Array.isArray(highIssues)) {
    console.warn("HighIssuesSlide: data.issues is not an array, using fallback");
    return null;
  }

  // Fallback issues if none provided
  const fallbackIssues = [
    "Missing Meta Descriptions",
    "H1 Tag Optimization Needed", 
    "Internal Linking Gaps",
    "Image ALT Text Missing"
  ];

  const issuesToShow = highIssues.length > 0 ? highIssues : fallbackIssues.slice(0, 4);

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
          background: "radial-gradient(circle, rgba(255,107,53,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={4}
        totalSlides={11}
        slideTitle="High Priority Issues"
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
              color: "#ff6b35",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              fontFamily: "sans-serif",
              marginBottom: 14,
            }}
          >
            ⚠️ High Priority
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
            High Issues
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            {issuesToShow.length} issue{issuesToShow.length !== 1 ? 's' : ''} requiring attention
          </div>
        </div>

        {/* Issues List */}
        <div
          style={{
            opacity: childOpacity(1),
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 24,
          }}
        >
          {issuesToShow.map((issue, i) => {
            const issueTitle = typeof issue === 'string' ? issue : issue.title;
            const itemDelay = 15 + i * 8;
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 20], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemY = interpolate(frame, [itemDelay, itemDelay + 20], [20, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  transform: `translateY(${itemY}px)`,
                  padding: "24px 28px",
                  background: "rgba(255,107,53,0.08)",
                  border: "1px solid rgba(255,107,53,0.2)",
                  borderRadius: 16,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(255,107,53,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#ff6b35",
                    fontWeight: 800,
                    fontSize: 18,
                    fontFamily: "sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#eef2ff",
                      fontFamily: "sans-serif",
                      marginBottom: 8,
                      lineHeight: 1.3,
                    }}
                  >
                    {issueTitle}
                  </div>
                  <div
                    style={{
                      fontSize: 15,
                      color: "rgba(255,255,255,0.5)",
                      fontFamily: "sans-serif",
                      lineHeight: 1.4,
                    }}
                  >
                    Impact on search rankings and user experience. Fix recommended within 1-2 weeks.
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 10px",
                        background: "rgba(255,107,53,0.15)",
                        color: "#ff6b35",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "sans-serif",
                        borderRadius: 6,
                      }}
                    >
                      High Impact
                    </span>
                    <span
                      style={{
                        padding: "4px 10px",
                        background: "rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: 13,
                        fontWeight: 600,
                        fontFamily: "sans-serif",
                        borderRadius: 6,
                      }}
                    >
                      Medium Effort
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom recommendation */}
        <div
          style={{
            opacity: childOpacity(3),
            marginTop: 40,
            padding: "20px 28px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
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
            🎯 <strong style={{ color: "#eef2ff" }}>Quick Win:</strong> Addressing these high-priority issues could improve SEO performance by 15-25% within 30 days
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
        04 / 11
      </div>
    </AbsoluteFill>
  );
};
