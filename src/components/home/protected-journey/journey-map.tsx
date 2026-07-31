import Image from "next/image";
import { Building2, MapPinned, ShieldCheck, TriangleAlert } from "lucide-react";
import { journeyAssets } from "./journey.constants";
import { JourneyCheckpoint } from "./journey-checkpoint";
import styles from "./protected-journey.module.css";

export function JourneyMap() {
  return (
    <aside className={styles.mapPanel} data-journey-map aria-label="Mapa final da rede">
      <div className={styles.mapHeader}>
        <span className={styles.mapIcon} aria-hidden="true">
          <MapPinned />
        </span>
        <div>
          <p>Mapa final</p>
          <h3>Rede visivel no fechamento da jornada</h3>
        </div>
      </div>

      <div className={styles.mapCanvas}>
        <Image
          src={journeyAssets.neighborhood.src}
          alt=""
          fill
          sizes="(max-width: 640px) 18rem, 21rem"
          aria-hidden="true"
        />
        <svg viewBox="0 0 420 250" className={styles.mapOverlay} aria-hidden="true">
          <path d="M52 176 C120 118 166 143 214 102 C274 50 329 91 374 55" />
          <circle cx="52" cy="176" r="7" />
          <circle cx="178" cy="130" r="7" />
          <circle cx="275" cy="72" r="7" />
          <circle cx="374" cy="55" r="7" />
        </svg>
        <div className={`${styles.mapTag} ${styles.mapTagSafe}`}>
          <ShieldCheck aria-hidden="true" />
          Pontos seguros
        </div>
        <div className={`${styles.mapTag} ${styles.mapTagGap}`}>
          <TriangleAlert aria-hidden="true" />
          Area sem cobertura
        </div>
        <div className={`${styles.mapTag} ${styles.mapTagNetwork}`}>
          <Building2 aria-hidden="true" />
          Escola e rede
        </div>
      </div>

      <div className={styles.mapCheckpoints}>
        <JourneyCheckpoint
          compact
          state="validated"
          label="Confirmados"
          time="4 eventos"
        />
        <JourneyCheckpoint compact state="attention" label="Atencao" time="1 area" />
      </div>
    </aside>
  );
}
