import { TECH_CHECKS } from "@/lib/constants/mockData"

export default function StatusBreakdown() {
  const pass = TECH_CHECKS.filter(c => c.status === "pass").length
  const warn = TECH_CHECKS.filter(c => c.status === "warn").length
  const fail = TECH_CHECKS.filter(c => c.status === "fail").length

  return (
    <div>
      <div className="glass-card" style={{ padding: 20, marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>
          Status Breakdown
        </div>
        <div className="breakdown-row">
          <span style={{ color: "var(--green)" }}>
            ✓ Passing
          </span>
          <span className="breakdown-count" style={{ color: "var(--green)" }}>
            {pass}
          </span>
        </div>
        <div className="breakdown-row">
          <span style={{ color: "var(--amber)" }}>
            ⚠ Warnings
          </span>
          <span className="breakdown-count" style={{ color: "var(--amber)" }}>
            {warn}
          </span>
        </div>
        <div className="breakdown-row">
          <span style={{ color: "var(--red)" }}>
            ✗ Critical
          </span>
          <span className="breakdown-count" style={{ color: "var(--red)" }}>
            {fail}
          </span>
        </div>
      </div>
      
      <div className="ai-card">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="ai-card-label">✦ ARIA Technical Insight</div>
          <span style={{ color: "var(--cyan)", fontSize: 14 }}>✦</span>
        </div>
        <div className="ai-card-text">
          3 critical issues require immediate attention: fix H1 tags, 
          validate schema markup, and resolve broken links. These 3 fixes 
          alone can recover an estimated{" "}
          <strong style={{ color: "var(--cyan)", cursor: "pointer" }}>
            +11 SEO Health points.
          </strong>
        </div>
      </div>
    </div>
  )
}
