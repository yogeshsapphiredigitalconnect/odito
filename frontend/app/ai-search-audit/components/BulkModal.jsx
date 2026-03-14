import styles from "../ai-search-audit.module.css";

export default function BulkModal({ checked, issue, onApply, onCancel }) {
  return (
    <div className={styles.modalBg}>
      <div style={{ 
        background:"var(--bg2)", 
        border:"1px solid rgba(119,48,237,.3)", 
        borderRadius:16, 
        maxWidth:460, 
        width:"100%", 
        padding:22, 
        animation:"fu .3s forwards" 
      }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:16, fontWeight:800, marginBottom:5 }}>
          ✦ Bulk AI Fix
        </div>
        <div style={{ fontSize:12, color:"var(--t2)", marginBottom:14 }}>
          Fixing <strong style={{ color:"var(--cy)" }}>{checked.length} pages</strong> for: {issue.title}
        </div>
        
        <div style={{ maxHeight:180, overflowY:"auto", marginBottom:14 }}>
          {checked.map((idx, i) => (
            <div key={i} style={{ 
              display:"flex", alignItems:"center", gap:8, marginBottom:6, 
              padding:"7px 10px", background:"var(--bg3)", borderRadius:8 
            }}>
              <span style={{ color:"var(--gr)" }}>✓</span>
              <span style={{ 
                fontFamily:"var(--fm)", color:"var(--cy)", flex:1, fontSize:10.5 
              }}>
                {issue.urls[idx]?.url}
              </span>
              <span className={`${styles.pill} ${styles.pillGreen}`} style={{ fontSize:9 }}>
                Ready
              </span>
            </div>
          ))}
        </div>

        <button className={`${styles.act} ${styles.actPr}`} onClick={onApply}>
          ✓ Apply All Fixes ({checked.length})
        </button>
        <button className={`${styles.act} ${styles.actGh}`} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}
