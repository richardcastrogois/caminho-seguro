"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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

      const result = data as unknown as { token: string; user: { name: string; role: string } };

      localStorage.setItem("token", result.token);
      localStorage.setItem("userName", result.user.name);
      localStorage.setItem("userRole", result.user.role);

      router.push("/responsavel");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <BrandLogo />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Acessar plataforma
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Use suas credenciais institucionais
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8"
        >
          <div>
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-900"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              autoComplete="email"
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-900"
            >
              Senha
            </label>

            <div className="relative mt-2">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                autoComplete="current-password"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-11 text-base text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div
              className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-(--brand-600) px-5 py-3.5 font-semibold text-white shadow-lg shadow-sky-900/15 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                Entrar
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50 p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sky-700" />

              <div>
                <p className="font-semibold text-sky-950">Contas de demonstração</p>

                <p className="mt-1 text-xs leading-5 text-sky-800">
                  <strong>Responsável:</strong> ana.responsavel@caminhoseguro.demo
                </p>

                <p className="text-xs leading-5 text-sky-800">
                  <strong>Escola:</strong> operador.escola@caminhoseguro.demo
                </p>

                <p className="text-xs leading-5 text-sky-800">
                  <strong>Senha:</strong> 123456
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
