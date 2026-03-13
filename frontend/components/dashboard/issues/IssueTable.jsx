import ProgressBar from "@/components/ui/ProgressBar"

function SevBadge({ sev }) {
  const dot = sev === "high" ? "● "
    : sev === "medium" ? "◆ " : "▸ "
  return (
    <span className={`sev-badge ${sev}`}>
      {dot}{sev.toUpperCase()}
    </span>
  )
}

function DifficultyPill({ difficulty }) {
  const d = (difficulty || "medium").toLowerCase()
  const cls = d === "easy" ? "green" : d === "medium" ? "cyan" : "violet"
  const label = d.charAt(0).toUpperCase() + d.slice(1)
  return <span className={`glow-pill ${cls}`}>{label}</span>
}

export default function IssueTable({ issues = [], selected, onSelect }) {
  if (issues.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No issues to display.</p>
  }

  return (
    <table className="issue-table" style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>Issue</th>
          <th>Severity</th>
          <th>Pages</th>
          <th>Impact %</th>
          <th>Difficulty</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {issues.map((iss, i) => (
          <tr
            key={iss.issue_code || i}
            onClick={() => onSelect?.(selected === i ? null : i)}
            style={{
              cursor: "pointer",
              background: selected === i ? "rgba(124,58,237,0.08)" : ""
            }}
          >
            <td style={{ fontWeight: 500, maxWidth: 220 }}>{iss.issue_message}</td>
            <td><SevBadge sev={iss.severity} /></td>
            <td style={{ color: "var(--text2)" }}>{iss.pages_affected}</td>
            <td>
              <span style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                color: iss.impact_percentage > 15 ? "var(--red)" : iss.impact_percentage > 8 ? "var(--amber)" : "var(--text2)"
              }}>
                +{iss.impact_percentage}%
              </span>
            </td>
            <td>
              <DifficultyPill difficulty={iss.difficulty} />
            </td>
            <td>
              <button
                className="fix-ai-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onSelect?.(i)
                }}
              >
                ✦ Fix with AI
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
