import CategoryCard from "./CategoryCard";
import styles from "../ai-search-audit.module.css";

export default function CategoryGrid({ aiData }) {
  const categories = aiData?.categories ? [
    { id:"ai_impact",            label:"AI Impact",            icon:"🧠", val:Math.round(aiData.categories.ai_impact || 0),            color:"#00f5a0", desc:"How much AI models surface your content" },
    { id:"citation_probability", label:"Citation Probability", icon:"🔗", val:Math.round(aiData.categories.citation_probability || 0), color:"#00dfff", desc:"Likelihood of being cited in AI answers" },
    { id:"llm_readiness",        label:"LLM Readiness",        icon:"🤖", val:Math.round(aiData.categories.llm_readiness || 0),        color:"#c77dff", desc:"How well LLMs can parse your content" },
    { id:"aeo_score",            label:"AEO Score",            icon:"❓", val:Math.round(aiData.categories.aeo_score || 0),            color:"#ffb703", desc:"Answer Engine Optimization quality" },
    { id:"topical_authority",    label:"Topical Authority",    icon:"🎯", val:Math.round(aiData.categories.topical_authority || 0),    color:"#ff3860", desc:"Depth of topic coverage in your niche" },
    { id:"voice_intent",         label:"Voice Intent",         icon:"🎙", val:Math.round(aiData.categories.voice_intent || 0),         color:"#8b5cf6", desc:"Alignment with voice & conversational queries" },
  ] : [];

  return (
    <>
      <div className={styles.secDivider}>
        <div className={styles.secDividerLine} />
        <span className={styles.secDividerLbl}>AI Visibility Categories</span>
        <div className={styles.secDividerLine} />
      </div>
      <div className={styles.catStrip}>
        {categories.map((c, i) => (
          <CategoryCard key={c.id} {...c} index={i} />
        ))}
      </div>
    </>
  );
}
