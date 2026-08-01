import Image from "next/image";
import { journeyAssets } from "./journey.constants";
import styles from "./protected-journey.module.css";

export function JourneyBus() {
  return (
    <figure data-journey-bus className={styles.busFigure}>
      <Image
        src={journeyAssets.schoolBus.src}
        alt={journeyAssets.schoolBus.alt}
        width={260}
        height={160}
        loading="eager"
        style={{ height: "auto" }}
      />
      <figcaption>Transporte confirmado</figcaption>
    </figure>
  );
}
