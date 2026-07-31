"use client";

import {
  Activity,
  Building2,
  HeartHandshake,
  MapPin,
  RadioTower,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { GsapReveal } from "@/components/shared/gsap-reveal";
import type { ProtectionNetworkData } from "@/types/protection-network";

type ProtectionNetworkDashboardProps = { data: ProtectionNetworkData };

type CoordinatePoint = {
  latitude: number | null;
  longitude: number | null;
};

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

function hasCoordinate<T extends CoordinatePoint>(
  point: T,
): point is T & {
  latitude: number;
  longitude: number;
} {
  return typeof point.latitude === "number" && typeof point.longitude === "number";
}

function buildMapPosition(points: Array<{ latitude: number; longitude: number }>) {
  const latitudes = points.map((point) => point.latitude);
  const longitudes = points.map((point) => point.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeSpan = Math.max(maxLatitude - minLatitude, 0.01);
  const longitudeSpan = Math.max(maxLongitude - minLongitude, 0.01);

  return (point: { latitude: number; longitude: number }) => ({
    left: `${30 + ((point.longitude - minLongitude) / longitudeSpan) * 40}%`,
    top: `${20 + (1 - (point.latitude - minLatitude) / latitudeSpan) * 58}%`,
  });
}

export function ProtectionNetworkDashboard({ data }: ProtectionNetworkDashboardProps) {
  const activeAlerts = data.alerts.filter((alert) => alert.status === "OPEN").length;
  const institutionPoints = data.institutions.filter(hasCoordinate);
  const alertPoints = data.alerts.filter(hasCoordinate);
  const positionedPoints = [...institutionPoints, ...alertPoints];
  const getPosition =
    positionedPoints.length > 0 ? buildMapPosition(positionedPoints) : null;

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
              Visualize instituições conectadas, alertas autorizados e eventos relevantes.
              Esta tela mostra pontos de proteção e ocorrências, não uma rota da criança.
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

          <section className="dashboard-panel motion-card mt-6 overflow-hidden rounded-[28px] border">
            <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[360px] overflow-hidden border-b border-sky-100 bg-[linear-gradient(90deg,rgba(14,165,233,0.10)_1px,transparent_1px),linear-gradient(0deg,rgba(16,185,129,0.10)_1px,transparent_1px),radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_82%_72%,rgba(16,185,129,0.18),transparent_32%)] bg-[size:36px_36px,36px_36px,100%_100%,100%_100%] sm:min-h-[420px] sm:bg-[size:44px_44px,44px_44px,100%_100%,100%_100%] lg:border-b-0 lg:border-r">
                <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm sm:left-6 sm:top-6">
                  Mapa agregado da rede
                </div>

                <div className="absolute inset-x-[18%] top-1/2 border-t border-dashed border-sky-300" />
                <div className="absolute inset-y-[18%] left-1/2 border-l border-dashed border-emerald-300" />
                <div className="absolute left-[23%] right-[23%] top-[24%] bottom-[24%] rounded-full border border-dashed border-sky-200 sm:left-[18%] sm:right-[18%] sm:top-[22%] sm:bottom-[22%]" />

                {getPosition &&
                  institutionPoints.map((institution) => {
                    const position = getPosition(institution);

                    return (
                      <div
                        key={institution.publicId}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={position}
                      >
                        <div className="flex max-w-[11.5rem] items-center gap-1.5 rounded-full border border-sky-200 bg-white px-2.5 py-2 text-xs font-semibold text-slate-800 shadow-lg shadow-sky-950/10 sm:max-w-52 sm:gap-2 sm:px-3 sm:text-sm">
                          <MapPin className="h-4 w-4 text-sky-700" />
                          <span className="min-w-0 truncate">{institution.name}</span>
                        </div>
                      </div>
                    );
                  })}

                {getPosition &&
                  alertPoints.map((alert) => {
                    const position = getPosition(alert);

                    return (
                      <div
                        key={alert.publicId}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={position}
                      >
                        <div className="relative flex size-10 items-center justify-center rounded-full bg-red-600 text-white shadow-xl shadow-red-900/25 sm:size-12">
                          <span className="absolute size-10 animate-ping rounded-full bg-red-400/40 sm:size-12" />
                          <ShieldAlert className="relative h-5 w-5" />
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <RadioTower className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      Cobertura do piloto
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Pontos conectados com coordenadas conhecidas e alertas emergenciais.
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3">
                  {data.institutions.map((institution) => (
                    <article
                      key={institution.publicId}
                      className="rounded-2xl border border-sky-100 bg-white/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {institution.name}
                          </p>
                          <p className="mt-1 text-sm font-medium text-emerald-700">
                            {institutionLabels[institution.type] ?? institution.type}
                          </p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                          Ativo
                        </span>
                      </div>
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
            </div>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="dashboard-panel rounded-[22px] border p-4 sm:rounded-[28px] sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Alertas autorizados
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Situações abertas ou assumidas por perfil autorizado.
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
                      className="rounded-2xl border border-slate-200 bg-white/80 p-4"
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
                        {alert.locationLabel ?? alert.institutionName ?? "Origem pública"}{" "}
                        ·{" "}
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

            <div className="dashboard-panel rounded-[22px] border p-4 sm:rounded-[28px] sm:p-6">
              <div className="flex items-center gap-3">
                <HeartHandshake className="h-5 w-5 text-emerald-700" />
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Eventos relevantes
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Registros recentes da rede; não representam rastreamento contínuo.
                  </p>
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {data.recentEvents.map((event) => (
                  <article
                    key={event.publicId}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                  >
                    <p className="font-semibold text-slate-950">
                      {eventLabels[event.type] ?? event.type}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      {event.locationLabel ?? event.institutionName ?? "Origem pública"}
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
    <article className="dashboard-panel motion-card rounded-[20px] border p-4 sm:rounded-[22px] sm:p-5">
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
