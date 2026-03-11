export default function CoreMetrics({ metrics }) {
  function MetricStatus({ status }) {
    return status === "pass"
      ? <span style={{ fontSize: 16 }}>✅</span>
      : <span style={{ fontSize: 16 }}>⚠️</span>
  }
  
  return (
    <div className="glass-card" style={{ padding: 20 }}>
      <div style={{ 
        fontFamily: "var(--font-display)", 
        fontWeight: 700, 
        marginBottom: 16, 
        fontSize: 14 
      }}>
        Core Metrics
      </div>
      {metrics.map((m, i) => (
        <div key={i} style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          padding: "12px 0", 
          borderBottom: i < metrics.length - 1 ? "1px solid var(--border)" : "none" 
        }}>
          <div style={{ 
            fontSize: 12, 
            fontWeight: 700, 
            color: "var(--text3)", 
            textTransform: "uppercase", 
            letterSpacing: "0.06em" 
          }}>
            {m.name}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ 
              fontFamily: "var(--font-display)", 
              fontWeight: 800, 
              fontSize: 20, 
              color: m.status === "pass" ? "var(--green)" : "var(--red)" 
            }}>
              {m.val}
            </div>
            <MetricStatus status={m.status} />
          </div>
        </div>
      ))}
    </div>
  )
}
