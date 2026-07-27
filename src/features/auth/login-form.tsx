"use client";

import { useState } from "react";
import {
  ArrowRight,
  Building2,
  BusFront,
  HeartHandshake,
  Loader2,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { DemoProfileId } from "@/lib/demo-auth";
import { setAuthToken } from "@/lib/auth-fetch";
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

const rolePaths: Record<string, string> = {
  GUARDIAN: "/responsavel",
  INSTITUTION_MEMBER: "/escola",
  TRANSPORT_MEMBER: "/transporte",
  PUBLIC_AGENT: "/rede",
  ADMIN: "/admin",
};

type LoginFormProps = {
  nextPath: string;
  unauthorized: boolean;
  initialProfile?: DemoProfileId;
};

export function LoginForm({ nextPath, unauthorized, initialProfile }: LoginFormProps) {
  const [selected, setSelected] = useState(
    profiles.find((profile) => profile.id === initialProfile) ?? profiles[0],
  );
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: selected.email, password }),
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
            : "Erro ao fazer login";
        throw new Error(message);
      }

      const result = data as unknown as {
        token: string;
        user: { name: string; role: string };
      };

      setAuthToken(result.token);
      const homePath = rolePaths[result.user.role] ?? "/";
      const finalPath = nextPath && nextPath !== "/" ? nextPath : homePath;

      window.location.href = finalPath;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

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
            Esta tela nao autentica pessoas reais. Ela simula privacidade por perfil para
            demonstrar o produto no hackathon sem criar atrito durante a avaliacao.
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-3xl border-emerald-100 bg-white/90 shadow-xl shadow-emerald-950/5">
        <form onSubmit={handleSubmit}>
          <CardHeader className="gap-1 p-5 pb-3 sm:p-6 sm:pb-3">
            <CardTitle className="text-2xl text-slate-950">
              Login de demonstracao
            </CardTitle>
            <CardDescription>
              Use o cartao para alternar o perfil antes de entrar na tela privada.
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-4 p-5 pt-0 sm:p-6 sm:pt-0">
            {unauthorized && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
                Esse perfil nao acessa a area escolhida. Selecione o perfil correto
                abaixo.
              </div>
            )}

            {error && (
              <div
                className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-900"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="email">E-mail do perfil</Label>
                <Input
                  id="email"
                  value={selected.email}
                  readOnly
                  className="h-11 min-w-0 rounded-2xl bg-slate-50"
                />
              </div>

              <div className="flex min-w-0 flex-col gap-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  required
                  className="h-11 min-w-0 rounded-2xl"
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {profiles.map((profile) => {
                const Icon = profile.icon;
                const active = selected.id === profile.id;

                return (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => setSelected(profile)}
                    className={cn(
                      "min-w-0 rounded-2xl border p-3 text-left transition",
                      active
                        ? "border-emerald-300 bg-emerald-50 shadow-md shadow-emerald-950/10"
                        : "border-slate-200 bg-white hover:border-sky-200 hover:bg-sky-50",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-3">
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
                      </span>
                    </span>
                    <span className="mt-3 block text-sm leading-5 text-slate-600">
                      {profile.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>

          <CardFooter className="border-t border-slate-100 p-5 sm:p-6">
            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="h-12 w-full rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 text-white hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar como {selected.label}
                  <ArrowRight data-icon="inline-end" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
