import { AlertTriangle, Check, CircleDot, LoaderCircle, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CheckpointState } from "./journey.types";
import styles from "./protected-journey.module.css";

type JourneyCheckpointProps = {
  state: CheckpointState;
  label: string;
  time?: string;
  compact?: boolean;
  className?: string;
  dataJourneyBoardingStatus?: boolean;
};

const stateConfig = {
  idle: {
    label: "Aguardando",
    Icon: CircleDot,
    className: styles.checkpointIdle,
  },
  detecting: {
    label: "Detectando",
    Icon: Radio,
    className: styles.checkpointDetecting,
  },
  validating: {
    label: "Validando",
    Icon: LoaderCircle,
    className: styles.checkpointValidating,
  },
  validated: {
    label: "Validado",
    Icon: Check,
    className: styles.checkpointValidated,
  },
  attention: {
    label: "Atencao",
    Icon: AlertTriangle,
    className: styles.checkpointAttention,
  },
} satisfies Record<
  CheckpointState,
  { label: string; Icon: typeof CircleDot; className: string }
>;

export function JourneyCheckpoint({
  state,
  label,
  time,
  compact = false,
  className,
  dataJourneyBoardingStatus = false,
}: JourneyCheckpointProps) {
  const config = stateConfig[state];
  const Icon = config.Icon;

  return (
    <div
      data-journey-checkpoint={state}
      data-journey-boarding-status={dataJourneyBoardingStatus ? true : undefined}
      className={cn(
        styles.checkpoint,
        config.className,
        compact && styles.checkpointCompact,
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={styles.checkpointWaves}
        data-journey-checkpoint-waves
      >
        <span />
        <span />
      </span>
      <span className={styles.checkpointBase}>
        <span className={styles.checkpointRing} aria-hidden="true" />
        <Icon className={styles.checkpointIcon} aria-hidden="true" />
      </span>
      <span className={styles.checkpointText}>
        <span className={styles.checkpointLabel}>{label}</span>
        <span className={styles.checkpointMeta}>
          {config.label}
          {time ? ` - ${time}` : ""}
        </span>
      </span>
    </div>
  );
}
