import Image from "next/image";
import { journeyAssets } from "./journey.constants";
import styles from "./protected-journey.module.css";

export function JourneySchool() {
  return (
    <figure data-journey-school className={styles.schoolFigure}>
      <Image
        src={journeyAssets.school.src}
        alt={journeyAssets.school.alt}
        width={320}
        height={240}
      />
      <figcaption>Chegada a escola</figcaption>
    </figure>
  );
}
