import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  GuardianDashboard,
  type GuardianDashboardData,
} from "@/features/guardian-dashboard/guardian-dashboard";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Painel do responsável",
  description: "Acompanhamento de eventos e alertas da rede Caminho Seguro.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_GUARDIAN_EMAIL = "ana.responsavel@caminhoseguro.demo";

export default async function GuardianPage() {
  const guardian = await prisma.guardian.findFirst({
    where: {
      user: {
        email: DEMO_GUARDIAN_EMAIL,
      },
    },
    select: {
      user: {
        select: {
          name: true,
        },
      },
      children: {
        where: {
          isPrimary: true,
        },
        take: 1,
        select: {
          child: {
            select: {
              publicId: true,
              firstName: true,
              lastName: true,
              status: true,
              events: {
                orderBy: {
                  occurredAt: "desc",
                },
                take: 10,
                select: {
                  publicId: true,
                  type: true,
                  source: true,
                  severity: true,
                  status: true,
                  occurredAt: true,
                  locationLabel: true,
                  latitude: true,
                  longitude: true,
                  notes: true,
                  institution: {
                    select: {
                      name: true,
                    },
                  },
                  blockchainRecord: {
                    select: {
                      status: true,
                      transactionHash: true,
                      slot: true,
                      eventHash: true,
                    },
                  },
                },
              },
              alerts: {
                orderBy: {
                  createdAt: "desc",
                },
                take: 10,
                select: {
                  publicId: true,
                  type: true,
                  severity: true,
                  status: true,
                  title: true,
                  message: true,
                  createdAt: true,
                  acknowledgedAt: true,
                  resolvedAt: true,
                  institution: {
                    select: {
                      name: true,
                    },
                  },
                  event: {
                    select: {
                      publicId: true,
                      type: true,
                      source: true,
                      severity: true,
                      status: true,
                      occurredAt: true,
                      latitude: true,
                      longitude: true,
                      locationLabel: true,
                      notes: true,
                      institution: {
                        select: {
                          name: true,
                        },
                      },
                      blockchainRecord: {
                        select: {
                          status: true,
                          transactionHash: true,
                          slot: true,
                          eventHash: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const childRelation = guardian?.children[0];

  if (!guardian || !childRelation) {
    notFound();
  }

  const child = childRelation.child;

  const dashboardData: GuardianDashboardData = {
    guardianName: guardian.user.name,
    child: {
      publicId: child.publicId,
      firstName: child.firstName,
      lastName: child.lastName,
      status: child.status,
    },
    events: child.events.map((event) => ({
      publicId: event.publicId,
      type: event.type,
      source: event.source,
      severity: event.severity,
      status: event.status,
      occurredAt: event.occurredAt.toISOString(),
      locationLabel: event.locationLabel,
      latitude: event.latitude !== null ? Number(event.latitude) : null,
      longitude: event.longitude !== null ? Number(event.longitude) : null,
      notes: event.notes,
      institutionName: event.institution?.name ?? null,
      blockchainStatus: event.blockchainRecord?.status ?? null,
      transactionHash: event.blockchainRecord?.transactionHash ?? null,
      slot: event.blockchainRecord?.slot?.toString() ?? null,
      eventHash: event.blockchainRecord?.eventHash ?? null,
    })),
    alerts: child.alerts.map((alert) => ({
      publicId: alert.publicId,
      type: alert.type,
      severity: alert.severity,
      status: alert.status,
      title: alert.title,
      message: alert.message,
      createdAt: alert.createdAt.toISOString(),
      acknowledgedAt: alert.acknowledgedAt?.toISOString() ?? null,
      resolvedAt: alert.resolvedAt?.toISOString() ?? null,
      institutionName: alert.institution?.name ?? null,
      event: alert.event
        ? {
            publicId: alert.event.publicId,
            type: alert.event.type,
            source: alert.event.source,
            severity: alert.event.severity,
            status: alert.event.status,
            occurredAt: alert.event.occurredAt.toISOString(),
            latitude: alert.event.latitude !== null ? Number(alert.event.latitude) : null,
            longitude:
              alert.event.longitude !== null ? Number(alert.event.longitude) : null,
            locationLabel: alert.event.locationLabel,
            notes: alert.event.notes,
            institutionName: alert.event.institution?.name ?? null,
            blockchainStatus: alert.event.blockchainRecord?.status ?? null,
            transactionHash: alert.event.blockchainRecord?.transactionHash ?? null,
            slot: alert.event.blockchainRecord?.slot?.toString() ?? null,
            eventHash: alert.event.blockchainRecord?.eventHash ?? null,
          }
        : null,
    })),
  };

  return <GuardianDashboard data={dashboardData} />;
}
