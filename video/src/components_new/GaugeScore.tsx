// remotion/components/GaugeScore.tsx
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface GaugeScoreProps {
  score: number;
  label: string;
  size?: number;
  color?: string;
  startFrame?: number;
}

export const GaugeScore: React.FC<GaugeScoreProps> = ({
  score,
  label,
  size = 200,
  startFrame = 10,
}) => {
  const frame = useCurrentFrame();

  const animatedScore = Math.round(
    interpolate(frame, [startFrame, startFrame + 50], [0, Number(score) || 0], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const strokeColor =
    score >= 80 ? "#00f5a0" : score >= 60 ? "#ffb703" : "#ff3860";

  const r = (size / 2) * 0.78;
  const circumference = 2 * Math.PI * r;
  const animatedDash = interpolate(
    frame,
    [startFrame, startFrame + 50],
    [0, ((Number(score) || 0) / 100) * circumference],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = interpolate(frame, [startFrame - 5, startFrame + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", width: size, height: size, opacity }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={size * 0.07}
        />
        {/* Animated score ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={size * 0.07}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - animatedDash}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            filter: `drop-shadow(0 0 ${size * 0.06}px ${strokeColor}80)`,
          }}
        />
      </svg>
      {/* Score text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "sans-serif",
            fontWeight: 800,
            fontSize: size * 0.28,
            color: strokeColor,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {animatedScore}
        </span>
        <span
          style={{
            fontFamily: "sans-serif",
            fontSize: size * 0.09,
            color: "rgba(255,255,255,0.4)",
            marginTop: size * 0.03,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          /100
        </span>
        <span
          style={{
            fontFamily: "sans-serif",
            fontSize: size * 0.08,
            color: "rgba(255,255,255,0.5)",
            marginTop: size * 0.02,
            textAlign: "center",
            maxWidth: size * 0.7,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
