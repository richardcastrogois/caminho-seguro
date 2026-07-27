"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BellRing,
  BusFront,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  MapPin,
  RefreshCw,
  School,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import {
  EventDetailsDialog,
  type GuardianEventDetails,
} from "@/features/guardian-dashboard/event-details-dialog";
import { GsapReveal } from "@/components/shared/gsap-reveal";

export type GuardianDashboardData = {
  guardianName: string;
  child: {
    publicId: string;
    firstName: string;
    lastName: string;
    status: string;
  };
  events: GuardianEventDetails[];
  alerts: Array<{
    publicId: string;
    type: string;
    severity: string;
    status: string;
    title: string;
    message: string;
    createdAt: string;
    acknowledgedAt: string | null;
    resolvedAt: string | null;
    institutionName: string | null;
    event: GuardianEventDetails | null;
  }>;
};

type GuardianDashboardProps = {
  data: GuardianDashboardData;
};

type AlertAction = "acknowledge" | "resolve";

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

const alertStatusLabels: Record<string, string> = {
  OPEN: "Aguardando confirmação",
  ACKNOWLEDGED: "Recebido pelo responsável",
  RESOLVED: "Resolvido",
  DISMISSED: "Encerrado",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

function getEventIcon(type: string) {
  if (type === "SCHOOL_ARRIVAL" || type === "SCHOOL_EXIT") {
    return School;
  }

  if (type === "BUS_BOARDING" || type === "DISEMBARKING_BUS") {
    return BusFront;
  }

  if (type === "HELP_REQUEST" || type === "CHILD_FOUND" || type === "CHILD_AT_RISK") {
    return ShieldAlert;
  }

  return CheckCircle2;
}

function getAlertClasses(severity: string, status: string) {
  if (status === "RESOLVED" || status === "DISMISSED") {
    return {
      container: "border-slate-200 bg-white",
      icon: "bg-slate-100 text-slate-600",
      badge: "bg-slate-100 text-slate-700",
    };
  }

  if (severity === "CRITICAL") {
    return {
      container: "border-red-300 bg-red-50",
      icon: "bg-red-600 text-white",
      badge: "bg-red-100 text-red-800",
    };
  }

  if (severity === "HIGH") {
    return {
      container: "border-orange-300 bg-orange-50",
      icon: "bg-orange-500 text-white",
      badge: "bg-orange-100 text-orange-800",
    };
  }

  return {
    container: "border-amber-200 bg-amber-50",
    icon: "bg-amber-500 text-white",
    badge: "bg-amber-100 text-amber-800",
  };
}

export function GuardianDashboard({ data }: GuardianDashboardProps) {
  const router = useRouter();

  const [selectedEvent, setSelectedEvent] = useState<GuardianEventDetails | null>(null);

  const [pendingAction, setPendingAction] = useState<{
    alertPublicId: string;
    action: AlertAction;
  } | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    const initializeTimer = window.setTimeout(() => {
      setLastUpdatedAt(new Date());
    }, 0);

    const refreshInterval = window.setInterval(() => {
      router.refresh();
      setLastUpdatedAt(new Date());
    }, 5000);

    return () => {
      window.clearTimeout(initializeTimer);
      window.clearInterval(refreshInterval);
    };
  }, [router]);

  const activeAlerts = data.alerts.filter(
    (alert) => alert.status === "OPEN" || alert.status === "ACKNOWLEDGED",
  );

  const resolvedAlerts = data.alerts.filter(
    (alert) => alert.status === "RESOLVED" || alert.status === "DISMISSED",
  );

  const latestEvent = data.events[0] ?? null;

  async function updateAlert(alertPublicId: string, action: AlertAction): Promise<void> {
    setActionError(null);

    setPendingAction({
      alertPublicId,
      action,
    });

    try {
      const response = await fetch(`/api/guardian/alerts/${alertPublicId}/${action}`, {
        method: "PATCH",
      });

      const result: unknown = await response.json();

      if (
        !response.ok ||
        typeof result !== "object" ||
        result === null ||
        !("ok" in result) ||
        result.ok !== true
      ) {
        const message =
          typeof result === "object" &&
          result !== null &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Não foi possível atualizar o alerta.";

        throw new Error(message);
      }

      router.refresh();
      setLastUpdatedAt(new Date());
    } catch (error: unknown) {
      setActionError(
        error instanceof Error ? error.message : "Não foi possível atualizar o alerta.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <GsapReveal>
      <div className="dashboard-page page-enter min-h-screen">
        <section className="dashboard-header border-b border-sky-100">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--brand-600)">
                Painel do responsável
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Olá, {data.guardianName}
              </h1>

              <p className="mt-2 text-slate-600">
                Acompanhe os eventos de proteção de {data.child.firstName}.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <RefreshCw className="h-4 w-4 text-sky-700" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Atualização automática
                </p>

                <p className="mt-0.5 text-sm text-slate-700">
                  Última atualização:{" "}
                  {lastUpdatedAt
                    ? lastUpdatedAt.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })
                    : "carregando..."}
                </p>
              </div>
            </div>
          </div>
        </section>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <section className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="dashboard-panel motion-card rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">Criança protegida</p>

                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">
                    {data.child.firstName} {data.child.lastName}
                  </h2>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-400">Status atual</p>

                <p className="mt-1 text-xl font-semibold">
                  {activeAlerts.length > 0
                    ? "Atenção necessária"
                    : latestEvent
                      ? (eventLabels[latestEvent.type] ?? latestEvent.type)
                      : "Nenhum evento recente"}
                </p>

                {latestEvent && (
                  <div className="mt-4 flex items-start gap-3 border-t border-white/10 pt-4">
                    <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />

                    <div>
                      <p className="text-sm font-medium">
                        {formatDateTime(latestEvent.occurredAt)}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        {latestEvent.locationLabel ??
                          latestEvent.institutionName ??
                          "Evento registrado na rede de proteção"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-semibold text-slate-950">
                    {data.events.length}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">eventos recentes</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-2xl font-semibold text-slate-950">
                    {activeAlerts.length}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">alertas ativos</p>
                </div>
              </div>
            </div>

            <div className="dashboard-panel motion-card rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                  <BellRing className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Alertas ativos</h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Situações que precisam de acompanhamento.
                  </p>
                </div>
              </div>

              {actionError && (
                <div
                  role="alert"
                  className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                  {actionError}
                </div>
              )}

              {activeAlerts.length === 0 ? (
                <div className="mt-6 rounded-3xl border border-dashed border-emerald-300 bg-emerald-50 p-8 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-700" />

                  <p className="mt-4 font-semibold text-emerald-950">
                    Nenhum alerta ativo
                  </p>

                  <p className="mt-2 text-sm leading-6 text-emerald-800">
                    Os últimos eventos não exigem uma ação do responsável.
                  </p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4">
                  {activeAlerts.map((alert) => {
                    const classes = getAlertClasses(alert.severity, alert.status);

                    const isAcknowledging =
                      pendingAction?.alertPublicId === alert.publicId &&
                      pendingAction.action === "acknowledge";

                    const isResolving =
                      pendingAction?.alertPublicId === alert.publicId &&
                      pendingAction.action === "resolve";

                    const hasCoordinates =
                      alert.event?.latitude !== null &&
                      alert.event?.latitude !== undefined &&
                      alert.event?.longitude !== null &&
                      alert.event?.longitude !== undefined;

                    const mapUrl = hasCoordinates
                      ? `https://www.openstreetmap.org/?mlat=${alert.event?.latitude}&mlon=${alert.event?.longitude}#map=17/${alert.event?.latitude}/${alert.event?.longitude}`
                      : null;

                    return (
                      <article
                        key={alert.publicId}
                        className={`rounded-3xl border p-5 ${classes.container}`}
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${classes.icon}`}
                          >
                            <AlertTriangle className="h-6 w-6" />
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-slate-950">
                                  {alert.title}
                                </h3>

                                <p className="mt-1 text-sm text-slate-600">
                                  {formatDateTime(alert.createdAt)}
                                </p>
                              </div>

                              <span
                                className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${classes.badge}`}
                              >
                                {alertStatusLabels[alert.status] ?? alert.status}
                              </span>
                            </div>

                            <p className="mt-4 leading-7 text-slate-700">
                              {alert.message}
                            </p>

                            {alert.event?.notes && (
                              <div className="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">
                                  Observação enviada
                                </p>

                                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-violet-950">
                                  {alert.event.notes}
                                </p>
                              </div>
                            )}

                            {alert.event?.locationLabel && (
                              <div className="mt-4 flex items-start gap-2 rounded-2xl bg-white/70 p-3">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />

                                <p className="text-sm text-slate-700">
                                  {alert.event.locationLabel}
                                </p>
                              </div>
                            )}

                            {mapUrl && (
                              <a
                                href={mapUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline"
                              >
                                Abrir localização compartilhada
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}

                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                              {alert.status === "OPEN" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateAlert(alert.publicId, "acknowledge")
                                  }
                                  disabled={pendingAction !== null}
                                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isAcknowledging ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Check className="h-4 w-4" />
                                  )}

                                  {isAcknowledging
                                    ? "Confirmando..."
                                    : "Confirmar recebimento"}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => updateAlert(alert.publicId, "resolve")}
                                disabled={pendingAction !== null}
                                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isResolving ? (
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="h-4 w-4" />
                                )}

                                {isResolving ? "Atualizando..." : "Marcar como resolvido"}
                              </button>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="dashboard-panel rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">
                Histórico de eventos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Registros mais recentes da rede de proteção.
              </p>

              <div className="mt-6 grid gap-1">
                {data.events.map((event, index) => {
                  const Icon = getEventIcon(event.type);

                  return (
                    <button
                      key={event.publicId}
                      type="button"
                      onClick={() => setSelectedEvent(event)}
                      className="grid w-full grid-cols-[auto_1fr] gap-4 rounded-2xl p-2 text-left transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-200"
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <Icon className="h-5 w-5" />
                        </div>

                        {index < data.events.length - 1 && (
                          <div className="my-1 h-full min-h-10 w-px bg-slate-200" />
                        )}
                      </div>

                      <div className="pb-6">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold text-slate-950">
                            {eventLabels[event.type] ?? event.type}
                          </p>

                          <p className="text-sm text-slate-500">
                            {formatDateTime(event.occurredAt)}
                          </p>
                        </div>

                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {event.locationLabel ??
                            event.institutionName ??
                            "Evento registrado na rede"}
                        </p>

                        <p className="mt-2 text-xs font-semibold text-sky-700">
                          Clique para ver os detalhes
                        </p>

                        {event.blockchainStatus === "CONFIRMED" && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Blockchain verificado
                            {event.transactionHash && (
                              <span className="hidden max-w-[100px] truncate text-[10px] text-emerald-500 sm:inline-block" title={event.transactionHash}>
                                {event.transactionHash.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        )}
                        {event.blockchainStatus === "PENDING" && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                            Pendente
                          </div>
                        )}
                        {event.blockchainStatus && event.blockchainStatus !== "CONFIRMED" && event.blockchainStatus !== "PENDING" && (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                            Falha
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="dashboard-panel rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-950">Alertas encerrados</h2>

              <p className="mt-1 text-sm text-slate-500">
                Histórico das situações já tratadas.
              </p>

              {resolvedAlerts.length === 0 ? (
                <p className="mt-6 rounded-2xl bg-slate-50 p-5 text-sm leading-6 text-slate-600">
                  Nenhum alerta foi encerrado até o momento.
                </p>
              ) : (
                <div className="mt-5 grid gap-3">
                  {resolvedAlerts.map((alert) => (
                    <button
                      key={alert.publicId}
                      type="button"
                      onClick={() => {
                        if (alert.event) {
                          setSelectedEvent(alert.event);
                        }
                      }}
                      disabled={!alert.event}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100 disabled:cursor-default"
                    >
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />

                        <div>
                          <p className="font-semibold text-slate-900">{alert.title}</p>

                          <p className="mt-1 text-sm text-slate-500">
                            {formatDateTime(alert.resolvedAt ?? alert.createdAt)}
                          </p>

                          {alert.event && (
                            <p className="mt-2 text-xs font-semibold text-sky-700">
                              Clique para ver os detalhes
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </section>
        </main>

        <EventDetailsDialog
          event={selectedEvent}
          eventLabel={
            selectedEvent ? (eventLabels[selectedEvent.type] ?? selectedEvent.type) : ""
          }
          onClose={() => setSelectedEvent(null)}
        />
      </div>
    </GsapReveal>
  );
}
