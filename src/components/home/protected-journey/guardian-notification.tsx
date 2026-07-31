"use client";

import { AlertTriangle, CheckCircle2, Clock3, Radio } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { CheckpointState } from "./journey.types";
import type { JourneyPhoneNotification } from "./journey-stage-content";
import { getJourneyMotionVariants } from "./journey-motion";
import { useClientReducedMotion } from "./use-client-reduced-motion";
import styles from "./protected-journey.module.css";

type GuardianNotificationProps = {
  item: JourneyPhoneNotification;
  state?: CheckpointState;
  compact?: boolean;
};

const iconByState = {
  idle: Clock3,
  detecting: Radio,
  validating: Radio,
  validated: CheckCircle2,
  attention: AlertTriangle,
};

export function GuardianNotification({
  item,
  state = "validated",
  compact = false,
}: GuardianNotificationProps) {
  const shouldReduceMotion = useClientReducedMotion();
  const variants = getJourneyMotionVariants(shouldReduceMotion);
  const Icon = iconByState[state];

  return (
    <motion.li
      layout={!shouldReduceMotion}
      data-guardian-notification={item.id}
      className={cn(styles.notification, compact && styles.notificationCompact)}
      variants={variants.notification}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <span className={styles.notificationIcon} aria-hidden="true">
        <Icon />
      </span>
      <span className={styles.notificationBody}>
        <span className={styles.notificationTime}>{item.time}</span>
        <span className={styles.notificationTitle}>{item.title}</span>
        <span className={styles.notificationDescription}>{item.description}</span>
      </span>
    </motion.li>
  );
}
