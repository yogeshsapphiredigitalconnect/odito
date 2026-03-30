import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAT_COLORS, getCategoryColor } from "../data/issuesData";
import styles from "../ai-search-audit.module.css";

export default function IssueCard({ issue }) {
  const router = useRouter();
  const [fixed, setFixed] = useState([]);

  const sevCol = issue.sev === "crit" ? "#ff3860" : issue.sev === "warn" ? "#ffb703" : "#00dfff";
  const catCol = getCategoryColor(issue.cat);

  const handleFixClick = () => {
    router.push(`/ai-search-audit/issues/${issue.id}`);
  };

  return (
    <div className={`${styles.issueCard} ${styles["sev-" + issue.sev]}`}>
      {/* ── HEADER ── */}
      <div className={styles.issueHeader}>
        <div className={styles.iIcon}>
          {/* Icon based on category */}
          {issue.cat === 'GEO' && '🌍'}
          {issue.cat === 'AEO' && '💬'}
          {issue.cat === 'AISEO' && '🤖'}
          {issue.cat === 'topical_authority' && '💡'}
          {issue.cat === 'citation_probability' && '🎓'}
          {issue.cat === 'ai_impact' && '🧠'}
          {issue.cat === 'voice_intent' && '🗣️'}
          {issue.cat === 'llm_readiness' && '✨'}
          {issue.cat === 'aeo_score' && '🎯'}
          {!['GEO', 'AEO', 'AISEO', 'topical_authority', 'citation_probability', 'ai_impact', 'voice_intent', 'llm_readiness', 'aeo_score'].includes(issue.cat) && '🔍'}
        </div>
        <div className={styles.iContent}>
          {/* Title row */}
          <div className={styles.iTitleRow}>
            <span className={styles.iTitle}>{issue.title}</span>
            <span className={styles.iCatPill} style={{ color: catCol, borderColor: catCol + "44", background: catCol + "11" }}>
              {issue.cat}
            </span>
            <span className={styles.iSevPill} style={{ color: sevCol, borderColor: sevCol + "33", background: sevCol + "0d" }}>
              {issue.sev === "crit" ? "● Critical" : issue.sev === "warn" ? "◆ Warning" : "ℹ Info"}
            </span>
          </div>

          {/* Description */}
          <div className={styles.iDesc}>{issue.desc}</div>

          {/* Meta row */}
          <div className={styles.iMeta}>
            <span className={styles.iPagesBadge}>{issue.pages} pages</span>
            <span className={styles.iImpactBadge}>▲ +{issue.impact_percentage || 0}%</span>
            <span className={styles.iDiffBadge}>{issue.difficulty || issue.diff}</span>
            {fixed.length > 0 && (
              <span className={styles.iFixedBadge}>✓ {fixed.length} fixed</span>
            )}
          </div>
        </div>
        <button 
          className={`${styles.btn} ${styles.btnPr} ${styles.btnSm}`}
          onClick={handleFixClick}
          style={{ marginLeft: 'auto', flexShrink: 0 }}
        >
          ✦ Fix
        </button>
      </div>
    </div>
  );
}
