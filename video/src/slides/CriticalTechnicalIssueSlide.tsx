// remotion/slides/CriticalTechnicalIssueSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    auditSnapshot: {
      technicalHighlights: {
        criticalIssues?: Array<{
          name: string;
          status: string;
          detail: string;
          affected_pages: number;
        }>;
      };
    };
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const CriticalTechnicalIssueSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  // Hard fail-safe check
  if (!data) {
    console.warn("CriticalTechnicalIssueSlide: Missing slide data");
    return null;
  }

  console.log("CriticalTechnicalIssueSlide Data:", data);
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  const criticalIssues = data?.auditSnapshot?.technicalHighlights?.criticalIssues || [];

  // Use first critical issue dynamically
  const issue = criticalIssues.length > 0 ? criticalIssues[0] : { name: "No Critical Issues", status: "PASS", detail: "All systems operating normally", affected_pages: 0 };

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      {/* Alert background gradient */}
      <div
        style={{
          position: "absolute",
          top: -200,
          left: -200,
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,56,96,0.08), transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <LogoHeader
        agencyName={agencyName}
        brandColor={brandColor}
        slideNumber={8}
        totalSlides={11}
        slideTitle="Critical Technical Issue"
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
        {/* Critical Alert Header */}
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
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 24px",
              background: "rgba(255,56,96,0.15)",
              border: "1px solid rgba(255,56,96,0.3)",
              borderRadius: 50,
              marginBottom: 20,
            }}
          >
            <span style={{ fontSize: 24 }}>🚨</span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#ff3860",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "sans-serif",
              }}
            >
              Critical Issue Detected
            </span>
          </div>
          
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#ff3860",
              fontFamily: "sans-serif",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              marginBottom: 16,
            }}
          >
            {issue.name}
          </div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "#eef2ff",
              fontFamily: "sans-serif",
              marginBottom: 12,
            }}
          >
            {issue.status}
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            {issue.name} - {issue.detail}
          </div>
        </div>

        {/* Issue Details */}
        <div
          style={{
            opacity: childOpacity(1),
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 40,
            marginBottom: 40,
          }}
        >
          {/* LEFT: Problem Description */}
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#eef2ff",
                fontFamily: "sans-serif",
                marginBottom: 16,
              }}
            >
              Issue Details
            </div>
            <div 
              style={{
                fontSize: 16,
                color: "rgba(255,255,255,0.7)",
                fontFamily: "sans-serif",
                lineHeight: 1.5,
                padding: "16px 20px",
                background: "rgba(255,56,96,0.08)",
                border: "1px solid rgba(255,56,96,0.2)",
                borderRadius: 10,
              }}
            >
              {issue.detail}
              {issue.affected_pages > 0 && (
                <div style={{ marginTop: 8, fontSize: 14, color: "rgba(255,255,255,0.5)" }}>
                  Affects {issue.affected_pages} page{issue.affected_pages !== 1 ? 's' : ''}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Impact */}
          <div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#eef2ff",
                fontFamily: "sans-serif",
                marginBottom: 16,
              }}
            >
              Affected Pages
            </div>
            <div 
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: issue.status === 'FAIL' ? "#ff3860" : "#ffb703",
                fontFamily: "sans-serif",
                textAlign: "center",
                padding: "20px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
              }}
            >
              {issue.affected_pages}
              <div style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                page{issue.affected_pages !== 1 ? 's' : ''} impacted
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div
          style={{
            opacity: childOpacity(3),
            padding: "24px 30px",
            background: "linear-gradient(135deg, rgba(255,56,96,0.15), rgba(255,107,53,0.08))",
            border: "1px solid rgba(255,56,96,0.3)",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
            {issue.status === 'FAIL' ? (
              <>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#ff3860",
                    fontFamily: "sans-serif",
                    marginBottom: 8,
                  }}
                >
                  🚨 Immediate Action Required
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  Address this critical issue within 24-48 hours to maintain security and performance standards
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#00f5a0",
                    fontFamily: "sans-serif",
                    marginBottom: 8,
                  }}
                >
                  ✅ System Status: Good
                </div>
                <div
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.7)",
                    fontFamily: "sans-serif",
                    lineHeight: 1.5,
                  }}
                >
                  No critical technical issues detected - continue monitoring for optimal performance
                </div>
              </>
            )}
        </div>
      </div>

      {/* Slide number */}
      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>
        08 / 11
      </div>
    </AbsoluteFill>
  );
};
