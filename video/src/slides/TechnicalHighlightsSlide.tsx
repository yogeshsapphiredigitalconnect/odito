// remotion/slides/TechnicalHighlightsSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    auditSnapshot: {
      technicalHighlights: {
        checks?: Array<{
          name: string;
          status: 'PASS' | 'FAIL' | 'WARN';
          detail: string;
          affected_pages?: number;
        }>;
        criticalIssues?: Array<{
          name: string;
          status: string;
          detail: string;
          affected_pages?: number;
        }>;
        topRecommendations?: Array<{
          name: string;
          status: string;
          detail: string;
          affected_pages?: number;
        }>;
      };
      scores?: {
        seo?: number;
        technical?: number;
        technicalHealth?: number;
      };
      issueDistribution?: {
        high?: number;
      };
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

  console.log("Technical Data:", {
    checks: data?.auditSnapshot?.technicalHighlights?.checks,
    criticalIssues: data?.auditSnapshot?.technicalHighlights?.criticalIssues,
    recommendations: data?.auditSnapshot?.technicalHighlights?.topRecommendations
  });
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  // Extract technical data
  const technical = data?.auditSnapshot?.technicalHighlights || {};
  const checks = technical.checks || [];
  const score = data?.auditSnapshot?.scores?.technicalHealth || 0;
  
  // Filter by status for structured sections
  const criticalIssues = checks.filter(c => c.status === "FAIL");
  const warnings = checks.filter(c => c.status === "WARN");

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
          display: "flex",
          flexDirection: "column",
          padding: "40px 80px",
          opacity,
        }}
      >
        {/* TOP SUMMARY BLOCK */}
        <div 
          className="top-summary"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 40,
            marginBottom: 40,
            padding: "30px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 16,
            opacity: childOpacity(0),
            transform: `translateY(${childY(0)}px)`,
          }}
        >
          <GaugeScore
            score={score}
            label="TECHNICAL HEALTH"
            size={150}
            color={score >= 80 ? "#00f5a0" : score >= 60 ? "#ffb703" : "#ff3860"}
            startFrame={10}
          />
          
          <div className="summary-text">
            <h3 style={{
              fontSize: 32,
              fontWeight: 800,
              color: "#eef2ff",
              fontFamily: "sans-serif",
              margin: 0,
              marginBottom: 8
            }}>
              Technical Health
            </h3>
            <p style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.6)",
              fontFamily: "sans-serif",
              margin: 0,
            }}>
              We have checked {checks.length} technical checks
            </p>
          </div>
        </div>

        {/* SECTIONS GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            flex: 1,
          }}
        >
          {/* CRITICAL ISSUES SECTION */}
          <div 
            className="section critical"
            style={{
              opacity: childOpacity(1),
              transform: `translateY(${childY(1)}px)`,
            }}
          >
            <h3 style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#ff3860",
              fontFamily: "sans-serif",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <span style={{ fontSize: 20 }}>🔴</span>
              Critical Issues ({criticalIssues.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {criticalIssues.length === 0 ? (
                <div style={{
                  padding: "20px",
                  background: "rgba(0,245,160,0.08)",
                  border: "1px solid rgba(0,245,160,0.2)",
                  borderRadius: 8,
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 16, color: "#00f5a0", fontFamily: "sans-serif", fontWeight: 600 }}>
                    ✅ No critical issues found
                  </div>
                </div>
              ) : (
                criticalIssues.map((item, i) => {
                  const itemDelay = 25 + i * 8;
                  const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 15], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  return (
                    <div
                      key={i}
                      className="issue-card critical"
                      style={{
                        opacity: itemOpacity,
                        padding: "16px",
                        background: "rgba(255,56,96,0.08)",
                        border: "1px solid rgba(255,56,96,0.2)",
                        borderRadius: 12,
                      }}
                    >
                      <h4 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.9)",
                        fontFamily: "sans-serif",
                        margin: 0,
                        marginBottom: 8
                      }}>
                        {item.name}
                      </h4>
                      <p style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.6)",
                        fontFamily: "sans-serif",
                        margin: 0,
                        lineHeight: 1.4
                      }}>
                        {item.detail}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* WARNINGS SECTION */}
          <div 
            className="section warning"
            style={{
              opacity: childOpacity(2),
              transform: `translateY(${childY(2)}px)`,
            }}
          >
            <h3 style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#ffb703",
              fontFamily: "sans-serif",
              marginBottom: 20,
              display: "flex",
              alignItems: "center",
              gap: 10
            }}>
              <span style={{ fontSize: 20 }}>🟡</span>
              Warnings ({warnings.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {warnings.length === 0 ? (
                <div style={{
                  padding: "20px",
                  background: "rgba(0,245,160,0.08)",
                  border: "1px solid rgba(0,245,160,0.2)",
                  borderRadius: 8,
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: 16, color: "#00f5a0", fontFamily: "sans-serif", fontWeight: 600 }}>
                    ✅ No warnings found
                  </div>
                </div>
              ) : (
                warnings.map((item, i) => {
                  const itemDelay = 30 + i * 8;
                  const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 15], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
                  return (
                    <div
                      key={i}
                      className="issue-card warning"
                      style={{
                        opacity: itemOpacity,
                        padding: "16px",
                        background: "rgba(255,183,3,0.08)",
                        border: "1px solid rgba(255,183,3,0.2)",
                        borderRadius: 12,
                      }}
                    >
                      <h4 style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.9)",
                        fontFamily: "sans-serif",
                        margin: 0,
                        marginBottom: 8
                      }}>
                        {item.name}
                      </h4>
                      <p style={{
                        fontSize: 14,
                        color: "rgba(255,255,255,0.6)",
                        fontFamily: "sans-serif",
                        margin: 0,
                        lineHeight: 1.4
                      }}>
                        {item.detail}
                      </p>
                    </div>
                  );
                })
              )}
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
