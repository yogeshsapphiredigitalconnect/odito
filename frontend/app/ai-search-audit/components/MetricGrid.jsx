import MetricCard from "./MetricCard";
import styles from "../ai-search-audit.module.css";

export default function MetricGrid({ metricsData, aiData }) {
  const metrics = metricsData?.detailed_metrics || [
    { id:"ai_score",     label:"AI Readiness",          icon:"🧠", val:Math.round(aiData?.score || 0), color:"#ffb703" },
    { id:"schema",       label:"Schema Coverage",        icon:"🧩", val:Math.round(aiData?.schema_coverage || 34), color:"#ffb703" },
    { id:"faq",          label:"FAQ Optimization",       icon:"❓", val:Math.round(aiData?.faq_optimization || 40), color:"#06b6d4" },
    { id:"conv",         label:"Conversational Score",   icon:"💬", val:Math.round(aiData?.conversational_score || 56), color:"#8b5cf6" },
    { id:"snippet",      label:"AI Snippet Probability", icon:"⚡", val:Math.round(aiData?.snippet_probability || 50), color:"#10b981" },
    { id:"citation",     label:"AI Citation Rate",       icon:"🔗", val:Math.round(aiData?.categories?.citation_probability || 50), color:"#00dfff" },
    { id:"kg",           label:"Knowledge Graph",        icon:"🔮", val:Math.round(aiData?.knowledge_graph || 35), color:"#c77dff" },
    { id:"entity",       label:"Topical Authority",      icon:"🗺", val:Math.round(aiData?.categories?.topical_authority || 25), color:"#ff3860" },
    { id:"llm",          label:"LLM Indexability",       icon:"🤖", val:Math.round(aiData?.categories?.llm_readiness || 56), color:"#00dfff" },
    { id:"struct_depth", label:"Structured Data Depth",  icon:"📐", val:Math.round(aiData?.structured_depth || 28), color:"#ffb703" },
    { id:"voice",        label:"Voice Intent",           icon:"🎙", val:Math.round(aiData?.categories?.voice_intent || 37), color:"#8b5cf6" },
    { id:"aeo",          label:"AEO Score",              icon:"🎯", val:Math.round(aiData?.categories?.aeo_score || 40), color:"#ffb703" },
  ];

  return (
    <>
      <div className={styles.secDivider}>
        <div className={styles.secDividerLine} />
        <span className={styles.secDividerLbl}>Detailed Metrics</span>
        <div className={styles.secDividerLine} />
      </div>
      <div className={styles.metricStrip}>
        {metrics.slice(0, 8).map((m, i) => (
          <MetricCard key={m.id} {...m} index={i} />
        ))}
      </div>
      <div className={`${styles.metricStrip} ${styles.metricStripLast}`}>
        {metrics.slice(8).map((m, i) => (
          <MetricCard key={m.id} {...m} index={i + 8} />
        ))}
      </div>
    </>
  );
}
