import React from 'react';

export default function Sparkline({ data, color }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const W = 72;
  const H = 26;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - ((v - min) / range) * H;
    return `${x},${y}`;
  }).join(' ');

  const lastValue = data[data.length - 1];
  const lastY = H - ((lastValue - min) / range) * H;

  return (
    <svg width={W} height={H} style={{ overflow: 'visible', display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={W} cy={lastY} r={2.5} fill={color} />
    </svg>
  );
}
