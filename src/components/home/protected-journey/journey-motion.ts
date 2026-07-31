import type { Variants } from "motion/react";

export type JourneyMotionVariants = {
  copy: Variants;
  notification: Variants;
  statusCard: Variants;
  timelineItem: Variants;
  actionButton: Variants;
};

export function getJourneyMotionVariants(reducedMotion: boolean): JourneyMotionVariants {
  const distance = reducedMotion ? 0 : 14;
  const smallDistance = reducedMotion ? 0 : 8;

  return {
    copy: {
      hidden: { opacity: 0, y: distance },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reducedMotion ? 0.18 : 0.34, ease: "easeOut" },
      },
      exit: {
        opacity: 0,
        y: reducedMotion ? 0 : -smallDistance,
        transition: { duration: reducedMotion ? 0.12 : 0.2, ease: "easeIn" },
      },
    },
    notification: {
      hidden: { opacity: 0, y: distance, scale: reducedMotion ? 1 : 0.98 },
      visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: reducedMotion ? 0.18 : 0.32, ease: "easeOut" },
      },
      exit: {
        opacity: 0,
        y: reducedMotion ? 0 : -smallDistance,
        scale: reducedMotion ? 1 : 0.98,
        transition: { duration: reducedMotion ? 0.12 : 0.18, ease: "easeIn" },
      },
    },
    statusCard: {
      hidden: { opacity: 0, y: smallDistance },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reducedMotion ? 0.16 : 0.28, ease: "easeOut" },
      },
      exit: {
        opacity: 0,
        y: 0,
        transition: { duration: reducedMotion ? 0.1 : 0.16, ease: "easeIn" },
      },
    },
    timelineItem: {
      hidden: { opacity: 0, y: smallDistance },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: reducedMotion ? 0.14 : 0.24, ease: "easeOut" },
      },
      exit: {
        opacity: 0,
        y: reducedMotion ? 0 : -6,
        transition: { duration: reducedMotion ? 0.1 : 0.16, ease: "easeIn" },
      },
    },
    actionButton: {
      rest: { scale: 1, y: 0 },
      hover: reducedMotion
        ? { scale: 1 }
        : {
            scale: 1.018,
            y: -1,
            transition: { duration: 0.18, ease: "easeOut" },
          },
      tap: reducedMotion
        ? { scale: 1 }
        : {
            scale: 0.985,
            y: 0,
            transition: { duration: 0.12, ease: "easeOut" },
          },
    },
  };
}
