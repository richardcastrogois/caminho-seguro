"use client";

import Link from "next/link";
import { buttonVariants } from "@heroui/styles";
import {
  ArrowRight,
  BellRing,
  Bluetooth,
  CheckCircle2,
  MapPinned,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { dashboardModules } from "@/features/dashboard/dashboard-modules";

const accentClasses = {
  blue: {
    icon: "bg-sky-50 text-sky-700",
    badge: "bg-sky-50 text-sky-700",
  },
  green: {
    icon: "bg-emerald-50 text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700",
  },
  orange: {
    icon: "bg-orange-50 text-orange-700",
    badge: "bg-orange-50 text-orange-700",
  },
  purple: {
    icon: "bg-violet-50 text-violet-700",
    badge: "bg-violet-50 text-violet-700",
  },
};

const protectionSteps = [
  {
    title: "Identificação inclusiva",
    description:
      "A criança utiliza QR Code e identificação Bluetooth sem precisar possuir celular.",
    icon: QrCode,
  },
  {
    title: "Eventos automáticos",
    description: "Escola e transporte registram chegadas e embarques sem criar filas.",
    icon: Bluetooth,
  },
  {
    title: "Alertas imediatos",
    description:
      "Responsáveis e instituições recebem atualizações e alertas de proteção.",
    icon: BellRing,
  },
  {
    title: "Integridade verificável",
    description: "Provas dos eventos são registradas na Solana sem expor dados pessoais.",
    icon: ShieldCheck,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <BrandLogo />

          <div className="hidden items-center gap-3 sm:flex">
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              MVP em desenvolvimento
            </span>

            <Link
              href="/login"
              className={buttonVariants({
                variant: "secondary",
                className: "font-semibold",
              })}
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />

          <div className="absolute -right-25 top-0 h-80 w-80 rounded-full bg-emerald-200/35 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-6 flex w-fit items-center gap-2 rounded-full border border-sky-200 bg-white/75 px-4 py-2 text-sm font-semibold text-sky-700 shadow-sm">
              <ShieldCheck className="h-4 w-4" />
              Tecnologia para proteger trajetos reais
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
              Uma rede que acompanha{" "}
              <span className="text-(--brand-600)">eventos de proteção</span>, não cada
              passo da criança.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              O Caminho Seguro conecta famílias, escolas, transportes, órgãos públicos e a
              comunidade para proteger crianças em trajetos longos ou vulneráveis, sem
              exigir smartphone, internet ou carteira blockchain.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ajuda/demo"
                className={buttonVariants({
                  variant: "primary",
                  className: "font-semibold",
                })}
              >
                Simular pedido de ajuda
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="#modulos"
                className={buttonVariants({
                  variant: "secondary",
                  className: "font-semibold",
                })}
              >
                Explorar módulos
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-2xl font-semibold text-slate-950">0</p>

                <p className="mt-1 text-sm text-slate-500">
                  dados pessoais na blockchain
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-2xl font-semibold text-slate-950">1</p>

                <p className="mt-1 text-sm text-slate-500">
                  identificação para toda a rede
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white/80 p-4">
                <p className="text-2xl font-semibold text-slate-950">24h</p>

                <p className="mt-1 text-sm text-slate-500">
                  potencial de proteção contínua
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="w-full max-w-xl rounded-[32px] border border-white/80 bg-white/80 p-5 shadow-2xl shadow-slate-900/10 backdrop-blur sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Status da criança</p>

                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                    Maria está segura
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <MapPinned className="h-5 w-5 text-sky-300" />
                  </div>

                  <div>
                    <p className="text-sm text-slate-400">Último evento</p>

                    <p className="font-medium">Chegada à escola confirmada</p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-4">
                  <div className="flex flex-col items-center">
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="my-1 h-10 w-px bg-white/20" />
                  </div>

                  <div>
                    <p className="font-medium">07:28 — Escola Municipal</p>

                    <p className="mt-1 text-sm text-slate-400">
                      Evento detectado automaticamente pelo leitor Bluetooth.
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="h-3 w-3 rounded-full bg-sky-400" />
                    <span className="my-1 h-10 w-px bg-white/20" />
                  </div>

                  <div>
                    <p className="font-medium">07:02 — Embarque confirmado</p>

                    <p className="mt-1 text-sm text-slate-400">
                      Transporte escolar identificado pela rede.
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="h-3 w-3 rounded-full bg-slate-500" />
                  </div>

                  <div>
                    <p className="font-medium">06:55 — Identificador ativo</p>

                    <p className="mt-1 text-sm text-slate-400">
                      Pulseira vinculada e pronta para o trajeto.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-sky-100 bg-sky-50 p-4">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />

                  <div>
                    <p className="font-semibold text-sky-950">
                      Privacidade desde a origem
                    </p>

                    <p className="mt-1 text-sm leading-6 text-sky-800">
                      O painel exibe eventos autorizados. Coordenadas e dados pessoais não
                      são publicados na blockchain.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="modulos" className="border-y border-slate-200 bg-white/70 py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--brand-600)">
              Ecossistema conectado
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Uma experiência específica para cada participante da rede
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Cada perfil acessa apenas as informações e ações necessárias para sua
              função.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {dashboardModules.map((module) => {
              const Icon = module.icon;
              const accent = accentClasses[module.accent];

              return (
                <Link
                  key={module.title}
                  href={module.href}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-sky-200 hover:shadow-xl hover:shadow-slate-900/5"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.icon}`}
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

                  <p className="mt-2 min-h-20 text-sm leading-6 text-slate-600">
                    {module.description}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-(--brand-600)">
                    Acessar módulo
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-(--safe-600)">
              Como funciona
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Tecnologia invisível para uma proteção simples
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {protectionSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-3xl border border-slate-200 bg-white/80 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-sm font-semibold text-slate-400">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 font-semibold text-slate-950">{step.title}</h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-slate-950 px-6 py-10 text-white sm:px-10 lg:flex lg:items-center lg:justify-between lg:px-12">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-300">
              Princípio central
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight">
              Nenhuma criança precisa possuir smartphone para ser protegida.
            </h2>

            <p className="mt-4 leading-7 text-slate-300">
              A tecnologia pertence à rede: escolas, transportes, instituições,
              responsáveis e cidadãos parceiros.
            </p>
          </div>

          <Link
            href="/ajuda/demo"
            className={buttonVariants({
              variant: "primary",
              className: "mt-8 font-semibold lg:mt-0",
            })}
          >
            Ver fluxo de proteção
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <BrandLogo />

          <p className="text-sm text-slate-500">
            Protótipo para o UNICEF x Superteam Brasil.
          </p>
        </div>
      </footer>
    </main>
  );
}
