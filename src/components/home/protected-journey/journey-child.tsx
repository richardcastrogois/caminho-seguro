import Image from "next/image";
import { journeyAssets } from "./journey.constants";
import styles from "./protected-journey.module.css";

export function JourneyChild() {
  return (
    <figure data-journey-child className={styles.childFigure}>
      <Image
        src={journeyAssets.child.src}
        alt={journeyAssets.child.alt}
        width={160}
        height={180}
      />
      <figcaption>Identidade protegida</figcaption>
    </figure>
  );
}
