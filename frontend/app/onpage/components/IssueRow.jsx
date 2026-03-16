export default function IssueRow({ issue, isSelected, isFixed, onSelect }) {
  const getSeverityClass = (severity) => {
    if (severity === "critical" || severity === "high") return "crit"
    if (severity === "warning" || severity === "medium") return "warn"
    if (severity === "low") return "low"
    return "low"
  }

  const getSeverityLabel = (severity) => {
    if (severity === "critical" || severity === "high") return "● Critical"
    if (severity === "warning" || severity === "medium") return "◆ Medium"
    if (severity === "low") return "○ Low"
    return "○ Low"
  }

  const getCategoryColor = (category) => {
    const colors = {
      "GEO": "#8b5cf6",
      "AEO": "#06b6d4", 
      "AISEO": "#00dfff",
      "TECHNICAL": "#ff3860",
      "CONTENT": "#ffb703"
    }
    return colors[category] || "var(--cy)"
  }

  const getIcon = (category) => {
    const icons = {
      "GEO": "🧩",
      "AEO": "⚡",
      "AISEO": "🤖",
      "TECHNICAL": "⚙",
      "CONTENT": "📝"
    }
    return icons[category] || "⚠"
  }

  const sevClass = getSeverityClass(issue.severity)
  const catColor = getCategoryColor(issue.category)
  const icon = getIcon(issue.category)

  return (
    <div
      className={`issue-row ${sevClass}`}
      style={{
        borderColor: isSelected ? "rgba(119,48,237,0.4)" : undefined,
        background: isSelected ? "rgba(119,48,237,0.07)" : undefined,
        opacity: isFixed ? 0.5 : 1
      }}
      onClick={() => !isFixed && onSelect()}
    >
      <div className="ir-top">
        <div className={`ir-icon ${sevClass}`}>{icon}</div>
        <div className="ir-title">{issue.title || issue.issue_message || issue.issue}</div>
        <span className={`ir-sev ${sevClass}`}>{getSeverityLabel(issue.severity)}</span>
        <span 
          className="ir-cat" 
          style={{ 
            color: catColor, 
            border: `1px solid ${catColor}44`, 
            background: `${catColor}11` 
          }}
        >
          {issue.category || "GENERAL"}
        </span>
      </div>
      
      <div className="ir-desc">
        {issue.description || issue.message || "Issue detected on this page that needs attention."}
      </div>
      
      <div className="ir-footer">
        <span style={{
          fontSize: "10px",
          fontWeight: 600,
          color: "var(--gr)",
          background: "rgba(0,245,160,0.07)",
          border: "1px solid rgba(0,245,160,0.15)",
          padding: "2px 8px",
          borderRadius: "6px"
        }}>
          ▲ +{issue.impact || issue.impact_percentage || 0}% Impact
        </span>
        
        {isFixed ? (
          <span className="fix-chip fixed" style={{ marginLeft: "auto" }}>✓ Fixed</span>
        ) : (
          <button 
            className="fix-chip" 
            onClick={(e) => {
              e.stopPropagation()
              onSelect()
            }}
          >
            ✦ Fix
          </button>
        )}
      </div>
    </div>
  )
}
