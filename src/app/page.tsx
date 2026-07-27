"use client";

import Link from "next/link";
import { buttonVariants } from "@heroui/styles";
import {
  ArrowRight,
  BellRing,
  Bluetooth,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { AppNavigation } from "@/components/shared/app-navigation";
import { GsapReveal } from "@/components/shared/gsap-reveal";
import { ProtectionNetworkVisual } from "@/components/shared/protection-network-visual";
import { dashboardModules } from "@/features/dashboard/dashboard-modules";

const accentClasses = {
  blue: {
    icon: "border-sky-200 bg-sky-50 text-sky-700",
    badge: "bg-sky-50 text-sky-700",
  },
  green: {
    icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700",
  },
  orange: {
    icon: "border-amber-200 bg-amber-50 text-amber-700",
    badge: "bg-amber-50 text-amber-700",
  },
  purple: {
    icon: "border-violet-200 bg-violet-50 text-violet-700",
    badge: "bg-violet-50 text-violet-700",
  },
};

const protectionSteps = [
  {
    title: "Identidade física",
    description:
      "A criança usa QR e camada Bluetooth sem depender de celular, internet ou aplicativo.",
    icon: QrCode,
  },
  {
    title: "Evento, não rota",
    description: "A rede registra passagens importantes, não cada passo da rotina.",
    icon: Bluetooth,
  },
  {
    title: "Alerta acionável",
    description:
      "Responsáveis e instituições recebem contexto suficiente para agir.",
    icon: BellRing,
  },
  {
    title: "Privacidade primeiro",
    description: "Dados pessoais ficam fora do QR público e fora de provas abertas.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <GsapReveal>
        <div data-gsap="nav">
          <AppNavigation />
        </div>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-10 lg:py-14">
            <div className="flex flex-col justify-center">
              <div data-gsap="hero" className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                Proteção infantil sem vigilância permanente
              </div>

              <h1 data-gsap="hero" className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.02] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Uma rede comunitária para transformar risco em resposta.
              </h1>

              <p data-gsap="hero" className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Caminho Seguro conecta famílias, escolas, transporte, serviços públicos e comunidade para registrar eventos de proteção. A criança não precisa carregar celular e o sistema não desenha sua rotina.
              </p>

              <div data-gsap="hero" className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/demo"
                  className={buttonVariants({
                    variant: "primary",
                    className: "min-h-12 bg-slate-950 px-5 font-semibold text-white hover:bg-slate-800",
                  })}
                >
                  Iniciar demo guiada
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/ajuda/demo"
                  className={buttonVariants({
                    variant: "secondary",
                    className: "min-h-12 border border-slate-300 bg-white px-5 font-semibold text-slate-900",
                  })}
                >
                  Testar QR público
                </Link>
              </div>

              <div data-gsap="hero" className="mt-8 grid gap-3 sm:grid-cols-3">
                <MetricCard value="0" label="dados pessoais no QR" />
                <MetricCard value="3" label="perfis já navegáveis" />
                <MetricCard value="24h" label="rede pronta para eventos" />
              </div>
            </div>

            <div data-gsap="card">
              <ProtectionNetworkVisual />
            </div>
          </div>
        </section>

        <section id="modulos" className="border-b border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div data-gsap="hero" className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Experiência guiada
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Cada perfil sabe onde clicar e por que aquela tela existe.
              </h2>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                Os módulos prontos ficam acessíveis. O que ainda é Etapa 2 aparece como roadmap, sem levar a telas quebradas.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboardModules.map((module) => {
                const Icon = module.icon;
                const accent = accentClasses[module.accent];

                return (
                  <Link
                    key={module.title}
                    data-gsap="card"
                    href={module.status === "ready" ? module.href : "#modulos"}
                    aria-disabled={module.status === "soon"}
                    className={`group min-h-[220px] rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 ${
                      module.status === "ready"
                        ? "hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/10"
                        : "cursor-default opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${accent.icon}`}>
                        <Icon className="h-6 w-6" />
                      </div>

                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${accent.badge}`}>
                        {module.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold text-slate-950">{module.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>

                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      {module.status === "ready" ? "Acessar módulo" : "Em breve"}
                      {module.status === "ready" && (
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-14 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div data-gsap="hero" className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Como explicar para a banca
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                Não é rastreador. É infraestrutura de eventos de proteção.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {protectionSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div key={step.title} data-gsap="timeline" className="rounded-[22px] border border-white/10 bg-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-500">0{index + 1}</span>
                    </div>
                    <h3 className="mt-5 font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </GsapReveal>
    </main>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
