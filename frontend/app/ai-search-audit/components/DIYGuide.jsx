import styles from "../ai-search-audit.module.css";

export default function DIYGuide({ issue }) {
  return (
    <div style={{ animation:"fu .3s forwards" }}>
      <div className={styles.ariaBox}>
        <div className={styles.ariaLbl}>🛠 What to do</div>
        <div className={styles.ariaBody}>{issue.aria}</div>
      </div>
      
      {issue.steps.map((s, i) => (
        <div key={i} className={styles.step}>
          <div className={styles.stepN}>{i + 1}</div>
          <div>
            <div className={styles.stepT}>{s.t}</div>
            <div className={styles.stepD}>{s.d}</div>
          </div>
        </div>
      ))}
      
      <div style={{ fontSize:9, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:".08em", margin:"12px 0 7px" }}>
        Code Reference
      </div>
      <div className={styles.diff}>
        <div className={styles.diffBox}>
          <div className={styles.diffLbl}>❌ Before</div>
          <pre>{issue.b4}</pre>
        </div>
        <div className={styles.diffBox}>
          <div className={styles.diffLbl}>✅ After</div>
          <pre>{issue.af}</pre>
        </div>
      </div>
      <button className={`${styles.act} ${styles.actPr}`}>
        📥 Download Checklist
      </button>
      <button className={`${styles.act} ${styles.actGh}`}>
        📋 Copy Code
      </button>
    </div>
  );
}
