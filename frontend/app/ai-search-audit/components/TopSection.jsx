import ScoreHero from "./ScoreHero";
import CategoryGrid from "./CategoryGrid";
import MetricGrid from "./MetricGrid";
import styles from "../ai-search-audit.module.css";

export default function TopSection({ aiData, metricsData }) {
  return (
    <div className={styles.topSection}>
      <ScoreHero aiData={aiData} />
      <CategoryGrid aiData={aiData} />
      <MetricGrid metricsData={metricsData} aiData={aiData} />
    </div>
  );
}
