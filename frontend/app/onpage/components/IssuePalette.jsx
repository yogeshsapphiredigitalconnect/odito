export default function IssuePalette({ counts, active, onChange }) {
  const paletteItems = [
    { id: "all", label: "All Issues", color: "#8494b0", count: counts.crit + counts.warn + counts.low },
    { id: "crit", label: "Critical", color: "#ff3860", count: counts.crit },
    { id: "warn", label: "Medium", color: "#ffb703", count: counts.warn },
    { id: "low", label: "Low", color: "#00dfff", count: counts.low },
  ]

  return (
    <div className="palette-row">
      {paletteItems.map(item => (
        <div
          key={item.id}
          className={`pal-card${active === item.id ? " on" : ""}`}
          onClick={() => onChange(item.id)}
        >
          <div className="pal-dot" style={{ background: item.color }}></div>
          <div className="pal-count" style={{ color: item.color }}>{item.count}</div>
          <div className="pal-label">{item.label}</div>
          <div className="pal-stripe" style={{ background: item.color }}></div>
        </div>
      ))}
    </div>
  )
}
