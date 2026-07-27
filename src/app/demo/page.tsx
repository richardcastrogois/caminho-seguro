import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BellRing,
  Bluetooth,
  CheckCircle2,
  QrCode,
  School,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { AppNavigation } from "@/components/shared/app-navigation";
import { GsapReveal } from "@/components/shared/gsap-reveal";

export const metadata: Metadata = {
  title: "Demo guiada",
  description: "Roteiro de demonstração do MVP Caminho Seguro.",
};

const demoSteps = [
  {
    number: "01",
    title: "Escola registra a chegada",
    description:
      "Mostre o leitor BLE simulado criando um evento real no banco para a criança fictícia.",
    href: "/escola",
    action: "Abrir escola",
    icon: School,
    accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  {
    number: "02",
    title: "Responsável acompanha",
    description:
      "Abra o histórico e destaque que o status vem de eventos pontuais, não de rastreamento.",
    href: "/responsavel",
    action: "Abrir responsável",
    icon: UserRoundCheck,
    accent: "border-sky-200 bg-sky-50 text-sky-800",
  },
  {
    number: "03",
    title: "Comunidade usa o QR",
    description:
      "Simule a leitura pública sem expor nome, telefone, endereço ou dados sensíveis.",
    href: "/ajuda/demo",
    action: "Abrir QR",
    icon: QrCode,
    accent: "border-violet-200 bg-violet-50 text-violet-800",
  },
  {
    number: "04",
    title: "Alerta é resolvido",
    description:
      "Volte ao responsável, confirme recebimento, resolva e abra detalhes do evento.",
    href: "/responsavel",
    action: "Tratar alerta",
    icon: BellRing,
    accent: "border-amber-200 bg-amber-50 text-amber-800",
  },
];

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <GsapReveal>
        <div data-gsap="nav">
          <AppNavigation badge="Roteiro de pitch" />
        </div>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-12">
            <div className="flex flex-col justify-center">
              <div data-gsap="hero" className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4" />
                Demo sem telas perdidas
              </div>

              <h1 data-gsap="hero" className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-5xl">
                Conte a história em ordem, sem depender de explicação longa.
              </h1>

              <p data-gsap="hero" className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Use os passos abaixo como roteiro: primeiro um evento confiável, depois o responsável, em seguida o QR público e por fim o tratamento do alerta.
              </p>

              <div data-gsap="card" className="mt-7 grid gap-3 sm:grid-cols-3">
                <Summary value="4" label="passos claros" />
                <Summary value="3" label="superfícies atuais" />
                <Summary value="0" label="dados pessoais no QR" />
              </div>
            </div>

            <div className="grid gap-4">
              {demoSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <Link
                    key={step.number}
                    data-gsap="card"
                    href={step.href}
                    className="group grid gap-4 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-900/10 sm:grid-cols-[auto_1fr_auto] sm:items-center"
                  >
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${step.accent}`}>
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-500">
                          {step.number}
                        </span>
                        <h2 className="text-lg font-semibold text-slate-950">{step.title}</h2>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
                    </div>

                    <div className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 sm:justify-self-end">
                      {step.action}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
          <div data-gsap="timeline" className="grid gap-5 rounded-[24px] border border-slate-200 bg-slate-950 p-5 text-white sm:grid-cols-[auto_1fr] sm:p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
              <Bluetooth className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-xl font-semibold">Frase de sustentação durante a demo</h2>
              <p className="mt-2 leading-7 text-slate-300">
                A criança não precisa de celular. O sistema registra eventos de proteção, não trajetos. O QR não revela identidade e a localização só vem do aparelho de quem decide ajudar.
              </p>
            </div>
          </div>
        </section>
      </GsapReveal>
    </main>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
        <p className="text-2xl font-semibold text-slate-950">{value}</p>
      </div>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
