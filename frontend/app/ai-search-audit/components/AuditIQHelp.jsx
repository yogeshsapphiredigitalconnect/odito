import styles from "../ai-search-audit.module.css";

export default function AuditIQHelp({ issue }) {
  const tiers = [
    { icon:"⚡", title:"Express Fix", desc:"All " + issue.pages + " pages fixed in 24h", tag:"Popular", tc:"var(--cy)" },
    { icon:"🔍", title:"Full GEO/AEO Audit + Fix", desc:"Schema + KG + AEO optimisation", tag:"Thorough", tc:"var(--pu)" },
    { icon:"♾", title:"Monthly AI Monitoring", desc:"Ongoing tracking + automatic fix alerts", tag:"Best Value", tc:"var(--gr)" },
  ];

  return (
    <div style={{ animation:"fu .3s forwards" }}>
      <div style={{ textAlign:"center", padding:"14px 0 16px" }}>
        <div style={{ 
          width:48, height:48, borderRadius:13, background:"var(--g1)", 
          display:"grid", placeItems:"center", fontSize:22, margin:"0 auto 10px" 
        }}>
          🤝
        </div>
        <div style={{ fontFamily:"var(--fd)", fontSize:15, fontWeight:800, marginBottom:5 }}>
          Let AuditIQ Fix It
        </div>
        <div style={{ fontSize:11.5, color:"var(--t2)", lineHeight:1.6 }}>
          Our specialists fix <strong style={{ color:"var(--t)" }}>{issue.title}</strong> across all {issue.pages} pages with before/after proof.
        </div>
      </div>

      {tiers.map((t, i) => (
        <div key={i} className={styles.tier}>
          <div className={styles.tierIcon} style={{ background:t.tc + "14" }}>
            {t.icon}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12.5, fontWeight:700, marginBottom:2 }}>{t.title}</div>
            <div style={{ fontSize:10.5, color:"var(--t3)" }}>{t.desc}</div>
          </div>
          <span className={styles.pill} style={{ 
            color:t.tc, borderColor:t.tc + "44", background:t.tc + "11" 
          }}>
            {t.tag}
          </span>
        </div>
      ))}

      <button className={`${styles.act} ${styles.actPr}`} style={{ marginTop:6 }}>
        🚀 Request Expert Fix
      </button>
      <button className={`${styles.act} ${styles.actPu}`}>
        📅 Book Strategy Call
      </button>
      <div style={{ 
        marginTop:10, padding:"9px 12px", background:"rgba(0,245,160,.04)", 
        border:"1px solid rgba(0,245,160,.13)", borderRadius:8, fontSize:11, 
        color:"var(--gr)", textAlign:"center" 
      }}>
        ✓ Validation report + 30-day AI monitoring included
      </div>
    </div>
  );
}
