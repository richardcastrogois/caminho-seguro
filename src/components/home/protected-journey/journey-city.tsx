import Image from "next/image";
import { journeyAssets, journeyScenes } from "./journey.constants";
import { JourneyCheckpoint } from "./journey-checkpoint";
import type { JourneyCheckpoint as JourneyCheckpointType } from "./journey.types";
import styles from "./protected-journey.module.css";

type JourneyCityProps = {
  checkpointById: Record<string, JourneyCheckpointType>;
};

export function JourneyCity({ checkpointById }: JourneyCityProps) {
  return (
    <div className={styles.city} data-journey-city>
      <article
        className={`${styles.zone} ${styles.homeZone}`}
        data-journey-zone="home-zone"
      >
        <Image
          src={journeyAssets.home.src}
          alt={journeyAssets.home.alt}
          width={260}
          height={122}
          style={{ height: "auto" }}
        />
        <ZoneText id="home-zone" />
        <JourneyCheckpoint
          compact
          state={checkpointById["home-start"].state}
          label={checkpointById["home-start"].shortLabel}
          time={checkpointById["home-start"].time}
        />
      </article>

      <article
        className={`${styles.zone} ${styles.communityZone}`}
        data-journey-zone="community-zone"
      >
        <Image
          src={journeyAssets.communityStore.src}
          alt={journeyAssets.communityStore.alt}
          width={220}
          height={220}
          style={{ height: "auto" }}
        />
        <ZoneText id="community-zone" />
        <JourneyCheckpoint
          compact
          state={checkpointById["safe-point"].state}
          label={checkpointById["safe-point"].shortLabel}
          time={checkpointById["safe-point"].time}
        />
      </article>

      <article
        className={`${styles.zone} ${styles.busStopZone}`}
        data-journey-zone="bus-stop-zone"
      >
        <Image
          src={journeyAssets.busStop.src}
          alt={journeyAssets.busStop.alt}
          width={220}
          height={220}
          style={{ height: "auto" }}
        />
        <ZoneText id="bus-stop-zone" />
        <JourneyCheckpoint
          compact
          state={checkpointById.boarding.state}
          label={checkpointById.boarding.shortLabel}
          time={checkpointById.boarding.time}
        />
      </article>
    </div>
  );
}

function ZoneText({ id }: { id: string }) {
  const scene = journeyScenes.find((item) => item.id === id);

  if (!scene) {
    return null;
  }

  return (
    <div className={styles.zoneText}>
      <h3>{scene.title}</h3>
    </div>
  );
}
