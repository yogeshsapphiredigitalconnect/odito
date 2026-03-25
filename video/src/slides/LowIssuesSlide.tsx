// remotion/slides/LowIssuesSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    issues: Array<{
      issue: string;
      severity: string;
      pages: number;
      count: number;
      recommendation: string;
    }>;
    count: number;
    totalLow: number;
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const LowIssuesSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("LowIssuesSlide: Missing slide data");
    return null;
  }

  console.log("Low Issues:", {
    total: data.totalLow,
    shown: data.count,
    issues: data.issues
  });
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const lowIssues = data?.issues || [];
  const totalLow = data?.totalLow || 0;

  // Safety check - ensure we have an array
  if (!Array.isArray(lowIssues)) {
    console.warn("LowIssuesSlide: data.issues is not an array, using fallback");
    return null;
  }

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          bottom: -150,
          right: -150,
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,223,255,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={6}
        totalSlides={11}
        slideTitle="Low Priority Issues"
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
            marginBottom: 30,
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
            ℹ️ Low Priority
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
            Low Issues
          </div>
          <div
            style={{
              fontSize: 24,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            {totalLow} low-priority issues detected
          </div>
        </div>

        {/* Issues Grid - 2x4 layout */}
        <div
          style={{
            opacity: childOpacity(1),
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
          }}
        >
          {lowIssues.map((item, i) => {
            const itemDelay = 10 + i * 5;
            const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemScale = interpolate(frame, [itemDelay, itemDelay + 15], [0.95, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={i}
                style={{
                  opacity: itemOpacity,
                  transform: `scale(${itemScale})`,
                  padding: "16px 20px",
                  background: "rgba(0,223,255,0.04)",
                  border: "1px solid rgba(0,223,255,0.12)",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(0,223,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#00dfff",
                    fontWeight: 700,
                    fontSize: 14,
                    fontFamily: "sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 600,
                      color: "#eef2ff",
                      fontFamily: "sans-serif",
                      marginBottom: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    {item.issue}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "sans-serif",
                    }}
                  >
                    {item.recommendation}
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
            marginTop: 25,
            padding: "16px 22px",
            background: "rgba(0,223,255,0.06)",
            border: "1px solid rgba(0,223,255,0.15)",
            borderRadius: 12,
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
            🔧 <strong style={{ color: "#eef2ff" }}>Fine-tuning:</strong> Address these low-priority items during routine maintenance or when time permits for incremental improvements
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
        06 / 11
      </div>
    </AbsoluteFill>
  );
};
