import Image from "next/image";
import { journeyAssets } from "./journey.constants";

import styles from "./protected-journey.module.css";

export function JourneyMap() {
  return (
    <aside className={styles.mapPanel} data-journey-map aria-label="Mapa final da rede">
      <p>Cuidado coordenado sem vigiar cada passo da crianca.</p>
      <div className={styles.mapCanvas}>
        <Image
          src={journeyAssets.finalMap.src}
          alt={journeyAssets.finalMap.alt}
          width={360}
          height={300}
          sizes="(max-width: 640px) 18rem, (max-width: 899px) 22rem, 32rem"
          style={{ height: "auto" }}
        />
      </div>
    </aside>
  );
}
