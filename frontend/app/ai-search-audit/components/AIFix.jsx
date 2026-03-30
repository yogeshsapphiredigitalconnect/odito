import { useState } from "react";
import styles from "../ai-search-audit.module.css";

export default function AIFix({ issue, selUrl, onFixed }) {
  const [phase, setPhase] = useState("idle");
  const [lines, setLines] = useState([]);
  const [copied, setCopied] = useState(false);

  function startFix() {
    if (!selUrl) return;
    setPhase("streaming");
    setLines([]);
    
    const msgs = [
      { t: 0, l: "🔍 Scanning " + selUrl + "…" },
      { t: 600, l: "🧩 Checking " + (issue.cat === "AEO" ? "FAQ / snippet signals" : issue.cat === "GEO" ? "conversational patterns" : "AI entity signals") + "…" },
      { t: 1300, l: "✦ Issue confirmed: " + issue.title },
      { t: 2100, l: "🧠 Generating optimized markup…" },
      { t: 2900, l: "✅ Fix ready — +" + (issue.impact_percentage || 0) + "% SEO Impact" },
    ];
    
    const ts = msgs.map(m => setTimeout(() => setLines(l => [...l, m.l]), m.t));
    setTimeout(() => setPhase("done"), 3100);
    
    return () => ts.forEach(clearTimeout);
  }

  if (phase === "idle") {
    return (
      <>
        <div className={styles.ariaBox}>
          <div className={styles.ariaLbl}>✦ ARIA</div>
          <div className={styles.ariaBody}>{issue.aria}</div>
        </div>
        <div className={styles.promptBlock}>
          <div style={{ fontSize:9, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:6 }}>
            AI Prompt Template
          </div>
          <div style={{ fontSize:10.5, color:"var(--t2)", lineHeight:1.55, marginBottom:8 }}>
            {issue.prompt}
          </div>
          <button 
            className={`${styles.btn} ${styles.btnSm}`}
            onClick={() => navigator.clipboard?.writeText(issue.prompt).catch(() => {})}
          >
            📋 Copy Prompt
          </button>
        </div>
        <button 
          className={`${styles.act} ${styles.actPr}`}
          style={{ opacity: selUrl ? 1 : 0.4 }}
          onClick={startFix}
        >
          {selUrl ? "✦ Generate AI Fix for " + (selUrl.split("/").pop() || "page") : "← Select a page first"}
        </button>
        <div className={styles.diff}>
          <div className={styles.diffBox}>
            <div className={styles.diffLbl}>❌ Current</div>
            <pre>{issue.b4}</pre>
          </div>
          <div className={styles.diffBox}>
            <div className={styles.diffLbl}>✅ Fixed</div>
            <pre>{issue.af}</pre>
          </div>
        </div>
      </>
    );
  }

  if (phase === "streaming") {
    return (
      <div className={styles.streamBox}>
        {lines.map((l, i) => (
          <div key={i} className={styles.sl}>{l}</div>
        ))}
        <span className={styles.cur} />
      </div>
    );
  }

  return (
    <div style={{ animation:"fu .3s forwards" }}>
      <div className={styles.streamBox}>
        {lines.map((l, i) => (
          <div key={i} className={styles.sl}>{l}</div>
        ))}
      </div>
      <div style={{ fontSize:9, fontWeight:700, color:"var(--t3)", textTransform:"uppercase", letterSpacing:".08em", marginBottom:7 }}>
        Generated Fix
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
      <div className={styles.ariaBox} style={{ marginBottom:10, padding:"10px 12px" }}>
        <div className={styles.ariaLbl}>✦ ARIA</div>
        <div className={styles.ariaBody} style={{ fontSize:11 }}>
          Applying fix to <span style={{ color:"var(--cy)", fontFamily:"var(--fm)", fontSize:9.5 }}>{selUrl}</span> — est. <strong style={{ color:"var(--gr)" }}>+{issue.impact_percentage || 0}% SEO Impact</strong>
        </div>
      </div>
      <button className={`${styles.act} ${styles.actPr}`} onClick={onFixed}>
        ✓ Mark as Fixed
      </button>
      <button 
        className={`${styles.act} ${styles.actGh}`}
        onClick={() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "✓ Copied!" : "📋 Copy Code"}
      </button>
      <button className={`${styles.act} ${styles.actGh}`}>
        👥 Send to Dev Team
      </button>
      <button className={`${styles.act} ${styles.actGh}`} onClick={() => setPhase("idle")}>
        ← Back
      </button>
    </div>
  );
}
