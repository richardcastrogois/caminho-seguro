"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  Copy,
  KeyRound,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserPlus,
} from "lucide-react";
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

const institutionTypes = Object.keys(institutionLabels) as InstitutionType[];

export function AdminDashboard({ data }: AdminDashboardProps) {
  const router = useRouter();
  const [type, setType] = useState<IdentifierType>("QR_CODE");
  const [label, setLabel] = useState("");
  const [isSavingIdentifier, setIsSavingIdentifier] = useState(false);
  const [isSavingInstitution, setIsSavingInstitution] = useState(false);
  const [isSavingChild, setIsSavingChild] = useState(false);
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
              className="dashboard-panel motion-card rounded-[24px] border p-6"
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
              className="dashboard-panel motion-card rounded-[24px] border p-6"
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
              className="dashboard-panel motion-card rounded-[24px] border p-6"
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

            <section className="dashboard-panel rounded-[24px] border p-6">
              <PanelHeading
                icon={BadgeCheck}
                title="Identificadores da demo"
                description="Revogação bloqueia novas leituras, mas preserva histórico."
              />
              <div className="mt-6 grid gap-3">
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
    <section className="dashboard-panel rounded-[28px] border p-6">
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-sky-700" />
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
      </div>
      <div className="mt-6 grid gap-3">{children}</div>
    </section>
  );
}
