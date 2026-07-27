"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type GsapRevealProps = {
  children: React.ReactNode;
  className?: string;
};

export function GsapReveal({ children, className = "" }: GsapRevealProps) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia(scope);

      mm.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          desktop: "(min-width: 768px)",
        },
        (context) => {
          const reduceMotion = Boolean(context.conditions?.reduceMotion);
          const desktop = Boolean(context.conditions?.desktop);

          if (reduceMotion) {
            gsap.set("[data-gsap='hero'], [data-gsap='card'], [data-gsap='timeline'], [data-gsap='nav'], .motion-card", {
              autoAlpha: 1,
              y: 0,
              scale: 1,
            });
            return;
          }

          const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

          timeline
            .from("[data-gsap='nav']", {
              autoAlpha: 0,
              y: -10,
              duration: 0.34,
            })
            .from(
              "[data-gsap='hero']",
              {
                autoAlpha: 0,
                y: desktop ? 22 : 12,
                duration: 0.52,
                stagger: 0.08,
              },
              "-=0.16",
            )
            .from(
              "[data-gsap='card'], .motion-card",
              {
                autoAlpha: 0,
                y: 18,
                scale: 0.985,
                duration: 0.44,
                stagger: 0.055,
              },
              "-=0.2",
            )
            .from(
              "[data-gsap='timeline']",
              {
                autoAlpha: 0,
                x: desktop ? -12 : 0,
                y: desktop ? 0 : 10,
                duration: 0.4,
                stagger: 0.08,
              },
              "-=0.18",
            );

          gsap.to("[data-gsap='pulse']", {
            scale: 1.18,
            autoAlpha: 0.72,
            duration: 1.35,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            stagger: 0.18,
          });
        },
      );

      return () => mm.revert();
    },
    { scope },
  );

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  );
}
