import { KEYWORDS } from "@/lib/constants/mockData"

export default function KeywordTable() {
  function CompBadge({ comp }) {
    const map = {
      "High":      { bg:"rgba(255,69,96,0.15)",   color:"var(--red)",    border:"rgba(255,69,96,0.25)"   },
      "Very High": { bg:"rgba(168,85,247,0.15)",  color:"var(--purple)", border:"rgba(168,85,247,0.25)"  },
      "Medium":    { bg:"rgba(255,187,51,0.12)",  color:"var(--amber)",  border:"rgba(255,187,51,0.25)"  },
      "Low":       { bg:"rgba(16,255,160,0.10)",  color:"var(--green)",  border:"rgba(16,255,160,0.20)"  },
    }
    const s = map[comp] || map["Medium"]
    return (
      <span style={{
        background: s.bg, color: s.color,
        border: `1px solid ${s.border}`,
        padding:"3px 10px", borderRadius:20,
        fontSize:11, fontWeight:700
      }}>
        {comp}
      </span>
    )
  }

  function AIBars({ val }) {
    const heights = [40, 60, 80, 100]
    const filled = val > 25 ? 4 : val > 15 ? 3 
                 : val > 8  ? 2 : 1
    return (
      <div style={{ display:"flex", alignItems:"flex-end",
                    gap:2, height:16 }}>
        {heights.map((h, i) => (
          <div key={i} style={{
            width: 3,
            height: `${h}%`,
            borderRadius: 2,
            background: i < filled
              ? "var(--cyan)"
              : "rgba(0,229,255,0.2)"
          }} />
        ))}
      </div>
    )
  }

  function RankDisplay({ rank }) {
    return (
      <div style={{ display:"flex", alignItems:"center",
                    gap:2 }}>
        <span style={{ color:"var(--cyan)", fontSize:11,
                       fontWeight:700, opacity:0.6 }}>
          ##
        </span>
        <span style={{
          fontFamily:"var(--font-display)",
          fontWeight:800, fontSize:18,
          color:"var(--cyan)"
        }}>
          {rank}
        </span>
      </div>
    )
  }

  return (
    <div className="glass-card" style={{ overflow:"hidden" }}>
      <table className="issue-table" style={{ width:"100%" }}>
        <thead>
          <tr>
            {["Keyword","Rank","Volume","Competition",
              "Change","AI Visibility","Ranking URL"]
              .map(h => (
                <th key={h}>{h}</th>
              ))}
          </tr>
        </thead>
        <tbody>
          {KEYWORDS.map((k, i) => (
            <tr key={i}>
              <td style={{ fontWeight:500, fontSize:13 }}>
                {k.kw}
              </td>
              <td><RankDisplay rank={k.rank} /></td>
              <td style={{ color:"var(--text2)" }}>
                {k.vol.toLocaleString()}
              </td>
              <td><CompBadge comp={k.comp} /></td>
              <td style={{
                fontWeight:700, fontSize:13,
                color: k.change > 0
                  ? "var(--green)" : "var(--red)"
              }}>
                {k.change > 0 ? "▲" : "▼"}{" "}
                {Math.abs(k.change)}
              </td>
              <td>
                <div style={{ display:"flex",
                  alignItems:"center", gap:8 }}>
                  <AIBars val={k.ai} />
                  <span style={{ fontSize:12,
                    fontWeight:700, color:"var(--cyan)" }}>
                    {k.ai}%
                  </span>
                </div>
              </td>
              <td style={{ fontSize:12,
                color:"var(--text3)" }}>
                {k.url}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
