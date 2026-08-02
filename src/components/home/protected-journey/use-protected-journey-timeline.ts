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
  isTablet?: boolean;
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

  if (progress >= 0.036) {
    stage = "leaving-home";
  }

  if (progress >= 0.109) {
    checkpoints["home-start"] = "validated";
  }

  if (progress >= 0.131) {
    stage = "community-checkpoint";
    checkpoints["safe-point"] = "detecting";
  }

  if (progress >= 0.19) {
    checkpoints["safe-point"] = "validating";
  }

  if (progress >= 0.248) {
    checkpoints["safe-point"] = "validated";
  }

  if (progress >= 0.263) {
    stage = "boarding";
    checkpoints.boarding = "detecting";
  }

  if (progress >= 0.321) {
    checkpoints.boarding = "validating";
  }

  if (progress >= 0.372) {
    checkpoints.boarding = "validated";
  }

  if (progress >= 0.387) {
    stage = "bus-route";
  }

  if (progress >= 0.577) {
    stage = "school-arrival";
    checkpoints["school-arrival"] = "detecting";
  }

  if (progress >= 0.642) {
    checkpoints["school-arrival"] = "validating";
  }

  if (progress >= 0.701) {
    checkpoints["school-arrival"] = "validated";
  }

  if (progress >= 0.715) {
    stage = "camera-rise";
  }

  if (progress >= 0.81) {
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
      const routePath = first<SVGPathElement>("[data-journey-route-path]");
      const attentionPath = first<SVGPathElement>("[data-journey-attention-path]");
      const attentionMarker = first<SVGGElement>("[data-journey-attention-marker]");
      const child = first<HTMLElement>("[data-journey-child]");
      const bus = first<HTMLElement>("[data-journey-bus]");
      const school = first<HTMLElement>("[data-journey-school]");
      const mapPanel = first<HTMLElement>("[data-journey-map]");
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
        !routePath ||
        !attentionPath ||
        !attentionMarker ||
        !child ||
        !bus ||
        !school ||
        !mapPanel ||
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
        gsap.set([copy, stage, camera, child, bus, school], {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
        });
        gsap.set([mapPanel, boardingStatus, attentionSlot], {
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
          isTablet: "(min-width: 521px) and (max-width: 899px)",
          isMobile: "(max-width: 520px)",
        },
        (context) => {
          const conditions = context.conditions as MatchMediaConditions;
          const isDesktop = Boolean(conditions.isDesktop);
          const isTablet = Boolean(conditions.isTablet);
          const isMobile = Boolean(conditions.isMobile);
          const isCompactViewport = isMobile && window.innerHeight < 680;
          const clampTabletCameraX = (x: number, scale: number) => {
            if (!isTablet) {
              return Math.round(x);
            }

            const cameraWidth = camera.offsetWidth;
            const scaledWidth = cameraWidth * scale;

            if (scaledWidth <= stage.clientWidth) {
              return Math.round((stage.clientWidth - cameraWidth) / 2);
            }

            const scaleInset = (cameraWidth - scaledWidth) / 2;
            const minX = stage.clientWidth - cameraWidth + scaleInset;
            const maxX = -scaleInset;

            return Math.round(gsap.utils.clamp(minX, maxX, x));
          };
          const centerCameraOn = (element: HTMLElement, scale = 1) => {
            const cameraCenter = camera.offsetWidth / 2;
            const elementCenter = element.offsetLeft + element.offsetWidth / 2;
            const centeredX =
              stage.clientWidth / 2 -
              ((elementCenter - cameraCenter) * scale + cameraCenter);

            return clampTabletCameraX(centeredX, scale);
          };
          const tabletRiseScale = Math.max(
            0.92,
            stage.clientWidth / camera.offsetWidth,
          );
          const centerCamera = clampTabletCameraX(
            (stage.clientWidth - camera.offsetWidth) / 2,
            isTablet ? tabletRiseScale : 1,
          );
          const distanceScale = isDesktop ? 1 : camera.offsetWidth / 1088;
          const scaled = (value: number) => Math.round(value * distanceScale);
          const getPinOffset = () => {
            const navigation = document.querySelector<HTMLElement>(
              "[data-app-navigation]",
            );

            return Math.round(navigation?.getBoundingClientRect().height ?? 72) + 22;
          };

          const travel = isDesktop
            ? {
                childHome: { x: scaled(72), y: scaled(-4) },
                childStore: { x: scaled(300), y: scaled(-160) },
                childBoarding: { x: scaled(520), y: scaled(8) },
                childSchoolExit: { x: scaled(780), y: scaled(-174) },
                childSchool: { x: scaled(820), y: scaled(-210) },
                busStart: { x: scaled(120), y: scaled(12) },
                busBoarding: { x: 0, y: 0 },
                busSchool: { x: scaled(300), y: scaled(-204) },
                cameraHome: { x: 0, y: 0, scale: 1.02 },
                cameraStore: { x: -30, y: 12, scale: 1.05 },
                cameraBus: { x: -72, y: -8, scale: 1.04 },
                cameraSchool: { x: -88, y: 26, scale: 1.02 },
                cameraRise: { x: 0, y: 0, scale: 0.88 },
                endMultiplier: 5.2,
                scrub: 0.55,
              }
            : isTablet
              ? {
                  childHome: { x: scaled(72), y: scaled(-18) },
                  childStore: { x: scaled(300), y: scaled(-184) },
                  childBoarding: { x: scaled(520), y: scaled(-42) },
                  childSchoolExit: { x: scaled(780), y: scaled(-206) },
                  childSchool: { x: scaled(820), y: scaled(-238) },
                  busStart: { x: scaled(120), y: scaled(-12) },
                  busBoarding: { x: 0, y: scaled(-34) },
                  busSchool: { x: scaled(300), y: scaled(-238) },
                  cameraHome: {
                    x: centerCameraOn(homeZone, 1),
                    y: 0,
                    scale: 1,
                  },
                  cameraStore: {
                    x: centerCameraOn(communityZone, 1.02),
                    y: 16,
                    scale: 1.02,
                  },
                  cameraBus: {
                    x: centerCameraOn(busStopZone, 1.02),
                    y: -4,
                    scale: 1.02,
                  },
                  cameraSchool: {
                    x: centerCameraOn(school, 1),
                    y: 24,
                    scale: 1,
                  },
                  cameraRise: {
                    x: centerCamera,
                    y: 20,
                    scale: tabletRiseScale,
                  },
                  endMultiplier: 4.4,
                  scrub: 0.35,
                }
            : {
                childHome: { x: scaled(72), y: scaled(-4) },
                childStore: { x: scaled(300), y: scaled(-160) },
                childBoarding: { x: scaled(520), y: scaled(8) },
                childSchoolExit: { x: scaled(780), y: scaled(-174) },
                childSchool: { x: scaled(820), y: scaled(-210) },
                busStart: { x: scaled(120), y: scaled(12) },
                busBoarding: { x: 0, y: 0 },
                busSchool: { x: scaled(300), y: scaled(-204) },
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
                endMultiplier: 5.8,
                scrub: 0.35,
              };

          gsap.set([copy, stage], { autoAlpha: 1, x: 0, y: 0 });
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
            scale: 0.72,
          });
          gsap.set([mapPanel, boardingStatus, attentionSlot], {
            autoAlpha: 0,
            y: 14,
            scale: 0.96,
          });
          gsap.set([attentionPath, attentionMarker], { autoAlpha: 0 });
          const attentionDrawStart = 31;
          const attentionSignalStart = isDesktop ? 45 : 41;

          const timeline = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              id: "protected-journey-main",
              trigger: pinFrame,
              pin: true,
              start: () => "top top+=" + getPinOffset(),
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
            .addLabel("leaving-home", 5)
            .to(routePath, { strokeDashoffset: routeLength * 0.84, duration: 13 }, 5)
            .to(child, { ...travel.childHome, duration: 13, ease: "power1.inOut" }, 5)
            .to(camera, { ...travel.cameraHome, duration: 13, ease: "power1.inOut" }, 5)
            .to(
              homeMarker,
              { autoAlpha: 1, scale: 1, duration: 3, ease: "back.out(1.4)" },
              7,
            )
            .addLabel("community-checkpoint", 18)
            .to(routePath, { strokeDashoffset: routeLength * 0.64, duration: 18 }, 18)
            .to(child, { ...travel.childStore, duration: 18, ease: "power1.inOut" }, 18)
            .to(camera, { ...travel.cameraStore, duration: 18, ease: "power1.inOut" }, 18)
            .to(communityZone, { scale: 1.05, duration: 3, ease: "power2.out" }, 22)
            .to(
              checkpointWaves,
              { autoAlpha: 0.42, scale: 1.42, duration: 6, stagger: 0.04 },
              24,
            )
            .to(
              communityMarker,
              { autoAlpha: 1, scale: 1, duration: 3, ease: "back.out(1.4)" },
              31,
            )
            .to(communityZone, { scale: 1, duration: 3, ease: "power2.out" }, 33)
            .addLabel("boarding", 36)
            .to(routePath, { strokeDashoffset: routeLength * 0.46, duration: 17 }, 36)
            .to(
              child,
              { ...travel.childBoarding, duration: 17, ease: "power1.inOut" },
              36,
            )
            .to(camera, { ...travel.cameraBus, duration: 17, ease: "power1.inOut" }, 36)
            .to(
              bus,
              {
                autoAlpha: 1,
                ...travel.busBoarding,
                scale: 0.78,
                duration: 6,
                ease: "power2.out",
              },
              39,
            )
            .to(
              boardingStatus,
              { autoAlpha: 1, y: 0, scale: 1, duration: 4, ease: "power2.out" },
              41,
            )
            .to(
              boardingMarker,
              { autoAlpha: 1, scale: 1, duration: 3, ease: "back.out(1.4)" },
              47,
            )
            .to(child, { autoAlpha: 0, scale: 0.72, duration: 3 }, 50)
            .addLabel("bus-route", 53)
            .to(routePath, { strokeDashoffset: routeLength * 0.2, duration: 26 }, 53)
            .to(bus, { ...travel.busSchool, duration: 26, ease: "power1.inOut" }, 53)
            .to(
              camera,
              { ...travel.cameraSchool, duration: 24, ease: "power1.inOut" },
              53,
            )
            .to(attentionPath, { autoAlpha: 0.9, duration: 3 }, attentionDrawStart)
            .to(attentionPath, { strokeDashoffset: 0, duration: 18 }, attentionDrawStart)
            .to(
              attentionMarker,
              { autoAlpha: 1, scale: 1, duration: 3, ease: "back.out(1.5)" },
              attentionSignalStart,
            )
            .to(
              attentionSlot,
              { autoAlpha: 1, y: 0, scale: 1, duration: 4, ease: "power2.out" },
              attentionSignalStart,
            )
            .addLabel("school-arrival", 79)
            .to(routePath, { strokeDashoffset: routeLength * 0.05, duration: 19 }, 79)
            .to(
              bus,
              {
                x: travel.busSchool.x + scaled(42),
                y: travel.busSchool.y + scaled(42),
                scale: 0.7,
                duration: 14,
                ease: "power1.inOut",
              },
              79,
            )
            .to(
              [attentionPath, attentionMarker, attentionSlot],
              { autoAlpha: 0.3, duration: 5 },
              79,
            )
            .set(
              child,
              {
                autoAlpha: 0,
                ...travel.childSchoolExit,
                scale: 0.8,
              },
              89,
            )
            .to(
              child,
              {
                autoAlpha: 1,
                ...travel.childSchool,
                scale: 0.8,
                duration: 6,
                ease: "power2.out",
              },
              90,
            )
            .to(
              schoolMarker,
              { autoAlpha: 1, scale: 1, duration: 3, ease: "back.out(1.4)" },
              92,
            )
            .addLabel("camera-rise", 98)
            .to(camera, { ...travel.cameraRise, duration: 13, ease: "power1.inOut" }, 98)
            .to(
              [homeZone, communityZone, busStopZone, school],
              { autoAlpha: 0.48, scale: 0.94, duration: 11 },
              98,
            )
            .addLabel("network-map", 111)
            .to(routePath, { strokeDashoffset: 0, duration: 8 }, 111)
            .to(camera, { autoAlpha: 0.1, duration: 8 }, 111)
            .to(
              mapPanel,
              {
                autoAlpha: 1,
                xPercent: -50,
                yPercent: -48,
                y: 0,
                scale: 1,
                duration: 7,
                ease: "power2.out",
              },
              113,
            )
            .addLabel("final-hold", 123)
            .to(root, { "--journey-progress": 1, duration: 0.1 }, 137);
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
