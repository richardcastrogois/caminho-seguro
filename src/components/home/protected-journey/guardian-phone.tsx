"use client";

import { AnimatePresence, motion } from "motion/react";
import { BellRing, ShieldCheck } from "lucide-react";
import type { JourneyStage } from "./journey.types";
import {
  getVisiblePhoneNotifications,
  phoneStatusByStage,
} from "./journey-stage-content";
import { getJourneyMotionVariants } from "./journey-motion";
import { useClientReducedMotion } from "./use-client-reduced-motion";
import styles from "./protected-journey.module.css";

type GuardianPhoneProps = {
  stage: JourneyStage;
};

export function GuardianPhone({ stage }: GuardianPhoneProps) {
  const shouldReduceMotion = useClientReducedMotion();
  const variants = getJourneyMotionVariants(shouldReduceMotion);
  const status = phoneStatusByStage[stage];
  const latestNotification = getVisiblePhoneNotifications(stage).at(-1);

  return (
    <aside
      data-journey-phone
      className={styles.phone}
      aria-label="Atualizacao demonstrativa recebida pelo responsavel"
    >
      <div className={styles.phoneHeader}>
        <span className={styles.phoneIcon} aria-hidden="true">
          <ShieldCheck />
        </span>
        <div>
          <p className={styles.phoneEyebrow}>Responsavel</p>
          <h3>Maria esta a caminho</h3>
        </div>
      </div>

      <div className={styles.phoneStatusViewport} aria-live="off">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={stage}
            className={styles.phoneStatus}
            variants={variants.statusCard}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <BellRing aria-hidden="true" />
            <span>
              <strong>{status.title}</strong>
              {status.description}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {latestNotification ? (
        <motion.p
          key={latestNotification.id}
          className={styles.latestNotification}
          variants={variants.notification}
          initial="hidden"
          animate="visible"
        >
          <strong>{latestNotification.time}</strong>
          {latestNotification.title}
        </motion.p>
      ) : null}
    </aside>
  );
}
