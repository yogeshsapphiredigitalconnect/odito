// remotion/slides/CriticalTechnicalIssueSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    criticalIssues?: Array<{
      name: string;
      status: string;
      severity?: string;
      pages?: number;
      description?: string;
    }>;
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

  const criticalIssues = data?.criticalIssues || [];

  // Debug logging to track data structure
  console.log("CriticalTechnicalIssueSlide - criticalIssues:", criticalIssues);
  if (criticalIssues.length > 0) {
    console.log("CriticalTechnicalIssueSlide - first issue structure:", criticalIssues[0]);
  }

  // Focus on Security Headers as the critical issue
  const securityHeadersIssue = criticalIssues.find(issue => {
    console.log("Checking issue:", issue);
    const issueName = issue?.name || "";
    return issueName.toLowerCase().includes('security') || 
           issueName.toLowerCase().includes('header');
  }) || { name: "Security Headers Missing", status: "FAIL" };

  // Use the securityHeadersIssue in the display
  const displayIssue = securityHeadersIssue.name;
  console.log("Selected displayIssue:", displayIssue);

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
            Security Headers
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
            FAIL
          </div>
          <div
            style={{
              fontSize: 20,
              color: "rgba(255,255,255,0.45)",
              fontFamily: "sans-serif",
            }}
          >
            {displayIssue} - Critical vulnerability requiring immediate attention
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
              What's Missing
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Strict-Transport-Security (HSTS)",
                "Content-Security-Policy (CSP)",
                "X-Content-Type-Options",
                "X-Frame-Options",
                "Referrer-Policy"
              ].map((header, i) => {
                const itemDelay = 20 + i * 8;
                const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 15], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                return (
                  <div
                    key={header}
                    style={{
                      opacity: itemOpacity,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "14px 18px",
                      background: "rgba(255,56,96,0.08)",
                      border: "1px solid rgba(255,56,96,0.2)",
                      borderRadius: 10,
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff3860", flexShrink: 0 }} />
                    <span style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif" }}>
                      {header}
                    </span>
                  </div>
                );
              })}
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
              Security Risks
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { risk: "Man-in-the-Middle Attacks", level: "High" },
                { risk: "Clickjacking Vulnerabilities", level: "Medium" },
                { risk: "Cross-Site Scripting (XSS)", level: "High" },
                { risk: "Data Injection Attacks", level: "High" },
                { risk: "Content Type Sniffing", level: "Medium" }
              ].map((item, i) => {
                const itemDelay = 25 + i * 8;
                const itemOpacity = interpolate(frame, [itemDelay, itemDelay + 15], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                });
                const riskColor = item.level === "High" ? "#ff3860" : "#ffb703";
                return (
                  <div
                    key={item.risk}
                    style={{
                      opacity: itemOpacity,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 18px",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10,
                    }}
                  >
                    <span style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif" }}>
                      {item.risk}
                    </span>
                    <span
                      style={{
                        padding: "4px 10px",
                        background: `${riskColor}15`,
                        color: riskColor,
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "sans-serif",
                        borderRadius: 6,
                      }}
                    >
                      {item.level}
                    </span>
                  </div>
                );
              })}
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
            Implement security headers within 24-48 hours to protect against critical security vulnerabilities and maintain user trust
          </div>
        </div>
      </div>

      {/* Slide number */}
      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>
        08 / 11
      </div>
    </AbsoluteFill>
  );
};
