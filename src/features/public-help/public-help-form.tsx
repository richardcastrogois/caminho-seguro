"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  LocateFixed,
  MapPin,
  Search,
  ShieldAlert,
} from "lucide-react";

type Situation = "HELP_REQUEST" | "CHILD_FOUND" | "CHILD_AT_RISK" | "MEDICAL_HELP";

type LocationState = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type PublicHelpFormProps = {
  token: string;
};

const situations: Array<{
  value: Situation;
  title: string;
  description: string;
  icon: typeof ShieldAlert;
}> = [
  {
    value: "HELP_REQUEST",
    title: "A criança pediu ajuda",
    description: "Use quando a criança se aproximou e informou que precisa de ajuda.",
    icon: ShieldAlert,
  },
  {
    value: "CHILD_FOUND",
    title: "Encontrei uma criança perdida",
    description: "Use quando a criança aparenta estar desacompanhada ou não sabe voltar.",
    icon: Search,
  },
  {
    value: "CHILD_AT_RISK",
    title: "A criança parece estar em risco",
    description: "Use quando houver comportamento, pessoa ou situação que gere preocupação.",
    icon: AlertTriangle,
  },
  {
    value: "MEDICAL_HELP",
    title: "A criança precisa de atendimento",
    description: "Use quando houver mal-estar, machucado ou necessidade aparente de cuidado.",
    icon: HeartPulse,
  },
];

export function PublicHelpForm({ token }: PublicHelpFormProps) {
  const [situation, setSituation] = useState<Situation | null>(null);
  const [location, setLocation] = useState<LocationState | null>(null);
  const [locationMessage, setLocationMessage] = useState(
    "A localização ainda não foi compartilhada.",
  );
  const [notes, setNotes] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successReference, setSuccessReference] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function requestLocation() {
    setErrorMessage(null);

    if (!("geolocation" in navigator)) {
      setLocationMessage(
        "Este dispositivo não oferece suporte ao compartilhamento de localização.",
      );
      return;
    }

    setIsLocating(true);
    setLocationMessage("Obtendo a localização deste aparelho...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        setLocationMessage(
          `Localização compartilhada com precisão aproximada de ${Math.round(
            position.coords.accuracy,
          )} metros.`,
        );

        setIsLocating(false);
      },
      () => {
        setLocation(null);
        setLocationMessage(
          "A localização não foi autorizada. Você ainda pode enviar o alerta.",
        );
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 30000,
      },
    );
  }

  async function submitAlert() {
    if (!situation) {
      setErrorMessage("Selecione o que está acontecendo.");
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/public/help", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          situation,
          latitude: location?.latitude ?? null,
          longitude: location?.longitude ?? null,
          locationAccuracy: location?.accuracy ?? null,
          notes,
        }),
      });

      const data: unknown = await response.json();

      if (
        !response.ok ||
        typeof data !== "object" ||
        data === null ||
        !("ok" in data) ||
        data.ok !== true
      ) {
        const message =
          typeof data === "object" &&
          data !== null &&
          "error" in data &&
          typeof data.error === "string"
            ? data.error
            : "Não foi possível registrar o alerta.";

        throw new Error(message);
      }

      const reference =
        "reference" in data && typeof data.reference === "string"
          ? data.reference
          : "registrado";

      setSuccessReference(reference);
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error ? error.message : "Não foi possível registrar o alerta.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (successReference) {
    return (
      <div
        data-gsap="card"
        className="dashboard-panel motion-card rounded-[24px] border border-emerald-200 bg-white p-6 text-center shadow-xl shadow-emerald-950/5 sm:p-8"
      >
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="size-7" />
        </div>

        <h2 className="mt-4 text-2xl font-semibold text-slate-950">Alerta registrado</h2>

        <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">
          A rede de proteção e os responsáveis autorizados poderão visualizar este evento.
          Permaneça com a criança em um local seguro quando isso for possível.
        </p>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            Referência do alerta
          </p>

          <p className="mt-2 break-all font-mono text-sm text-slate-800">
            {successReference}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      data-gsap="card"
      className="dashboard-panel motion-card rounded-[24px] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-950/5 sm:p-5"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-(--brand-600) sm:text-sm">
          Informe a situação
        </p>

        <h2 className="mt-1 text-2xl font-semibold text-slate-950">
          O que está acontecendo?
        </h2>

        <p className="mt-1 leading-6 text-slate-600">
          Nenhum dado pessoal da criança será exibido nesta página.
        </p>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {situations.map((item) => {
          const Icon = item.icon;
          const isSelected = situation === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setSituation(item.value)}
              className={`flex h-full w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
                isSelected
                  ? "border-sky-500 bg-sky-50 ring-2 ring-sky-100"
                  : "border-slate-200 bg-white hover:border-sky-200 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-2xl ${
                  isSelected ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"
                }`}
              >
                <Icon className="size-4" />
              </span>

              <span>
                <span className="block font-semibold leading-5 text-slate-950">{item.title}</span>

                <span className="mt-1 block text-sm leading-5 text-slate-600">
                  {item.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 size-5 shrink-0 text-sky-700" />

            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-950">Localização</p>

              <p className="mt-1 text-sm leading-5 text-slate-600">{locationMessage}</p>

              <button
                type="button"
                onClick={requestLocation}
                disabled={isLocating}
                className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LocateFixed className="size-4" />
                {isLocating
                  ? "Obtendo..."
                  : location
                    ? "Atualizar"
                    : "Compartilhar"}
              </button>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="help-notes" className="text-sm font-semibold text-slate-900">
            Observação opcional
          </label>

          <textarea
            id="help-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={500}
            rows={3}
            placeholder="Exemplo: a criança informou que se perdeu ao voltar da escola."
            className="mt-2 h-[7.5rem] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 lg:h-[8.25rem]"
          />

          <p className="mt-1 text-right text-xs text-slate-400">{notes.length}/500</p>
        </div>
      </div>

      {errorMessage && (
        <div
          className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <button
        type="button"
        onClick={submitAlert}
        disabled={isSubmitting}
        className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-(--brand-600) px-5 py-3 font-semibold text-white shadow-lg shadow-sky-900/15 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Enviando alerta..." : "Confirmar e enviar alerta"}
      </button>

      <p className="mt-2 text-center text-xs leading-5 text-slate-500">
        O envio registra horário, situação e localização apenas quando autorizada.
      </p>
    </div>
  );
}