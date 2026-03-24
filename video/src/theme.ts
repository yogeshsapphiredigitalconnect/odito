export const theme = {
  // Backgrounds
  bg: "#080c14", // near-black
  bgCard: "#0d1220", // card surface
  bgCardHi: "#111827", // highlighted card
  bgGlass: "rgba(255,255,255,0.03)", // glass panels

  // Borders
  border: "rgba(255,255,255,0.06)",
  borderHi: "rgba(255,255,255,0.12)",

  // Text
  text: "#f0f4ff", // primary white
  textMuted: "#6b7a9e", // muted blue-gray
  textDim: "#3a4468", // very dim

  // Semantic colors
  pass: "#10b981", // emerald green
  passGlow: "rgba(16,185,129,0.15)",
  fail: "#ef4444", // red
  failGlow: "rgba(239,68,68,0.15)",
  warn: "#f59e0b", // amber
  warnGlow: "rgba(245,158,11,0.15)",

  // Score colors
  scoreHigh: "#ef4444", // red (score < 50)
  scoreMid: "#f59e0b", // amber (score 50-70)
  scoreGood: "#10b981", // green (score > 70)

  // Issue severity
  high: "#ef4444",
  highGlow: "rgba(239,68,68,0.12)",
  medium: "#f97316",
  mediumGlow: "rgba(249,115,22,0.12)",
  low: "#eab308",
  lowGlow: "rgba(234,179,8,0.12)",

  // AI / special
  ai: "#8b5cf6", // violet
  aiGlow: "rgba(139,92,246,0.2)",
  accent: "#3b82f6", // blue
  accentGlow: "rgba(59,130,246,0.15)",

  // Performance
  poor: "#ef4444",
  moderate: "#f59e0b",
  good: "#10b981",
} as const;
