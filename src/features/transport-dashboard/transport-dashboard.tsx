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
import type { TransportDashboardData } from "@/types/transport-dashboard";

type TransportDashboardProps = {
  data: TransportDashboardData;
};

type Action = "BUS_BOARDING" | "DISEMBARKING_BUS";

const eventLabels: Record<Action, string> = {
  BUS_BOARDING: "Embarque confirmado",
  DISEMBARKING_BUS: "Desembarque confirmado",
};

export function TransportDashboard({ data }: TransportDashboardProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<Action | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const child = data.children[0] ?? null;
  const currentState = child?.lastEventType ?? null;

  async function registerEvent(action: Action) {
    if (!child) {
      return;
    }

    setPendingAction(action);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch("/api/transport/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, childPublicId: child.publicId }),
      });
      const result: unknown = await response.json();

      if (!response.ok) {
        const responseError =
          typeof result === "object" && result !== null && "error" in result
            ? result.error
            : "Não foi possível registrar o evento.";
        throw new Error(
          typeof responseError === "string"
            ? responseError
            : "Não foi possível registrar o evento.",
        );
      }

      setMessage(eventLabels[action]);
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível registrar o evento.",
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
                Operação de transporte
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {data.institution.name}
              </h1>
              <p className="mt-2 text-slate-600">
                Registre somente eventos de embarque e desembarque, sem rastrear a rota.
              </p>
            </div>
            {data.route && (
              <div className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50/80 px-4 py-3">
                <Route className="h-5 w-5 text-sky-700" />
                <div>
                  <p className="font-semibold text-slate-950">{data.route.name}</p>
                  <p className="mt-0.5 text-sm text-slate-600">
                    {data.route.vehiclePlate ?? "Veículo não informado"} ·{" "}
                    {data.route.driverName ?? "Motorista não informado"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="dashboard-panel motion-card rounded-[24px] border p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-sky-700">
                    Passageiro esperado
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    {child?.fullName ?? "Nenhuma criança vinculada"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {child?.referenceCode ?? "Vínculo de rota não informado"}
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                  <BusFront className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 rounded-3xl bg-slate-950 p-5 text-white">
                <p className="text-sm text-slate-400">Status atual</p>
                <p className="mt-1 text-xl font-semibold">
                  {currentState === "BUS_BOARDING"
                    ? "Em trajeto"
                    : currentState === "DISEMBARKING_BUS"
                      ? "Desembarque registrado"
                      : "Aguardando embarque"}
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  {child?.identifierLabel ?? "Identificador BLE não informado"}
                </p>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                  {error}
                </p>
              )}
              {message && (
                <p
                  role="status"
                  className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
                >
                  {message}
                </p>
              )}

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => registerEvent("BUS_BOARDING")}
                  disabled={
                    !child || pendingAction !== null || currentState === "BUS_BOARDING"
                  }
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-sky-600 px-5 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendingAction === "BUS_BOARDING" ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <CircleDot className="h-5 w-5" />
                  )}
                  Confirmar embarque
                </button>
                <button
                  type="button"
                  onClick={() => registerEvent("DISEMBARKING_BUS")}
                  disabled={
                    !child || pendingAction !== null || currentState !== "BUS_BOARDING"
                  }
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pendingAction === "DISEMBARKING_BUS" ? (
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                  Confirmar desembarque
                </button>
              </div>
            </div>

            <div className="dashboard-panel motion-card rounded-[24px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Regras da operação
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    O transporte registra passagens importantes; não coleta localização
                    contínua.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                <RuleItem text="Cada ação gera um evento com data, rota e fonte assistida." />
                <RuleItem text="Embarque e desembarque são bloqueados quando já houver um registro diário igual." />
                <RuleItem text="O responsável visualiza o evento no próprio painel, sem receber a rota do veículo." />
              </div>
            </div>
          </section>

          <section className="dashboard-panel mt-6 rounded-[28px] border p-6">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-sky-700" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Eventos de hoje</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Histórico operacional da rota de demonstração.
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
                      {event.locationLabel ?? "Local não informado"}
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
