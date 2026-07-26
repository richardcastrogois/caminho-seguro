import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
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
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 sm:px-8">
          <BrandLogo />

          <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Identidade protegida
          </span>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
          <div className="absolute -right-20 top-24 h-72 w-72 rounded-full bg-emerald-200/35 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-5xl gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-900/20">
              <ShieldCheck className="h-7 w-7" />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-sky-700">
              Caminho Seguro
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-slate-950">
              Você está ajudando uma criança protegida.
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              Selecione a situação e envie o alerta. O sistema não exibirá nome, endereço,
              responsável ou qualquer outro dado pessoal da criança.
            </p>

            <div className="mt-7 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="font-semibold text-emerald-950">
                Permaneça em um local visível e seguro
              </p>

              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Evite deslocar a criança sem necessidade. Em risco imediato, procure apoio
                de autoridades ou serviços de emergência.
              </p>
            </div>
          </div>

          <PublicHelpForm token={token} />
        </div>
      </section>
    </main>
  );
}
