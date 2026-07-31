"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  BellRing,
  Home,
  Pause,
  Play,
  School,
  ShieldCheck,
  Users,
} from "lucide-react";

gsap.registerPlugin(useGSAP);

const scenarioSteps = [
  {
    id: "saiu-de-casa",
    label: "Saiu de casa",
    icon: Home,
    tone: "blue",
    detail: "O QR é lido na saída e o evento é registrado.",
  },
  {
    id: "nao-chegou-na-escola",
    label: "Não chegou na escola",
    icon: School,
    tone: "blue",
    detail: "O horário passa sem registro de chegada.",
  },
  {
    id: "alerta-dispara",
    label: "Alerta dispara",
    icon: BellRing,
    tone: "amber",
    detail: "O responsável recebe o alerta na hora.",
  },
  {
    id: "pais-agem",
    label: "Pais agem",
    icon: Users,
    tone: "green",
    detail: "Família e rede pública são acionadas.",
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

const activeToneStyles: Record<string, string> = {
  blue: "ring-sky-400",
  amber: "ring-amber-400",
  green: "ring-emerald-400",
};

const iconToneStyles: Record<string, string> = {
  blue: "bg-sky-50 text-sky-700",
  amber: "bg-amber-50 text-amber-600",
  green: "bg-emerald-50 text-emerald-700",
};

export function HowItWorksScenario() {
  const scope = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const isFirstRun = useRef(true);

  const activeStep = scenarioSteps[activeIndex];

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const id = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % scenarioSteps.length);
    }, 2600);

    return () => window.clearInterval(id);
  }, [isPlaying]);

  useEffect(() => {
    const root = scope.current;

    if (!root || isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const node = root.querySelector<HTMLElement>(
      `[data-scenario-node="${activeStep.id}"]`,
    );

    if (node) {
      gsap.fromTo(
        node,
        { scale: 0.9 },
        { scale: 1, duration: 0.5, ease: "back.out(2)", overwrite: "auto" },
      );
    }
  }, [activeIndex, activeStep.id]);

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
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0e7490" />
          </marker>
        </defs>
        {edges.map((edge) => {
          const isActive =
            edge.to === activeStep.id || edge.from === activeStep.id;

          return (
            <line
              key={`${edge.from}-${edge.to}`}
              data-scenario-edge
              data-from={edge.from}
              data-to={edge.to}
              stroke={isActive ? "#0e7490" : "#94a3b8"}
              strokeWidth={isActive ? 2.4 : 1.4}
              strokeDasharray="6 8"
              strokeLinecap="round"
              markerEnd="url(#scenario-arrow)"
              opacity={isActive ? 0.95 : 0.45}
            />
          );
        })}
      </svg>

      <div className="relative z-20 flex flex-col items-stretch gap-4 px-6 py-16 sm:px-12 sm:py-20 md:flex-row md:items-center md:justify-between md:gap-4">
        {scenarioSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeIndex === index;

          return (
            <button
              key={step.id}
              type="button"
              data-scenario-node
              data-scenario-anchor={step.id}
              aria-pressed={isActive}
              onClick={() => {
                setActiveIndex(index);
                setIsPlaying(false);
              }}
              className={`flex min-h-14 items-center gap-3 rounded-2xl border px-5 py-4 text-base font-semibold shadow-lg outline-offset-2 will-change-transform transition-[box-shadow,border-color,outline-color] duration-300 focus-visible:outline-2 focus-visible:outline-emerald-500 hover:shadow-xl ${toneStyles[step.tone]} ${isActive ? `ring-[3px] ring-offset-2 ring-offset-white/90 ${activeToneStyles[step.tone]}` : ""}`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${iconToneStyles[step.tone]}`}
              >
                0{index + 1}
              </span>
              <Icon className="h-5 w-5 shrink-0" />
              {step.label}
            </button>
          );
        })}
      </div>

      <div className="relative z-20 flex items-center gap-4 border-t border-sky-100/90 bg-white/80 px-5 py-4 backdrop-blur sm:px-8">
        <button
          type="button"
          onClick={() => setIsPlaying((playing) => !playing)}
          aria-label={isPlaying ? "Pausar demonstração" : "Reproduzir demonstração"}
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md outline-offset-2 transition-colors duration-300 hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 translate-x-px" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            Passo 0{activeIndex + 1} de 0{scenarioSteps.length}
          </p>
          <p className="mt-1 text-sm font-semibold leading-snug text-slate-950 sm:text-base">
            {activeStep.detail}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5" role="group" aria-label="Passos do cenário">
          {scenarioSteps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              aria-label={`Passo ${index + 1}: ${step.label}`}
              aria-pressed={activeIndex === index}
              onClick={() => {
                setActiveIndex(index);
                setIsPlaying(false);
              }}
              className={`size-2.5 rounded-full outline-offset-2 transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-emerald-500 ${activeIndex === index ? "bg-emerald-600" : "bg-slate-300 hover:bg-slate-400"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
