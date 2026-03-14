export const AI_VISIBILITY = {
  score: 46,
  pages_scored: 20,
  summary: "Moderate AI visibility. Limited presence in AI-generated search results.",
  categories: {
    ai_impact:            75.077,
    citation_probability: 49.769,
    llm_readiness:        55.917,
    aeo_score:            40,
    topical_authority:    24.572,
    voice_intent:         36.5,
  }
};

export const CATEGORIES_DATA = [
  { id:"ai_impact",            label:"AI Impact",            icon:"🧠", val:75, color:"#00f5a0", desc:"How much AI models surface your content" },
  { id:"citation_probability", label:"Citation Probability", icon:"🔗", val:50, color:"#00dfff", desc:"Likelihood of being cited in AI answers" },
  { id:"llm_readiness",        label:"LLM Readiness",        icon:"🤖", val:56, color:"#c77dff", desc:"How well LLMs can parse your content" },
  { id:"aeo_score",            label:"AEO Score",            icon:"❓", val:40, color:"#ffb703", desc:"Answer Engine Optimization quality" },
  { id:"topical_authority",    label:"Topical Authority",    icon:"🎯", val:25, color:"#ff3860", desc:"Depth of topic coverage in your niche" },
  { id:"voice_intent",         label:"Voice Intent",         icon:"🎙", val:37, color:"#8b5cf6", desc:"Alignment with voice & conversational queries" },
];

export const METRICS_DATA = [
  { id:"ai_score",     label:"AI Readiness",          icon:"🧠", val:46, color:"#ffb703" },
  { id:"schema",       label:"Schema Coverage",        icon:"🧩", val:34, color:"#ffb703" },
  { id:"faq",          label:"FAQ Optimization",       icon:"❓", val:40, color:"#06b6d4" },
  { id:"conv",         label:"Conversational Score",   icon:"💬", val:56, color:"#8b5cf6" },
  { id:"snippet",      label:"AI Snippet Probability", icon:"⚡", val:50, color:"#10b981" },
  { id:"citation",     label:"AI Citation Rate",       icon:"🔗", val:50, color:"#00dfff" },
  { id:"kg",           label:"Knowledge Graph",        icon:"🔮", val:35, color:"#c77dff" },
  { id:"entity",       label:"Topical Authority",      icon:"🗺", val:25, color:"#ff3860" },
  { id:"llm",          label:"LLM Indexability",       icon:"🤖", val:56, color:"#00dfff" },
  { id:"struct_depth", label:"Structured Data Depth",  icon:"📐", val:28, color:"#ffb703" },
  { id:"voice",        label:"Voice Intent",           icon:"🎙", val:37, color:"#8b5cf6" },
  { id:"aeo",          label:"AEO Score",              icon:"🎯", val:40, color:"#ffb703" },
];
