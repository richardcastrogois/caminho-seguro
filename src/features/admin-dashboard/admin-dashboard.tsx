"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity,
  BadgeCheck,
  Building2,
  CalendarDays,
  Copy,
  KeyRound,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserPlus,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { GsapReveal } from "@/components/shared/gsap-reveal";
import { authFetch } from "@/lib/auth-fetch";
import type { AdminDashboardData } from "@/types/admin-dashboard";

type AdminDashboardProps = { data: AdminDashboardData };
type IdentifierType = "QR_CODE" | "BLE" | "NFC";
type InstitutionType =
  | "SCHOOL"
  | "TRANSPORT"
  | "PROTECTION_AGENCY"
  | "UBS"
  | "CRAS"
  | "NGO"
  | "PARTNER_BUSINESS";

const identifierLabels: Record<IdentifierType, string> = {
  QR_CODE: "QR Code",
  BLE: "Bluetooth",
  NFC: "NFC",
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

const sourceLabels: Record<string, string> = {
  BLE_GATEWAY: "Gateway BLE",
  QR_PUBLIC_SCAN: "QR público",
  QR_INSTITUTION_SCAN: "QR institucional",
  NFC_SCAN: "NFC",
  MANUAL: "Manual",
  SYSTEM: "Sistema",
};

const sourceColors: Record<string, string> = {
  BLE_GATEWAY: "#0284c7",
  QR_PUBLIC_SCAN: "#10b981",
  QR_INSTITUTION_SCAN: "#8b5cf6",
  NFC_SCAN: "#f59e0b",
  MANUAL: "#64748b",
  SYSTEM: "#0d9488",
};

const blockchainStatusLabels: Record<string, string> = {
  CONFIRMED: "Confirmado",
  PENDING: "Pendente",
  SUBMITTED: "Submetido",
  FAILED: "Falha",
};

const blockchainStatusColors: Record<string, string> = {
  CONFIRMED: "bg-emerald-500",
  PENDING: "bg-amber-500",
  SUBMITTED: "bg-sky-500",
  FAILED: "bg-red-500",
};

const institutionTypes = Object.keys(institutionLabels) as InstitutionType[];

export function AdminDashboard({ data }: AdminDashboardProps) {
  const router = useRouter();
  const [type, setType] = useState<IdentifierType>("QR_CODE");
  const [label, setLabel] = useState("");
  const [isSavingIdentifier, setIsSavingIdentifier] = useState(false);
  const [isSavingInstitution, setIsSavingInstitution] = useState(false);
  const [isSavingChild, setIsSavingChild] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [institutionForm, setInstitutionForm] = useState({
    name: "",
    type: "SCHOOL" as InstitutionType,
    email: "",
    phone: "",
    address: "",
  });

  const [childForm, setChildForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "2016-01-01",
    guardianName: "",
    guardianEmail: "",
    institutionPublicId: data.institutions[0]?.publicId ?? "",
    referenceCode: "",
    identifierType: "QR_CODE" as IdentifierType,
    identifierLabel: "",
  });

  async function parseResponse(response: Response, fallback: string) {
    const result: unknown = await response.json();
    if (response.ok) {
      return result;
    }

    const responseError =
      typeof result === "object" && result !== null && "error" in result
        ? result.error
        : fallback;
    throw new Error(typeof responseError === "string" ? responseError : fallback);
  }

  async function createIdentifier(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data.child) return;

    setIsSavingIdentifier(true);
    setError(null);
    setMessage(null);
    try {
      const response = await authFetch("/api/admin/identifiers", {
        method: "POST",
        body: JSON.stringify({ childPublicId: data.child.publicId, type, label }),
      });
      await parseResponse(response, "Não foi possível emitir o identificador.");
      setLabel("");
      setMessage("Identificador protegido emitido com sucesso.");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível emitir o identificador.",
      );
    } finally {
      setIsSavingIdentifier(false);
    }
  }

  async function createInstitution(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingInstitution(true);
    setError(null);
    setMessage(null);
    try {
      const response = await authFetch("/api/admin/institutions", {
        method: "POST",
        body: JSON.stringify(institutionForm),
      });
      await parseResponse(response, "Não foi possível cadastrar a instituição.");
      setInstitutionForm({ name: "", type: "SCHOOL", email: "", phone: "", address: "" });
      setMessage("Instituição cadastrada com sucesso.");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível cadastrar a instituição.",
      );
    } finally {
      setIsSavingInstitution(false);
    }
  }

  async function createChild(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSavingChild(true);
    setError(null);
    setMessage(null);
    try {
      const response = await authFetch("/api/admin/children", {
        method: "POST",
        body: JSON.stringify(childForm),
      });
      await parseResponse(response, "Não foi possível cadastrar a criança.");
      setChildForm({
        firstName: "",
        lastName: "",
        birthDate: "2016-01-01",
        guardianName: "",
        guardianEmail: "",
        institutionPublicId: data.institutions[0]?.publicId ?? "",
        referenceCode: "",
        identifierType: "QR_CODE",
        identifierLabel: "",
      });
      setMessage("Criança, responsável e identificador cadastrados com sucesso.");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível cadastrar a criança.",
      );
    } finally {
      setIsSavingChild(false);
    }
  }

  async function revokeIdentifier(publicToken: string) {
    setRevokingToken(publicToken);
    setError(null);
    setMessage(null);
    try {
      const response = await authFetch(
        `/api/admin/identifiers/${encodeURIComponent(publicToken)}/revoke`,
        {
          method: "PATCH",
        },
      );
      await parseResponse(response, "Não foi possível revogar o identificador.");
      setMessage("Identificador revogado. Ele não poderá mais gerar eventos.");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível revogar o identificador.",
      );
    } finally {
      setRevokingToken(null);
    }
  }

  async function retryBlockchain() {
    setIsRetrying(true);
    setError(null);
    setMessage(null);
    try {
      const response = await authFetch("/api/blockchain/retry", { method: "POST" });
      await parseResponse(response, "Não foi possível reprocessar os eventos pendentes.");
      setMessage("Eventos pendentes reprocessados.");
      router.refresh();
    } catch (caughtError: unknown) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível reprocessar os eventos pendentes.",
      );
    } finally {
      setIsRetrying(false);
    }
  }

  const blockchainTotal = data.blockchainHealth.byStatus.reduce(
    (total, item) => total + item.count,
    0,
  );
  const confirmedCount =
    data.blockchainHealth.byStatus.find((item) => item.status === "CONFIRMED")?.count ??
    0;
  const confirmedRate =
    blockchainTotal > 0 ? Math.round((confirmedCount / blockchainTotal) * 100) : 0;

  const eventsByDayData = data.analytics.eventsByDay.map((item) => ({
    day: `${item.date.slice(8, 10)}/${item.date.slice(5, 7)}`,
    count: item.count,
  }));

  const eventsByTypeData = data.analytics.eventsByType
    .map((item) => ({
      label: eventLabels[item.type] ?? item.type,
      count: item.count,
    }))
    .sort((a, b) => b.count - a.count);

  const eventsBySourceData = data.analytics.eventsBySource.map((item) => ({
    key: item.source,
    label: sourceLabels[item.source] ?? item.source,
    count: item.count,
  }));

  const eventsByDayConfig: ChartConfig = {
    events: { label: "Eventos", color: "#0284c7" },
  };
  const eventsByTypeConfig: ChartConfig = {
    count: { label: "Eventos", color: "#0ea5e9" },
  };
  const eventsBySourceConfig: ChartConfig = Object.fromEntries(
    eventsBySourceData.map((item) => [
      item.key,
      { label: item.label, color: sourceColors[item.key] ?? "#94a3b8" },
    ]),
  ) as ChartConfig;

  return (
    <GsapReveal>
      <main className="dashboard-page page-enter min-h-screen">
        <section className="dashboard-header border-b border-sky-100">
          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--brand-600)">
              Administração de demonstração
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Cadastro do piloto
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Cadastre instituições, crie crianças fictícias com responsável e emita ou
              revogue identificadores protegidos.
            </p>
          </div>
        </section>

        <section className="border-b border-sky-100">
          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--brand-600)">
              Visão geral
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
              Plataforma em números
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Eventos nas últimas 24h"
                value={data.analytics.events24h}
                icon={Activity}
              />
              <KpiCard
                title="Eventos em 7 dias"
                value={data.analytics.events7d}
                icon={CalendarDays}
              />
              <KpiCard
                title="Blockchain confirmado"
                value={`${confirmedRate}%`}
                hint={`${confirmedCount} de ${blockchainTotal} registros`}
                icon={ShieldCheck}
                tone="emerald"
              />
              <KpiCard
                title="Alertas em aberto"
                value={data.openAlerts}
                icon={ShieldAlert}
                tone="alert"
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
              <section className="dashboard-panel rounded-[22px] border p-4 sm:rounded-[24px] sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      Eventos por dia
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">Últimos 14 dias</p>
                  </div>
                </div>
                <ChartContainer config={eventsByDayConfig} className="mt-5 h-[240px]">
                  <BarChart
                    data={eventsByDayData}
                    margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis
                      dataKey="day"
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      width={28}
                      fontSize={12}
                    />
                    <ChartTooltip
                      cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                      content={<ChartTooltipContent />}
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--color-events)"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={28}
                    />
                  </BarChart>
                </ChartContainer>
              </section>

              <section className="dashboard-panel rounded-[22px] border p-4 sm:rounded-[24px] sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      Saúde do blockchain
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Prova de integridade dos eventos
                    </p>
                  </div>
                </div>

                {blockchainTotal === 0 ? (
                  <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                    Nenhum registro blockchain até o momento.
                  </p>
                ) : (
                  <>
                    <div className="mt-5 flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      {data.blockchainHealth.byStatus.map((item) => (
                        <div
                          key={item.status}
                          className={
                            blockchainStatusColors[item.status] ?? "bg-slate-400"
                          }
                          style={{ width: `${(item.count / blockchainTotal) * 100}%` }}
                        />
                      ))}
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {data.blockchainHealth.byStatus.map((item) => (
                        <div
                          key={item.status}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-xs font-medium text-slate-500">
                            {blockchainStatusLabels[item.status] ?? item.status}
                          </p>
                          <p className="mt-1 text-lg font-semibold text-slate-950">
                            {item.count}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Wallet className="h-5 w-5 text-violet-700" />
                      <div>
                        <p className="text-xs font-medium text-slate-500">
                          Saldo da wallet
                        </p>
                        <p className="mt-0.5 font-semibold text-slate-950">
                          {data.blockchainHealth.wallet.configured
                            ? `${data.blockchainHealth.wallet.balanceSOL?.toFixed(4)} SOL`
                            : "Não configurada"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        !data.blockchainHealth.wallet.configured
                          ? "bg-slate-200 text-slate-700"
                          : data.blockchainHealth.wallet.low
                            ? "bg-red-100 text-red-800"
                            : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {!data.blockchainHealth.wallet.configured
                        ? "Sem wallet"
                        : data.blockchainHealth.wallet.low
                          ? "Saldo baixo"
                          : "Saldo ok"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={retryBlockchain}
                  disabled={isRetrying}
                  className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 text-sm font-semibold text-violet-700 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRetrying ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Reprocessar pendentes
                </button>
              </section>
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-2">
              <section className="dashboard-panel rounded-[22px] border p-4 sm:rounded-[24px] sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      Eventos por tipo
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Distribuição dos registros da plataforma
                    </p>
                  </div>
                </div>
                {eventsByTypeData.length === 0 ? (
                  <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                    Nenhum evento registrado.
                  </p>
                ) : (
                  <ChartContainer config={eventsByTypeConfig} className="mt-5 h-[260px]">
                    <BarChart
                      data={eventsByTypeData}
                      layout="vertical"
                      margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        type="category"
                        dataKey="label"
                        width={150}
                        tickLine={false}
                        axisLine={false}
                        fontSize={12}
                      />
                      <ChartTooltip
                        cursor={{ fill: "rgba(148, 163, 184, 0.12)" }}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--color-count)"
                        radius={[0, 6, 6, 0]}
                        barSize={18}
                      />
                    </BarChart>
                  </ChartContainer>
                )}
              </section>

              <section className="dashboard-panel rounded-[22px] border p-4 sm:rounded-[24px] sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">
                      Eventos por origem
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                      Como os eventos chegaram à rede
                    </p>
                  </div>
                </div>
                {eventsBySourceData.length === 0 ? (
                  <p className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                    Nenhum evento registrado.
                  </p>
                ) : (
                  <div className="mt-5 grid items-center gap-4 sm:grid-cols-[1fr_0.9fr]">
                    <ChartContainer config={eventsBySourceConfig} className="h-[220px]">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                          data={eventsBySourceData}
                          dataKey="count"
                          nameKey="label"
                          innerRadius={52}
                          outerRadius={82}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {eventsBySourceData.map((item) => (
                            <Cell key={item.key} fill={`var(--color-${item.key})`} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                    <div className="flex flex-wrap gap-2">
                      {eventsBySourceData.map((item) => (
                        <span
                          key={item.key}
                          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                        >
                          <span
                            className="h-2 w-2 rounded-[2px]"
                            style={{
                              backgroundColor: sourceColors[item.key] ?? "#94a3b8",
                            }}
                          />
                          {item.label} · {item.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          {(error || message) && (
            <div
              className={`mb-5 rounded-2xl border p-4 text-sm font-medium ${error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}
            >
              {error ?? message}
            </div>
          )}

          <section className="grid gap-6 lg:grid-cols-4">
            <SummaryCard title="Crianças" value={data.children.length} icon={UserPlus} />
            <SummaryCard
              title="Instituições"
              value={data.institutions.length}
              icon={Building2}
            />
            <SummaryCard
              title="IDs da demo"
              value={data.child?.identifiers.length ?? 0}
              icon={ShieldCheck}
            />
            <Link
              href="/admin/simulador"
              className="dashboard-panel motion-card flex items-center justify-between rounded-[22px] border p-5 transition hover:border-sky-300 hover:bg-sky-50"
            >
              <div>
                <p className="text-sm text-slate-600">Simular leitura</p>
                <p className="mt-1.5 text-sm font-semibold text-sky-700">
                  Abrir simulador &rarr;
                </p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                <Smartphone className="size-5" />
              </div>
            </Link>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <form
              onSubmit={createInstitution}
              className="dashboard-panel motion-card rounded-[22px] border p-4 sm:rounded-[24px] sm:p-6"
            >
              <PanelHeading
                icon={Building2}
                title="Cadastrar instituição"
                description="Inclua escola, transporte, UBS, CRAS, ONG, órgão ou ponto parceiro."
              />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Nome"
                  value={institutionForm.name}
                  onChange={(value) =>
                    setInstitutionForm((form) => ({ ...form, name: value }))
                  }
                  required
                />
                <label className="text-sm font-semibold text-slate-800">
                  Tipo
                  <select
                    value={institutionForm.type}
                    onChange={(event) =>
                      setInstitutionForm((form) => ({
                        ...form,
                        type: event.target.value as InstitutionType,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    {institutionTypes.map((institutionType) => (
                      <option key={institutionType} value={institutionType}>
                        {institutionLabels[institutionType]}
                      </option>
                    ))}
                  </select>
                </label>
                <TextInput
                  label="E-mail"
                  type="email"
                  value={institutionForm.email}
                  onChange={(value) =>
                    setInstitutionForm((form) => ({ ...form, email: value }))
                  }
                />
                <TextInput
                  label="Telefone"
                  value={institutionForm.phone}
                  onChange={(value) =>
                    setInstitutionForm((form) => ({ ...form, phone: value }))
                  }
                />
                <div className="sm:col-span-2">
                  <TextInput
                    label="Endereço"
                    value={institutionForm.address}
                    onChange={(value) =>
                      setInstitutionForm((form) => ({ ...form, address: value }))
                    }
                  />
                </div>
              </div>
              <SubmitButton
                isLoading={isSavingInstitution}
                label="Cadastrar instituição"
              />
            </form>

            <form
              onSubmit={createChild}
              className="dashboard-panel motion-card rounded-[22px] border p-4 sm:rounded-[24px] sm:p-6"
            >
              <PanelHeading
                icon={UserPlus}
                title="Cadastrar criança"
                description="Cria criança fictícia, responsável, vínculo institucional e identificador inicial."
              />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <TextInput
                  label="Nome"
                  value={childForm.firstName}
                  onChange={(value) =>
                    setChildForm((form) => ({ ...form, firstName: value }))
                  }
                  required
                />
                <TextInput
                  label="Sobrenome"
                  value={childForm.lastName}
                  onChange={(value) =>
                    setChildForm((form) => ({ ...form, lastName: value }))
                  }
                  required
                />
                <TextInput
                  label="Nascimento"
                  type="date"
                  value={childForm.birthDate}
                  onChange={(value) =>
                    setChildForm((form) => ({ ...form, birthDate: value }))
                  }
                  required
                />
                <TextInput
                  label="Responsável"
                  value={childForm.guardianName}
                  onChange={(value) =>
                    setChildForm((form) => ({ ...form, guardianName: value }))
                  }
                  required
                />
                <TextInput
                  label="E-mail do responsável"
                  type="email"
                  value={childForm.guardianEmail}
                  onChange={(value) =>
                    setChildForm((form) => ({ ...form, guardianEmail: value }))
                  }
                  required
                />
                <label className="text-sm font-semibold text-slate-800">
                  Instituição
                  <select
                    value={childForm.institutionPublicId}
                    onChange={(event) =>
                      setChildForm((form) => ({
                        ...form,
                        institutionPublicId: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                    required
                  >
                    {data.institutions.map((institution) => (
                      <option key={institution.publicId} value={institution.publicId}>
                        {institution.name}
                      </option>
                    ))}
                  </select>
                </label>
                <TextInput
                  label="Código de referência"
                  value={childForm.referenceCode}
                  onChange={(value) =>
                    setChildForm((form) => ({ ...form, referenceCode: value }))
                  }
                />
                <label className="text-sm font-semibold text-slate-800">
                  Identificador
                  <select
                    value={childForm.identifierType}
                    onChange={(event) =>
                      setChildForm((form) => ({
                        ...form,
                        identifierType: event.target.value as IdentifierType,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    {Object.entries(identifierLabels).map(([value, text]) => (
                      <option key={value} value={value}>
                        {text}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="sm:col-span-2">
                  <TextInput
                    label="Etiqueta do identificador"
                    value={childForm.identifierLabel}
                    onChange={(value) =>
                      setChildForm((form) => ({ ...form, identifierLabel: value }))
                    }
                  />
                </div>
              </div>
              <SubmitButton isLoading={isSavingChild} label="Cadastrar criança" />
            </form>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
            <form
              onSubmit={createIdentifier}
              className="dashboard-panel motion-card rounded-[22px] border p-4 sm:rounded-[24px] sm:p-6"
            >
              <PanelHeading
                icon={KeyRound}
                title="Emitir identificador para a demo"
                description="Mantém o fluxo rápido para a criança Maria do roteiro principal."
              />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-800">
                  Tecnologia
                  <select
                    value={type}
                    onChange={(event) => setType(event.target.value as IdentifierType)}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-950 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  >
                    {Object.entries(identifierLabels).map(([value, text]) => (
                      <option key={value} value={value}>
                        {text}
                      </option>
                    ))}
                  </select>
                </label>
                <TextInput label="Etiqueta" value={label} onChange={setLabel} />
              </div>
              <SubmitButton
                isLoading={isSavingIdentifier}
                label="Emitir identificador"
                disabled={!data.child}
              />
            </form>

            <section className="dashboard-panel rounded-[22px] border p-4 sm:rounded-[24px] sm:p-6">
              <PanelHeading
                icon={BadgeCheck}
                title="Identificadores da demo"
                description="Revogação bloqueia novas leituras, mas preserva histórico."
              />
              <div className="mt-4 grid gap-3 sm:mt-6">
                {data.child?.identifiers.map((identifier) => (
                  <article
                    key={identifier.publicToken}
                    className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-950">
                            {identifierLabels[identifier.type]}
                          </p>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${identifier.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}
                          >
                            {identifier.status}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">
                          {identifier.label ?? "Sem etiqueta"}
                        </p>
                        <p className="mt-2 font-mono text-xs text-slate-500">
                          {identifier.publicToken.slice(0, 18)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {identifier.status === "ACTIVE" && (
                          <button
                            type="button"
                            onClick={() => revokeIdentifier(identifier.publicToken)}
                            disabled={revokingToken !== null}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                            title="Revogar identificador"
                            aria-label="Revogar identificador"
                          >
                            {revokingToken === identifier.publicToken ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        <Copy className="h-4 w-4 text-slate-400" aria-hidden="true" />
                      </div>
                    </div>
                  </article>
                )) ?? (
                  <p className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600">
                    Nenhum identificador disponível.
                  </p>
                )}
              </div>
            </section>
          </section>

          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <ListPanel title="Crianças cadastradas" icon={UserPlus}>
              {data.children.map((child) => (
                <article
                  key={child.publicId}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                >
                  <p className="font-semibold text-slate-950">{child.fullName}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    Responsável: {child.guardianName ?? "Não informado"}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    Instituição: {child.institutionName ?? "Sem vínculo"}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-sky-700">
                    {child.identifiers} identificador(es)
                  </p>
                </article>
              ))}
            </ListPanel>

            <ListPanel title="Instituições cadastradas" icon={Building2}>
              {data.institutions.map((institution) => (
                <article
                  key={institution.publicId}
                  className="rounded-2xl border border-slate-200 bg-white/80 p-4"
                >
                  <p className="font-semibold text-slate-950">{institution.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {institutionLabels[institution.type] ?? institution.type}
                  </p>
                  <p
                    className={`mt-3 text-xs font-semibold ${institution.active ? "text-emerald-700" : "text-slate-500"}`}
                  >
                    {institution.active ? "Ativa" : "Inativa"}
                  </p>
                </article>
              ))}
            </ListPanel>
          </section>
        </div>
      </main>
    </GsapReveal>
  );
}

function PanelHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof ShieldCheck;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: typeof ShieldCheck;
}) {
  return (
    <article className="dashboard-panel motion-card rounded-[22px] border p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-semibold text-slate-800">
      {label}
      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
      />
    </label>
  );
}

function SubmitButton({
  isLoading,
  label,
  disabled = false,
}: {
  isLoading: boolean;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isLoading ? (
        <LoaderCircle className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}

function ListPanel({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof ShieldCheck;
  children: React.ReactNode;
}) {
  return (
    <section className="dashboard-panel rounded-[22px] border p-4 sm:rounded-[28px] sm:p-6">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-sky-700" />
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="mt-4 grid gap-3 sm:mt-6">{children}</div>
    </section>
  );
}

function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: number | string;
  hint?: string;
  icon: typeof ShieldCheck;
  tone?: "default" | "emerald" | "alert";
}) {
  const toneClasses = {
    default: "bg-sky-100 text-sky-700",
    emerald: "bg-emerald-100 text-emerald-700",
    alert: "bg-red-100 text-red-700",
  };

  return (
    <article className="dashboard-panel motion-card rounded-[20px] border p-4 sm:rounded-[22px] sm:p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-600">{title}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}
