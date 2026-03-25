// remotion/slides/PageSpeedSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { GaugeScore } from "../components_new/GaugeScore";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    mobile: {
      lcp: string;
      tbt: string;
      fcp: string;
      cls: string;
      score: number;
    };
    desktop: {
      lcp: string;
      tbt: string;
      fcp: string;
      cls: string;
      score: number;
    };
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const PageSpeedSlide: React.FC<Props> = ({ data, narration, brandColor = "#7730ed", agencyName = "AuditIQ" }) => {
  console.log("Core Web Vitals Data:", data);
  
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  // Extract mobile and desktop data with fallbacks
  const mobileData = data?.mobile || {};
  const desktopData = data?.desktop || {};

  // Mobile Core Web Vitals
  const mobileCwv = [
    { id: 'lcp', label: 'LCP', value: mobileData.lcp || 'N/A', display: mobileData.lcp || 'N/A' },
    { id: 'tbt', label: 'TBT', value: mobileData.tbt || 'N/A', display: mobileData.tbt || 'N/A' },
    { id: 'fcp', label: 'FCP', value: mobileData.fcp || 'N/A', display: mobileData.fcp || 'N/A' },
    { id: 'cls', label: 'CLS', value: mobileData.cls || 'N/A', display: mobileData.cls || 'N/A' }
  ];

  // Desktop Core Web Vitals  
  const desktopCwv = [
    { id: 'lcp', label: 'LCP', value: desktopData.lcp || 'N/A', display: desktopData.lcp || 'N/A' },
    { id: 'tbt', label: 'TBT', value: desktopData.tbt || 'N/A', display: desktopData.tbt || 'N/A' },
    { id: 'fcp', label: 'FCP', value: desktopData.fcp || 'N/A', display: desktopData.fcp || 'N/A' },
    { id: 'cls', label: 'CLS', value: desktopData.cls || 'N/A', display: desktopData.cls || 'N/A' }
  ];

  // Calculate mobile and desktop scores for gauges
  const mobileScore = mobileData.score || 0;
  const desktopScore = desktopData.score || 0;

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      <div style={{ position: "absolute", bottom: -200, right: -100, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,223,255,0.05), transparent 70%)", pointerEvents: "none" }} />

      <LogoHeader agencyName={agencyName} brandColor={brandColor} slideNumber={10} totalSlides={11} slideTitle="Core Web Vitals" />

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, bottom: 0, display: "grid", gridTemplateColumns: "1fr 1fr", opacity }}>

        {/* LEFT: Mobile Performance */}
        <div style={{ padding: "45px 30px 45px 80px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#00f5a0", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 16 }}>
              📱 Mobile Performance
            </div>
          </div>

          <div style={{ opacity: childOpacity(1), display: "flex", justifyContent: "center", marginBottom: 30 }}>
            <GaugeScore
              score={mobileScore}
              label="Mobile"
              size={200}
              color={mobileScore >= 90 ? "#00f5a0" : mobileScore >= 50 ? "#ffb703" : "#ff3860"}
              startFrame={12}
            />
          </div>

          {/* Mobile Core Web Vitals */}
          <div style={{ opacity: childOpacity(2) }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "sans-serif", marginBottom: 12 }}>Core Web Vitals</div>
            {mobileCwv.map((v, i) => {
              const op = interpolate(frame, [25 + i * 8, 45 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={v.id} style={{ opacity: op, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif" }}>{v.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#00f5a0", fontFamily: "sans-serif" }}>{v.display}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Desktop Performance */}
        <div style={{ padding: "45px 80px 45px 50px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ffb703", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 16 }}>
              🖥️ Desktop Performance
            </div>
          </div>

          <div style={{ opacity: childOpacity(1), display: "flex", justifyContent: "center", marginBottom: 30 }}>
            <GaugeScore
              score={desktopScore}
              label="Desktop"
              size={200}
              color={desktopScore >= 90 ? "#00f5a0" : desktopScore >= 50 ? "#ffb703" : "#ff3860"}
              startFrame={12}
            />
          </div>

          {/* Desktop Core Web Vitals */}
          <div style={{ opacity: childOpacity(2) }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "sans-serif", marginBottom: 12 }}>Core Web Vitals</div>
            {desktopCwv.map((v, i) => {
              const op = interpolate(frame, [25 + i * 8, 45 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={v.id} style={{ opacity: op, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: "sans-serif" }}>{v.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#ffb703", fontFamily: "sans-serif" }}>{v.display}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>10 / 11</div>
    </AbsoluteFill>
  );
};
