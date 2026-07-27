import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AppNavigation } from "@/components/shared/app-navigation";
import { GsapReveal } from "@/components/shared/gsap-reveal";
import { PublicHelpForm } from "@/features/public-help/public-help-form";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PublicHelpPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function PublicHelpPage({ params }: PublicHelpPageProps) {
  const { token } = await params;

  const identifier = await prisma.childIdentifier.findFirst({
    where: {
      publicToken: token,
      status: "ACTIVE",
      type: "QR_CODE",
    },
    select: {
      id: true,
    },
  });

  if (!identifier) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <GsapReveal>
        <div data-gsap="nav">
          <AppNavigation badge="Identidade protegida" />
        </div>

        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-10 lg:py-12">
            <div className="flex flex-col justify-center">
              <div data-gsap="hero" className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15">
                <ShieldCheck className="h-7 w-7" />
              </div>

              <p data-gsap="hero" className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Leitura pública do QR
              </p>

              <h1 data-gsap="hero" className="mt-3 text-4xl font-semibold leading-tight tracking-tight text-slate-950">
                Você pode ajudar sem acessar dados pessoais da criança.
              </h1>

              <p data-gsap="hero" className="mt-5 text-lg leading-8 text-slate-600">
                Escolha o que aconteceu e envie o alerta. O sistema não mostra nome, endereço, telefone, responsável ou dados médicos nesta página.
              </p>

              <div data-gsap="timeline" className="mt-7 rounded-[22px] border border-emerald-200 bg-emerald-50 p-5">
                <p className="font-semibold text-emerald-950">Permaneça em local visível e seguro</p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  Em risco imediato, procure autoridades ou serviços de emergência. A localização é opcional e vem do aparelho de quem está ajudando.
                </p>
              </div>
            </div>

            <PublicHelpForm token={token} />
          </div>
        </section>
      </GsapReveal>
    </main>
  );
}
