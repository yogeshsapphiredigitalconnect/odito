// remotion/slides/KeywordSlide.tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { KeywordData, SlideNarration } from "../types";
import { LogoHeader } from "../components_new/LogoHeader";
import { ScoreCard } from "../components_new/IssueCard";
import { useSlideTiming } from "../hooks/useSlideTiming";

interface Props {
  data: KeywordData;
  narration: SlideNarration;
  brandColor?: string;
  agencyName?: string;
}

const OPP_COLOR: Record<string, string> = {
  improve_rank: "#ff3860",
  boost_ctr:    "#ffb703",
  maintain:     "#00f5a0",
  new:          "#c77dff",
};
const OPP_LABEL: Record<string, string> = {
  improve_rank: "↑ Improve Rank",
  boost_ctr:    "▲ Boost CTR",
  maintain:     "✓ Maintain",
  new:          "★ New",
};

export const KeywordSlide: React.FC<Props> = ({ data, narration, brandColor = "#7730ed", agencyName = "AuditIQ" }) => {
  const frame = useCurrentFrame();
  const { opacity, childOpacity, childY } = useSlideTiming();

  return (
    <AbsoluteFill style={{ background: "#030912" }}>
      <div style={{ position: "absolute", top: -100, right: 200, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(199,125,255,0.05), transparent 70%)", pointerEvents: "none" }} />

      <LogoHeader agencyName={agencyName} brandColor={brandColor} slideNumber={5} totalSlides={7} slideTitle="Keywords" />

      <div style={{ position: "absolute", top: 80, left: 0, right: 0, bottom: 0, padding: "48px 80px", opacity }}>

        {/* Header */}
        <div style={{ opacity: childOpacity(0), transform: `translateY(${childY(0)}px)`, marginBottom: 32 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#c77dff", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "sans-serif", marginBottom: 10 }}>
            🎯 Keyword Opportunities
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: "#eef2ff", fontFamily: "sans-serif", letterSpacing: "-0.03em" }}>
              {data.opportunities.length} Near-Top-10 Keywords
            </div>
            <div style={{ fontSize: 20, color: "rgba(255,255,255,0.4)", fontFamily: "sans-serif" }}>
              within reach of page 1
            </div>
          </div>
        </div>

        {/* Summary stat cards */}
        <div style={{ display: "flex", gap: 18, marginBottom: 36, opacity: childOpacity(1) }}>
          <ScoreCard label="Total Keywords" value={data.total_keywords} color="#c77dff" index={0} startFrame={12} width={220} icon="🎯" />
          <ScoreCard label="Top 3 Rankings" value={data.top3_count}    color="#00f5a0" index={1} startFrame={12} width={220} icon="🏆" />
          <ScoreCard label="Avg Position"   value={data.avg_position}  color="#00dfff" index={2} startFrame={12} width={220} subLabel="across all keywords" icon="📊" />
        </div>

        {/* Keyword opportunity rows */}
        <div>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 140px 140px 120px 160px", gap: 16, padding: "10px 20px", marginBottom: 8, opacity: childOpacity(2) }}>
            {["Keyword", "Position", "Change", "Volume", "CTR", "Opportunity"].map((h) => (
              <div key={h} style={{ fontFamily: "sans-serif", fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</div>
            ))}
          </div>

          {(data?.opportunities || []).map((kw, i) => {
            const delay = 25 + i * 14;
            const op   = interpolate(frame, [delay, delay + 20], [0, 1],  { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const ty   = interpolate(frame, [delay, delay + 20], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const change = kw.google_prev - kw.google_position;
            const oppColor = OPP_COLOR[kw.opportunity_tag] || "#00dfff";
            const oppLabel = OPP_LABEL[kw.opportunity_tag] || kw.opportunity_tag;

            // Animate position bar (inverted — lower is better, show 100 - pos out of 100)
            const barFill = interpolate(frame, [delay + 5, delay + 45], [0, Math.max(0, 100 - (Number(kw.google_position) || 0))], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const posColor = kw.google_position <= 3 ? "#00f5a0" : kw.google_position <= 10 ? "#00dfff" : kw.google_position <= 20 ? "#ffb703" : "#ff3860";

            return (
              <div
                key={kw.keyword}
                style={{
                  opacity: op,
                  transform: `translateY(${ty}px)`,
                  display: "grid",
                  gridTemplateColumns: "1fr 160px 140px 140px 120px 160px",
                  gap: 16,
                  padding: "20px 20px",
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14,
                  marginBottom: 10,
                  alignItems: "center",
                }}
              >
                {/* Keyword */}
                <div>
                  <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 20, color: "#eef2ff", marginBottom: 4 }}>{kw.keyword}</div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>{kw.url}</div>
                </div>

                {/* Position + mini bar */}
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 5 }}>
                    <span style={{ fontFamily: "sans-serif", fontWeight: 800, fontSize: 26, color: posColor }}>{kw.google_position}</span>
                    <span style={{ fontFamily: "sans-serif", fontSize: 14, color: "rgba(255,255,255,0.35)" }}>/ 100</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ width: `${barFill}%`, height: "100%", background: posColor, borderRadius: 3 }} />
                  </div>
                </div>

                {/* Change */}
                <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 20, color: change > 0 ? "#00f5a0" : change < 0 ? "#ff3860" : "rgba(255,255,255,0.4)" }}>
                  {change > 0 ? `▲ +${change}` : change < 0 ? `▼ ${change}` : "—"}
                </div>

                {/* Volume */}
                <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 20, color: "#eef2ff" }}>
                  {kw.search_volume >= 1000 ? `${(kw.search_volume / 1000).toFixed(1)}k` : kw.search_volume}
                </div>

                {/* CTR */}
                <div style={{ fontFamily: "sans-serif", fontWeight: 700, fontSize: 20, color: "#00dfff" }}>
                  {(kw.gsc_ctr * 100).toFixed(1)}%
                </div>

                {/* Opportunity tag */}
                <div style={{ padding: "6px 12px", background: `${oppColor}12`, border: `1px solid ${oppColor}28`, borderRadius: 8, fontFamily: "sans-serif", fontWeight: 700, fontSize: 15, color: oppColor, textAlign: "center" }}>
                  {oppLabel}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={{ opacity: childOpacity(6), marginTop: 20, padding: "18px 24px", background: "rgba(199,125,255,0.05)", border: "1px solid rgba(199,125,255,0.15)", borderRadius: 14 }}>
          <div style={{ fontFamily: "sans-serif", fontSize: 18, color: "rgba(255,255,255,0.65)", lineHeight: 1.5 }}>
            💡 Pushing <strong style={{ color: "#eef2ff" }}>'seo audit software'</strong> from position 11 → 10 could unlock <strong style={{ color: "#00f5a0" }}>3× more monthly clicks</strong>
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 28, right: 60, fontFamily: "sans-serif", fontSize: 15, color: "rgba(255,255,255,0.2)" }}>05 / 07</div>
    </AbsoluteFill>
  );
};
