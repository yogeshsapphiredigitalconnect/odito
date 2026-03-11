"use client";

import { useState, useEffect } from "react";

export default function ScoreRing({ val, color, color2, size = 90 }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => { const t = setTimeout(() => setCurrent(val), 300); return () => clearTimeout(t); }, [val]);
  const r = (size / 2) - 8;
  const circ = 2 * Math.PI * r;
  const offset = circ - (current / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      <defs>
        <linearGradient id={`g${color.replace('#','')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color2} />
        </linearGradient>
      </defs>
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={`url(#g${color.replace('#','')})`} strokeWidth="7"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)" }}
      />
    </svg>
  );
}
