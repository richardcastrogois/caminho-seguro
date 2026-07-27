import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/features/auth/login-form";
import { getDemoSession, isDemoProfileId } from "@/lib/demo-auth";

export const metadata: Metadata = {
  title: "Acesso simulado",
  description: "Simulacao de privacidade por perfil para os paineis do Caminho Seguro.",
};

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    unauthorized?: string;
    profile?: string;
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
  const initialProfile = isDemoProfileId(params.profile) ? params.profile : undefined;
  const session = await getDemoSession();

  if (session && params.unauthorized !== "1" && !initialProfile) {
    redirect(nextPath === "/" ? session.homePath : nextPath);
  }

  return (
    <main className="dashboard-page min-h-screen">
      <section className="app-first-content mx-auto max-w-6xl px-5 pb-8 pt-6 sm:px-8 lg:px-10">
        <LoginForm nextPath={nextPath} unauthorized={params.unauthorized === "1"} initialProfile={initialProfile} />
      </section>
    </main>
  );
}
