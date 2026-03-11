"use client"
import { useState } from "react"
import { PAGESPEED } from "@/lib/constants/mockData"
import DeviceTabs from "@/components/dashboard/pagespeed/DeviceTabs"
import PerformanceRing from "@/components/dashboard/pagespeed/PerformanceRing"
import CoreMetrics from "@/components/dashboard/pagespeed/CoreMetrics"

export default function PageSpeedPageContent() {
  const [device, setDevice] = useState("mobile")
  const d = PAGESPEED[device]
  const metrics = [
    { l: "LCP", v: d.metrics[0].val, ok: d.metrics[0].status === "pass" },
    { l: "CLS", v: d.metrics[1].val, ok: d.metrics[1].status === "pass" },
    { l: "FCP", v: d.metrics[2].val, ok: d.metrics[2].status === "pass" },
    { l: "TTFB", v: d.metrics[3].val, ok: d.metrics[3].status === "pass" },
    { l: "Speed Index", v: d.metrics[4].val, ok: d.metrics[4].status === "pass" },
  ]
  
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div className="section-head" style={{ margin: 0 }}>
          <div className="section-title">PageSpeed Insights</div>
          <div className="section-tag">CORE WEB VITALS</div>
        </div>
        <DeviceTabs active={device} onChange={setDevice} />
      </div>
      <div className="two-col">
        <div>
          <div className="score-card" style={{ marginBottom: 16, "--grad": d.score > 70 ? "linear-gradient(90deg,#10ffa0,#00e5ff)" : "linear-gradient(90deg,#ff4560,#ffbb33)" }}>
            <div className="score-label">Performance Score</div>
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <PerformanceRing
                score={d.score}
                color={d.score > 70 ? "#10ffa0" : "#ff4560"}
                color2={d.score > 70 ? "#00e5ff" : "#ffbb33"}
                label={device}
              />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: d.score > 70 ? "var(--green)" : "var(--red)" }}>{d.score}</div>
              </div>
            </div>
            <div className="score-sub">{device === "mobile" ? "📱 Mobile" : "🖥 Desktop"}</div>
          </div>
          <div className="ai-card">
            <div className="ai-card-label">✦ Traffic Impact</div>
            <div className="ai-card-text">
              {device === "mobile" ? 
                <>Your mobile LCP of {metrics[0].v} exceeds Google's 2.5s threshold. Estimated traffic loss: <strong style={{ color: "var(--red)" }}>~12–18% of mobile sessions</strong>.</> : 
                <><strong style={{ color: "var(--green)" }}>No significant traffic loss detected</strong> on desktop.</>
              }
            </div>
          </div>
        </div>
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, marginBottom: 16, fontSize: 14 }}>Core Metrics</div>
          {metrics.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < metrics.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{m.l}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 20, color: m.ok ? "var(--green)" : "var(--red)" }}>{m.v}</div>
                <div style={{ fontSize: 16 }}>{m.ok ? "✅" : "⚠️"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
