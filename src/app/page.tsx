"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BellRing,
  BrainCircuit,
  Bluetooth,
  CheckCircle2,
  EyeOff,
  Fingerprint,
  MapPinned,
  Network,
  PlugZap,
  QrCode,
  Radio,
  School,
  ShieldCheck,
  Users,
} from "lucide-react";
import { GsapReveal } from "@/components/shared/gsap-reveal";
import { HowItWorksScenario } from "@/components/shared/how-it-works-scenario";
import { InteractiveParticleField } from "@/components/shared/interactive-particle-field";
import { ProtectionNetworkVisual } from "@/components/shared/protection-network-visual";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const productPillars = [
  {
    title: "Nao rastreia a crianca",
    text: "O sistema registra eventos importantes: chegada, saida, embarque, pedido de ajuda e confirmacao institucional.",
    icon: EyeOff,
  },
  {
    title: "A crianca nao precisa de celular",
    text: "A identidade fica em pulseira, cracha, etiqueta, QR, NFC ou BLE. Quem le e a rede ao redor.",
    icon: Fingerprint,
  },
  {
    title: "Dados sensiveis ficam protegidos",
    text: "O QR publico nao mostra nome, telefone, escola, endereco, responsavel ou dados medicos.",
    icon: ShieldCheck,
  },
];

const testSteps = [
  {
    title: "Abra a Familia em uma aba",
    text: "Use esta tela para acompanhar os eventos chegando no painel do responsavel.",
    href: "/responsavel",
    action: "Abrir Familia",
    icon: Users,
  },
  {
    title: "Em outra aba, simule uma acao",
    text: "Use Escola para chegada BLE, Transporte para embarque ou QR para pedido publico de ajuda.",
    href: "/escola",
    action: "Testar Escola",
    icon: School,
  },
  {
    title: "Compare os limites de cada perfil",
    text: "Troque o perfil privado e veja que cada ator recebe apenas o necessario para agir.",
    href: "/login?next=/rede",
    action: "Trocar perfil",
    icon: Network,
  },
];

const protectionSteps = [
  {
    title: "Identificacao simples",
    description:
      "A crianca tem um cartao ou pulseira com um codigo unico. Basta alguem ler para pedir ajuda — sem precisar de celular, internet ou aplicativo.",
    icon: QrCode,
  },
  {
    title: "So os momentos que importam",
    description:
      "O sistema registra apenas os pontos-chave: saiu de casa, chegou na escola, entrou no transporte. Nada de localizacao o tempo todo.",
    icon: Bluetooth,
  },
  {
    title: "Alerta na hora certa",
    description:
      "Se algo sai do esperado, os responsaveis recebem um aviso claro com o que fazer e quem contatar.",
    icon: BellRing,
  },
  {
    title: "Dados protegidos",
    description:
      "As informacoes pessoais da crianca ficam guardadas em seguranca. O codigo publico nao mostra nome, endereco nem dados sensiveis.",
    icon: ShieldCheck,
  },
];

const futureEvolutions = [
  {
    title: "IA para prevencao de riscos",
    horizon: "Pesquisa aplicada",
    icon: BrainCircuit,
    description:
      "Usar eventos historicos anonimizados para detectar atrasos recorrentes, mudancas de rotina, horarios criticos e regioes com aumento de ocorrencias.",
    approach:
      "Comecariamos por indicadores explicaveis e alertas de anomalia, sempre como apoio a responsaveis e gestores. A IA nao decidiria sozinha e nao dependeria de rastreamento continuo.",
  },
  {
    title: "Mapa inteligente da rede",
    horizon: "Curto prazo",
    icon: MapPinned,
    description:
      "Evoluir o mapa para mostrar cobertura por bairro, pontos de apoio, concentracao de eventos e lacunas de atendimento.",
    approach:
      "A primeira versao pode combinar filtros por periodo, heatmap e leitura de cobertura. Depois, a rede pode sugerir onde cadastrar novos parceiros ou reforcar rotas de resposta.",
  },
  {
    title: "Pontos seguros certificados",
    horizon: "Curto prazo",
    icon: BadgeCheck,
    description:
      "Criar uma rede oficial de escolas, comercios, UBS, CRAS e parceiros treinados para receber criancas em situacao de risco.",
    approach:
      "Cada ponto teria cadastro, protocolo simples, responsavel validado e selo Caminho Seguro. A plataforma registraria o atendimento sem expor dados sensiveis no QR publico.",
  },
  {
    title: "API publica para integracoes",
    horizon: "Curto prazo",
    icon: PlugZap,
    description:
      "Permitir que sistemas de escolas, transporte, assistencia social e prefeituras registrem eventos sem substituir suas ferramentas atuais.",
    approach:
      "O caminho seria publicar uma API autenticada com OpenAPI, escopos por parceiro, webhooks de notificacao e logs auditaveis para integracoes graduais.",
  },
  {
    title: "Integracao com wearables",
    horizon: "Longo prazo",
    icon: Radio,
    description:
      "Ampliar a identificacao fisica para pulseiras, crachas, relogios infantis, mochilas inteligentes, BLE, NFC ou outros dispositivos.",
    approach:
      "A evolucao manteria a mesma identidade protegida. O dispositivo so ajudaria a criar eventos confiaveis, considerando custo, bateria, manutencao e contexto de cada instituicao.",
  },
];

export default function Home() {
  const [futureOpen, setFutureOpen] = useState<string[]>([]);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[linear-gradient(135deg,#CFDAE0_0%,#ffffff_45%,#DDECE5_100%)]">
      <InteractiveParticleField className="z-0 opacity-90" />

      <GsapReveal className="relative z-10">
        <section className="relative border-b border-sky-100/80">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-180 bg-[linear-gradient(115deg,rgba(14,165,233,.14),rgba(23, 176, 203, 0.11)_45%,rgba(16,185,129,.14))]" />

          <div className="relative mx-auto grid max-w-7xl gap-6 px-4 pb-10 pt-[calc(var(--app-nav-offset)+0.50rem)] sm:gap-9 sm:px-6 sm:pb-14 lg:grid-cols-[0.94fr_1.06fr] lg:items-center lg:px-10 lg:pb-20">
            <div className="flex flex-col justify-center">
              <div
                data-gsap="hero"
                className="flex w-fit items-center gap-2 rounded-full border border-emerald-200 bg-white/95 px-4 py-2 b-2 text-sm font-semibold text-emerald-700 shadow-sm"
              >
                <ShieldCheck />
                Protecao infantil por eventos, sem vigilancia permanente
              </div>

              <h1
                data-gsap="hero"
                className="mt-6 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-normal text-slate-950 sm:text-5xl lg:text-6xl"
              >
                Caminho Seguro: uma rede que protege sem vigiar.
              </h1>

              <p
                data-gsap="hero"
                className="mt-6 max-w-2xl text-lg leading-8 text-slate-600"
              >
                Um MVP para conectar familia, escola, transporte, servicos publicos e
                comunidade em torno de eventos de protecao infantil. A proposta e simples:
                acompanhar sinais importantes sem acompanhar cada passo da crianca.
              </p>

              <div data-gsap="metrics" className="mt-9 grid gap-3 sm:grid-cols-3">
                <MetricCard value="0" label="dados pessoais no QR" />
                <MetricCard value="7" label="atores da rede conectados" />
                <MetricCard value="24h" label="eventos prontos para resposta" />
              </div>
            </div>

            <div data-gsap="visual">
              <ProtectionNetworkVisual />
            </div>
          </div>
        </section>

        <section className="relative border-b border-sky-100 py-10 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:gap-10 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:px-10">
            <Card
              data-gsap-scroll="left"
              className="rounded-3xl border-sky-100 bg-linear-to-br from-sky-600 via-cyan-600 to-emerald-600 text-white shadow-[0_26px_60px_rgba(3,105,161,0.24)]"
            >
              <CardHeader>
                <CardTitle className="text-3xl leading-tight tracking-normal sm:text-4xl">
                  Protecao comunitaria para criancas, com privacidade desde o primeiro
                  evento.
                </CardTitle>
              </CardHeader>
              <CardContent className="text-base leading-7 text-cyan-50">
                O Caminho Seguro nao promete saber onde a crianca esta o tempo todo. Ele
                cria uma infraestrutura de confianca para registrar quando algo importante
                aconteceu e acionar quem pode responder.
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-3">
              {productPillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <Card
                    key={pillar.title}
                    data-gsap-scroll="up"
                    className="home-surface rounded-2xl border-sky-100 bg-white/90"
                  >
                    <CardHeader>
                      <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                        <Icon />
                      </div>
                      <CardTitle className="text-lg text-slate-950">
                        {pillar.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-6 text-slate-600">
                      {pillar.text}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="relative border-b border-sky-100 py-10 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div data-gsap-scroll="up" className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Como funciona
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                Cada crianca recebe uma identificacao simples e segura. O sistema
                acompanha os momentos importantes do trajeto. Pais, escola e rede
                de apoio agem juntos.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Se a crianca nao chega na escola no horario, os pais recebem um
                alerta. Se alguem encontra uma crianca perdida, le o codigo e pede
                ajuda sem ver informacoes pessoais. A escola confirma a chegada. O
                transporte avisa o embarque. Cada um faz a sua parte, e a rede
                publica coordena os casos que precisam de acao oficial.
              </p>
            </div>

            <div data-gsap-scroll="up" className="mt-10">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Na pratica
              </p>
              <HowItWorksScenario />
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {protectionSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <Card
                    key={step.title}
                    data-gsap-scroll="up"
                    className="rounded-2xl border-slate-800 bg-slate-950 text-white"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex size-11 items-center justify-center rounded-xl bg-white text-slate-950">
                          <Icon />
                        </div>
                        <span className="text-sm font-semibold text-slate-500">
                          0{index + 1}
                        </span>
                      </div>
                      <CardTitle>{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-6 text-slate-300">
                      {step.description}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section
          id="como-testar"
          className="relative border-b border-sky-100 py-10 sm:py-16"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
            <div data-gsap-scroll="up" className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                Como testar
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                Abra duas abas: uma acompanha, a outra provoca eventos no navegador
                anonimo.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Use a aba Familia como observatorio do responsavel. Na segunda aba, simule
                Escola, Transporte ou QR publico. Assim voce acompanha os resultados sem
                precisar de explicacao longa.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {testSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <Card
                    key={step.title}
                    data-gsap-scroll="up"
                    className="home-surface rounded-2xl border-sky-100 bg-white/90"
                  >
                    <CardHeader>
                      <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <Icon />
                      </div>
                      <CardTitle className="text-xl text-slate-950">
                        {step.title}
                      </CardTitle>
                      <CardDescription className="leading-6">{step.text}</CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Link
                        href={step.href}
                        className={cn(
                          buttonVariants({ variant: "outline", size: "lg" }),
                          "w-full rounded-2xl bg-white",
                        )}
                      >
                        {step.action}
                        <ArrowRight data-icon="inline-end" />
                      </Link>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="relative border-b border-sky-100 py-10 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:gap-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-10">
            <div data-gsap-scroll="left">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                O que ele faz e nao faz
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                O valor do produto esta no limite: ajudar sem expor.
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TruthCard
                title="Faz"
                text="Registra eventos de protecao e notifica responsaveis, instituicoes e rede formal."
                positive
              />
              <TruthCard
                title="Nao faz"
                text="Nao mostra dados pessoais no QR e nao acompanha GPS continuo da crianca."
              />
            </div>
          </div>
        </section>

        <section className="relative py-10 sm:py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:gap-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:px-10">
            <div data-gsap-scroll="left" className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
                Visao de futuro
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950 sm:text-4xl">
                Como essa rede pode evoluir sem abandonar privacidade e confianca.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                As proximas evolucoes partem do mesmo principio do MVP: criar eventos
                confiaveis, acionar a rede certa e evitar vigilancia permanente da
                crianca.
              </p>
            </div>

            <Card
              data-gsap-scroll="up"
              className="home-surface overflow-hidden rounded-3xl border-sky-100 bg-white/90"
            >
              <CardHeader className="gap-2 p-4 sm:p-6">
                <CardTitle className="text-xl text-slate-950 sm:text-2xl">
                  Evolucoes planejadas para a rede
                </CardTitle>
                <CardDescription className="leading-6">
                  Cada frente pode ser validada em pequenos incrementos antes de entrar no
                  roadmap principal.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
                <Accordion
                  multiple
                  value={futureOpen}
                  onValueChange={(value) => {
                    const nextValue = Array.isArray(value) ? value.slice(-1) : [];
                    setFutureOpen(nextValue);
                  }}
                  className="gap-2"
                >
                  {futureEvolutions.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <AccordionItem
                        key={item.title}
                        value={`future-${index}`}
                        className="rounded-2xl border border-sky-100 bg-white/90 px-4 shadow-sm transition-[border-color,box-shadow,background-color] duration-300 data-open:border-emerald-200 data-open:bg-white data-open:shadow-md not-last:border-b"
                      >
                        <AccordionTrigger className="gap-3 py-4 no-underline hover:no-underline">
                          <span className="flex min-w-0 flex-1 items-center gap-3">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                              <Icon />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-base font-semibold leading-6 text-slate-950">
                                {item.title}
                              </span>
                              <span className="mt-1 block text-sm font-medium text-sky-700">
                                {item.horizon}
                              </span>
                            </span>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pl-13 text-sm leading-6 text-slate-600">
                          <p>{item.description}</p>
                          <p className="mt-3 text-slate-700">{item.approach}</p>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>
      </GsapReveal>
    </main>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <Card className="home-surface rounded-2xl border-sky-100 bg-white/90">
      <CardContent className="p-4">
        <p className="text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-1 text-sm leading-5 text-slate-500">{label}</p>
      </CardContent>
    </Card>
  );
}

function TruthCard({
  title,
  text,
  positive = false,
}: {
  title: string;
  text: string;
  positive?: boolean;
}) {
  return (
    <Card
      data-gsap-scroll="up"
      className={`rounded-2xl ${positive ? "border-emerald-200 bg-emerald-50" : "border-sky-200 bg-sky-50"}`}
    >
      <CardHeader>
        <div className="flex items-center gap-2 text-slate-950">
          <CheckCircle2 />
          <CardTitle>{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="leading-7 text-slate-700">{text}</CardContent>
    </Card>
  );
}
