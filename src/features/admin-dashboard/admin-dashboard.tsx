"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  Copy,
  KeyRound,
  LoaderCircle,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { GsapReveal } from "@/components/shared/gsap-reveal";
import type { AdminDashboardData } from "@/types/admin-dashboard";

type AdminDashboardProps = { data: AdminDashboardData };
type IdentifierType = "QR_CODE" | "BLE" | "NFC";

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

export function AdminDashboard({ data }: AdminDashboardProps) {
  const router = useRouter();
  const [type, setType] = useState<IdentifierType>("QR_CODE");
  const [label, setLabel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [revokingToken, setRevokingToken] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createIdentifier(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data.child) return;

    setIsSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/identifiers", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ childPublicId: data.child.publicId, type, label }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const responseError =
          typeof result === "object" && result !== null && "error" in result
            ? result.error
            : "Não foi possível emitir o identificador.";
        throw new Error(
          typeof responseError === "string"
            ? responseError
            : "Não foi possível emitir o identificador.",
        );
      }
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
      setIsSaving(false);
    }
  }

  async function revokeIdentifier(publicToken: string) {
    setRevokingToken(publicToken);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/admin/identifiers/${encodeURIComponent(publicToken)}/revoke`,
        { method: "PATCH" },
      );
      const result: unknown = await response.json();
      if (!response.ok) {
        const responseError =
          typeof result === "object" && result !== null && "error" in result
            ? result.error
            : "Não foi possível revogar o identificador.";
        throw new Error(
          typeof responseError === "string"
            ? responseError
            : "Não foi possível revogar o identificador.",
        );
      }
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
              Identidades protegidas
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Esta área mostra o cadastro mínimo necessário para a demonstração. A emissão
              e a revogação são limitadas à criança fictícia configurada no ambiente.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="dashboard-panel motion-card rounded-[24px] border p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Cadastro protegido
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    A identidade pública é um token opaco; nome e contato não são gravados
                    no QR.
                  </p>
                </div>
              </div>
              {data.child ? (
                <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white">
                  <p className="text-sm text-slate-400">Criança de demonstração</p>
                  <p className="mt-1 text-xl font-semibold">{data.child.fullName}</p>
                  <p className="mt-3 text-sm text-slate-300">
                    Responsável: {data.child.guardianName ?? "Não informado"}
                  </p>
                </div>
              ) : (
                <p className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-800">
                  Cadastro de demonstração não encontrado.
                </p>
              )}
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Metric
                  label="Identificadores"
                  value={data.child?.identifiers.length ?? 0}
                />
                <Metric label="Instituições" value={data.institutions.length} />
              </div>
            </div>

            <form
              onSubmit={createIdentifier}
              className="dashboard-panel motion-card rounded-[24px] border p-6"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">
                    Emitir identificador
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    O token é criado no servidor e não pode ser escolhido manualmente.
                  </p>
                </div>
              </div>
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
                <label className="text-sm font-semibold text-slate-800">
                  Etiqueta
                  <input
                    value={label}
                    onChange={(event) => setLabel(event.target.value)}
                    maxLength={80}
                    placeholder="Ex.: cartão reserva"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                  />
                </label>
              </div>
              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                >
                  {error}
                </p>
              )}
              {message && (
                <p
                  role="status"
                  className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900"
                >
                  {message}
                </p>
              )}
              <button
                type="submit"
                disabled={!data.child || isSaving}
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Emitir identificador
              </button>
            </form>
          </section>

          <section className="dashboard-panel mt-6 rounded-[28px] border p-6">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-5 w-5 text-emerald-700" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Identificadores emitidos
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  A revogação preserva o histórico, mas bloqueia novas leituras e novos
                  eventos.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {data.child?.identifiers.map((identifier) => (
                <article
                  key={identifier.publicToken}
                  className="rounded-2xl border border-slate-200 bg-white/70 p-4"
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
                        {identifier.publicToken.slice(0, 18)}…
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

          <section className="dashboard-panel mt-6 rounded-[28px] border p-6">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-sky-700" />
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Instituições cadastradas
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Referências existentes na rede de demonstração.
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.institutions.map((institution) => (
                <article
                  key={institution.publicId}
                  className="rounded-2xl border border-slate-200 bg-white/70 p-4"
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
            </div>
          </section>
        </div>
      </main>
    </GsapReveal>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </div>
  );
}
