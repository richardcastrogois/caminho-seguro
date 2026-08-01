"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getJourneyMotionVariants } from "./journey-motion";
import { useClientReducedMotion } from "./use-client-reduced-motion";
import styles from "./protected-journey.module.css";

type MotionActionLinkProps = {
  href: ComponentProps<typeof Link>["href"];
  children: ReactNode;
  variant?: "default" | "outline";
  className?: string;
};

export function MotionActionLink({
  href,
  children,
  variant = "default",
  className,
}: MotionActionLinkProps) {
  const shouldReduceMotion = useClientReducedMotion();
  const variants = getJourneyMotionVariants(shouldReduceMotion);

  return (
    <motion.span
      className={styles.actionMotionShell}
      variants={variants.actionButton}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap="tap"
    >
      <Link
        href={href}
        className={cn(buttonVariants({ variant, size: "lg" }), styles.action, className)}
      >
        {children}
      </Link>
    </motion.span>
  );
}
