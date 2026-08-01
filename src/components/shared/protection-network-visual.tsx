"use client";

import { type CSSProperties, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Building2,
  BusFront,
  HeartHandshake,
  Hospital,
  Home,
  QrCode,
  School,
  ShieldCheck,
  UserRound,
} from "lucide-react";

gsap.registerPlugin(useGSAP);

const nodes = [
  {
    id: "familia",
    label: "Familia",
    icon: Home,
    left: "7%",
    top: "25%",
    mobileLeft: "9%",
    mobileTop: "24%",
    tone: "blue",
  },
  {
    id: "escola",
    label: "Escola",
    icon: School,
    left: "40%",
    top: "8%",
    mobileLeft: "37%",
    mobileTop: "9%",
    tone: "green",
  },
  {
    id: "transporte",
    label: "Transporte",
    icon: BusFront,
    left: "73%",
    top: "27%",
    mobileLeft: "58%",
    mobileTop: "27%",
    tone: "blue",
  },
  {
    id: "ubs",
    label: "UBS",
    icon: Hospital,
    left: "78%",
    top: "62%",
    mobileLeft: "64%",
    mobileTop: "62%",
    tone: "green",
  },
  {
    id: "cras",
    label: "CRAS",
    icon: Building2,
    left: "43%",
    top: "78%",
    mobileLeft: "42%",
    mobileTop: "78%",
    tone: "blue",
  },
  {
    id: "comunidade",
    label: "Comunidade",
    icon: HeartHandshake,
    left: "6%",
    top: "64%",
    mobileLeft: "7%",
    mobileTop: "63%",
    tone: "green",
  },
] as const;

const edges = [
  ...nodes.map((node) => ({ from: "center", to: node.id, primary: true })),
  { from: "familia", to: "escola", primary: false },
  { from: "escola", to: "transporte", primary: false },
  { from: "transporte", to: "ubs", primary: false },
  { from: "ubs", to: "cras", primary: false },
  { from: "cras", to: "comunidade", primary: false },
  { from: "comunidade", to: "familia", primary: false },
  { from: "familia", to: "cras", primary: false },
  { from: "escola", to: "ubs", primary: false },
] as const;

export function ProtectionNetworkVisual() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = scope.current;

      if (!root) {
        return;
      }

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const nodeElements = Array.from(
        root.querySelectorAll<HTMLElement>("[data-network-node]"),
      );
      const center = root.querySelector<HTMLElement>("[data-network-anchor='center']");
      const edgeElements = Array.from(
        root.querySelectorAll<SVGLineElement>("[data-network-edge]"),
      );
      const pulses = Array.from(
        root.querySelectorAll<HTMLElement>("[data-network-pulse]"),
      );

      const updateEdges = () => {
        const rootRect = root.getBoundingClientRect();
        const anchors = new Map<string, { x: number; y: number }>();

        root.querySelectorAll<HTMLElement>("[data-network-anchor]").forEach((element) => {
          const rect = element.getBoundingClientRect();
          const id = element.dataset.networkAnchor;

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

      gsap.set([center, ...nodeElements], { autoAlpha: 1 });
      updateEdges();
      window.addEventListener("resize", updateEdges);

      if (reduceMotion) {
        return () => window.removeEventListener("resize", updateEdges);
      }

      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (center) {
        intro.from(center, { autoAlpha: 0, scale: 0.72, duration: 0.72 });
      }

      intro.from(
        nodeElements,
        {
          autoAlpha: 0,
          scale: 0.72,
          duration: 0.58,
          stagger: { each: 0.09, from: "center" },
        },
        "-=0.34",
      );

      intro.from(
        edgeElements,
        {
          autoAlpha: 0,
          duration: 0.65,
          stagger: 0.025,
        },
        "-=0.45",
      );

      const isCompact = window.matchMedia("(max-width: 640px)").matches;
      const travelX = isCompact ? 5 : 14;
      const travelY = isCompact ? 6 : 13;

      nodeElements.forEach((node, index) => {
        gsap.to(node, {
          x:
            index % 2 === 0
              ? travelX + index * (isCompact ? 0.25 : 0.85)
              : -(travelX + index * (isCompact ? 0.25 : 0.85)),
          y:
            index % 3 === 0
              ? -(travelY + index * (isCompact ? 0.18 : 0.65))
              : travelY + (index % 2) * (isCompact ? 1.2 : 3),
          rotation: index % 2 === 0 ? 1.4 : -1.2,
          duration: 1.85 + index * 0.18,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });

      if (center) {
        gsap.to(center, {
          y: -7,
          scale: 1.015,
          duration: 2.15,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }

      gsap.fromTo(
        edgeElements,
        { strokeDashoffset: 28 },
        {
          strokeDashoffset: 0,
          duration: 2.4,
          repeat: -1,
          ease: "none",
          stagger: 0.08,
        },
      );

      gsap.to(pulses, {
        scale: 1.7,
        autoAlpha: 0.18,
        duration: 1.45,
        repeat: -1,
        stagger: 0.22,
        ease: "power2.out",
      });

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
      data-network-visual
      className="relative min-h-[470px] overflow-hidden rounded-lg border border-sky-200/80 bg-white/88 shadow-[0_28px_70px_rgba(8,47,73,0.16)] backdrop-blur-sm sm:min-h-[540px]"
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(224,242,254,.88),rgba(255,255,255,.35)_46%,rgba(209,250,229,.78))]" />
      <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(14,165,233,.13)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,.11)_1px,transparent_1px)] [background-size:42px_42px]" />

      <svg
        className="pointer-events-none absolute inset-0 z-10 h-full w-full"
        aria-hidden="true"
      >
        {edges.map((edge, index) => (
          <line
            key={`${edge.from}-${edge.to}`}
            data-network-edge
            data-from={edge.from}
            data-to={edge.to}
            stroke={edge.primary ? (index % 2 === 0 ? "#0284c7" : "#059669") : "#38bdf8"}
            strokeWidth={edge.primary ? 1.35 : 0.9}
            strokeDasharray={edge.primary ? "6 8" : "3 10"}
            strokeLinecap="round"
            opacity={edge.primary ? 0.56 : 0.3}
          />
        ))}
      </svg>

      <div
        data-network-anchor="center"
        className="absolute left-1/2 top-[48%] z-30 flex size-[136px] -translate-x-1/2 -translate-y-1/2 will-change-transform items-center justify-center rounded-full border border-cyan-200 bg-[radial-gradient(circle_at_34%_24%,#ecfdf5_0%,#a7f3d0_26%,#0e7490_68%,#082f49_100%)] shadow-[0_20px_62px_rgba(8,145,178,0.34)] sm:size-[170px]"
      >
        <span
          data-network-pulse
          className="absolute inset-[-12px] -z-10 rounded-full border border-emerald-300/90"
        />
        <span
          data-network-pulse
          className="absolute inset-[-26px] -z-10 rounded-full border border-sky-300/80"
        />

        <div className="text-center">
          <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-slate-950/70 text-white shadow-lg shadow-sky-950/40">
            <UserRound className="h-6 w-6" />
            <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-slate-950">
              <QrCode className="h-3.5 w-3.5" />
            </span>
          </div>
          <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-50">
            Identidade protegida
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">Criança</h2>
        </div>
      </div>

      {nodes.map((node) => {
        const Icon = node.icon;
        const tone =
          node.tone === "green"
            ? "border-emerald-200 bg-white text-emerald-800 shadow-emerald-950/10"
            : "border-sky-200 bg-white text-sky-800 shadow-sky-950/10";

        return (
          <div
            key={node.id}
            data-network-node
            data-network-anchor={node.id}
            className={`absolute left-[var(--node-left)] top-[var(--node-top)] z-20 flex min-h-10 max-w-[42vw] items-center gap-2 truncate rounded-full border px-3 py-2 text-xs font-semibold shadow-lg will-change-transform sm:left-[var(--node-left-sm)] sm:top-[var(--node-top-sm)] sm:max-w-none sm:text-sm ${tone}`}
            style={
              {
                "--node-left": node.mobileLeft,
                "--node-top": node.mobileTop,
                "--node-left-sm": node.left,
                "--node-top-sm": node.top,
              } as CSSProperties
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{node.label}</span>
          </div>
        );
      })}

      <div className="absolute bottom-4 left-1/2 z-20 flex w-[min(82%,20rem)] -translate-x-1/2 items-center justify-center gap-2 rounded-full border border-emerald-200 bg-white/92 px-3 py-2 text-center text-xs font-semibold text-emerald-800 shadow-sm backdrop-blur sm:w-auto">
        <ShieldCheck className="h-4 w-4" />
        Rede ativa ao redor da criança
      </div>
    </div>
  );
}
