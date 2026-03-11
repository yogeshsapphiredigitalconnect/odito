import { ISSUES } from "@/lib/constants/mockData"
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

export default function IssueTable({ selected, onSelect }) {
  return (
    <table className="issue-table" style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>Issue</th>
          <th>Severity</th>
          <th>Pages</th>
          <th>Impact %</th>
          <th>Difficulty</th>
          <th>AI Confidence</th>
        </tr>
      </thead>
      <tbody>
        {ISSUES.map((iss, i) => (
          <tr 
            key={i} 
            onClick={() => onSelect(selected === i ? null : i)} 
            style={{ 
              cursor: "pointer", 
              background: selected === i ? "rgba(124,58,237,0.08)" : "" 
            }}
          >
            <td style={{ fontWeight: 500, maxWidth: 220 }}>{iss.issue}</td>
            <td><SevBadge sev={iss.sev} /></td>
            <td style={{ color: "var(--text2)" }}>{iss.pages}</td>
            <td>
              <span style={{ 
                fontFamily: "var(--font-display)", 
                fontWeight: 700, 
                color: iss.impact > 15 ? "var(--red)" : iss.impact > 8 ? "var(--amber)" : "var(--text2)" 
              }}>
                +{iss.impact}%
              </span>
            </td>
            <td>
              <span className={`glow-pill ${iss.difficulty === "Easy" ? "green" : iss.difficulty === "Medium" ? "cyan" : "violet"}`}>
                {iss.difficulty}
              </span>
            </td>
            <td>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 50 }}>
                  <ProgressBar val={iss.ai} color="var(--cyan)" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--cyan)" }}>
                  {iss.ai}%
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
