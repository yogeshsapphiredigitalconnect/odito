// remotion/components/ChartBar.tsx
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface ChartBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  startFrame?: number;
  index?: number;
  unit?: string;
  showValue?: boolean;
  height?: number;
}

export const ChartBar: React.FC<ChartBarProps> = ({
  label,
  value,
  maxValue = 100,
  color = "#00dfff",
  startFrame = 20,
  index = 0,
  unit = "",
  showValue = true,
  height = 18,
}) => {
  const frame = useCurrentFrame();
  const delay = startFrame + index * 10;

  const safeValue = typeof value === "number" && !isNaN(value) ? value : 0;

  const barWidth = interpolate(frame, [delay, delay + 40], [0, (safeValue / maxValue) * 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const displayValue = Math.round(
    interpolate(frame, [delay, delay + 40], [0, safeValue], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  const opacity = interpolate(frame, [delay - 5, delay + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ opacity, marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 7,
          fontFamily: "sans-serif",
          fontSize: 18,
          color: "rgba(255,255,255,0.7)",
        }}
      >
        <span>{label}</span>
        {showValue && (
          <span style={{ color, fontWeight: 700 }}>
            {displayValue}
            {unit}
          </span>
        )}
      </div>
      <div
        style={{
          height,
          background: "rgba(255,255,255,0.06)",
          borderRadius: height / 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${barWidth}%`,
            background: color,
            borderRadius: height / 2,
            boxShadow: `0 0 16px ${color}60`,
          }}
        />
      </div>
    </div>
  );
};
