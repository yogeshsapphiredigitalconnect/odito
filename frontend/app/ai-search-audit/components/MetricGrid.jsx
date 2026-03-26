import MetricCard from "./MetricCard";
import styles from "../ai-search-audit.module.css";

export default function MetricGrid({ metricsData, aiData }) {
  console.log("AI DATA:", aiData);
  console.log("METRICS DATA:", metricsData);
  
  const metrics = [
    { id:"ai_score",     label:"AI Readiness",          icon:"🧠", val:Math.round(metricsData?.ai_readiness || 0), color:"#ffb703" },
    { id:"schema",       label:"Schema Coverage",        icon:"🧩", val:Math.round(metricsData?.schema_coverage || 0), color:"#ffb703" },
    { id:"faq",          label:"FAQ Optimization",       icon:"❓", val:Math.round(metricsData?.faq_optimization || 0), color:"#06b6d4" },
    { id:"conv",         label:"Conversational Score",   icon:"💬", val:Math.round(metricsData?.conversational_score || 0), color:"#8b5cf6" },
    { id:"snippet",      label:"AI Snippet Probability", icon:"⚡", val:Math.round(metricsData?.ai_snippet_probability || 0), color:"#10b981" },
    { id:"citation",     label:"AI Citation Rate",       icon:"🔗", val:Math.round(metricsData?.ai_citation_rate || 0), color:"#00dfff" },
    { id:"kg",           label:"Knowledge Graph",        icon:"🔮", val:Math.round(metricsData?.knowledge_graph || 0), color:"#c77dff" },
    { id:"entity",       label:"Topical Authority",      icon:"🗺", val:Math.round(metricsData?.entity_coverage || 0), color:"#ff3860" },
    { id:"llm",          label:"LLM Indexability",       icon:"🤖", val:Math.round(metricsData?.llm_indexability || 0), color:"#00dfff" },
    { id:"struct_depth", label:"Structured Data Depth",  icon:"📐", val:Math.round(metricsData?.structured_data_depth || 0), color:"#ffb703" },
    { id:"voice",        label:"Voice Intent",           icon:"🎙", val:Math.round(metricsData?.geo_score || 0), color:"#8b5cf6" },
    { id:"aeo",          label:"AEO Score",              icon:"🎯", val:Math.round(metricsData?.entity_coverage_pct || 0), color:"#ffb703" },
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
