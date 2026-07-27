import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin-dashboard/admin-dashboard";
import { prisma } from "@/lib/prisma";
import type { AdminDashboardData } from "@/types/admin-dashboard";

export const metadata: Metadata = {
  title: "Administração da demonstração",
  description: "Consulta e gestão controlada de identificadores do Caminho Seguro.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_CHILD_PUBLIC_ID = "crianca-demo-maria";

export default async function AdminPage() {
  const [child, institutions] = await Promise.all([
    prisma.child.findUnique({
      where: { publicId: DEMO_CHILD_PUBLIC_ID },
      select: {
        publicId: true,
        firstName: true,
        lastName: true,
        guardians: {
          where: { isPrimary: true },
          take: 1,
          select: { guardian: { select: { user: { select: { name: true } } } } },
        },
        identifiers: {
          orderBy: { issuedAt: "desc" },
          select: {
            publicToken: true,
            type: true,
            status: true,
            label: true,
            issuedAt: true,
            lastSeenAt: true,
          },
        },
      },
    }),
    prisma.institution.findMany({
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: { publicId: true, name: true, type: true, active: true },
    }),
  ]);

  const data: AdminDashboardData = {
    child: child
      ? {
          publicId: child.publicId,
          fullName: `${child.firstName} ${child.lastName}`,
          guardianName: child.guardians[0]?.guardian.user.name ?? null,
          identifiers: child.identifiers.map((identifier) => ({
            publicToken: identifier.publicToken,
            type: identifier.type,
            status: identifier.status,
            label: identifier.label,
            issuedAt: identifier.issuedAt.toISOString(),
            lastSeenAt: identifier.lastSeenAt?.toISOString() ?? null,
          })),
        }
      : null,
    institutions,
  };

  return <AdminDashboard data={data} />;
}
