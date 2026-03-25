// remotion/slides/IssueDistributionSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    issueDistribution: {
      total: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const IssueDistributionSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("IssueDistributionSlide: Missing slide data");
    return null;
  }

  console.log("IssueDistributionSlide Data:", data);
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const issueDistribution = data?.issueDistribution || {
    total: 0,
    high: 0,
    medium: 0,
    low: 0
  };

  const severityData = [
    { label: "High", count: issueDistribution?.high || 0, color: "#ff6b35", icon: "⚠️" },
    { label: "Medium", count: issueDistribution?.medium || 0, color: "#ffb703", icon: "⚡" },
    { label: "Low", count: issueDistribution?.low || 0, color: "#00dfff", icon: "ℹ️" },
  ];

  const totalCount = issueDistribution?.total || 
    (issueDistribution?.high || 0) + (issueDistribution?.medium || 0) + (issueDistribution?.low || 0);

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: -100,
          left: -100,
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,56,96,0.06), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={3}
        totalSlides={11}
        slideTitle="Issue Distribution"
      />

      <div
        style={{
          position: "absolute",
          top: 80,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          padding: "60px 80px",
          opacity,
        }}
      >
        {/* LEFT: Headline and total */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
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
                color: "#ff3860",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontFamily: "sans-serif",
                marginBottom: 14,
              }}
            >
              📊 Issue Breakdown
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
              {totalCount}
            </div>
            <div
              style={{
                fontSize: 28,
                color: "rgba(255,255,255,0.45)",
                fontFamily: "sans-serif",
              }}
            >
              Total Issues Found
            </div>
          </div>

          {/* Priority focus */}
          <div
            style={{
              opacity: childOpacity(2),
              padding: "24px 28px",
              background: "rgba(255,56,96,0.08)",
              border: "1px solid rgba(255,56,96,0.2)",
              borderRadius: 16,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#ff3860",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "sans-serif",
                marginBottom: 8,
              }}
            >
              Priority Focus
            </div>
            <div
              style={{
                fontSize: 20,
                color: "rgba(255,255,255,0.75)",
                fontFamily: "sans-serif",
                lineHeight: 1.4,
              }}
            >
              Focus on {(issueDistribution?.high || 0)} high-priority issue{(issueDistribution?.high || 0) !== 1 ? 's' : ''} first for maximum impact
            </div>
          </div>
        </div>

        {/* RIGHT: Issue distribution */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: 60 }}>
          <div
            style={{
              opacity: childOpacity(1),
              transform: `translateY(${childY(1)}px)`,
              marginBottom: 30,
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "sans-serif",
                marginBottom: 20,
              }}
            >
              Issues by Severity
            </div>
          </div>

          {/* Severity bars */}
          {severityData.map((severity, i) => {
            const percentage = totalCount > 0 ? (severity.count / totalCount) * 100 : 0;
            const barWidth = interpolate(frame, [20 + i * 15, 60 + i * 15], [0, percentage], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const itemOpacity = interpolate(frame, [15 + i * 15, 30 + i * 15], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });

            return (
              <div
                key={severity.label}
                style={{
                  opacity: itemOpacity,
                  marginBottom: 24,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{severity.icon}</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: severity.color, fontFamily: "sans-serif" }}>
                      {severity.label}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 24, fontWeight: 800, color: severity.color, fontFamily: "sans-serif" }}>
                      {severity.count}
                    </span>
                    <span style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div style={{ height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" }}>
                  <div
                    style={{
                      width: `${barWidth}%`,
                      height: "100%",
                      background: severity.color,
                      borderRadius: 6,
                      boxShadow: `0 0 10px ${severity.color}60`,
                    }}
                  />
                </div>
              </div>
            );
          })}

          {/* Quick insight */}
          <div
            style={{
              opacity: childOpacity(4),
              marginTop: 20,
              padding: "16px 20px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
            }}
          >
            <div
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.6)",
                fontFamily: "sans-serif",
                lineHeight: 1.4,
              }}
            >
              💡 <strong style={{ color: "#eef2ff" }}>
                 {(issueDistribution?.high || 0) > 2 ? "Focus on high-priority fixes" :
                 "Good health - maintain standards"}
              </strong>
            </div>
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
        03 / 11
      </div>
    </AbsoluteFill>
  );
};
