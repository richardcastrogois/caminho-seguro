"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CalendarClock,
  ExternalLink,
  MapPin,
  MessageSquareText,
  Radio,
  ShieldCheck,
  X,
} from "lucide-react";

export type GuardianEventDetails = {
  publicId: string;
  type: string;
  source: string;
  severity: string;
  status: string;
  occurredAt: string;
  locationLabel: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  institutionName: string | null;
  blockchainStatus: string | null;
  transactionHash: string | null;
  slot: string | null;
  eventHash: string | null;
};

type EventDetailsDialogProps = {
  event: GuardianEventDetails | null;
  eventLabel: string;
  onClose: () => void;
};

const sourceLabels: Record<string, string> = {
  BLE_GATEWAY: "Leitor Bluetooth",
  QR_PUBLIC_SCAN: "Leitura pública do QR",
  QR_INSTITUTION_SCAN: "Leitura institucional do QR",
  NFC_SCAN: "Leitura NFC",
  MANUAL: "Registro manual",
  SYSTEM: "Sistema",
};

const statusLabels: Record<string, string> = {
  RECEIVED: "Recebido",
  VALIDATED: "Validado",
  REJECTED: "Rejeitado",
  CANCELLED: "Cancelado",
};

const severityLabels: Record<string, string> = {
  INFORMATIONAL: "Informativo",
  ATTENTION: "Atenção",
  CRITICAL: "Crítico",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "medium",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export function EventDetailsDialog({
  event,
  eventLabel,
  onClose,
}: EventDetailsDialogProps) {

  useEffect(() => {
    if (!event) {
      return;
    }

    function handleKeyDown(keyboardEvent: KeyboardEvent) {
      if (keyboardEvent.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [event, onClose]);

  if (!event || typeof document === "undefined") {
    return null;
  }

  const hasCoordinates = event.latitude !== null && event.longitude !== null;

  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${event.latitude}&mlon=${event.longitude}#map=17/${event.latitude}/${event.longitude}`
    : null;

  const dialog = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="event-details-title"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="flex h-[calc(100dvh-1.5rem)] w-full max-w-[min(85vw,980px)] flex-col overflow-hidden rounded-[30px] border border-white/80 bg-white shadow-2xl shadow-slate-950/30 sm:h-[85dvh]">
        <header className="z-10 flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 sm:px-7 sm:py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-(--brand-600)">
              Detalhes do evento
            </p>

            <h2
              id="event-details-title"
              className="mt-1 text-2xl font-semibold text-slate-950"
            >
              {eventLabel}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar detalhes"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-300"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="modal-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarClock className="h-4 w-4" />

                <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                  Data e horário
                </p>
              </div>

              <p className="mt-2 font-medium text-slate-950">
                {formatDateTime(event.occurredAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Radio className="h-4 w-4" />

                <p className="text-xs font-semibold uppercase tracking-[0.12em]">
                  Origem
                </p>
              </div>

              <p className="mt-2 font-medium text-slate-950">
                {sourceLabels[event.source] ?? event.source}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Status
              </p>

              <p className="mt-2 font-medium text-slate-950">
                {statusLabels[event.status] ?? event.status}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Criticidade
              </p>

              <p className="mt-2 font-medium text-slate-950">
                {severityLabels[event.severity] ?? event.severity}
              </p>
            </div>
          </div>

          <section className="mt-5 rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-950">Localização</h3>

                <p className="mt-1 wrap-break-word leading-7 text-slate-600">
                  {event.locationLabel ?? "Localização não informada"}
                </p>

                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:underline"
                  >
                    Abrir localização no mapa
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start gap-3">
              <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" />

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-950">Observação enviada</h3>

                <p className="mt-2 whitespace-pre-wrap wrap-break-word leading-7 text-slate-600">
                  {event.notes?.trim() || "Nenhuma observação foi informada."}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-violet-200 bg-violet-50 p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" />

              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-violet-950">Integridade blockchain</h3>

                {event.blockchainStatus ? (
                  <div className="mt-2 space-y-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        event.blockchainStatus === "CONFIRMED"
                          ? "border border-emerald-200 bg-emerald-100 text-emerald-800"
                          : event.blockchainStatus === "PENDING"
                            ? "border border-amber-200 bg-amber-100 text-amber-800"
                            : "border border-red-200 bg-red-100 text-red-800"
                      }`}
                    >
                      {event.blockchainStatus === "CONFIRMED" ? "CONFIRMADO" :
                       event.blockchainStatus === "PENDING" ? "PENDENTE" : "FALHA"}
                    </span>

                    {event.transactionHash && (
                      <div className="rounded-xl border border-violet-200 bg-white p-3 font-mono text-xs text-violet-900">
                        <p>
                          <span className="font-semibold">Tx:</span>{" "}
                          <span className="break-all">{event.transactionHash}</span>
                        </p>
                        {event.slot && (
                          <p className="mt-1">
                            <span className="font-semibold">Slot:</span> {event.slot}
                          </p>
                        )}
                        {event.eventHash && (
                          <p className="mt-1">
                            <span className="font-semibold">Hash:</span>{" "}
                            <span className="break-all">{event.eventHash}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-sm leading-6 text-violet-800">
                    Este evento ainda não possui registro blockchain associado.
                  </p>
                )}
              </div>
            </div>
          </section>

          <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Identificador público
            </p>

            <p className="mt-2 break-all font-mono text-sm">{event.publicId}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}