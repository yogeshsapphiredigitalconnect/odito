import styles from "../ai-search-audit.module.css";



export default function UrlList({

  issue, selIdx, setSelIdx, fixed, checked,

  setChecked, progress, openCount, onBulkOpen, setMode

}) {

  const sevCol = issue.sev === "crit" ? "#ff3860" : issue.sev === "warn" ? "#ffb703" : "#00dfff";



  return (

    <div className={styles.urlSection}>

      {/* Header */}

      <div className={styles.urlSectionHead}>

        <div className={styles.urlSectionTitle}>

          Affected Pages{" "}

          <span style={{ color:sevCol, fontSize:10, fontWeight:600 }}>({openCount} open)</span>

        </div>

        <div className={styles.urlSectionActions}>

          {openCount > 1 && (

            <button className={`${styles.btn} ${styles.btnSm}`} onClick={() =>

              setChecked(issue.urls.map((_,i)=>i).filter(i=>!fixed.includes(i)))

            }>☐ All</button>

          )}

          {checked.length > 0 && (

            <button className={`${styles.btn} ${styles.btnSm} ${styles.btnPr}`} onClick={onBulkOpen}>

              ✦ Bulk Fix {checked.length}

            </button>

          )}

        </div>

      </div>



      {/* Bulk bar */}

      {checked.length > 0 && (

        <div className={styles.bulkBar}>

          <span>✦</span>

          <span>{checked.length} selected</span>

          <button className={`${styles.btn} ${styles.btnPr}`} style={{ marginLeft:"auto" }} onClick={onBulkOpen}>

            Bulk Fix

          </button>

          <button className={`${styles.btn} ${styles.btnSm}`} onClick={() => setChecked([])}>Clear</button>

        </div>

      )}



      {/* URL rows */}

      {issue.urls.map((u, i) => {

        const isDone = fixed.includes(i);

        const isSel  = selIdx === i;

        return (

          <div

            key={i}

            className={`${styles.urlRow}${isSel ? " " + styles.urlRowSel : ""}${isDone ? " " + styles.urlRowDone : ""}`}

            onClick={() => !isDone && setSelIdx(isSel ? null : i)}

          >

            {!isDone && (

              <input

                type="checkbox"

                checked={checked.includes(i)}

                onChange={e => {

                  e.stopPropagation();

                  setChecked(c => c.includes(i) ? c.filter(x=>x!==i) : [...c, i]);

                }}

                onClick={e => e.stopPropagation()}

                style={{ accentColor:"#7730ed", width:12, height:12, flexShrink:0, cursor:"pointer" }}

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

                onClick={e => { e.stopPropagation(); setSelIdx(i); setMode("ai"); }}

              >✦ Fix</button>

            )}

          </div>

        );

      })}



      {/* Progress */}

      <div className={styles.urlProgressBox}>

        <div className={styles.progressRow}>

          <span style={{ color:"#8494b0" }}>Fix Progress</span>

          <span style={{ fontWeight:700, color: progress===100 ? "#00f5a0" : "#8494b0" }}>

            {fixed.length}/{issue.urls.length} Fixed

          </span>

        </div>

        <div className={styles.pb}>

          <div className={styles.pbf} style={{ width:progress+"%", background: progress===100 ? "#00f5a0" : "#00dfff" }}/>

        </div>

        {progress === 100 && (

          <div className={styles.progressDone}>🎉 All fixed! Re-scan to confirm AI improvement.</div>

        )}

      </div>

    </div>

  );

}

