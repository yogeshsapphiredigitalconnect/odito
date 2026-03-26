import { useState, useEffect } from "react";

import styles from "../ai-search-audit.module.css";



export default function ScoreHero({ aiData }) {

  const score = aiData?.score || 0;

  const ringR = 52, ringC = 2 * Math.PI * ringR;

  const [animated, setAnimated] = useState(false);

  useEffect(() => {

    const t = setTimeout(() => setAnimated(true), 200);

    return () => clearTimeout(t);

  }, []);



  const scoreColor = score >= 70 ? "var(--green)" : score >= 50 ? "var(--amber)" : "var(--red)";

  const glowColor  = score >= 70 ? "rgba(0,245,160,.5)" : score >= 50 ? "rgba(255,183,3,.5)" : "rgba(255,56,96,.5)";

  const scoreLabel = score >= 70 ? "Good AI Readiness" : score >= 50 ? "Moderate AI Readiness" : "Poor AI Readiness";

  const scoreDesc  = score >= 70

    ? "Your content is well-optimised for AI citation. Keep monitoring for gaps."

    : score >= 50

    ? "AI models can partially understand your content. Key gaps remain in topical authority and schema."

    : "ChatGPT, Perplexity, and Gemini have limited ability to understand and cite your content.";

  const offset = animated ? ringC - (ringC * score / 100) : ringC;



  return (

    <div className={styles.scoreHero}>

      <div className={styles.scoreHeroRing}>

        <svg width="150" height="150" viewBox="0 0 120 120">

          <circle cx="60" cy="60" r={ringR} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="9"/>

          <circle cx="60" cy="60" r={ringR} fill="none"

            stroke={scoreColor} strokeWidth="9" strokeLinecap="round"

            strokeDasharray={ringC} strokeDashoffset={offset}

            transform="rotate(-90 60 60)"

            style={{ transition:"stroke-dashoffset 1.2s ease", filter:`drop-shadow(0 0 10px ${glowColor})` }}

          />

          <text x="60" y="54" textAnchor="middle" fill={scoreColor}

            fontSize="30" fontWeight="800" fontFamily="var(--font-display)">{score}</text>

          <text x="60" y="68" textAnchor="middle" fill="var(--t3)"

            fontSize="10" fontFamily="var(--font-body)">/100</text>

          <text x="60" y="82" textAnchor="middle" fill="var(--t3)"

            fontSize="7.5" letterSpacing="1.5" fontFamily="var(--font-body)">AI READINESS</text>

        </svg>

      </div>

      <div className={styles.scoreHeroText}>

        <div className={styles.scoreHeroTitle} style={{ color: scoreColor }}>{scoreLabel}</div>

        <div className={styles.scoreHeroDesc}>

          {scoreDesc} Fix the{" "}

         <strong style={{ color:"var(--amber)" }}>{aiData?.critical_issues || 4} critical issues</strong>{" "}

          below to reach <strong style={{ color:"var(--green)" }}>68+</strong>.

        </div>

        <div className={styles.scoreHeroPills}>

          <span className={`${styles.heroPill} ${styles.pillRed}`}>● {aiData?.critical_issues || 4} Critical</span>

          <span className={`${styles.heroPill} ${styles.pillAmber}`}>◆ {aiData?.warnings || 3} Warnings</span>

          <span className={`${styles.heroPill} ${styles.pillCyan}`}>

            🔗 {aiData?.categories?.citation_probability?.toFixed(1) || 49.8}% Citation

          </span>

          <span className={`${styles.heroPill} ${styles.pillPurple}`}>

            🤖 {aiData?.categories?.llm_readiness?.toFixed(1) || 55.9}% LLM Ready

          </span>

          <span className={`${styles.heroPill} ${styles.pillGreen}`}>

            📄 {aiData?.pages_scored || 20} pages scored

          </span>

        </div>

      </div>

    </div>

  );

}

