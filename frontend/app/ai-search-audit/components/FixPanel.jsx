import { useState } from "react";
import AIFix from "./AIFix";
import DIYGuide from "./DIYGuide";
import AuditIQHelp from "./AuditIQHelp";
import styles from "../ai-search-audit.module.css";

export default function FixPanel({ issue, selIdx, mode, setMode, onFixed }) {
  const selUrl = issue.urls[selIdx]?.url || null;

  return (
    <div className={styles.fixPanel}>
      <div className={styles.fixPanelTitle}>
        {selIdx !== null
          ? `🔧 Fix: ${issue.urls[selIdx]?.url?.split("/").pop() || "page"}` 
          : "Fix Assistant"}
      </div>
      <div className={styles.modeTabs}>
        <button className={`${styles.modeTab}${mode==="ai"  ? " " + styles.modeTabOn : ""}`} onClick={() => setMode("ai")}>✦ AI Fix</button>
        <button className={`${styles.modeTab}${mode==="diy" ? " " + styles.modeTabOn : ""}`} onClick={() => setMode("diy")}>🛠 DIY</button>
        <button className={`${styles.modeTab}${mode==="help"? " " + styles.modeTabOn : ""}`} onClick={() => setMode("help")}>🤝 AuditIQ</button>
      </div>
      {mode === "ai"   && <AIFix      issue={issue} selUrl={selUrl} onFixed={onFixed} />}
      {mode === "diy"  && <DIYGuide   issue={issue} />}
      {mode === "help" && <AuditIQHelp issue={issue} />}
    </div>
  );
}
