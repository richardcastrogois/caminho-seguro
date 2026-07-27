import type { Metadata } from "next";
import { ProtectionNetworkDashboard } from "@/features/protection-network/protection-network-dashboard";
import { requireDemoSession } from "@/lib/demo-auth";
import { prisma } from "@/lib/prisma";
import type { ProtectionNetworkData } from "@/types/protection-network";

export const metadata: Metadata = {
  title: "Rede de proteção",
  description: "Coordenação de instituições e alertas autorizados do Caminho Seguro.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function ProtectionNetworkPage() {
  await requireDemoSession(["network", "admin"], "/rede");

  const [institutions, alerts, recentEvents] = await Promise.all([
    prisma.institution.findMany({
      where: { active: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: {
        publicId: true,
        name: true,
        type: true,
        address: true,
        latitude: true,
        longitude: true,
        active: true,
      },
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
        event: { select: { latitude: true, longitude: true, locationLabel: true } },
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
        latitude: true,
        longitude: true,
        locationLabel: true,
        institution: { select: { name: true } },
      },
    }),
  ]);

  const data: ProtectionNetworkData = {
    institutions: institutions.map((institution) => ({
      publicId: institution.publicId,
      name: institution.name,
      type: institution.type,
      address: institution.address,
      latitude: institution.latitude !== null ? Number(institution.latitude) : null,
      longitude: institution.longitude !== null ? Number(institution.longitude) : null,
      active: institution.active,
    })),
    alerts: alerts.map((alert) => ({
      publicId: alert.publicId,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      status: alert.status,
      createdAt: alert.createdAt.toISOString(),
      institutionName: alert.institution?.name ?? null,
      latitude:
        alert.event?.latitude !== null && alert.event?.latitude !== undefined
          ? Number(alert.event.latitude)
          : null,
      longitude:
        alert.event?.longitude !== null && alert.event?.longitude !== undefined
          ? Number(alert.event.longitude)
          : null,
      locationLabel: alert.event?.locationLabel ?? null,
    })),
    recentEvents: recentEvents.map((event) => ({
      publicId: event.publicId,
      type: event.type,
      severity: event.severity,
      occurredAt: event.occurredAt.toISOString(),
      institutionName: event.institution?.name ?? null,
      latitude: event.latitude !== null ? Number(event.latitude) : null,
      longitude: event.longitude !== null ? Number(event.longitude) : null,
      locationLabel: event.locationLabel,
    })),
  };

  return <ProtectionNetworkDashboard data={data} />;
}
