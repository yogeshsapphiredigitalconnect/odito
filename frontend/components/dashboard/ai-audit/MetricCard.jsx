"use client"

export default function MetricCard({ icon, label, val, color }) {
  const getColorByValue = (value) => {
    if (value < 40) return '#ff3860'
    if (value < 65) return '#ffb703'
    return '#00f5a0'
  }

  const valueColor = getColorByValue(val)
  const improvement = Math.floor(val / 12)

  return (
    <div className="m-card">
      <div className="m-top">
        <span className="m-icon">{icon}</span>
        <span style={{ fontSize: '9px', color: valueColor, fontWeight: '600' }}>
          ▲ +{improvement}
        </span>
      </div>
      <div className="m-val" style={{ color: valueColor }}>
        {val}
        <span style={{ fontSize: '11px', fontWeight: '500', color: 'var(--t3)' }}>
          /100
        </span>
      </div>
      <div className="m-label">{label}</div>
      <div className="m-bar">
        <div 
          className="m-fill" 
          style={{ 
            width: `${val}%`, 
            background: color 
          }} 
        />
      </div>
      <div className="m-bottom-stripe" style={{ background: color }} />
    </div>
  )
}
