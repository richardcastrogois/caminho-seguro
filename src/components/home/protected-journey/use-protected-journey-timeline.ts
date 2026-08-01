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

  if (progress >= 0.05) {
    stage = "leaving-home";
  }

  if (progress >= 0.1) {
    checkpoints["home-start"] = "validated";
  }

  if (progress >= 0.13) {
    stage = "community-checkpoint";
    checkpoints["safe-point"] = "detecting";
  }

  if (progress >= 0.17) {
    checkpoints["safe-point"] = "validating";
  }

  if (progress >= 0.21) {
    checkpoints["safe-point"] = "validated";
  }

  if (progress >= 0.313) {
    stage = "boarding";
    checkpoints.boarding = "detecting";
  }

  if (progress >= 0.35) {
    checkpoints.boarding = "validating";
  }

  if (progress >= 0.38) {
    checkpoints.boarding = "validated";
  }

  if (progress >= 0.394) {
    stage = "bus-route";
  }

  if (progress >= 0.535) {
    stage = "school-arrival";
    checkpoints["school-arrival"] = "detecting";
  }

  if (progress >= 0.58) {
    checkpoints["school-arrival"] = "validating";
  }

  if (progress >= 0.63) {
    checkpoints["school-arrival"] = "validated";
  }

  if (progress >= 0.717) {
    stage = "camera-rise";
  }

  if (progress >= 0.788) {
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
      const attentionPath = first<SVGPathElement>("[data-journey-attention-path]");
      const attentionMarker = first<SVGGElement>("[data-journey-attention-marker]");
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
        !attentionPath ||
        !attentionMarker ||
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
      const attentionLength = attentionPath.getTotalLength();
      gsap.set(root, { "--journey-progress": staticMode ? 1 : 0 });
      gsap.set(routePath, {
        strokeDasharray: routeLength,
        strokeDashoffset: staticMode ? 0 : routeLength,
      });
      gsap.set(attentionPath, {
        autoAlpha: staticMode ? 0.72 : 0,
        strokeDasharray: attentionLength,
        strokeDashoffset: staticMode ? 0 : attentionLength,
      });
      gsap.set(attentionMarker, {
        autoAlpha: staticMode ? 1 : 0,
        scale: staticMode ? 1 : 0.65,
        transformOrigin: "center center",
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
          const isCompactViewport = !isDesktop && window.innerHeight < 680;
          const centerCameraOn = (element: HTMLElement, scale = 1) => {
            const cameraCenter = camera.offsetWidth / 2;
            const elementCenter = element.offsetLeft + element.offsetWidth / 2;

            return Math.round(
              stage.clientWidth / 2 -
                ((elementCenter - cameraCenter) * scale + cameraCenter),
            );
          };
          const centerCamera = Math.round((stage.clientWidth - camera.offsetWidth) / 2);

          const travel = isDesktop
            ? {
                childHome: { x: 72, y: -4 },
                childStore: { x: 300, y: -160 },
                childBoarding: { x: 520, y: 8 },
                childSchoolExit: { x: 780, y: -174 },
                childSchool: { x: 820, y: -210 },
                busStart: { x: 120, y: 12 },
                busBoarding: { x: 0, y: 0 },
                busSchool: { x: 282, y: -210 },
                cameraHome: { x: 0, y: 0, scale: 1.02 },
                cameraStore: { x: -30, y: 12, scale: 1.05 },
                cameraBus: { x: -72, y: -8, scale: 1.04 },
                cameraSchool: { x: -88, y: 26, scale: 1.02 },
                cameraRise: { x: 0, y: 0, scale: 0.88 },
                endMultiplier: 8,
                scrub: 0.75,
              }
            : {
                childHome: { x: 72, y: -4 },
                childStore: { x: 300, y: -160 },
                childBoarding: { x: 520, y: 8 },
                childSchoolExit: { x: 780, y: -174 },
                childSchool: { x: 820, y: -210 },
                busStart: { x: 120, y: 12 },
                busBoarding: { x: 0, y: 0 },
                busSchool: { x: 282, y: -210 },
                cameraHome: {
                  x: centerCameraOn(homeZone, isCompactViewport ? 0.9 : 1),
                  y: 0,
                  scale: isCompactViewport ? 0.9 : 1,
                },
                cameraStore: {
                  x: centerCameraOn(communityZone, isCompactViewport ? 0.88 : 1.02),
                  y: 16,
                  scale: isCompactViewport ? 0.88 : 1.02,
                },
                cameraBus: {
                  x: centerCameraOn(busStopZone, isCompactViewport ? 0.84 : 1.02),
                  y: -4,
                  scale: isCompactViewport ? 0.84 : 1.02,
                },
                cameraSchool: {
                  x: centerCameraOn(school, isCompactViewport ? 0.84 : 1),
                  y: 24,
                  scale: isCompactViewport ? 0.84 : 1,
                },
                cameraRise: {
                  x: centerCamera,
                  y: 20,
                  scale: isCompactViewport ? 0.68 : 0.72,
                },
                endMultiplier: 9,
                scrub: 0.5,
              };

          gsap.set([copy, phone, stage], { autoAlpha: 1, x: 0, y: 0 });
          gsap.set(camera, {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            transformOrigin: "50% 50%",
          });
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
          gsap.set([attentionPath, attentionMarker], { autoAlpha: 0 });

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
            .addLabel("intro", 0)
            .addLabel("leaving-home", 10)
            .to(routePath, { strokeDashoffset: routeLength * 0.84, duration: 16 }, 10)
            .to(child, { ...travel.childHome, duration: 16, ease: "power1.inOut" }, 10)
            .to(camera, { ...travel.cameraHome, duration: 16, ease: "power1.inOut" }, 10)
            .to(
              homeMarker,
              { autoAlpha: 1, scale: 1, duration: 4, ease: "back.out(1.4)" },
              13,
            )
            .addLabel("community-checkpoint", 26)
            .to(routePath, { strokeDashoffset: routeLength * 0.64, duration: 18 }, 26)
            .to(child, { ...travel.childStore, duration: 18, ease: "power1.inOut" }, 26)
            .to(camera, { ...travel.cameraStore, duration: 18, ease: "power1.inOut" }, 26)
            .to(communityZone, { scale: 1.05, duration: 4, ease: "power2.out" }, 29)
            .to(
              checkpointWaves,
              { autoAlpha: 0.42, scale: 1.42, duration: 7, stagger: 0.04 },
              31,
            )
            .to(
              communityMarker,
              { autoAlpha: 1, scale: 1, duration: 4, ease: "back.out(1.4)" },
              37,
            )
            .to(communityZone, { scale: 1, duration: 4, ease: "power2.out" }, 42)
            .addLabel("community-hold", 44)
            .addLabel("boarding", 62)
            .to(routePath, { strokeDashoffset: routeLength * 0.46, duration: 16 }, 62)
            .to(
              child,
              { ...travel.childBoarding, duration: 16, ease: "power1.inOut" },
              62,
            )
            .to(camera, { ...travel.cameraBus, duration: 16, ease: "power1.inOut" }, 62)
            .to(
              bus,
              {
                autoAlpha: 1,
                ...travel.busBoarding,
                scale: 1,
                duration: 7,
                ease: "power2.out",
              },
              65,
            )
            .to(
              boardingStatus,
              { autoAlpha: 1, y: 0, scale: 1, duration: 5, ease: "power2.out" },
              67,
            )
            .to(
              boardingMarker,
              { autoAlpha: 1, scale: 1, duration: 4, ease: "back.out(1.4)" },
              71,
            )
            .to(child, { autoAlpha: 0, scale: 0.72, duration: 3 }, 75)
            .addLabel("bus-route", 78)
            .to(routePath, { strokeDashoffset: routeLength * 0.2, duration: 28 }, 78)
            .to(bus, { ...travel.busSchool, duration: 28, ease: "power1.inOut" }, 78)
            .to(
              camera,
              { ...travel.cameraSchool, duration: 28, ease: "power1.inOut" },
              78,
            )
            .to(attentionPath, { autoAlpha: 0.9, duration: 3 }, 82)
            .to(attentionPath, { strokeDashoffset: 0, duration: 12 }, 82)
            .to(
              attentionMarker,
              { autoAlpha: 1, scale: 1, duration: 4, ease: "back.out(1.5)" },
              91,
            )
            .to(
              attentionSlot,
              { autoAlpha: 1, y: 0, scale: 1, duration: 5, ease: "power2.out" },
              90,
            )
            .addLabel("school-arrival", 106)
            .to(routePath, { strokeDashoffset: routeLength * 0.05, duration: 18 }, 106)
            .to(
              bus,
              {
                x: travel.busSchool.x + 42,
                y: travel.busSchool.y + 42,
                scale: 0.86,
                duration: 14,
                ease: "power1.inOut",
              },
              106,
            )
            .to(
              [attentionPath, attentionMarker, attentionSlot],
              { autoAlpha: 0.28, duration: 6 },
              106,
            )
            .set(
              child,
              {
                autoAlpha: 0,
                ...travel.childSchoolExit,
                scale: 0.82,
              },
              116,
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
              117,
            )
            .to(
              schoolMarker,
              { autoAlpha: 1, scale: 1, duration: 4, ease: "back.out(1.4)" },
              117,
            )
            .addLabel("school-hold", 124)
            .addLabel("camera-rise", 142)
            .to(camera, { ...travel.cameraRise, duration: 14, ease: "power1.inOut" }, 142)
            .to(
              [homeZone, communityZone, busStopZone, school],
              { autoAlpha: 0.5, scale: 0.95, duration: 12 },
              142,
            )
            .to(
              [copy, phone],
              { autoAlpha: 0, y: 8, duration: 5, ease: "power2.in" },
              153,
            )
            .addLabel("network-map", 156)
            .to(routePath, { strokeDashoffset: 0, duration: 8 }, 156)
            .to(camera, { autoAlpha: 0.32, duration: 8 }, 156)
            .to(
              mapPanel,
              { autoAlpha: 1, y: 0, scale: 1, duration: 7, ease: "power2.out" },
              158,
            )
            .to(
              finalMessage,
              { autoAlpha: 1, y: 0, scale: 1, duration: 7, ease: "power2.out" },
              160,
            )
            .addLabel("final-hold", 170)
            .to(root, { "--journey-progress": 1, duration: 0.1 }, 198);

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
