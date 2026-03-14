import styles from "../ai-search-audit.module.css";

export default function UrlList({ 
  issue, 
  selIdx, 
  setSelIdx, 
  fixed, 
  checked, 
  setChecked, 
  showBulk, 
  setShowBulk, 
  sevCol 
}) {
  const openCount = issue.urls.filter((_, i) => !fixed.includes(i)).length;
  const progress = issue.urls.length ? (fixed.length / issue.urls.length) * 100 : 0;

  return (
    <div className={styles.urlSection}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
        <div style={{ fontFamily:"var(--fd)", fontSize:12, fontWeight:700 }}>
          Affected Pages <span style={{ color:sevCol, fontSize:10, fontWeight:600 }}>({openCount} open)</span>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {openCount > 1 && (
            <button 
              className={`${styles.btn} ${styles.btnSm}`}
              onClick={() => setChecked(issue.urls.map((_, i) => i).filter(i => !fixed.includes(i)))}
            >
              ☐ All
            </button>
          )}
          {checked.length > 0 && (
            <button 
              className={`${styles.btn} ${styles.btnSm} ${styles.btnPr}`}
              onClick={() => setShowBulk(true)}
            >
              ✦ Bulk Fix {checked.length}
            </button>
          )}
        </div>
      </div>

      {checked.length > 0 && (
        <div className={styles.bulkBar}>
          <span>✦</span>
          <span>{checked.length} selected</span>
          <button 
            className={styles.act} 
            style={{ width:"auto", padding:"3px 10px", marginBottom:0, fontSize:10 }}
            onClick={() => setShowBulk(true)}
          >
            Bulk Fix
          </button>
          <button 
            className={styles.act} 
            style={{ width:"auto", padding:"3px 8px", marginBottom:0, fontSize:10 }}
            onClick={() => setChecked([])}
          >
            Clear
          </button>
        </div>
      )}

      {issue.urls.map((u, i) => {
        const isDone = fixed.includes(i);
        const isSel = selIdx === i;
        return (
          <div 
            key={i} 
            className={`${styles.urlRow} ${isSel ? styles.urlRowSel : ""} ${isDone ? styles.urlRowDone : ""}`}
            onClick={() => !isDone && setSelIdx(isSel ? null : i)}
          >
            {!isDone && (
              <input 
                type="checkbox" 
                checked={checked.includes(i)}
                onChange={e => {
                  e.stopPropagation();
                  setChecked(c => c.includes(i) ? c.filter(x => x !== i) : [...c, i]);
                }}
                onClick={e => e.stopPropagation()}
                style={{ accentColor:"var(--vi)", width:12, height:12, flexShrink:0, cursor:"pointer" }}
              />
            )}
            <div style={{ flex:1, minWidth:0 }}>
              <div className={styles.uPath}>{u.url}</div>
              <div className={styles.uSub}>{u.sub}</div>
            </div>
            <span className={`${styles.uStatus} ${isDone ? styles.uStatusDone : styles.uStatusOpen}`}>
              {isDone ? "✓ Fixed" : "Open"}
            </span>
            {!isDone && (
              <button 
                className={styles.fixBtn}
                onClick={e => {
                  e.stopPropagation();
                  setSelIdx(i);
                }}
              >
                ✦ Fix
              </button>
            )}
          </div>
        );
      })}

      <div style={{ marginTop:12, padding:"10px 12px", background:"var(--bg2)", border:"1px solid var(--b)", borderRadius:9 }}>
        <div className={styles.progressRow}>
          <span style={{ color:"var(--t2)" }}>Fix Progress</span>
          <span style={{ fontWeight:700, color:progress === 100 ? "var(--gr)" : "var(--t2)" }}>
            {fixed.length}/{issue.urls.length} Fixed
          </span>
        </div>
        <div className={styles.pb}>
          <div 
            className={styles.pbf} 
            style={{ 
              width: progress + "%", 
              background: progress === 100 ? "var(--gr)" : "var(--cy)" 
            }}
          />
        </div>
        {progress === 100 && (
          <div style={{ marginTop:8, textAlign:"center", fontSize:11, color:"var(--gr)", fontWeight:600 }}>
            🎉 All fixed! Re-scan to confirm AI improvement.
          </div>
        )}
      </div>
    </div>
  );
}
