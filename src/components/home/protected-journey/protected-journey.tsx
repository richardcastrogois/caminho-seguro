"use client";

import { useState } from "react";
import { PauseCircle, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuardianPhone } from "./guardian-phone";
import { JourneyCopy } from "./journey-copy";
import { JourneyScene } from "./journey-scene";
import { ReducedMotionJourneySummary } from "./reduced-motion-summary";
import styles from "./protected-journey.module.css";
import { useClientReducedMotion } from "./use-client-reduced-motion";
import { useProtectedJourneyTimeline } from "./use-protected-journey-timeline";

export function ProtectedJourney() {
  const systemReducedMotion = useClientReducedMotion();
  const [motionOverride, setMotionOverride] = useState<"system" | "animated" | "static">(
    "system",
  );
  const staticMode =
    motionOverride === "static" || (motionOverride === "system" && systemReducedMotion);
  const { scope, journeyStage, checkpointStates } =
    useProtectedJourneyTimeline(staticMode);

  const toggleMotionMode = () => {
    setMotionOverride(staticMode ? "animated" : "static");
  };

  return (
    <section
      ref={scope}
      className={styles.section}
      aria-labelledby="protected-journey-heading"
      data-protected-journey
      data-journey-stage={journeyStage}
      data-journey-reduced-motion={staticMode ? "true" : "false"}
    >
      <div className="sr-only">
        Jornada Protegida: casa, inicio do trajeto, ponto seguro, transporte, escola e
        mapa final.
      </div>

      <div className={styles.sectionIntro}>
        <div className={styles.sectionIntroCopy}>
          <span>Jornada protegida</span>
          <h2 id="protected-journey-heading">Veja a rede agir em cada checkpoint.</h2>
          <p>Role devagar para acompanhar casa, ponto seguro, transporte e escola.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={styles.motionControl}
          aria-pressed={staticMode}
          onClick={toggleMotionMode}
        >
          {staticMode ? <PlayCircle /> : <PauseCircle />}
          {staticMode ? "Ativar jornada animada" : "Ver sem animacao"}
        </Button>
      </div>

      <div className={styles.pinFrame} data-journey-pin>
        <div className={styles.inner}>
          <JourneyScene checkpointStates={checkpointStates}>
            <JourneyCopy stage={journeyStage} />
            <GuardianPhone stage={journeyStage} />
          </JourneyScene>
          {staticMode ? <ReducedMotionJourneySummary /> : null}
        </div>
      </div>
    </section>
  );
}
