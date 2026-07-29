"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BusFront,
  CheckCircle2,
  CircleDot,
  Clock3,
  LoaderCircle,
  MapPin,
  Route,
  Users,
} from "lucide-react";
import { GsapReveal } from "@/components/shared/gsap-reveal";
import { authFetch } from "@/lib/auth-fetch";
import type { TransportChild, TransportDashboardData } from "@/types/transport-dashboard";

type TransportDashboardProps = { data: TransportDashboardData };
type Action = "BUS_BOARDING" | "DISEMBARKING_BUS";

type PendingAction = { action: Action; childPublicId: string } | null;

const eventLabels: Record<Action, string> = {
  BUS_BOARDING: "Embarque confirmado",
  DISEMBARKING_BUS: "Desembarque confirmado",
};

function statusLabel(child: TransportChild) {
  if (child.lastEventType === "BUS_BOARDING") return "Em trajeto";
  if (child.lastEventType === "DISEMBARKING_BUS") return "Desembarque registrado";
  return "Aguardando embarque";
}

export function TransportDashboard({ data }: TransportDashboardProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function registerEvent(action: Action, childPublicId: string) {
    setPendingAction({ action, childPublicId });
    setMessage(null);
    setError(null);

    try {
      const response = await authFetch("/api/transport/events", {
        method: "POST",
        body: JSON.stringify({ action, childPublicId }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const responseError =
          typeof result === "object" && result !== null && "error" in result
            ? result.error
            : "Nao foi possivel registrar o evento.";
        throw new Error(
          typeof responseError === "string"
            ? responseError
            : "Nao foi possivel registrar o evento.",
        );
      }

      setMessage(eventLabels[action]);
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Nao foi possivel registrar o evento.",
      );
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <GsapReveal>
      <main className="dashboard-page page-enter min-h-screen">
        <section className="dashboard-header border-b border-sky-100">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--brand-600)">
                Operacao de transporte
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {data.institution.name}
              </h1>
              <p className="mt-2 text-slate-600">
                Registre somente embarque e desembarque, sem rastrear a rota.
              </p>
            </div>
            {data.route && (
              <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-3">
                <Route className="h-5 w-5 text-sky-700" />
                <div>
                  <p className="font-semibold text-slate-950">{data.route.name}</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {data.route.vehiclePlate ?? "Veiculo nao informado"} ·{" "}
                    {data.route.driverName ?? "Motorista nao informado"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          {(error || message) && (
            <p
              role={error ? "alert" : "status"}
              className={`mb-5 rounded-2xl border p-4 text-sm font-medium ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
            >
              {error ?? message}
            </p>
          )}

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="dashboard-panel motion-card rounded-[24px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <BusFront className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Passageiros esperados
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Cada crianca vinculada a rota pode gerar eventos independentes.
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4">
                {data.children.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                    Nenhuma crianca vinculada ao transporte.
                  </p>
                ) : (
                  data.children.map((child) => {
                    const pending =
                      pendingAction?.childPublicId === child.publicId
                        ? pendingAction.action
                        : null;
                    return (
                      <article
                        key={child.publicId}
                        className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-950/10"
                      >
                        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                          <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
                              {statusLabel(child)}
                            </p>
                            <h3 className="mt-1 text-xl font-semibold text-slate-950">
                              {child.fullName}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {child.referenceCode ?? "Vinculo de rota nao informado"}
                            </p>
                            <p className="mt-2 text-sm text-slate-500">
                              {child.identifierLabel ?? "Identificador BLE nao informado"}
                            </p>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2 xl:min-w-80">
                            <button
                              type="button"
                              onClick={() =>
                                registerEvent("BUS_BOARDING", child.publicId)
                              }
                              disabled={
                                pendingAction !== null ||
                                child.lastEventType === "BUS_BOARDING"
                              }
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-4 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {pending === "BUS_BOARDING" ? (
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                              ) : (
                                <CircleDot className="h-5 w-5" />
                              )}
                              Embarque
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                registerEvent("DISEMBARKING_BUS", child.publicId)
                              }
                              disabled={
                                pendingAction !== null ||
                                child.lastEventType !== "BUS_BOARDING"
                              }
                              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-4 font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {pending === "DISEMBARKING_BUS" ? (
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-5 w-5" />
                              )}
                              Desembarque
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>

            <div className="dashboard-panel motion-card rounded-[24px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Regras da operacao
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Eventos pontuais, sem localizacao continua.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <RuleItem text="Cada acao gera evento com data, rota e fonte assistida." />
                <RuleItem text="A demo permite repetir eventos no mesmo dia para testar a apresentacao sem reiniciar o banco." />
                <RuleItem text="O responsavel visualiza o evento sem receber a rota do veiculo." />
              </div>
            </div>
          </section>

          <section className="dashboard-panel mt-6 rounded-[28px] border p-6">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-sky-700" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Eventos de hoje</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Historico operacional da rota.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {data.recentEvents.length === 0 ? (
                <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                  Nenhum evento de transporte foi registrado hoje.
                </p>
              ) : (
                data.recentEvents.map((event) => (
                  <article
                    key={event.publicId}
                    className="rounded-2xl border border-slate-200 bg-white/70 p-4"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {eventLabels[event.type]}
                        </p>
                        <p className="mt-1 text-sm text-slate-600">{event.childName}</p>
                      </div>
                      <p className="text-sm font-medium text-sky-700">
                        {new Date(event.occurredAt).toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4" />
                      {event.locationLabel ?? "Local nao informado"}
                    </p>
                  </article>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </GsapReveal>
  );
}

function RuleItem({ text }: { text: string }) {
  return (
    <p className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-sm leading-6 text-slate-700">
      {text}
    </p>
  );
}
