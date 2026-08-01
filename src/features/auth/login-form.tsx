"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  BusFront,
  HeartHandshake,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DemoProfileId } from "@/lib/demo-auth";
import { cn } from "@/lib/utils";

const profiles: Array<{
  id: DemoProfileId;
  label: string;
  email: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    id: "guardian",
    label: "Familia",
    email: "ana.responsavel@caminhoseguro.demo",
    description: "Acompanha apenas eventos e alertas da crianca vinculada.",
    icon: Users,
  },
  {
    id: "school",
    label: "Escola",
    email: "operador.escola@caminhoseguro.demo",
    description: "Registra chegada institucional e ve criancas esperadas.",
    icon: Building2,
  },
  {
    id: "transport",
    label: "Transporte",
    email: "operador.transporte@caminhoseguro.demo",
    description: "Registra embarque e desembarque da rota.",
    icon: BusFront,
  },
  {
    id: "network",
    label: "Rede",
    email: "rede.protecao@caminhoseguro.demo",
    description: "Coordena alertas e instituicoes da rede de protecao.",
    icon: HeartHandshake,
  },
  {
    id: "admin",
    label: "Admin",
    email: "admin@caminhoseguro.demo",
    description: "Gerencia cadastros, vinculos e identificadores protegidos.",
    icon: ShieldCheck,
  },
];

type LoginFormProps = {
  nextPath: string;
  unauthorized: boolean;
  initialProfile?: DemoProfileId;
};

export function LoginForm({ nextPath, unauthorized, initialProfile }: LoginFormProps) {
  const [selected, setSelected] = useState(
    profiles.find((profile) => profile.id === initialProfile) ?? profiles[0],
  );

  return (
    <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
      <Card className="rounded-3xl border-sky-100 bg-white/90 shadow-xl shadow-sky-950/5">
        <CardHeader className="gap-3 p-5 sm:p-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <ShieldCheck />
          </div>
          <CardTitle className="text-2xl tracking-tight text-slate-950 sm:text-3xl">
            Simular acesso privado
          </CardTitle>
          <CardDescription className="text-base leading-7">
            Escolha um papel para mostrar que cada ator ve apenas a parte necessaria do
            Caminho Seguro. O QR publico continua aberto, sem login e sem dados pessoais.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0 sm:p-6 sm:pt-0">
          <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-4 text-sm leading-6 text-slate-700">
            Esta tela nao autentica pessoas reais. Ela troca o personagem da demonstracao
            e grava apenas uma sessao demo temporaria no navegador.
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-3xl border-emerald-100 bg-white/90 shadow-xl shadow-emerald-950/5">
        <form action="/api/auth/demo-login" method="post">
          <input type="hidden" name="profileId" value={selected.id} />
          <input type="hidden" name="next" value={nextPath} />

          <CardHeader className="gap-1 p-5 pb-3 sm:p-6 sm:pb-3">
            <CardTitle className="text-2xl text-slate-950">
              Perfil da demonstracao
            </CardTitle>
            <CardDescription>
              Selecione um papel e entre direto na tela privada correspondente.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 p-5 pt-0 sm:p-6 sm:pt-0">
            {unauthorized && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
                O perfil atual nao acessa a area escolhida. Troque para o papel correto.
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {profiles.map((profile) => {
                const Icon = profile.icon;
                const active = selected.id === profile.id;

                return (
                  <Button
                    key={profile.id}
                    type="button"
                    variant="outline"
                    onClick={() => setSelected(profile)}
                    className={cn(
                      "h-auto min-w-0 justify-start rounded-2xl p-3 text-left transition",
                      active
                        ? "border-emerald-300 bg-emerald-50 shadow-md shadow-emerald-950/10"
                        : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50",
                    )}
                  >
                    <span className="flex min-w-0 items-start gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                        <Icon />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold text-slate-950">
                          {profile.label}
                        </span>
                        <span className="block truncate text-xs text-slate-500">
                          {profile.email}
                        </span>
                        <span className="mt-2 block whitespace-normal text-sm leading-5 text-slate-600">
                          {profile.description}
                        </span>
                      </span>
                    </span>
                  </Button>
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="border-t border-slate-100 p-5 sm:p-6">
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-2xl bg-linear-to-r from-sky-600 via-cyan-600 to-emerald-600 text-white hover:brightness-105"
            >
              Entrar como {selected.label}
              <ArrowRight data-icon="inline-end" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
