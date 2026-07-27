import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
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
    <main className="app-surface min-h-screen">
      <GsapReveal>
        <section className="border-b border-slate-200 bg-white">
          <div className="app-first-content mx-auto grid min-h-[calc(100dvh-var(--app-nav-offset)-2.75rem)] max-w-7xl gap-8 px-4 pb-8 pt-8 sm:px-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:px-10 lg:pb-10">
            <div className="flex min-h-0 flex-col justify-center lg:sticky lg:top-[calc(var(--app-nav-offset)+2.75rem)]">
              <div
                data-gsap="hero"
                className="flex size-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-900/15"
              >
                <ShieldCheck className="size-7" />
              </div>

              <p
                data-gsap="hero"
                className="mt-5 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700"
              >
                Leitura pública do QR
              </p>

              <h1
                data-gsap="hero"
                className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl"
              >
                Você pode ajudar sem acessar dados pessoais da criança.
              </h1>

              <p data-gsap="hero" className="mt-4 max-w-xl text-base leading-7 text-slate-600">
                Escolha o que aconteceu e envie o alerta. O sistema não mostra nome,
                endereço, telefone, responsável ou dados médicos nesta página.
              </p>

              <div
                data-gsap="timeline"
                className="mt-5 max-w-xl rounded-[22px] border border-emerald-200 bg-emerald-50 p-4"
              >
                <p className="font-semibold text-emerald-950">
                  Permaneça em local visível e seguro
                </p>
                <p className="mt-2 text-sm leading-6 text-emerald-800">
                  Em risco imediato, procure autoridades ou serviços de emergência. A
                  localização é opcional e vem do aparelho de quem está ajudando.
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