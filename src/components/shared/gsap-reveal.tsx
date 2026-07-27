"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type GsapRevealProps = {
  children: React.ReactNode;
  className?: string;
};

export function GsapReveal({ children, className = "" }: GsapRevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;

      if (!root) {
        return;
      }

      const find = (selector: string) =>
        Array.from(root.querySelectorAll<HTMLElement>(selector));

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const desktop = window.matchMedia("(min-width: 768px)").matches;
      const heroTargets = find("[data-gsap='hero']");
      const metricTargets = find("[data-gsap='metrics'] > *");
      const visualTargets = find("[data-gsap='visual']");
      const cardTargets = find("[data-gsap='card']");
      const timelineTargets = find("[data-gsap='timeline']");
      const pulseTargets = find("[data-gsap='pulse']");
      const scrollTargets = Array.from(
        new Set([
          ...find("[data-gsap-scroll]"),
          ...find(".motion-card, .dashboard-panel, .gsap-scroll-card"),
        ]),
      ).filter(
        (element) =>
          !heroTargets.includes(element) &&
          !metricTargets.includes(element) &&
          !visualTargets.includes(element) &&
          !cardTargets.includes(element) &&
          !timelineTargets.includes(element),
      );
      const parallaxTargets = find("[data-gsap-parallax]");
      const allTargets = [
        ...heroTargets,
        ...metricTargets,
        ...visualTargets,
        ...cardTargets,
        ...timelineTargets,
        ...scrollTargets,
      ];

      if (reduceMotion) {
        gsap.set(allTargets, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          rotationX: 0,
          rotationY: 0,
        });
        return;
      }

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (heroTargets.length) {
        intro.fromTo(
          heroTargets,
          { autoAlpha: 0, y: desktop ? 46 : 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: desktop ? 0.82 : 0.64,
            stagger: 0.11,
          },
        );
      }

      if (metricTargets.length) {
        intro.fromTo(
          metricTargets,
          { autoAlpha: 0, y: 30, scale: 0.92 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.62,
            stagger: 0.1,
          },
          "-=0.46",
        );
      }

      if (visualTargets.length) {
        intro.fromTo(
          visualTargets,
          {
            autoAlpha: 0,
            x: desktop ? 72 : 0,
            y: desktop ? 0 : 34,
            scale: 0.94,
            rotationY: desktop ? -4 : 0,
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotationY: 0,
            duration: 0.92,
          },
          0.18,
        );
      }

      if (cardTargets.length) {
        intro.fromTo(
          cardTargets,
          { autoAlpha: 0, y: 38, scale: 0.94 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.72,
            stagger: 0.08,
          },
          "-=0.44",
        );
      }

      if (timelineTargets.length) {
        intro.fromTo(
          timelineTargets,
          {
            autoAlpha: 0,
            x: desktop ? -48 : 0,
            y: desktop ? 0 : 26,
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            duration: 0.76,
            stagger: 0.1,
          },
          "-=0.42",
        );
      }

      const heroIcons = heroTargets.flatMap((target) =>
        Array.from(target.querySelectorAll<HTMLElement>("[data-gsap-icon]")),
      );

      if (heroIcons.length) {
        intro.fromTo(
          heroIcons,
          { scale: 0.45, rotation: -18 },
          {
            scale: 1,
            rotation: 0,
            duration: 0.56,
            stagger: 0.08,
            ease: "back.out(1.8)",
            clearProps: "transform",
          },
          "-=0.72",
        );
      }

      if (pulseTargets.length) {
        gsap.to(pulseTargets, {
          scale: 1.28,
          autoAlpha: 0.58,
          duration: 1.25,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 0.16,
        });
      }

      scrollTargets.forEach((element, index) => {
        const direction = element.dataset.gsapScroll ?? "up";
        const markedIcons = Array.from(
          element.querySelectorAll<HTMLElement>("[data-gsap-icon]"),
        );
        const icons =
          markedIcons.length > 0
            ? markedIcons
            : Array.from(element.querySelectorAll<HTMLElement>("svg")).slice(0, 1);
        const x = direction === "left" ? -64 : direction === "right" ? 64 : 0;
        const y = direction === "up" ? 54 : 18;
        const reveal = gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start: "top 86%",
            end: "bottom 14%",
            toggleActions: "play reverse play reverse",
            invalidateOnRefresh: true,
            refreshPriority: index,
          },
        });

        reveal.fromTo(
          element,
          {
            autoAlpha: 0,
            x: desktop ? x : 0,
            y: desktop ? y : Math.min(y, 34),
            scale: 0.96,
            rotationX: desktop ? 4 : 0,
          },
          {
            autoAlpha: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotationX: 0,
            duration: desktop ? 0.84 : 0.66,
            ease: "power3.out",
          },
        );

        if (icons.length) {
          reveal.fromTo(
            icons,
            { scale: 0.45, rotation: -16 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.5,
              stagger: 0.06,
              ease: "back.out(1.8)",
            },
            "-=0.58",
          );
        }
      });

      parallaxTargets.forEach((element) => {
        gsap.to(element, {
          y: desktop ? -30 : -14,
          ease: "none",
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });
      });

      const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => window.cancelAnimationFrame(refreshFrame);
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
