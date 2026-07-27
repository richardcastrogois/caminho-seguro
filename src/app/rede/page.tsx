import type { Metadata } from "next";
import { ProtectionNetworkDashboard } from "@/features/protection-network/protection-network-dashboard";
import { prisma } from "@/lib/prisma";
import type { ProtectionNetworkData } from "@/types/protection-network";

export const metadata: Metadata = {
  title: "Rede de proteção",
  description: "Coordenação de instituições e alertas autorizados do Caminho Seguro.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProtectionNetworkPage() {
  const [institutions, alerts, recentEvents] = await Promise.all([
    prisma.institution.findMany({
      where: { active: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: { publicId: true, name: true, type: true, address: true, active: true },
    }),
    prisma.alert.findMany({
      where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 16,
      select: {
        publicId: true,
        title: true,
        message: true,
        severity: true,
        status: true,
        createdAt: true,
        institution: { select: { name: true } },
      },
    }),
    prisma.protectionEvent.findMany({
      orderBy: { occurredAt: "desc" },
      take: 16,
      select: {
        publicId: true,
        type: true,
        severity: true,
        occurredAt: true,
        institution: { select: { name: true } },
      },
    }),
  ]);

  const data: ProtectionNetworkData = {
    institutions,
    alerts: alerts.map((alert) => ({
      publicId: alert.publicId,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      status: alert.status,
      createdAt: alert.createdAt.toISOString(),
      institutionName: alert.institution?.name ?? null,
    })),
    recentEvents: recentEvents.map((event) => ({
      publicId: event.publicId,
      type: event.type,
      severity: event.severity,
      occurredAt: event.occurredAt.toISOString(),
      institutionName: event.institution?.name ?? null,
    })),
  };

  return <ProtectionNetworkDashboard data={data} />;
}
