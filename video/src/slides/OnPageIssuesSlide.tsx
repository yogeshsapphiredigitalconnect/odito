// remotion/slides/OnPageIssuesSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { OnPageData, SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { IssueCard } from "../components_new/IssueCard";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: OnPageData;
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

export const OnPageIssuesSlide: React.FC<Props> = ({
  data,
  narration,
  brandColor = "#7730ed",
  agencyName = "AuditIQ",
}) => {
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      <div style={{ position: "absolute", top: -100, right: -100, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,56,96,0.06), transparent 70%)", pointerEvents: "none" }} />

      <LogoHeader agencyName={agencyName} brandColor={brandColor} slideNumber={2} totalSlides={7} slideTitle="On-Page Issues" />

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, bottom: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, opacity }}>
        {/* LEFT: Issues list */}
        <div style={{ padding: "50px 50px 50px 80px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 36 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#ff3860", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 10 }}>
              ⚠ On-Page Issues
            </div>
            <div style={{ fontSize: 52, fontWeight: 800, color: "#eef2ff", fontFamily: "sans-serif", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
              {data.total_issues} Issues Found
            </div>
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.45)", fontFamily: "sans-serif", marginTop: 8 }}>
              Across {data.issues.reduce((a, b) => a + b.affected_count, 0)} page instances
            </div>
          </div>

              {(data?.issues || []).map((issue, i) => (
            <IssueCard
              key={issue.title}
              title={issue.title}
              count={issue.affected_count}
              impact={issue.impact}
              severity={issue.severity}
              index={i}
              startFrame={18}
              width={680}
            />
          ))}
        </div>

        {/* RIGHT: Quick wins panel */}
        <div style={{ padding: "50px 80px 50px 40px", display: "flex", flexDirection: "column", justifyContent: "center", borderLeft: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ opacity: childOpacity(1), transform: `translateY(${childY(1)}px)`, marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#00f5a0", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 10 }}>
              ✦ Quick Wins
            </div>
            <div style={{ fontSize: 40, fontWeight: 800, color: "#eef2ff", fontFamily: "sans-serif", lineHeight: 1.15 }}>
              Fix These First
            </div>
          </div>

          {(data?.quick_wins || []).map((win, i) => {
            const delay = 25 + i * 12;
            const op = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const tx = interpolate(frame, [delay, delay + 18], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div
                key={win.title}
                style={{
                  opacity: op,
                  transform: `translateX(${tx}px)`,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 16,
                  padding: "20px 24px",
                  background: "rgba(0,245,160,0.05)",
                  border: "1px solid rgba(0,245,160,0.15)",
                  borderRadius: 14,
                  marginBottom: 14,
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,245,160,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00f5a0", fontWeight: 800, fontSize: 16, flexShrink: 0, fontFamily: "sans-serif" }}>
                  {i + 1}
                </div>
                <div style={{ fontFamily: "sans-serif", fontSize: 20, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 700, color: "#eef2ff", marginBottom: 6 }}>{win.title}</div>
                  <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>{win.impact}</div>
                  <div style={{ fontSize: 14, color: "#00f5a0", marginTop: 8 }}>Effort: {win.effort}</div>
                </div>
              </div>
            );
          })}

          {/* Impact stat */}
          <div style={{ opacity: childOpacity(5), marginTop: 24, padding: "22px 26px", background: "rgba(0,245,160,0.04)", border: "1px solid rgba(0,245,160,0.12)", borderRadius: 14 }}>
            <div style={{ fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Estimated Impact</div>
            <div style={{ fontFamily: "sans-serif", fontSize: 32, fontWeight: 800, color: "#00f5a0" }}>+18 SEO Points</div>
            <div style={{ fontFamily: "sans-serif", fontSize: 16, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>in 2–5 business days</div>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>02 / 07</div>
    </AbsoluteFill>
  );
};
