"use client";

import Link from "next/link";
import { buttonVariants } from "@heroui/styles";
import {
  ArrowRight,
  BellRing,
  Bluetooth,
  Fingerprint,
  HeartHandshake,
  Network,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { GsapReveal } from "@/components/shared/gsap-reveal";
import { InteractiveParticleField } from "@/components/shared/interactive-particle-field";
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
    icon: "border-cyan-200 bg-cyan-50 text-cyan-700",
    badge: "bg-cyan-50 text-cyan-700",
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
    description: "Responsáveis e instituições recebem contexto suficiente para agir.",
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
    <main className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(135deg,#f7fcff_0%,#ffffff_45%,#f3fff9_100%)]">
      <InteractiveParticleField className="z-0 opacity-90" />

      <GsapReveal className="relative z-10">
        <section className="relative border-b border-sky-100/80">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[linear-gradient(115deg,rgba(14,165,233,.14),rgba(6,182,212,.08)_45%,rgba(16,185,129,.14))]" />

          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-14 pt-5 sm:px-6 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:px-10 lg:pb-20 lg:pt-10">
            <div className="flex flex-col justify-center">
              <div
                data-gsap="hero"
                className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm"
              >
                <ShieldCheck data-gsap-icon className="h-4 w-4" />
                Proteção infantil por eventos, sem rastrear rotina
              </div>

              <h1
                data-gsap="hero"
                className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-normal text-slate-950 sm:text-5xl lg:text-6xl"
              >
                Caminho Seguro conecta quem pode proteger uma criança.
              </h1>

              <p
                data-gsap="hero"
                className="mt-6 max-w-2xl text-lg leading-8 text-slate-600"
              >
                Uma rede comunitária que registra eventos de proteção entre família,
                escola, transporte, serviços públicos e comunidade. A criança participa
                com uma identidade física protegida, sem precisar de celular e sem
                vigilância contínua.
              </p>

              <div data-gsap="hero" className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/demo"
                  className={buttonVariants({
                    variant: "primary",
                    className:
                      "min-h-12 bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 px-5 font-semibold text-white shadow-lg shadow-emerald-900/15 hover:brightness-105",
                  })}
                >
                  Ver o produto funcionando
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/ajuda/demo"
                  className={buttonVariants({
                    variant: "secondary",
                    className:
                      "min-h-12 border border-slate-300 bg-white px-5 font-semibold text-slate-900 hover:border-sky-300 hover:bg-sky-50",
                  })}
                >
                  Simular pedido de ajuda
                </Link>
              </div>

              <div data-gsap="metrics" className="mt-9 grid gap-3 sm:grid-cols-3">
                <MetricCard value="0" label="dados pessoais expostos no QR" />
                <MetricCard value="6" label="atores conectados à proteção" />
                <MetricCard value="24h" label="rede pronta para receber eventos" />
              </div>
            </div>

            <div data-gsap="visual">
              <div data-gsap-parallax>
                <ProtectionNetworkVisual />
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-b border-sky-100 py-16">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-10">
            <div
              data-gsap-scroll="left"
              className="rounded-lg bg-gradient-to-br from-sky-600 via-cyan-600 to-emerald-600 p-7 text-white shadow-[0_26px_60px_rgba(3,105,161,0.24)] sm:p-9"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-50">
                Pergunta central
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-normal sm:text-4xl">
                Como proteger uma criança sem expor sua identidade ou mapear sua rotina?
              </h2>
              <p className="mt-6 text-base leading-7 text-cyan-50">
                O Caminho Seguro transforma leituras autorizadas em eventos claros para a
                rede agir, mantendo os dados pessoais fora do acesso público.
              </p>
            </div>

            <div className="grid gap-0 sm:grid-cols-3">
              <SignalItem
                icon={Fingerprint}
                title="Identidade protegida"
                text="O token público não revela nome, endereço, responsável ou escola."
              />
              <SignalItem
                icon={Network}
                title="Rede acionável"
                text="Cada evento chega à pessoa ou instituição certa para responder."
              />
              <SignalItem
                icon={HeartHandshake}
                title="Ajuda com limite"
                text="O cidadão ajuda sem receber acesso aos dados sensíveis da criança."
              />
            </div>
          </div>
        </section>

        <section id="modulos" className="relative border-b border-sky-100 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div data-gsap-scroll="up" className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Rede de proteção conectada
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                Cada pessoa vê o que precisa para agir, sem abrir os dados da criança.
              </h2>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                Família, escola e acesso público trabalham sobre o mesmo evento, com
                papéis e limites diferentes. Os módulos abaixo mostram o produto a partir
                de cada ponto da rede.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {dashboardModules.map((module, index) => {
                const Icon = module.icon;
                const accent = accentClasses[module.accent];

                return (
                  <Link
                    key={module.title}
                    data-gsap-scroll={index % 2 === 0 ? "left" : "right"}
                    href={module.status === "ready" ? module.href : "#modulos"}
                    aria-disabled={module.status === "soon"}
                    className={`home-surface group min-h-[220px] rounded-lg border border-slate-200/90 bg-white p-5 shadow-sm transition duration-200 ${
                      module.status === "ready"
                        ? "hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/10"
                        : "cursor-default opacity-70"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div
                        data-gsap-icon
                        className={`flex h-12 w-12 items-center justify-center rounded-lg border ${accent.icon}`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${accent.badge}`}
                      >
                        {module.badge}
                      </span>
                    </div>

                    <h3 className="mt-5 text-xl font-semibold text-slate-950">
                      {module.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {module.description}
                    </p>

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

        <section className="relative bg-slate-950 py-16 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div data-gsap-scroll="up" className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
                Proteção por eventos
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                Não é rastreador. É infraestrutura para reconhecer sinais importantes e
                coordenar resposta.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {protectionSteps.map((step, index) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.title}
                    data-gsap-scroll="up"
                    className="rounded-lg border border-white/10 bg-white/5 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        data-gsap-icon
                        className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-slate-950"
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-slate-500">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-300">
                      {step.description}
                    </p>
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
    <div className="home-surface rounded-lg border border-slate-200/90 bg-white/92 p-4 shadow-sm backdrop-blur">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm leading-5 text-slate-500">{label}</p>
    </div>
  );
}

function SignalItem({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
}) {
  return (
    <div data-gsap-scroll="up" className="home-surface rounded-lg border p-5 sm:p-6">
      <div
        data-gsap-icon
        className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-700"
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
