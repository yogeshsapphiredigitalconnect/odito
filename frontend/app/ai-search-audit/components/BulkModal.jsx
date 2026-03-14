import styles from "../ai-search-audit.module.css";

export default function BulkModal({ checked, issue, onApply, onClose }) {
  return (
    <div className={styles.modalBg} onClick={onClose}>
      <div className={styles.bulkModal} onClick={e => e.stopPropagation()}>
        <div className={styles.bulkModalTitle}>✦ Bulk AI Fix</div>
        <div className={styles.bulkModalSub}>
          Fixing <strong style={{ color:"#00dfff" }}>{checked.length} pages</strong> for: {issue.title}
        </div>
        <div className={styles.bulkModalList}>
          {checked.map((idx, i) => (
            <div key={i} className={styles.bulkModalRow}>
              <span style={{ color:"#00f5a0" }}>✓</span>
              <span className={styles.bulkModalUrl}>{issue.urls[idx]?.url}</span>
              <span className={styles.bulkModalReady}>Ready</span>
            </div>
          ))}
        </div>
        <button className={`${styles.act} ${styles.actPr}`} onClick={onApply}>
          ✓ Apply All Fixes ({checked.length})
        </button>
        <button className={`${styles.act} ${styles.actGh}`} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
