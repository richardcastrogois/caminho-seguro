"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tone: "blue" | "green";
};

type InteractiveParticleFieldProps = {
  className?: string;
};

export function InteractiveParticleField({
  className = "",
}: InteractiveParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGSAP(
    () => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");

      if (!canvas || !context) {
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const pointer = { x: -1000, y: -1000, active: false };
      let width = 0;
      let height = 0;
      let particles: Particle[] = [];
      let seed = 4187;

      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };

      const createParticles = () => {
        const count = width < 640 ? 30 : width < 1024 ? 46 : 68;
        particles = Array.from({ length: count }, (_, index) => ({
          x: random() * width,
          y: random() * height,
          vx: (random() - 0.5) * 0.24,
          vy: (random() - 0.5) * 0.24,
          radius: index % 7 === 0 ? 2.4 : 1.65,
          tone: index % 3 === 0 ? "green" : "blue",
        }));
      };

      const resize = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * ratio);
        canvas.height = Math.floor(height * ratio);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
        createParticles();
      };

      const onPointerMove = (event: PointerEvent) => {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        pointer.active = true;
      };

      const onPointerLeave = () => {
        pointer.active = false;
      };

      const draw = () => {
        context.clearRect(0, 0, width, height);

        for (let index = 0; index < particles.length; index += 1) {
          const particle = particles[index];

          if (!reduceMotion) {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (pointer.active) {
              const dx = particle.x - pointer.x;
              const dy = particle.y - pointer.y;
              const distance = Math.hypot(dx, dy);

              if (distance > 0 && distance < 260) {
                const force = (260 - distance) / 260;
                particle.vx += (dx / distance) * force * 0.52;
                particle.vy += (dy / distance) * force * 0.52;
                particle.x += (dx / distance) * force * 1.4;
                particle.y += (dy / distance) * force * 1.4;
              }
            }

            particle.vx = Math.max(-1.45, Math.min(1.45, particle.vx * 0.992));
            particle.vy = Math.max(-1.45, Math.min(1.45, particle.vy * 0.992));

            if (particle.x < -20) particle.x = width + 20;
            if (particle.x > width + 20) particle.x = -20;
            if (particle.y < -20) particle.y = height + 20;
            if (particle.y > height + 20) particle.y = -20;
          }

          for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
            const next = particles[nextIndex];
            const distance = Math.hypot(particle.x - next.x, particle.y - next.y);

            if (distance < 170) {
              const opacity = (1 - distance / 170) * 0.42;
              context.beginPath();
              context.moveTo(particle.x, particle.y);
              context.lineTo(next.x, next.y);
              context.strokeStyle =
                particle.tone === "green"
                  ? `rgba(16, 185, 129, ${opacity})`
                  : `rgba(14, 165, 233, ${opacity})`;
              context.lineWidth = 0.85;
              context.stroke();
            }
          }

          if (pointer.active) {
            const pointerDistance = Math.hypot(
              particle.x - pointer.x,
              particle.y - pointer.y,
            );

            if (pointerDistance < 280) {
              context.beginPath();
              context.moveTo(particle.x, particle.y);
              context.lineTo(pointer.x, pointer.y);
              context.strokeStyle = `rgba(6, 182, 212, ${(1 - pointerDistance / 280) * 0.58})`;
              context.lineWidth = 1.05;
              context.stroke();
            }
          }

          context.beginPath();
          context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
          context.fillStyle =
            particle.tone === "green"
              ? "rgba(16, 185, 129, 0.78)"
              : "rgba(14, 165, 233, 0.74)";
          context.fill();
        }

        if (pointer.active) {
          const halo = context.createRadialGradient(
            pointer.x,
            pointer.y,
            2,
            pointer.x,
            pointer.y,
            76,
          );
          halo.addColorStop(0, "rgba(14, 165, 233, 0.18)");
          halo.addColorStop(0.54, "rgba(16, 185, 129, 0.08)");
          halo.addColorStop(1, "rgba(16, 185, 129, 0)");
          context.beginPath();
          context.arc(pointer.x, pointer.y, 76, 0, Math.PI * 2);
          context.fillStyle = halo;
          context.fill();

          context.beginPath();
          context.arc(pointer.x, pointer.y, 3.2, 0, Math.PI * 2);
          context.fillStyle = "rgba(6, 182, 212, 0.9)";
          context.fill();
        }
      };

      resize();
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.documentElement.addEventListener("mouseleave", onPointerLeave);

      if (reduceMotion) {
        draw();
      } else {
        gsap.ticker.add(draw);
      }

      return () => {
        gsap.ticker.remove(draw);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onPointerMove);
        document.documentElement.removeEventListener("mouseleave", onPointerLeave);
      };
    },
    { scope: canvasRef },
  );

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      data-particle-field
      className={`pointer-events-none fixed inset-0 h-screen w-screen ${className}`}
    />
  );
}
