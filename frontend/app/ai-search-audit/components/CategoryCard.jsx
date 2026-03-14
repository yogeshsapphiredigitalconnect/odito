import { useState, useEffect } from "react";
import styles from "../ai-search-audit.module.css";

export default function CategoryCard({ icon, label, val, color, desc, index }) {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setFilled(true), 300 + index * 80);
    return () => clearTimeout(t);
  }, [index]);

  const valColor = val >= 70 ? "#00f5a0" : val >= 50 ? "#ffb703" : "#ff3860";

  return (
    <div className={styles.catCard}>
      <div className={styles.catCardTop}>
        <div className={styles.catCardIcon} style={{ background: color + "22" }}>{icon}</div>
        <div className={styles.catCardNum}>
          <span className={styles.catCardVal} style={{ color: valColor }}>{val}</span>
          <span className={styles.catCardPer}>/ 100</span>
        </div>
      </div>
      <div className={styles.catCardLabel}>{label}</div>
      <div className={styles.catCardDesc}>{desc}</div>
      <div className={styles.catCardBar}>
        <div
          className={styles.catCardFill}
          style={{ width: filled ? val + "%" : "0%", background: color }}
        />
      </div>
      <div className={styles.catCardStripe} style={{ background: color }} />
    </div>
  );
}
