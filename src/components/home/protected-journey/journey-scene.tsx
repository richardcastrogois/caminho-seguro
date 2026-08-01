import { JourneyBackground } from "./journey-background";
import { JourneyBus } from "./journey-bus";
import { JourneyChild } from "./journey-child";
import { JourneyCity } from "./journey-city";
import { journeyCheckpoints } from "./journey.constants";
import { JourneyCheckpoint } from "./journey-checkpoint";
import { JourneyMap } from "./journey-map";
import { JourneyRoute } from "./journey-route";
import { JourneySchool } from "./journey-school";

import type {
  CheckpointState,
  JourneyCheckpoint as JourneyCheckpointType,
} from "./journey.types";
import styles from "./protected-journey.module.css";

type JourneySceneProps = {
  checkpointStates: Record<string, CheckpointState>;
  children?: React.ReactNode;
};

function resolveCheckpoints(checkpointStates: Record<string, CheckpointState>) {
  return journeyCheckpoints.reduce<Record<string, JourneyCheckpointType>>(
    (accumulator, checkpoint) => {
      accumulator[checkpoint.id] = {
        ...checkpoint,
        state: checkpointStates[checkpoint.id] ?? checkpoint.state,
      };
      return accumulator;
    },
    {},
  );
}

export function JourneyScene({ checkpointStates, children }: JourneySceneProps) {
  const checkpoints = resolveCheckpoints(checkpointStates);

  return (
    <div
      className={styles.stage}
      data-journey-scene
      aria-label="Trajeto ilustrado com casa, comunidade, escola, transporte e mapa final"
    >
      {children}

      <div className={styles.cameraLayer} data-journey-camera>
        <JourneyBackground />
        <JourneyRoute />
        <JourneyCity checkpointById={checkpoints} />
        <JourneyChild />
        <JourneyBus />
        <JourneySchool />

        <div
          className={styles.schoolCheckpoint}
          data-journey-checkpoint-slot="school-arrival"
        >
          <JourneyCheckpoint
            compact
            state={checkpoints["school-arrival"].state}
            label="Chegada a escola"
            time={checkpoints["school-arrival"].time}
          />
        </div>

        <div
          className={styles.attentionCheckpoint}
          data-journey-checkpoint-slot="attention"
        >
          <JourneyCheckpoint
            compact
            state={checkpoints["attention-zone"].state}
            label="Rota alternativa"
            time="sem cobertura"
          />
        </div>
      </div>

      <JourneyMap />
    </div>
  );
}
