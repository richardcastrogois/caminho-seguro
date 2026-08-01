import { journeyCheckpoints } from "./journey.constants";
import styles from "./protected-journey.module.css";

const routePath =
  "M82 360 C170 330 238 190 330 190 C430 190 470 350 560 350 C650 350 690 190 780 190 C860 190 900 120 940 105";
const attentionPath = "M405 245 C470 170 545 125 650 145";

const mainMarkerPoints = [
  { id: "home-start", x: 82, y: 360 },
  { id: "safe-point", x: 330, y: 190 },
  { id: "boarding", x: 560, y: 350 },
  { id: "school-arrival", x: 940, y: 105 },
];

export function JourneyRoute() {
  return (
    <svg
      data-journey-route
      className={styles.route}
      viewBox="0 0 1000 520"
      role="img"
      aria-label="Rota principal entre casa e escola, com uma alternativa sem cobertura"
    >
      <defs>
        <linearGradient id="journeyRouteGradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0891b2" />
          <stop offset="0.55" stopColor="#0ea5e9" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <path className={styles.routeBase} d={routePath} />
      <path data-journey-route-path className={styles.routeProgress} d={routePath} />

      <path
        data-journey-attention-path
        className={styles.attentionRoute}
        d={attentionPath}
      />
      <g data-journey-attention-marker className={styles.attentionRouteMarker}>
        <circle cx="650" cy="145" r="14" className={styles.attentionMarkerHalo} />
        <circle cx="650" cy="145" r="6" className={styles.attentionMarker} />
      </g>

      {mainMarkerPoints.map((point) => {
        const checkpoint = journeyCheckpoints.find((item) => item.id === point.id);

        return (
          <g key={point.id} data-route-marker={checkpoint?.state ?? "idle"}>
            <circle cx={point.x} cy={point.y} r="12" className={styles.routeMarkerHalo} />
            <circle cx={point.x} cy={point.y} r="5" className={styles.routeMarker} />
          </g>
        );
      })}
    </svg>
  );
}
