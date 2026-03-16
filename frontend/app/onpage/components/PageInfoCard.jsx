export default function PageInfoCard({ pageData }) {
  const { url, name, title, description, statusCode, wordCount, loadTime, issues } = pageData

  return (
    <div className="info-card">
      <div className="info-top">
        <div className="info-favicon">🌐</div>
        <div>
          <div className="info-pg-name" style={{
            fontFamily: 'var(--font-display)',
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--t)',
            lineHeight: 1.1,
            marginBottom: '3px'
          }}>{name}</div>
          <div className="info-pg-url" style={{
            fontFamily: 'var(--font-body)',
            fontSize: '11px',
            color: 'var(--cy)'
          }}>{url}</div>
        </div>
      </div>

      <div className="info-field">
        <div className="info-lbl">Page Title</div>
        <div className="info-val is-title">{title}</div>
      </div>

      <div className="info-field">
        <div className="info-lbl">Meta Description</div>
        <div className="info-val">{description}</div>
      </div>

      <div className="info-chips">
        <span className={`sb-status ${statusCode === 200 ? 's200' : 's404'}`}>
          {statusCode === 200 ? "✓ 200 OK" : `✗ ${statusCode}`}
        </span>
        <span className="info-chip">📝 {wordCount.toLocaleString()} words</span>
        <span className="info-chip">⚡ {loadTime} load</span>
      </div>

          </div>
  )
}
