// remotion/slides/KeywordSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { ScoreCard } from "../components_new/IssueCard";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: {
    totalKeywords: number;
    topRankings: Array<{keyword: string, rank: number, status: string}>;
    opportunities: Array<{keyword: string, rank: number, status: string}>;
    notRanking: Array<{keyword: string, rank: number | null, status: string}>;
  };
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

const RANK_COLOR = {
  top: "#00f5a0",      // Green for top rankings (≤10)
  opportunity: "#ffb703", // Yellow for opportunities (11-30)
  not_ranking: "#ff3860"  // Red for not ranking (>30 or null)
};

export const KeywordSlide: React.FC<Props> = ({ data, narration, brandColor = "#7730ed", agencyName = "AuditIQ" }) => {
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      <div style={{ position: "absolute", top: -100, right: 200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(199,125,255,0.05), transparent 70%)", pointerEvents: "none" }} />

      <LogoHeader agencyName={agencyName} brandColor={brandColor} slideNumber={10} totalSlides={15} slideTitle="Keyword Performance" />

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, bottom: 0, padding: "48px 80px", opacity }}>

        {/* Header */}
        <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 32 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#c77dff", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 10 }}>
            🎯 Keyword Performance Analysis
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: "#eef2ff", fontFamily: "sans-serif", letterSpacing: "-0.03em" }}>
              {data.totalKeywords || 0} Keywords
            </div>
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>
              tracked across search results
            </div>
          </div>
        </div>

        {/* Summary stat cards */}
        <div style={{ display: "flex", gap: 18, marginBottom: 36, opacity: childOpacity(1) }}>
          <ScoreCard label="Top Rankings" value={data.topRankings?.length || 0} color={RANK_COLOR.top} index={0} startFrame={12} width={220} icon="�" />
          <ScoreCard label="Opportunities" value={data.opportunities?.length || 0} color={RANK_COLOR.opportunity} index={1} startFrame={12} width={220} icon="📈" />
          <ScoreCard label="Not Ranking" value={data.notRanking?.length || 0} color={RANK_COLOR.not_ranking} index={2} startFrame={12} width={220} icon="🎯" />
        </div>

        {/* Keyword categories */}
        <div>
          {/* Top Rankings Section */}
          {(data.topRankings?.length > 0) && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, opacity: childOpacity(2) }}>
                <div style={{ width: 4, height: 20, background: RANK_COLOR.top, borderRadius: 2 }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: "#eef2ff", fontFamily: "sans-serif" }}>
                  🏆 Top Rankings (Position 1-10)
                </div>
              </div>
              {data.topRankings.slice(0, 5).map((kw, i) => {
                const delay = 25 + i * 14;
                const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const ty = interpolate(frame, [delay, delay + 20], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                return (
                  <div
                    key={kw.keyword}
                    style={{
                      opacity: op,
                      transform: `translateY(${ty}px)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 20px",
                      background: "rgba(0,245,160,0.05)",
                      border: "1px solid rgba(0,245,160,0.2)",
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#eef2ff", fontFamily: "sans-serif" }}>
                        {kw.keyword}
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: RANK_COLOR.top, fontFamily: "sans-serif", minWidth: 60, textAlign: "right" }}>
                      #{kw.rank}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Opportunities Section */}
          {(data.opportunities?.length > 0) && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, opacity: childOpacity(3) }}>
                <div style={{ width: 4, height: 20, background: RANK_COLOR.opportunity, borderRadius: 2 }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: "#eef2ff", fontFamily: "sans-serif" }}>
                  📈 Growth Opportunities (Position 11-30)
                </div>
              </div>
              {data.opportunities.slice(0, 5).map((kw, i) => {
                const delay = 25 + i * 14;
                const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const ty = interpolate(frame, [delay, delay + 20], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                return (
                  <div
                    key={kw.keyword}
                    style={{
                      opacity: op,
                      transform: `translateY(${ty}px)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 20px",
                      background: "rgba(255,183,3,0.05)",
                      border: "1px solid rgba(255,183,3,0.2)",
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#eef2ff", fontFamily: "sans-serif" }}>
                        {kw.keyword}
                      </div>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: RANK_COLOR.opportunity, fontFamily: "sans-serif", minWidth: 60, textAlign: "right" }}>
                      #{kw.rank}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Not Ranking Section */}
          {(data.notRanking?.length > 0) && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, opacity: childOpacity(4) }}>
                <div style={{ width: 4, height: 20, background: RANK_COLOR.not_ranking, borderRadius: 2 }} />
                <div style={{ fontSize: 18, fontWeight: 700, color: "#eef2ff", fontFamily: "sans-serif" }}>
                  🎯 Not in Top 100
                </div>
              </div>
              {data.notRanking.slice(0, 5).map((kw, i) => {
                const delay = 25 + i * 14;
                const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                const ty = interpolate(frame, [delay, delay + 20], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                return (
                  <div
                    key={kw.keyword}
                    style={{
                      opacity: op,
                      transform: `translateY(${ty}px)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 20px",
                      background: "rgba(255,56,96,0.05)",
                      border: "1px solid rgba(255,56,96,0.2)",
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#eef2ff", fontFamily: "sans-serif" }}>
                        {kw.keyword}
                      </div>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: RANK_COLOR.not_ranking, fontFamily: "sans-serif", minWidth: 100, textAlign: "right" }}>
                      Not in Top 100
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom insight */}
        <div style={{ opacity: childOpacity(5), marginTop: 20, padding: "18px 24px", background: "rgba(199,125,255,0.05)", border: "1px solid rgba(199,125,255,0.15)", borderRadius: 14 }}>
          <div style={{ fontFamily: "sans-serif", fontSize: 18, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
            💡 <strong style={{ color: "#eef2ff" }}>Focus on opportunities first</strong> — keywords ranked 11-30 need minimal effort to reach page 1 and can significantly increase organic traffic.
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>10 / 15</div>
    </AbsoluteFill>
  );
};
