"use client";

import {
  Activity,
  Building2,
  HeartHandshake,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { GsapReveal } from "@/components/shared/gsap-reveal";
import type { ProtectionNetworkData } from "@/types/protection-network";

type ProtectionNetworkDashboardProps = { data: ProtectionNetworkData };

const institutionLabels: Record<string, string> = {
  SCHOOL: "Escola",
  TRANSPORT: "Transporte",
  PROTECTION_AGENCY: "Órgão de proteção",
  UBS: "UBS",
  CRAS: "CRAS",
  NGO: "ONG",
  PARTNER_BUSINESS: "Ponto parceiro",
};

const eventLabels: Record<string, string> = {
  SCHOOL_ARRIVAL: "Chegada à escola",
  SCHOOL_EXIT: "Saída da escola",
  BUS_BOARDING: "Embarque no transporte",
  DISEMBARKING_BUS: "Desembarque do transporte",
  HELP_REQUEST: "Pedido de ajuda",
  CHILD_FOUND: "Criança encontrada",
  CHILD_AT_RISK: "Situação de risco",
  MANUAL_CHECK_IN: "Check-in institucional",
};

const severityClasses: Record<string, string> = {
  LOW: "bg-sky-100 text-sky-800",
  MEDIUM: "bg-amber-100 text-amber-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

export function ProtectionNetworkDashboard({ data }: ProtectionNetworkDashboardProps) {
  const activeAlerts = data.alerts.filter((alert) => alert.status === "OPEN").length;

  return (
    <GsapReveal>
      <main className="dashboard-page page-enter min-h-screen">
        <section className="dashboard-header border-b border-sky-100">
          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--brand-600)">
              Coordenação autorizada
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Rede de proteção
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Visualize os atores da rede, alertas que precisam de acompanhamento e
              eventos relevantes. Esta tela não mostra rastreamento contínuo ou
              localização em tempo real.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <section className="grid gap-4 sm:grid-cols-3">
            <Summary
              title="Instituições ativas"
              value={data.institutions.length}
              icon={Building2}
            />
            <Summary
              title="Alertas em aberto"
              value={activeAlerts}
              icon={ShieldAlert}
              tone="alert"
            />
            <Summary
              title="Eventos recentes"
              value={data.recentEvents.length}
              icon={Activity}
            />
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="dashboard-panel rounded-[28px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <UsersRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Atores conectados
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Instituições disponíveis para responder conforme seu papel.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {data.institutions.map((institution) => (
                  <article
                    key={institution.publicId}
                    className="rounded-2xl border border-sky-100 bg-white/70 p-4"
                  >
                    <p className="font-semibold text-slate-950">{institution.name}</p>
                    <p className="mt-1 text-sm font-medium text-emerald-700">
                      {institutionLabels[institution.type] ?? institution.type}
                    </p>
                    {institution.address && (
                      <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sky-700" />
                        {institution.address}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <div className="dashboard-panel rounded-[28px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Alertas autorizados
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Situações abertas ou já assumidas por um responsável autorizado.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {data.alerts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-emerald-300 bg-emerald-50 p-6 text-center text-sm text-emerald-900">
                    <ShieldCheck className="mx-auto mb-3 h-7 w-7" />
                    Nenhum alerta ativo na rede.
                  </div>
                ) : (
                  data.alerts.map((alert) => (
                    <article
                      key={alert.publicId}
                      className="rounded-2xl border border-slate-200 bg-white/70 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold text-slate-950">{alert.title}</p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityClasses[alert.severity] ?? "bg-slate-100 text-slate-700"}`}
                        >
                          {alert.severity}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {alert.message}
                      </p>
                      <p className="mt-3 text-xs font-semibold text-sky-700">
                        {alert.institutionName ?? "Origem pública"} ·{" "}
                        {new Date(alert.createdAt).toLocaleString("pt-BR", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>

          <section className="dashboard-panel mt-6 rounded-[28px] border p-6">
            <div className="flex items-center gap-3">
              <HeartHandshake className="h-5 w-5 text-emerald-700" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Eventos relevantes
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Passagens registradas pela rede; não representam uma trilha da rotina.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {data.recentEvents.map((event) => (
                <article
                  key={event.publicId}
                  className="rounded-2xl border border-slate-200 bg-white/70 p-4"
                >
                  <p className="font-semibold text-slate-950">
                    {eventLabels[event.type] ?? event.type}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {event.institutionName ?? "Origem pública"}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-sky-700">
                    {new Date(event.occurredAt).toLocaleString("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </GsapReveal>
  );
}

function Summary({
  title,
  value,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: number;
  icon: typeof Building2;
  tone?: "default" | "alert";
}) {
  return (
    <article className="dashboard-panel motion-card rounded-[22px] border p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone === "alert" ? "bg-red-100 text-red-700" : "bg-sky-100 text-sky-700"}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
