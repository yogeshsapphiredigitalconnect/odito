"use client"

import { useState, useEffect } from "react"
import { AI_AUDIT } from "@/lib/constants/mockData"

export default function AIFactorTable() {
  function ProgressBar({ val, color = "var(--cyan)", animated = true }) {
    const [w, setW] = useState(0);
    useEffect(() => { const t = setTimeout(() => setW(val), 400); return () => clearTimeout(t); }, [val]);
    return (
      <div className="prog-bar">
        <div className="prog-fill" style={{ width: animated ? `${w}%` : `${val}%`, background: color }} />
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ overflow: "hidden" }}>
      <table className="issue-table" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>AI Factor</th>
            <th>Score</th>
            <th>Progress</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {AI_AUDIT.factors.map((f, i) => {
            const col = f.score < 30 ? "var(--red)"
                      : f.score < 60 ? "var(--amber)"
                      : "var(--green)"
            return (
              <tr key={i}>
                <td style={{ fontWeight: 600, fontSize: 13 }}>
                  {f.name}
                </td>
                <td>
                  <span style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800, fontSize: 20,
                    color: col
                  }}>
                    {f.score}
                  </span>
                </td>
                <td style={{ width: 120 }}>
                  <ProgressBar val={f.score} color={col} />
                </td>
                <td style={{
                  fontSize: 12, color: "var(--text2)",
                  lineHeight: 1.5
                }}>
                  {f.rec}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
