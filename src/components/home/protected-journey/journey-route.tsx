import { journeyCheckpoints } from "./journey.constants";
import styles from "./protected-journey.module.css";

const routePath =
  "M82 360 C170 330 238 190 330 190 C430 190 470 350 560 350 C650 350 690 190 780 190 C860 190 900 120 940 105";

const markerPoints = [
  { x: 82, y: 360 },
  { x: 330, y: 190 },
  { x: 560, y: 350 },
  { x: 710, y: 225 },
  { x: 940, y: 105 },
];

export function JourneyRoute() {
  return (
    <svg
      data-journey-route
      className={styles.route}
      viewBox="0 0 1000 520"
      role="img"
      aria-label="Rota ilustrativa conectando casa, ponto seguro, transporte e escola"
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
      {journeyCheckpoints.map((checkpoint, index) => {
        const point = markerPoints[index] ?? markerPoints[0];

        return (
          <g key={checkpoint.id} data-route-marker={checkpoint.state}>
            <circle cx={point.x} cy={point.y} r="12" className={styles.routeMarkerHalo} />
            <circle cx={point.x} cy={point.y} r="5" className={styles.routeMarker} />
          </g>
        );
      })}
    </svg>
  );
}
