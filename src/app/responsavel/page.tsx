import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Bluetooth,
  Building2,
  BusFront,
  CheckCircle2,
  Clock,
  Footprints,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { prisma } from "@/lib/prisma";
import type { BlockchainStatus, EventType } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const eventConfig: Record<
  string,
  { label: string; icon: typeof Building2; color: string; bg: string }
> = {
  SCHOOL_ARRIVAL: {
    label: "Chegada à escola",
    icon: Building2,
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  SCHOOL_EXIT: {
    label: "Saída da escola",
    icon: Building2,
    color: "text-sky-700",
    bg: "bg-sky-100",
  },
  BUS_BOARDING: {
    label: "Embarque no transporte",
    icon: BusFront,
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  DISEMBARKING_BUS: {
    label: "Desembarque do transporte",
    icon: BusFront,
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  HELP_REQUEST: {
    label: "Pedido de ajuda",
    icon: ShieldAlert,
    color: "text-red-700",
    bg: "bg-red-100",
  },
  CHILD_FOUND: {
    label: "Criança encontrada",
    icon: Search,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  CHILD_AT_RISK: {
    label: "Situação de risco",
    icon: AlertTriangle,
    color: "text-red-700",
    bg: "bg-red-100",
  },
  MANUAL_CHECK_IN: {
    label: "Verificação manual",
    icon: QrCode,
    color: "text-violet-700",
    bg: "bg-violet-100",
  },
};

function BlockchainBadge({
  status,
  transactionHash,
}: {
  status: string;
  transactionHash: string | null;
}) {
  if (status === "CONFIRMED") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
        <span className="text-xs font-semibold text-emerald-700">
          Blockchain verificado
        </span>
        {transactionHash && (
          <span className="hidden max-w-[120px] truncate text-[10px] text-emerald-500 sm:inline-block" title={transactionHash}>
            {transactionHash.slice(0, 8)}...
          </span>
        )}
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1">
        <Clock className="h-3.5 w-3.5 text-amber-600" />
        <span className="text-xs font-semibold text-amber-700">
          Pendente
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1">
      <XCircle className="h-3.5 w-3.5 text-red-600" />
      <span className="text-xs font-semibold text-red-700">Falha</span>
    </div>
  );
}

function TimelineDot({ status }: { status: string }) {
  if (status === "CONFIRMED" || status === "VALIDATED") {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-emerald-200 bg-emerald-100">
        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white">
      <Clock className="h-4 w-4 text-slate-400" />
    </div>
  );
}

export default async function ResponsavelPage({
  searchParams,
}: {
  searchParams: Promise<{ childId?: string }>;
}) {
  const { childId: queryChildId } = await searchParams;
  const childPublicId = queryChildId ?? "crianca-demo-maria";

  const child = await prisma.child.findUnique({
    where: { publicId: childPublicId },
    include: {
      guardians: {
        include: {
          guardian: {
            include: {
              user: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  if (!child) {
    notFound();
  }

  const events = await prisma.protectionEvent.findMany({
    where: { childId: child.id },
    include: {
      institution: { select: { name: true, type: true } },
      identifier: { select: { type: true, label: true } },
      gateway: { select: { name: true } },
      blockchainRecord: true,
    },
    orderBy: { occurredAt: "desc" },
    take: 20,
  });

  const primaryGuardian = child.guardians.find((g) => g.isPrimary);
  const responsibleName = primaryGuardian?.guardian.user.name ?? "Responsável";

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <BrandLogo />

          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            {responsibleName}
          </span>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
        <div className="rounded-[32px] border border-white/80 bg-white/80 p-6 shadow-xl shadow-slate-900/5 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--brand-600)">
                Painel do Responsável
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                {child.firstName} está{" "}
                <span className="text-(--safe-600)">segura</span>
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {child.firstName} {child.lastName}
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <ShieldCheck className="h-8 w-8" />
            </div>
          </div>

          {events.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center">
              <Footprints className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-4 text-lg font-semibold text-slate-700">
                Nenhum evento registrado ainda
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Os eventos de proteção aparecerão aqui assim que forem detectados.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-0">
              {events.map((event, index) => {
                const cfg = eventConfig[event.type] ?? {
                  label: event.type,
                  icon: ShieldCheck,
                  color: "text-slate-700",
                  bg: "bg-slate-100",
                };
                const Icon = cfg.icon;
                const bc = event.blockchainRecord;
                const isLast = index === events.length - 1;

                return (
                  <div key={event.id} className="relative flex gap-4 pb-6">
                    {!isLast && (
                      <div className="absolute left-4 top-9 bottom-0 w-px bg-slate-200" />
                    )}

                    <TimelineDot status={bc?.status ?? "PENDING"} />

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${cfg.bg} ${cfg.color}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <h3 className="font-semibold text-slate-950">
                            {cfg.label}
                          </h3>
                        </div>

                        <span className="text-sm text-slate-400">
                          {event.occurredAt.toLocaleString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="mt-1.5 space-y-1">
                        {event.institution && (
                          <p className="text-sm text-slate-600">
                            {event.institution.name}
                          </p>
                        )}

                        {event.locationLabel && (
                          <p className="text-sm text-slate-500">
                            {event.locationLabel}
                          </p>
                        )}

                        {event.identifier && (
                          <p className="flex items-center gap-1.5 text-xs text-slate-400">
                            {event.identifier.type === "BLE" ? (
                              <Bluetooth className="h-3 w-3" />
                            ) : (
                              <QrCode className="h-3 w-3" />
                            )}
                            {event.identifier.label}
                          </p>
                        )}
                      </div>

                      <div className="mt-2">
                        <BlockchainBadge
                          status={bc?.status ?? "PENDING"}
                          transactionHash={bc?.transactionHash ?? null}
                        />
                      </div>

                      <details className="group mt-2">
                        <summary className="cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-600">
                          Detalhes técnicos
                        </summary>

                        <div className="mt-2 space-y-1 rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-500">
                          {bc?.transactionHash && (
                            <p>
                              <span className="font-semibold text-slate-700">Tx:</span>{" "}
                              {bc.transactionHash}
                            </p>
                          )}
                          {bc?.slot && (
                            <p>
                              <span className="font-semibold text-slate-700">Slot:</span>{" "}
                              {bc.slot.toString()}
                            </p>
                          )}
                          {bc?.eventHash && (
                            <p>
                              <span className="font-semibold text-slate-700">Hash:</span>{" "}
                              {bc.eventHash}
                            </p>
                          )}
                          {bc?.confirmedAt && (
                            <p>
                              <span className="font-semibold text-slate-700">Confirmado:</span>{" "}
                              {bc.confirmedAt.toLocaleString("pt-BR")}
                            </p>
                          )}
                          {event.notes && (
                            <p className="text-slate-600">{event.notes}</p>
                          )}
                        </div>
                      </details>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-400">
            Exibindo os {Math.min(events.length, 20)} eventos mais recentes
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-(--brand-600) hover:underline"
          >
            Voltar para início
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
