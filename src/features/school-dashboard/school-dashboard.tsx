"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Bluetooth,
  CheckCircle2,
  CircleDot,
  Clock3,
  LoaderCircle,
  MapPin,
  RadioTower,
  RefreshCw,
  RotateCcw,
  School,
  ShieldCheck,
  Users,
  Wifi,
} from "lucide-react";
import type { SchoolDashboardData } from "@/types/school-dashboard";
import { GsapReveal } from "@/components/shared/gsap-reveal";

type SchoolDashboardProps = {
  data: SchoolDashboardData;
};

type SimulationStage =
  "idle" | "scanning" | "identifier-found" | "validating" | "saving" | "success";

const eventLabels: Record<string, string> = {
  SCHOOL_ARRIVAL: "Chegada à escola",
  SCHOOL_EXIT: "Saída da escola",
  BUS_BOARDING: "Embarque no transporte",
  DISEMBARKING_BUS: "Desembarque do transporte",
  HELP_REQUEST: "Pedido de ajuda",
  CHILD_FOUND: "Criança encontrada",
  CHILD_AT_RISK: "Possível situação de risco",
  MANUAL_CHECK_IN: "Confirmação manual",
};

const stageLabels: Record<SimulationStage, string> = {
  idle: "Leitor aguardando nova simulação",
  scanning: "Procurando identificadores Bluetooth próximos...",
  "identifier-found": "Tag BLE de Maria encontrada",
  validating: "Validando intensidade do sinal e vínculo protegido...",
  saving: "Registrando chegada na rede de proteção...",
  success: "Chegada registrada com sucesso",
};

function formatTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export function SchoolDashboard({ data }: SchoolDashboardProps) {
  const router = useRouter();

  const [simulationStage, setSimulationStage] = useState<SimulationStage>("idle");

  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastRefreshLabel, setLastRefreshLabel] = useState("Dados carregados agora");

  const simulationRunning = simulationStage !== "idle" && simulationStage !== "success";

  useEffect(() => {
    const refreshInterval = window.setInterval(() => {
      router.refresh();

      setLastRefreshLabel(
        `Atualizado às ${new Date().toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}`,
      );
    }, 5000);

    return () => {
      window.clearInterval(refreshInterval);
    };
  }, [router]);

  async function simulateDetection() {
    setErrorMessage(null);
    setMessage(null);

    try {
      setSimulationStage("scanning");
      await wait(1300);

      setSimulationStage("identifier-found");
      await wait(900);

      setSimulationStage("validating");
      await wait(1100);

      setSimulationStage("saving");

      const response = await fetch("/api/institution/ble/detect", {
        method: "POST",
      });

      const result: unknown = await response.json();

      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("ok" in result) ||
        result.ok !== true
      ) {
        const responseMessage =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Não foi possível registrar a detecção Bluetooth.";

        throw new Error(responseMessage);
      }

      const successMessage =
        "message" in result && typeof result.message === "string"
          ? result.message
          : "Chegada registrada com sucesso.";

      setMessage(successMessage);
      setSimulationStage("success");
      router.refresh();

      window.setTimeout(() => {
        setSimulationStage("idle");
      }, 3500);
    } catch (error: unknown) {
      setSimulationStage("idle");

      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível executar a simulação.",
      );
    }
  }

  async function resetDemonstration() {
    setIsResetting(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/institution/ble/reset", {
        method: "POST",
      });

      const result: unknown = await response.json();

      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("ok" in result) ||
        result.ok !== true
      ) {
        const responseMessage =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Não foi possível reiniciar a demonstração.";

        throw new Error(responseMessage);
      }

      const successMessage =
        "message" in result && typeof result.message === "string"
          ? result.message
          : "Demonstração reiniciada.";

      setMessage(successMessage);
      setSimulationStage("idle");
      router.refresh();
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível reiniciar a demonstração.",
      );
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <GsapReveal>
      <div className="dashboard-page page-enter min-h-screen">
        <section className="dashboard-header border-b border-sky-100">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--brand-600)">
                Painel institucional
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {data.institution.name}
              </h1>

              <p className="mt-2 flex items-center gap-2 text-slate-600">
                <MapPin className="h-4 w-4" />
                {data.institution.address ?? "Endereço institucional"}
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <RefreshCw className="h-4 w-4 text-sky-700" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Atualização automática
                </p>

                <p className="mt-0.5 text-sm text-slate-700">{lastRefreshLabel}</p>
              </div>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Crianças esperadas"
              value={data.summary.expectedChildren}
              icon={Users}
              description="Vínculos ativos com a escola"
            />

            <SummaryCard
              title="Detectadas hoje"
              value={data.summary.detectedChildren}
              icon={CheckCircle2}
              description="Chegadas confirmadas"
            />

            <SummaryCard
              title="Ainda não detectadas"
              value={data.summary.pendingChildren}
              icon={Clock3}
              description="Aguardando evento de chegada"
            />

            <SummaryCard
              title="Alertas ativos"
              value={data.summary.activeAlerts}
              icon={AlertTriangle}
              description="Situações em acompanhamento"
            />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="dashboard-panel motion-card rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
                    Gateway Bluetooth
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Leitor do portão principal
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <RadioTower className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Status do leitor</p>

                    <p className="mt-1 text-xl font-semibold">
                      {data.gateway?.status === "ACTIVE"
                        ? "Ativo e conectado"
                        : "Gateway indisponível"}
                    </p>
                  </div>

                  <span className="relative flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                    <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-400" />
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      Gateway
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {data.gateway?.name ?? "Não configurado"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                      Último sinal
                    </p>

                    <p className="mt-2 text-sm font-medium">
                      {data.gateway?.lastSeenAt
                        ? formatDateTime(data.gateway.lastSeenAt)
                        : "Aguardando leitura"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-sky-200 bg-sky-50 p-5">
                <div className="flex items-start gap-3">
                  {simulationRunning ? (
                    <LoaderCircle className="mt-0.5 h-5 w-5 animate-spin text-sky-700" />
                  ) : simulationStage === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
                  ) : (
                    <Bluetooth className="mt-0.5 h-5 w-5 text-sky-700" />
                  )}

                  <div>
                    <p className="font-semibold text-slate-950">
                      Simulação do leitor BLE
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {stageLabels[simulationStage]}
                    </p>

                    {simulationRunning && (
                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-sky-100">
                        <div className="h-full w-2/3 animate-pulse rounded-full bg-sky-600" />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {message && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  {message}
                </div>
              )}

              {errorMessage && (
                <div
                  role="alert"
                  className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                  {errorMessage}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={simulateDetection}
                  disabled={
                    simulationRunning || isResetting || data.summary.pendingChildren === 0
                  }
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 py-3 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {simulationRunning ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <Bluetooth className="h-5 w-5" />
                  )}

                  {data.summary.pendingChildren === 0
                    ? "Todas as crianças foram detectadas"
                    : simulationRunning
                      ? "Simulando detecção..."
                      : "Simular chegada por Bluetooth"}
                </button>

                <button
                  type="button"
                  onClick={resetDemonstration}
                  disabled={simulationRunning || isResetting}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isResetting ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <RotateCcw className="h-5 w-5" />
                  )}
                  Reiniciar demonstração
                </button>
              </div>
            </div>

            <div className="dashboard-panel rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <School className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Crianças esperadas
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Situação das chegadas previstas para hoje.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {data.children.map((child) => (
                  <article
                    key={child.publicId}
                    className={`rounded-3xl border p-5 ${
                      child.detected
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                            child.detected
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {child.detected ? (
                            <CheckCircle2 className="h-6 w-6" />
                          ) : (
                            <CircleDot className="h-6 w-6" />
                          )}
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold text-slate-950">
                            {child.firstName} {child.lastName}
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {child.referenceCode ?? "Vínculo escolar ativo"}
                          </p>

                          <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                            <Bluetooth className="h-4 w-4 text-sky-700" />
                            {child.identifierLabel ?? "Identificador BLE não informado"}
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${
                            child.detected
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {child.detected ? "Chegada confirmada" : "Aguardando chegada"}
                        </span>

                        {child.arrivalTime && (
                          <p className="mt-2 text-sm font-medium text-slate-700">
                            Detectada às {formatTime(child.arrivalTime)}
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="dashboard-panel rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-sky-700" />

                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Eventos da instituição
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Registros mais recentes realizados hoje.
                  </p>
                </div>
              </div>

              {data.recentEvents.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                  Nenhum evento institucional foi registrado hoje.
                </p>
              ) : (
                <div className="mt-6 grid gap-3">
                  {data.recentEvents.map((event) => (
                    <article
                      key={event.publicId}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {eventLabels[event.type] ?? event.type}
                          </p>

                          <p className="mt-1 text-sm text-slate-600">{event.childName}</p>

                          <p className="mt-1 text-sm text-slate-500">
                            {event.locationLabel ?? "Localização institucional"}
                          </p>
                        </div>

                        <div className="sm:text-right">
                          <p className="text-sm font-medium text-slate-700">
                            {formatDateTime(event.occurredAt)}
                          </p>

                          {event.blockchainStatus && (
                            <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              Blockchain: {event.blockchainStatus.toLowerCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>

            <div className="dashboard-panel rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-emerald-700" />

                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Saúde da infraestrutura
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Recursos conectados ao ambiente.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                <InfrastructureStatus
                  title="Gateway BLE"
                  description="Leitor do portão principal"
                  active={data.gateway?.status === "ACTIVE"}
                />

                <InfrastructureStatus
                  title="Banco de eventos"
                  description="Neon PostgreSQL conectado"
                  active
                />

                <InfrastructureStatus
                  title="Prova de integridade"
                  description="Fila de registros da Solana"
                  active
                />
              </div>
            </div>
          </section>
        </main>
      </div>
    </GsapReveal>
  );
}

type SummaryCardProps = {
  title: string;
  value: number;
  description: string;
  icon: typeof Users;
};

function SummaryCard({ title, value, description, icon: Icon }: SummaryCardProps) {
  return (
    <article className="dashboard-panel motion-card rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-500">{description}</p>
    </article>
  );
}

type InfrastructureStatusProps = {
  title: string;
  description: string;
  active: boolean;
};

function InfrastructureStatus({ title, description, active }: InfrastructureStatusProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <span
        className={`h-3 w-3 shrink-0 rounded-full ${
          active ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      <div>
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}
