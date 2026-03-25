// remotion/components/IssueCard.tsx
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface IssueCardProps {
  title: string;
  count: number;
  impact?: string;
  severity: "critical" | "warning" | "info" | "passed";
  index?: number;
  startFrame?: number;
  width?: number;
}

const SEV_COLORS = {
  critical: "#ff3860",
  warning: "#ffb703",
  info: "#00dfff",
  passed: "#00f5a0",
};

const SEV_BG = {
  critical: "rgba(255,56,96,0.08)",
  warning: "rgba(255,183,3,0.07)",
  info: "rgba(0,223,255,0.07)",
  passed: "rgba(0,245,160,0.07)",
};

const SEV_ICONS = {
  critical: "●",
  warning: "◆",
  info: "ℹ",
  passed: "✓",
};

export const IssueCard: React.FC<IssueCardProps> = ({
  title,
  count,
  impact,
  severity,
  index = 0,
  startFrame = 15,
  width = 780,
}) => {
  const frame = useCurrentFrame();
  const delay = startFrame + index * 12;

  const opacity = interpolate(frame, [delay, delay + 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateX = interpolate(frame, [delay, delay + 18], [-30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const color = SEV_COLORS[severity];
  const bg = SEV_BG[severity];
  const icon = SEV_ICONS[severity];

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${translateX}px)`,
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "22px 28px",
        background: bg,
        border: `1px solid ${color}30`,
        borderLeft: `4px solid ${color}`,
        borderRadius: 16,
        width,
        marginBottom: 16,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 13,
          background: `${color}18`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          color,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: "sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: "#eef2ff",
            marginBottom: 5,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              padding: "3px 10px",
              background: `${color}18`,
              color,
              borderRadius: 6,
            }}
          >
            {count} pages
          </span>
          {impact && (
            <span
              style={{
                fontSize: 16,
                color: "#00f5a0",
                fontWeight: 600,
                background: "rgba(0,245,160,0.08)",
                padding: "3px 10px",
                borderRadius: 6,
              }}
            >
              ▲ {impact}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── SCORE CARD ────────────────────────────────────────────────────────────────

interface ScoreCardProps {
  label: string;
  value: number | string;
  subLabel?: string;
  color?: string;
  index?: number;
  startFrame?: number;
  width?: number;
  icon?: string;
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  label,
  value,
  subLabel,
  color = "#00dfff",
  index = 0,
  startFrame = 15,
  width = 260,
  icon,
}) => {
  const frame = useCurrentFrame();
  const delay = startFrame + index * 10;

  const opacity = interpolate(frame, [delay, delay + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const translateY = interpolate(frame, [delay, delay + 20], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const numericValue =
    typeof value === "number"
      ? Math.round(
          interpolate(frame, [delay, delay + 45], [0, typeof value === "number" && !isNaN(value) ? value : 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })
        )
      : value;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px)`,
        width,
        padding: "28px 24px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        borderTop: `3px solid ${color}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {icon && (
        <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      )}
      <div
        style={{
          fontFamily: "sans-serif",
          fontSize: 10,
          fontWeight: 700,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "sans-serif",
          fontWeight: 800,
          fontSize: 48,
          color,
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {numericValue}
      </div>
      {subLabel && (
        <div
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.4)",
            marginTop: 6,
            fontFamily: "sans-serif",
          }}
        >
          {subLabel}
        </div>
      )}
    </div>
  );
};
