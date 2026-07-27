import type { Metadata } from "next";
import { AdminDashboard } from "@/features/admin-dashboard/admin-dashboard";
import { requireDemoSession } from "@/lib/demo-auth";
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
  await requireDemoSession(["admin"], "/admin");

  const [child, children, institutions] = await Promise.all([
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
    prisma.child.findMany({
      orderBy: [{ createdAt: "desc" }],
      take: 20,
      select: {
        publicId: true,
        firstName: true,
        lastName: true,
        guardians: {
          where: { isPrimary: true },
          take: 1,
          select: { guardian: { select: { user: { select: { name: true } } } } },
        },
        enrollments: {
          where: { active: true },
          take: 1,
          select: { institution: { select: { name: true } } },
        },
        identifiers: { select: { id: true } },
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
    children: children.map((item) => ({
      publicId: item.publicId,
      fullName: `${item.firstName} ${item.lastName}`,
      guardianName: item.guardians[0]?.guardian.user.name ?? null,
      institutionName: item.enrollments[0]?.institution.name ?? null,
      identifiers: item.identifiers.length,
    })),
    institutions,
  };

  return <AdminDashboard data={data} />;
}
