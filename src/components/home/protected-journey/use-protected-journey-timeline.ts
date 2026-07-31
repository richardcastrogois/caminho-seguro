"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { CheckpointState, JourneyStage } from "./journey.types";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type CheckpointStateMap = Record<string, CheckpointState>;

type MatchMediaConditions = {
  isDesktop?: boolean;
  isMobile?: boolean;
};

const initialCheckpointStates: CheckpointStateMap = {
  "home-start": "idle",
  "safe-point": "idle",
  boarding: "idle",
  "attention-zone": "attention",
  "school-arrival": "idle",
};

const completedCheckpointStates: CheckpointStateMap = {
  "home-start": "validated",
  "safe-point": "validated",
  boarding: "validated",
  "attention-zone": "attention",
  "school-arrival": "validated",
};

function areCheckpointStatesEqual(left: CheckpointStateMap, right: CheckpointStateMap) {
  return Object.keys(initialCheckpointStates).every((key) => left[key] === right[key]);
}

function getSemanticSnapshot(progress: number): {
  stage: JourneyStage;
  checkpoints: CheckpointStateMap;
} {
  const checkpoints: CheckpointStateMap = { ...initialCheckpointStates };
  let stage: JourneyStage = "intro";

  if (progress >= 0.04) {
    stage = "leaving-home";
    checkpoints["home-start"] = "validated";
  }

  if (progress >= 0.2) {
    stage = "community-checkpoint";
    checkpoints["safe-point"] = "detecting";
  }

  if (progress >= 0.25) {
    checkpoints["safe-point"] = "validating";
  }

  if (progress >= 0.31) {
    checkpoints["safe-point"] = "validated";
  }

  if (progress >= 0.34) {
    stage = "boarding";
    checkpoints.boarding = "detecting";
  }

  if (progress >= 0.4) {
    checkpoints.boarding = "validating";
  }

  if (progress >= 0.47) {
    checkpoints.boarding = "validated";
  }

  if (progress >= 0.5) {
    stage = "bus-route";
  }

  if (progress >= 0.68) {
    stage = "school-arrival";
    checkpoints["school-arrival"] = "detecting";
  }

  if (progress >= 0.74) {
    checkpoints["school-arrival"] = "validating";
  }

  if (progress >= 0.8) {
    checkpoints["school-arrival"] = "validated";
  }

  if (progress >= 0.83) {
    stage = "camera-rise";
  }

  if (progress >= 0.93) {
    stage = "network-map";
    return { stage, checkpoints: completedCheckpointStates };
  }

  return { stage, checkpoints };
}

export function useProtectedJourneyTimeline(staticMode: boolean) {
  const scope = useRef<HTMLElement>(null);
  const [journeyStage, setJourneyStage] = useState<JourneyStage>("intro");
  const [checkpointStates, setCheckpointStates] = useState<CheckpointStateMap>(
    initialCheckpointStates,
  );
  const journeyStageRef = useRef<JourneyStage>("intro");
  const checkpointStatesRef = useRef<CheckpointStateMap>(initialCheckpointStates);

  useGSAP(
    () => {
      const root = scope.current;

      if (!root) {
        return;
      }

      const first = <T extends Element>(selector: string) =>
        root.querySelector<T>(selector) ?? undefined;
      const all = <T extends Element>(selector: string) =>
        Array.from(root.querySelectorAll<T>(selector));
      const pinFrame = first<HTMLElement>("[data-journey-pin]");
      const camera = first<HTMLElement>("[data-journey-camera]");
      const stage = first<HTMLElement>("[data-journey-scene]");
      const copy = first<HTMLElement>("[data-journey-copy]");
      const phone = first<HTMLElement>("[data-journey-phone]");
      const routePath = first<SVGPathElement>("[data-journey-route-path]");
      const child = first<HTMLElement>("[data-journey-child]");
      const bus = first<HTMLElement>("[data-journey-bus]");
      const school = first<HTMLElement>("[data-journey-school]");
      const mapPanel = first<HTMLElement>("[data-journey-map]");
      const finalMessage = first<HTMLElement>("[data-journey-final]");
      const boardingStatus = first<HTMLElement>("[data-journey-boarding-status]");
      const attentionSlot = first<HTMLElement>(
        "[data-journey-checkpoint-slot='attention']",
      );
      const homeZone = first<HTMLElement>("[data-journey-zone='home-zone']");
      const communityZone = first<HTMLElement>("[data-journey-zone='community-zone']");
      const busStopZone = first<HTMLElement>("[data-journey-zone='bus-stop-zone']");
      const routeMarkers = all<SVGElement>("[data-route-marker]");
      const [homeMarker, communityMarker, boardingMarker, schoolMarker] = routeMarkers;
      const checkpointWaves = all<HTMLElement>("[data-journey-checkpoint-waves]");

      if (
        !pinFrame ||
        !camera ||
        !stage ||
        !copy ||
        !phone ||
        !routePath ||
        !child ||
        !bus ||
        !school ||
        !mapPanel ||
        !finalMessage ||
        !boardingStatus ||
        !attentionSlot ||
        !homeZone ||
        !communityZone ||
        !busStopZone ||
        !homeMarker ||
        !communityMarker ||
        !boardingMarker ||
        !schoolMarker
      ) {
        return;
      }

      const setSemanticSnapshot = (
        nextStage: JourneyStage,
        nextCheckpoints: CheckpointStateMap,
      ) => {
        if (journeyStageRef.current !== nextStage) {
          journeyStageRef.current = nextStage;
          setJourneyStage(nextStage);
        }

        if (!areCheckpointStatesEqual(checkpointStatesRef.current, nextCheckpoints)) {
          checkpointStatesRef.current = nextCheckpoints;
          setCheckpointStates(nextCheckpoints);
        }
      };

      ScrollTrigger.getById("protected-journey-main")?.kill(true);

      const routeLength = routePath.getTotalLength();
      gsap.set(root, { "--journey-progress": staticMode ? 1 : 0 });
      gsap.set(routePath, {
        strokeDasharray: routeLength,
        strokeDashoffset: staticMode ? 0 : routeLength,
      });
      gsap.set(routeMarkers, {
        autoAlpha: staticMode ? 1 : 0,
        scale: staticMode ? 1 : 0.62,
        transformOrigin: "center center",
      });
      gsap.set(checkpointWaves, { autoAlpha: 0, scale: 0.78 });

      if (staticMode) {
        setSemanticSnapshot("network-map", completedCheckpointStates);
        gsap.set([copy, phone, stage, camera, child, bus, school], {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
        });
        gsap.set([mapPanel, finalMessage, boardingStatus, attentionSlot], {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
        });

        const staticRefreshFrame = window.requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });

        return () => {
          window.cancelAnimationFrame(staticRefreshFrame);
          ScrollTrigger.refresh();
        };
      }

      setSemanticSnapshot("intro", initialCheckpointStates);

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: "(min-width: 900px)",
          isMobile: "(max-width: 899px)",
        },
        (context) => {
          const conditions = context.conditions as MatchMediaConditions;
          const isDesktop = Boolean(conditions.isDesktop);

          const travel = isDesktop
            ? {
                childHome: { x: 72, y: -4 },
                childStore: { x: 300, y: -160 },
                childBoarding: { x: 520, y: 8 },
                childSchool: { x: 820, y: -210 },
                busStart: { x: 120, y: 12 },
                busBoarding: { x: 0, y: 0 },
                busSchool: { x: 282, y: -210 },
                cameraHome: { x: 0, y: 0, scale: 1.02 },
                cameraStore: { x: -30, y: 12, scale: 1.05 },
                cameraBus: { x: -72, y: -8, scale: 1.04 },
                cameraSchool: { x: -88, y: 26, scale: 1.02 },
                cameraRise: { x: 0, y: 0, scale: 0.88 },
                endMultiplier: 5.4,
                scrub: 0.7,
              }
            : {
                childHome: { x: 72, y: -4 },
                childStore: { x: 300, y: -160 },
                childBoarding: { x: 520, y: 8 },
                childSchool: { x: 820, y: -210 },
                busStart: { x: 120, y: 12 },
                busBoarding: { x: 0, y: 0 },
                busSchool: { x: 282, y: -210 },
                cameraHome: { x: -24, y: 0, scale: 1 },
                cameraStore: { x: -230, y: 18, scale: 1.02 },
                cameraBus: { x: -450, y: -6, scale: 1.02 },
                cameraSchool: { x: -720, y: 30, scale: 1 },
                cameraRise: { x: -470, y: 26, scale: 0.72 },
                endMultiplier: 6.2,
                scrub: 0.48,
              };

          gsap.set([copy, phone, stage], { autoAlpha: 1, x: 0, y: 0 });
          gsap.set(camera, { x: 0, y: 0, scale: 1, transformOrigin: "50% 50%" });
          gsap.set(child, { autoAlpha: 1, x: 0, y: 0, scale: 1 });
          gsap.set(bus, {
            autoAlpha: 0,
            x: travel.busStart.x,
            y: travel.busStart.y,
            scale: 0.92,
          });
          gsap.set([mapPanel, finalMessage, boardingStatus, attentionSlot], {
            autoAlpha: 0,
            y: 14,
            scale: 0.96,
          });

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              id: "protected-journey-main",
              trigger: pinFrame,
              pin: true,
              start: "top top",
              end: () => `+=${Math.round(window.innerHeight * travel.endMultiplier)}`,
              scrub: travel.scrub,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              refreshPriority: 1,
              onUpdate: (self) => {
                const snapshot = getSemanticSnapshot(self.progress);
                setSemanticSnapshot(snapshot.stage, snapshot.checkpoints);
              },
            },
          });

          timeline
            .addLabel("leaving-home", 0)
            .to(routePath, { strokeDashoffset: routeLength * 0.84, duration: 15 }, 0)
            .to(child, { ...travel.childHome, duration: 15 }, 0)
            .to(camera, { ...travel.cameraHome, duration: 15 }, 0)
            .to(
              homeMarker,
              { autoAlpha: 1, scale: 1, duration: 4, ease: "back.out(1.4)" },
              2,
            )
            .addLabel("community-checkpoint", 18)
            .to(routePath, { strokeDashoffset: routeLength * 0.64, duration: 16 }, 18)
            .to(child, { ...travel.childStore, duration: 16 }, 18)
            .to(camera, { ...travel.cameraStore, duration: 16 }, 18)
            .to(communityZone, { scale: 1.05, duration: 4, ease: "power2.out" }, 20)
            .to(
              checkpointWaves,
              { autoAlpha: 0.42, scale: 1.42, duration: 7, stagger: 0.04 },
              22,
            )
            .to(
              communityMarker,
              { autoAlpha: 1, scale: 1, duration: 4, ease: "back.out(1.4)" },
              26,
            )
            .to(communityZone, { scale: 1, duration: 4, ease: "power2.out" }, 31)
            .addLabel("boarding", 34)
            .to(routePath, { strokeDashoffset: routeLength * 0.46, duration: 14 }, 34)
            .to(child, { ...travel.childBoarding, duration: 14 }, 34)
            .to(camera, { ...travel.cameraBus, duration: 14 }, 34)
            .to(
              bus,
              {
                autoAlpha: 1,
                ...travel.busBoarding,
                scale: 1,
                duration: 7,
                ease: "power2.out",
              },
              36,
            )
            .to(
              boardingStatus,
              { autoAlpha: 1, y: 0, scale: 1, duration: 5, ease: "power2.out" },
              38,
            )
            .to(
              boardingMarker,
              { autoAlpha: 1, scale: 1, duration: 4, ease: "back.out(1.4)" },
              42,
            )
            .to(child, { autoAlpha: 0, scale: 0.72, duration: 4 }, 46)
            .addLabel("bus-route", 50)
            .to(routePath, { strokeDashoffset: routeLength * 0.2, duration: 17 }, 50)
            .to(bus, { ...travel.busSchool, duration: 17 }, 50)
            .to(camera, { ...travel.cameraSchool, duration: 17 }, 50)
            .to(
              attentionSlot,
              { autoAlpha: 1, y: 0, scale: 1, duration: 5, ease: "power2.out" },
              56,
            )
            .addLabel("school-arrival", 68)
            .to(routePath, { strokeDashoffset: routeLength * 0.05, duration: 13 }, 68)
            .to(
              bus,
              {
                x: travel.busSchool.x + 42,
                y: travel.busSchool.y + 42,
                scale: 0.86,
                duration: 13,
              },
              68,
            )
            .to(
              child,
              {
                autoAlpha: 1,
                ...travel.childSchool,
                scale: 0.82,
                duration: 7,
                ease: "power2.out",
              },
              72,
            )
            .to(
              schoolMarker,
              { autoAlpha: 1, scale: 1, duration: 4, ease: "back.out(1.4)" },
              75,
            )
            .addLabel("camera-rise", 82)
            .to(camera, { ...travel.cameraRise, duration: 11, ease: "power1.inOut" }, 82)
            .to(
              [homeZone, communityZone, busStopZone, school],
              { autoAlpha: 0.62, scale: 0.95, duration: 9 },
              82,
            )
            .addLabel("network-map", 93)
            .to(routePath, { strokeDashoffset: 0, duration: 7 }, 93)
            .to(
              mapPanel,
              { autoAlpha: 1, y: 0, scale: 1, duration: 5, ease: "power2.out" },
              93,
            )
            .to(
              finalMessage,
              { autoAlpha: 1, y: 0, scale: 1, duration: 5, ease: "power2.out" },
              94,
            )
            .to(root, { "--journey-progress": 1, duration: 0.1 }, 100);

          const refreshFrame = window.requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });

          return () => {
            window.cancelAnimationFrame(refreshFrame);
            timeline.scrollTrigger?.kill(true);
            timeline.kill();
          };
        },
        root,
      );

      return () => {
        mm.revert();
        ScrollTrigger.getById("protected-journey-main")?.kill(true);
        ScrollTrigger.refresh();
      };
    },
    {
      scope,
      dependencies: [staticMode],
      revertOnUpdate: true,
    },
  );

  return {
    scope,
    journeyStage,
    checkpointStates,
  };
}
