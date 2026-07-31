"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { BellRing, Home, School, ShieldCheck, Users } from "lucide-react";

gsap.registerPlugin(useGSAP);

const scenarioSteps = [
  {
    id: "saiu-de-casa",
    label: "Saiu de casa",
    icon: Home,
    tone: "blue",
  },
  {
    id: "nao-chegou-na-escola",
    label: "Não chegou na escola",
    icon: School,
    tone: "blue",
  },
  {
    id: "alerta-dispara",
    label: "Alerta dispara",
    icon: BellRing,
    tone: "amber",
  },
  {
    id: "pais-agem",
    label: "Pais agem",
    icon: Users,
    tone: "green",
  },
] as const;

const edges = [
  { from: "saiu-de-casa", to: "nao-chegou-na-escola" },
  { from: "nao-chegou-na-escola", to: "alerta-dispara" },
  { from: "alerta-dispara", to: "pais-agem" },
] as const;

const toneStyles: Record<string, string> = {
  blue: "border-sky-200 bg-white text-sky-800 shadow-sky-950/10",
  amber: "border-amber-300 bg-white text-amber-700 shadow-amber-950/10",
  green: "border-emerald-200 bg-white text-emerald-800 shadow-emerald-950/10",
};

const iconToneStyles: Record<string, string> = {
  blue: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-700",
};

export function HowItWorksScenario() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;

      if (!root) {
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nodeElements = Array.from(
        root.querySelectorAll<HTMLElement>("[data-scenario-node]"),
      );
      const edgeElements = Array.from(
        root.querySelectorAll<SVGLineElement>("[data-scenario-edge]"),
      );

      const updateEdges = () => {
        const rootRect = root.getBoundingClientRect();
        const anchors = new Map<string, { x: number; y: number }>();

        root.querySelectorAll<HTMLElement>("[data-scenario-anchor]").forEach((element) => {
          const rect = element.getBoundingClientRect();
          const id = element.dataset.scenarioAnchor;

          if (id) {
            anchors.set(id, {
              x: rect.left - rootRect.left + rect.width / 2,
              y: rect.top - rootRect.top + rect.height / 2,
            });
          }
        });

        edgeElements.forEach((line) => {
          const from = anchors.get(line.dataset.from ?? "");
          const to = anchors.get(line.dataset.to ?? "");

          if (!from || !to) {
            return;
          }

          line.setAttribute("x1", from.x.toFixed(2));
          line.setAttribute("y1", from.y.toFixed(2));
          line.setAttribute("x2", to.x.toFixed(2));
          line.setAttribute("y2", to.y.toFixed(2));
        });
      };

      gsap.set(nodeElements, { autoAlpha: 1 });
      updateEdges();
      window.addEventListener("resize", updateEdges);

      if (reduceMotion) {
        return () => window.removeEventListener("resize", updateEdges);
      }

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      intro.from(
        nodeElements,
        {
          autoAlpha: 0,
          scale: 0.82,
          duration: 0.55,
          stagger: 0.12,
        },
      );

      intro.from(
        edgeElements,
        {
          autoAlpha: 0,
          duration: 0.6,
          stagger: 0.1,
        },
        "-=0.4",
      );

      nodeElements.forEach((node, index) => {
        gsap.to(node, {
          y: index % 2 === 0 ? -6 : 6,
          duration: 2 + index * 0.15,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      gsap.fromTo(
        edgeElements,
        { strokeDashoffset: 28 },
        {
          strokeDashoffset: 0,
          duration: 2.2,
          repeat: -1,
          ease: "none",
          stagger: 0.12,
        },
      );

      gsap.ticker.add(updateEdges);

      return () => {
        gsap.ticker.remove(updateEdges);
        window.removeEventListener("resize", updateEdges);
      };
    },
    { scope },
  );

  return (
    <div
      ref={scope}
      data-scenario-visual
      className="relative overflow-hidden rounded-3xl border border-sky-200/80 bg-white/88 shadow-[0_28px_70px_rgba(8,47,73,0.16)] backdrop-blur-sm"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(224,242,254,.9),rgba(255,255,255,.4)_46%,rgba(209,250,229,.8))]" />
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(14,165,233,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.11)_1px,transparent_1px)] [background-size:42px_42px]" />

      <svg
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        aria-hidden="true"
      >
        <defs>
          <marker
            id="scenario-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
        </defs>
        {edges.map((edge) => (
          <line
            key={`${edge.from}-${edge.to}`}
            data-scenario-edge
            data-from={edge.from}
            data-to={edge.to}
            stroke="#64748b"
            strokeWidth={1.4}
            strokeDasharray="6 8"
            strokeLinecap="round"
            markerEnd="url(#scenario-arrow)"
            opacity={0.5}
          />
        ))}
      </svg>

      <div className="relative z-20 flex flex-col items-stretch gap-4 px-6 py-12 sm:px-10 md:flex-row md:items-center md:justify-between md:gap-2 md:px-14">
        {scenarioSteps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              data-scenario-node
              data-scenario-anchor={step.id}
              className={`flex min-h-12 items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-lg will-change-transform ${toneStyles[step.tone]}`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${iconToneStyles[step.tone]}`}
              >
                0{index + 1}
              </span>
              <Icon className="h-4 w-4 shrink-0" />
              {step.label}
            </div>
          );
        })}
      </div>

      <div className="relative z-20 flex flex-wrap items-center justify-center gap-2 border-t border-sky-100/90 bg-white/70 px-4 py-3 text-xs font-semibold text-emerald-800 backdrop-blur">
        <ShieldCheck className="h-4 w-4" />
        O Caminho Seguro nao rastreia: acompanha os eventos importantes
      </div>
    </div>
  );
}
