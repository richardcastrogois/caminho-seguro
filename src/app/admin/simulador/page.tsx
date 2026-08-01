import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GsapReveal } from "@/components/shared/gsap-reveal";
import { HelpSimulator } from "@/features/demo/help-simulator";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Simular leitura do QR",
  description: "Simulador de leitura do QR Code para demonstração do Caminho Seguro.",
};

export default async function AdminSimuladorPage() {
  await requireCurrentUser(["ADMIN"], "/admin/simulador");

  const identifier = await prisma.childIdentifier.findFirst({
    where: {
      type: "QR_CODE",
      status: "ACTIVE",
      child: { publicId: "crianca-demo-maria" },
    },
    select: { publicToken: true },
  });

  if (!identifier) {
    notFound();
  }

  return (
    <GsapReveal>
      <main className="dashboard-page min-h-screen">
        <section className="dashboard-header border-b border-sky-100">
          <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-(--brand-600)">
              Administração de demonstração
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
              Simular leitura do QR Code
            </h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Dispare eventos reais com registro em blockchain para testar os fluxos da
              plataforma.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
          <HelpSimulator token={identifier.publicToken} />
        </section>
      </main>
    </GsapReveal>
  );
}
