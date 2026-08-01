import type { Metadata } from "next";
import { ProtectionNetworkDashboard } from "@/features/protection-network/protection-network-dashboard";
import { requireCurrentUser, requireUserInstitution } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { ProtectionNetworkData } from "@/types/protection-network";

export const metadata: Metadata = {
  title: "Rede de proteÃ§Ã£o",
  description: "CoordenaÃ§Ã£o de instituiÃ§Ãµes e alertas autorizados do Caminho Seguro.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SeverityKey = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

function daysAgo(days: number): Date {
  const reference = new Date();
  reference.setDate(reference.getDate() - days);
  return reference;
}

export default async function ProtectionNetworkPage() {
  const user = await requireCurrentUser(
    ["ADMIN", "PUBLIC_AGENT", "INSTITUTION_MEMBER"],
    "/rede",
  );
  if (user.role === "INSTITUTION_MEMBER") {
    await requireUserInstitution(
      user,
      ["PROTECTION_AGENCY", "UBS", "CRAS", "NGO", "PARTNER_BUSINESS"],
      "/rede",
    );
  }

  const activeAlertSince = daysAgo(14);

  const [
    institutions,
    alerts,
    recentEvents,
    severityGroup,
    actedAlerts,
    eventsByType,
    institutionEventGroup,
  ] = await Promise.all([
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
      take: 24,
      select: {
        publicId: true,
        title: true,
        message: true,
        severity: true,
        status: true,
        createdAt: true,
        acknowledgedAt: true,
        resolvedAt: true,
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
    prisma.alert.groupBy({
      by: ["severity"],
      where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
      _count: { _all: true },
    }),
    prisma.alert.findMany({
      where: { acknowledgedAt: { not: null } },
      select: { createdAt: true, acknowledgedAt: true, resolvedAt: true },
    }),
    prisma.protectionEvent.groupBy({
      by: ["type"],
      where: { occurredAt: { gte: activeAlertSince } },
      _count: { _all: true },
    }),
    prisma.protectionEvent.groupBy({
      by: ["institutionId"],
      where: { occurredAt: { gte: activeAlertSince }, institutionId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const institutionNames = await prisma.institution.findMany({
    where: {
      id: { in: institutionEventGroup.map((item) => item.institutionId as string) },
    },
    select: { id: true, name: true },
  });

  const severityCounts: Record<SeverityKey, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };
  for (const item of severityGroup) {
    const key = item.severity as SeverityKey;
    if (key in severityCounts) {
      severityCounts[key] = item._count._all;
    }
  }

  const actedDurations: number[] = [];
  for (const alert of actedAlerts) {
    const resolvedAt = alert.resolvedAt?.getTime();
    const acknowledgedAt = alert.acknowledgedAt?.getTime();
    const createdAt = alert.createdAt.getTime();
    const end = resolvedAt ?? acknowledgedAt ?? null;
    if (end !== null && end >= createdAt) {
      actedDurations.push((end - createdAt) / 60000);
    }
  }
  const averageMinutes =
    actedDurations.length > 0
      ? actedDurations.reduce((total, value) => total + value, 0) / actedDurations.length
      : null;

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
      acknowledgedAt: alert.acknowledgedAt?.toISOString() ?? null,
      resolvedAt: alert.resolvedAt?.toISOString() ?? null,
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
    severityCounts,
    responseTime: {
      averageMinutes,
      actedCount: actedDurations.length,
    },
    eventsByType: eventsByType.map((item) => ({
      type: item.type,
      count: item._count._all,
    })),
    eventsByInstitution: institutionEventGroup.map((item) => {
      const name = institutionNames.find(
        (institution) => institution.id === item.institutionId,
      )?.name;
      return { name: name ?? "Sem vínculo", count: item._count._all };
    }),
  };

  return <ProtectionNetworkDashboard data={data} />;
}
