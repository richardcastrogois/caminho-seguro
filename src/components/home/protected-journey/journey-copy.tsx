"use client";

import { AnimatePresence, motion } from "motion/react";
import type { JourneyStage } from "./journey.types";
import { journeyStageCopy } from "./journey-stage-content";
import { getJourneyMotionVariants } from "./journey-motion";
import { useClientReducedMotion } from "./use-client-reduced-motion";
import styles from "./protected-journey.module.css";

type JourneyCopyProps = {
  stage: JourneyStage;
};

export function JourneyCopy({ stage }: JourneyCopyProps) {
  const shouldReduceMotion = useClientReducedMotion();
  const variants = getJourneyMotionVariants(shouldReduceMotion);
  const copy = journeyStageCopy[stage];

  return (
    <div className={styles.copy} data-journey-copy>
      <div className={styles.copyViewport} aria-live="off">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage}
            className={styles.copyMotionPanel}
            variants={variants.copy}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <p className={styles.eyebrow}>{copy.eyebrow}</p>
            <h2 id="protected-journey-title">{copy.title}</h2>
            <p className={styles.lead}>{copy.lead}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
