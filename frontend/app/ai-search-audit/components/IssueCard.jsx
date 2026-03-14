import { useState } from "react";
import { CAT_COLORS } from "../data/issuesData";
import UrlList from "./UrlList";
import FixPanel from "./FixPanel";
import BulkModal from "./BulkModal";
import styles from "../ai-search-audit.module.css";

export default function IssueCard({ issue }) {
  const [open, setOpen] = useState(false);
  const [selIdx, setSelIdx] = useState(null);
  const [fixed, setFixed] = useState([]);
  const [checked, setChecked] = useState([]);
  const [showBulk, setShowBulk] = useState(false);

  const progress = issue.urls.length ? (fixed.length / issue.urls.length) * 100 : 0;
  const openCount = issue.urls.filter((_, i) => !fixed.includes(i)).length;
  const sevCol = issue.sev === "crit" ? "var(--re)" : issue.sev === "warn" ? "var(--am)" : "var(--cy)";
  const catCol = CAT_COLORS[issue.cat] || "var(--cy)";

  function markFixed() {
    if (selIdx !== null) {
      setFixed(f => [...f, selIdx]);
      setSelIdx(null);
    }
  }

  return (
    <div className={`${styles.issueCard} ${styles["sev-" + issue.sev]} ${open ? styles.issueCardOpen : ""}`}>
      <div className={styles.issueHeader} onClick={() => setOpen(o => !o)}>
        <div className={styles.iIcon}>{issue.icon}</div>
        <div className={styles.iContent}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:3, flexWrap:"wrap" }}>
            <div className={styles.iTitle}>{issue.title}</div>
            <span className={styles.pill} style={{ color:catCol, borderColor:catCol+"44", background:catCol+"11", fontSize:9 }}>
              {issue.cat}
            </span>
            <span className={styles.pill} style={{ color:sevCol, borderColor:sevCol+"33", background:sevCol+"0d", fontSize:9 }}>
              {issue.sev === "crit" ? "● Critical" : issue.sev === "warn" ? "◆ Warning" : "ℹ Info"}
            </span>
          </div>
          <div className={styles.iDesc}>{issue.desc}</div>
          <div className={styles.iMeta}>
            <span className={styles.iPages}>{issue.pages} pages</span>
            <span className={styles.iImpact}>▲ {issue.impact}</span>
            <span className={styles.pill} style={{ fontSize:9 }}>{issue.diff}</span>
            {fixed.length > 0 && (
              <span className={styles.pillGreen} style={{ fontSize:9 }}>✓ {fixed.length} fixed</span>
            )}
          </div>
        </div>
        <div className={`${styles.iChevron} ${open ? styles.iChevronOpen : ""}`}>›</div>
      </div>

      {open && (
        <div className={styles.issueBody}>
          <div className={styles.issueBodyInner}>
            <UrlList
              issue={issue}
              selIdx={selIdx}
              setSelIdx={setSelIdx}
              fixed={fixed}
              checked={checked}
              setChecked={setChecked}
              showBulk={showBulk}
              setShowBulk={setShowBulk}
              sevCol={sevCol}
            />
            <FixPanel
              issue={issue}
              selIdx={selIdx}
              onFixed={markFixed}
            />
          </div>
        </div>
      )}

      {showBulk && (
        <BulkModal
          checked={checked}
          issue={issue}
          onApply={() => {
            setFixed(f => [...f, ...checked]);
            setChecked([]);
            setShowBulk(false);
          }}
          onCancel={() => setShowBulk(false)}
        />
      )}
    </div>
  );
}
