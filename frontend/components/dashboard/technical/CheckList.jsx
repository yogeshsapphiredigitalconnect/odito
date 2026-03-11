import { TECH_CHECKS } from "@/lib/constants/mockData"

function StatusIcon({ status }) {
  if (status === "pass") return (
    <span style={{ color:"var(--green)", fontSize:16 }}>✓</span>
  )
  if (status === "warn") return (
    <span style={{ color:"var(--amber)", fontSize:16 }}>⚠</span>
  )
  return (
    <span style={{ color:"var(--red)", fontSize:16 }}>✗</span>
  )
}

export default function CheckList() {
  return (
    <div className="glass-card">
      <div className="card-header">
        <span className="section-title">
          Homepage Technical Checks
        </span>
        <span className="section-tag">
          {TECH_CHECKS.length} CHECKS
        </span>
      </div>
      <div className="check-list">
        {TECH_CHECKS.map((check, i) => (
          <div key={i} className="check-item">
            <StatusIcon status={check.status} />
            <div>
              <div className="check-name">{check.name}</div>
              <div className="check-desc">{check.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
