import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Building2, BusFront, HeartHandshake, ShieldCheck, Users } from "lucide-react";
import { demoProfiles, getDemoSession, type DemoProfileId } from "@/lib/demo-auth";

export const metadata: Metadata = {
  title: "Acesso de demonstracao",
  description: "Selecao de perfis ficticios para demonstrar o Caminho Seguro.",
};

const profileCards: Array<{
  id: DemoProfileId;
  title: string;
  description: string;
  icon: typeof Users;
}> = [
  {
    id: "guardian",
    title: "Responsavel",
    description: "Acompanha status, historico e alertas da crianca.",
    icon: Users,
  },
  {
    id: "school",
    title: "Escola",
    description: "Simula chegada por BLE e acompanha criancas esperadas.",
    icon: Building2,
  },
  {
    id: "transport",
    title: "Transporte",
    description: "Registra embarque e desembarque assistidos.",
    icon: BusFront,
  },
  {
    id: "network",
    title: "Rede",
    description: "Visualiza instituicoes, alertas autorizados e eventos.",
    icon: HeartHandshake,
  },
  {
    id: "admin",
    title: "Admin",
    description: "Gerencia identificadores protegidos da demonstracao.",
    icon: ShieldCheck,
  },
];

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    unauthorized?: string;
  }>;
};

function normalizeNextPath(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = normalizeNextPath(params.next);
  const session = await getDemoSession();

  if (session && params.unauthorized !== "1") {
    redirect(nextPath === "/" ? session.homePath : nextPath);
  }

  return (
    <main className="dashboard-page min-h-screen">
      <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--brand-600)">
            Acesso do MVP
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
            Escolha um perfil de demonstracao
          </h1>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            As contas abaixo simulam perfis autorizados para a banca testar o fluxo
            completo sem expor dados reais. A pagina publica do QR continua sem login.
          </p>
        </div>

        {params.unauthorized === "1" && (
          <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
            O perfil atual nao tem acesso a essa area. Selecione o perfil correto para
            continuar.
          </p>
        )}

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profileCards.map((profile) => {
            const Icon = profile.icon;
            const demoProfile = demoProfiles[profile.id];

            return (
              <form
                key={profile.id}
                action="/api/auth/demo-login"
                method="post"
                className="dashboard-panel rounded-[24px] border p-5 transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/10"
              >
                <input type="hidden" name="profileId" value={profile.id} />
                <input type="hidden" name="next" value={nextPath} />

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-5 text-xl font-semibold text-slate-950">
                  {profile.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {profile.description}
                </p>
                <p className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                  {demoProfile.name}
                </p>
                <button
                  type="submit"
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 via-cyan-600 to-emerald-600 px-4 font-semibold text-white transition hover:brightness-105"
                >
                  Entrar como {profile.title}
                </button>
              </form>
            );
          })}
        </div>
      </section>
    </main>
  );
}
