"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, QrCode, School, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { simulateInstitutionalAction } from "./actions";

type SimResult = {
  ok: boolean;
  error?: string;
  event?: { id: string; publicId: string; type: string; status: string };
  blockchain?: {
    status: string;
    transactionHash: string | null;
    slot: string | null;
  } | null;
};

function ResultBlock({ result }: { result: SimResult | null }) {
  if (!result) return null;

  if (!result.ok) {
    return (
      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
        <XCircle className="mt-0.5 size-4 shrink-0" />
        <span>{result.error}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
      <div className="flex items-center gap-2 font-medium">
        <CheckCircle2 className="size-4 text-emerald-600" />
        Evento {result.event?.type} criado com sucesso
      </div>
      <div className="flex flex-col gap-1 text-emerald-800">
        <p>Status: {result.event?.status}</p>
        {result.blockchain && (
          <p>
            Blockchain: {result.blockchain.status}
            {result.blockchain.transactionHash && (
              <> - tx: {result.blockchain.transactionHash.slice(0, 8)}...</>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

export function HelpSimulator({ token }: { token: string }) {
  const [publicLoading, setPublicLoading] = useState(false);
  const [institutionalLoading, setInstitutionalLoading] = useState(false);
  const [publicResult, setPublicResult] = useState<SimResult | null>(null);
  const [institutionalResult, setInstitutionalResult] = useState<SimResult | null>(null);

  async function handlePublicSimulation() {
    setPublicLoading(true);
    setPublicResult(null);

    try {
      const response = await fetch("/api/public/help", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          token,
          situation: "CHILD_FOUND",
          latitude: null,
          longitude: null,
          locationAccuracy: null,
          notes: "Simulacao de leitura publica - demonstracao Caminho Seguro.",
        }),
      });

      const data = await response.json();

      if (response.ok && data.ok) {
        setPublicResult({
          ok: true,
          event: {
            id: data.event,
            publicId: data.event,
            type: "CHILD_FOUND",
            status: "VALIDATED",
          },
          blockchain: data.blockchain,
        });
      } else {
        setPublicResult({
          ok: false,
          error: data.error ?? "Erro ao simular leitura publica.",
        });
      }
    } catch {
      setPublicResult({
        ok: false,
        error: "Erro de conexao ao simular leitura publica.",
      });
    } finally {
      setPublicLoading(false);
    }
  }

  async function handleInstitutionalSimulation() {
    setInstitutionalLoading(true);
    setInstitutionalResult(null);

    try {
      const result = await simulateInstitutionalAction();
      setInstitutionalResult(result as SimResult);
    } finally {
      setInstitutionalLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
      <Card className="overflow-hidden rounded-3xl border-sky-100 bg-white/90 shadow-xl shadow-sky-950/5">
        <CardHeader className="gap-3 p-5 sm:p-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
            <QrCode className="size-7" />
          </div>
          <CardTitle className="text-2xl text-slate-950">Leitura Publica</CardTitle>
          <CardDescription className="text-base leading-7">
            Simula um cidadao escaneando o QR Code da pulseira e registrando que encontrou
            a crianca. Nao precisa de login.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <Button
            onClick={handlePublicSimulation}
            disabled={publicLoading}
            size="lg"
            className="h-14 w-full rounded-2xl bg-linear-to-r from-sky-600 to-cyan-600 text-base text-white hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {publicLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Simulando...
              </>
            ) : (
              <>
                <QrCode className="size-5" />
                Simular Leitura Publica
              </>
            )}
          </Button>

          <ResultBlock result={publicResult} />
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-3xl border-emerald-100 bg-white/90 shadow-xl shadow-emerald-950/5">
        <CardHeader className="gap-3 p-5 sm:p-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <School className="size-7" />
          </div>
          <CardTitle className="text-2xl text-slate-950">Leitura Institucional</CardTitle>
          <CardDescription className="text-base leading-7">
            Simula, a partir do admin da demo, um registro institucional de chegada
            escolar para testar o fluxo completo.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <Button
            onClick={handleInstitutionalSimulation}
            disabled={institutionalLoading}
            size="lg"
            className="h-14 w-full rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 text-base text-white hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {institutionalLoading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                Simulando...
              </>
            ) : (
              <>
                <School className="size-5" />
                Simular Leitura Institucional
              </>
            )}
          </Button>

          <ResultBlock result={institutionalResult} />
        </CardContent>
      </Card>
    </div>
  );
}
