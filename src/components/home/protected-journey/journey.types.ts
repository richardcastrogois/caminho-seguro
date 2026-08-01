export type JourneyStage =
  | "intro"
  | "leaving-home"
  | "community-checkpoint"
  | "boarding"
  | "bus-route"
  | "school-arrival"
  | "camera-rise"
  | "network-map";

export type CheckpointState =
  "idle" | "detecting" | "validating" | "validated" | "attention";

export type JourneyCheckpoint = {
  id: string;
  label: string;
  time?: string;
  state: CheckpointState;
  stage: JourneyStage;
  shortLabel: string;
};

export type GuardianNotification = {
  id: string;
  time: string;
  title: string;
  description: string;
  state: CheckpointState;
};

export type JourneyScene = {
  id: string;
  stage: JourneyStage;
  title: string;
  description: string;
};

export type JourneyAsset = {
  id: string;
  src: string;
  alt: string;
};
