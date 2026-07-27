import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SchoolDashboard } from "@/features/school-dashboard/school-dashboard";
import { prisma } from "@/lib/prisma";
import { requireDemoSession } from "@/lib/demo-auth";
import { getSaoPauloDayRange } from "@/lib/time";
import type { SchoolDashboardData } from "@/types/school-dashboard";

export const metadata: Metadata = {
  title: "Painel da escola",
  description: "Monitoramento institucional de chegadas e eventos do Caminho Seguro.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_SCHOOL_PUBLIC_ID = "instituicao-demo-escola";

export default async function SchoolPage() {
  await requireDemoSession(["school", "admin"], "/escola");

  const { start, end } = getSaoPauloDayRange();

  const institution = await prisma.institution.findUnique({
    where: {
      publicId: DEMO_SCHOOL_PUBLIC_ID,
    },
    select: {
      publicId: true,
      name: true,
      address: true,
      identifiers: {
        where: {
          type: "BLE",
        },
        orderBy: {
          createdAt: "asc",
        },
        take: 1,
        select: {
          publicToken: true,
          name: true,
          status: true,
          lastSeenAt: true,
        },
      },
      children: {
        where: {
          active: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          referenceCode: true,
          child: {
            select: {
              publicId: true,
              firstName: true,
              lastName: true,
              identifiers: {
                where: {
                  type: "BLE",
                  status: "ACTIVE",
                },
                take: 1,
                select: {
                  label: true,
                },
              },
              events: {
                where: {
                  institution: {
                    publicId: DEMO_SCHOOL_PUBLIC_ID,
                  },
                  type: "SCHOOL_ARRIVAL",
                  occurredAt: {
                    gte: start,
                    lte: end,
                  },
                },
                orderBy: {
                  occurredAt: "desc",
                },
                take: 1,
                select: {
                  publicId: true,
                  occurredAt: true,
                },
              },
            },
          },
        },
      },
      events: {
        where: {
          occurredAt: {
            gte: start,
            lte: end,
          },
        },
        orderBy: {
          occurredAt: "desc",
        },
        take: 12,
        select: {
          publicId: true,
          type: true,
          source: true,
          status: true,
          severity: true,
          occurredAt: true,
          locationLabel: true,
          child: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          blockchainRecord: {
            select: {
              status: true,
            },
          },
        },
      },
      alerts: {
        orderBy: {
          createdAt: "desc",
        },
        take: 8,
        select: {
          publicId: true,
          title: true,
          message: true,
          severity: true,
          status: true,
          createdAt: true,
        },
      },
    },
  });

  if (!institution) {
    notFound();
  }

  const children = institution.children.map((relation) => {
    const arrivalEvent = relation.child.events[0] ?? null;
    const bleIdentifier = relation.child.identifiers[0] ?? null;

    return {
      publicId: relation.child.publicId,
      firstName: relation.child.firstName,
      lastName: relation.child.lastName,
      referenceCode: relation.referenceCode,
      identifierLabel: bleIdentifier?.label ?? null,
      detected: arrivalEvent !== null,
      arrivalTime: arrivalEvent?.occurredAt.toISOString() ?? null,
      arrivalEventPublicId: arrivalEvent?.publicId ?? null,
    };
  });

  const detectedChildren = children.filter((child) => child.detected).length;

  const activeAlerts = institution.alerts.filter(
    (alert) => alert.status === "OPEN" || alert.status === "ACKNOWLEDGED",
  ).length;

  const dashboardData: SchoolDashboardData = {
    institution: {
      publicId: institution.publicId,
      name: institution.name,
      address: institution.address,
    },
    gateway: institution.identifiers[0]
      ? {
          publicToken: institution.identifiers[0].publicToken,
          name: institution.identifiers[0].name,
          status: institution.identifiers[0].status,
          lastSeenAt: institution.identifiers[0].lastSeenAt?.toISOString() ?? null,
        }
      : null,
    summary: {
      expectedChildren: children.length,
      detectedChildren,
      pendingChildren: children.length - detectedChildren,
      activeAlerts,
    },
    children,
    recentEvents: institution.events.map((event) => ({
      publicId: event.publicId,
      type: event.type,
      source: event.source,
      status: event.status,
      severity: event.severity,
      occurredAt: event.occurredAt.toISOString(),
      childName: `${event.child.firstName} ${event.child.lastName}`,
      locationLabel: event.locationLabel,
      blockchainStatus: event.blockchainRecord?.status ?? null,
    })),
    alerts: institution.alerts.map((alert) => ({
      publicId: alert.publicId,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      status: alert.status,
      createdAt: alert.createdAt.toISOString(),
    })),
  };

  return <SchoolDashboard data={dashboardData} />;
}
