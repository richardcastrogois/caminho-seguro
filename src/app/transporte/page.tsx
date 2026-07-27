import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TransportDashboard } from "@/features/transport-dashboard/transport-dashboard";
import { prisma } from "@/lib/prisma";
import { requireCurrentUser, requireUserInstitution } from "@/lib/session";
import { getSaoPauloDayRange } from "@/lib/time";
import type { TransportDashboardData } from "@/types/transport-dashboard";

export const metadata: Metadata = {
  title: "Painel de transporte",
  description: "Registro assistido de embarques e desembarques do Caminho Seguro.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function TransportPage() {
  const user = await requireCurrentUser(["TRANSPORT_MEMBER", "ADMIN"], "/transporte");
  const userInstitution = await requireUserInstitution(user, ["TRANSPORT"], "/transporte");
  const { start, end } = getSaoPauloDayRange();

  const transport = await prisma.institution.findUnique({
    where: { id: userInstitution.id },
    select: {
      name: true,
      transportRoutes: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
        take: 1,
        select: { id: true, name: true, vehiclePlate: true, driverName: true },
      },
      children: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
        select: {
          referenceCode: true,
          child: {
            select: {
              publicId: true,
              firstName: true,
              lastName: true,
              identifiers: {
                where: { type: "BLE", status: "ACTIVE" },
                take: 1,
                select: { label: true },
              },
              events: {
                where: {
                  institutionId: userInstitution.id,
                  type: { in: ["BUS_BOARDING", "DISEMBARKING_BUS"] },
                  occurredAt: { gte: start, lte: end },
                },
                orderBy: { occurredAt: "desc" },
                take: 1,
                select: { type: true, occurredAt: true },
              },
            },
          },
        },
      },
      events: {
        where: {
          type: { in: ["BUS_BOARDING", "DISEMBARKING_BUS"] },
          occurredAt: { gte: start, lte: end },
        },
        orderBy: { occurredAt: "desc" },
        take: 12,
        select: {
          publicId: true,
          type: true,
          occurredAt: true,
          locationLabel: true,
          child: { select: { firstName: true, lastName: true } },
        },
      },
    },
  });

  if (!transport) {
    notFound();
  }

  const route = transport.transportRoutes[0] ?? null;
  const dashboardData: TransportDashboardData = {
    institution: { name: transport.name },
    route: route
      ? {
          name: route.name,
          vehiclePlate: route.vehiclePlate,
          driverName: route.driverName,
        }
      : null,
    children: transport.children.map((relation) => {
      const event = relation.child.events[0] ?? null;

      return {
        publicId: relation.child.publicId,
        fullName: `${relation.child.firstName} ${relation.child.lastName}`,
        referenceCode: relation.referenceCode,
        identifierLabel: relation.child.identifiers[0]?.label ?? null,
        lastEventType:
          event?.type === "BUS_BOARDING" || event?.type === "DISEMBARKING_BUS"
            ? event.type
            : null,
        lastEventAt: event?.occurredAt.toISOString() ?? null,
      };
    }),
    recentEvents: transport.events.map((event) => ({
      publicId: event.publicId,
      type: event.type as "BUS_BOARDING" | "DISEMBARKING_BUS",
      occurredAt: event.occurredAt.toISOString(),
      childName: `${event.child.firstName} ${event.child.lastName}`,
      locationLabel: event.locationLabel,
    })),
  };

  return <TransportDashboard data={dashboardData} />;
}
