import styles from "./protected-journey.module.css";

export function JourneyBackground() {
  return (
    <div className={styles.background} aria-hidden="true">
      <div className={styles.backgroundGrid} />
      <div className={styles.backgroundGlowOne} />
      <div className={styles.backgroundGlowTwo} />
      <div className={styles.backgroundRoad} />
    </div>
  );
}
