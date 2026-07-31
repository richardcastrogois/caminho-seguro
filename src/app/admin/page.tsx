import type { Metadata } from "next";
import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import { AdminDashboard } from "@/features/admin-dashboard/admin-dashboard";
import { blockchainConfig } from "@/features/blockchain/blockchain.config";
import { blockchainService } from "@/features/blockchain/blockchain.service";
import { requireCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import type { AdminDashboardData } from "@/types/admin-dashboard";

export const metadata: Metadata = {
  title: "AdministraÃ§Ã£o da demonstraÃ§Ã£o",
  description: "Consulta e gestÃ£o controlada de identificadores do Caminho Seguro.",
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function dateKey(date: Date) {
  return dayFormatter.format(date);
}

function daysAgo(days: number): Date {
  const reference = new Date();
  reference.setDate(reference.getDate() - days);
  return reference;
}

function hoursAgo(hours: number): Date {
  const reference = new Date();
  reference.setTime(reference.getTime() - hours * 60 * 60 * 1000);
  return reference;
}

function buildDaySeries(days: number): string[] {
  const keys: string[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    keys.push(dateKey(date));
  }
  return keys;
}

export default async function AdminPage() {
  await requireCurrentUser(["ADMIN"], "/admin");

  const fourteenDaysAgo = daysAgo(14);

  const [
    child,
    children,
    institutions,
    events24h,
    events7d,
    recentEvents,
    eventsByType,
    eventsBySource,
    blockchainByStatus,
    openAlerts,
  ] = await Promise.all([
    prisma.child.findFirst({
      orderBy: { createdAt: "desc" },
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
    prisma.protectionEvent.count({
      where: { occurredAt: { gte: hoursAgo(24) } },
    }),
    prisma.protectionEvent.count({
      where: { occurredAt: { gte: hoursAgo(168) } },
    }),
    prisma.protectionEvent.findMany({
      where: { occurredAt: { gte: fourteenDaysAgo } },
      select: { occurredAt: true },
    }),
    prisma.protectionEvent.groupBy({
      by: ["type"],
      _count: { _all: true },
    }),
    prisma.protectionEvent.groupBy({
      by: ["source"],
      _count: { _all: true },
    }),
    prisma.blockchainRecord.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.alert.count({ where: { status: "OPEN" } }),
  ]);

  const dayKeys = buildDaySeries(14);
  const countsByDay = new Map(dayKeys.map((key) => [key, 0]));
  for (const event of recentEvents) {
    const key = dateKey(event.occurredAt);
    if (countsByDay.has(key)) {
      countsByDay.set(key, (countsByDay.get(key) as number) + 1);
    }
  }

  let wallet: AdminDashboardData["blockchainHealth"]["wallet"] = {
    configured: false,
    publicKey: null,
    balanceSOL: null,
    low: false,
  };
  if (blockchainConfig.privateKey) {
    try {
      const secret = bs58.decode(blockchainConfig.privateKey);
      const keypair = Keypair.fromSecretKey(secret);
      const publicKey = keypair.publicKey.toBase58();
      const balance = await blockchainService.getBalance(publicKey);
      wallet = {
        configured: true,
        publicKey,
        balanceSOL: balance / LAMPORTS_PER_SOL,
        low: balance < 0.1 * LAMPORTS_PER_SOL,
      };
    } catch (error: unknown) {
      console.error("Falha ao consultar saldo Solana no admin:", error);
    }
  }

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
    analytics: {
      events24h,
      events7d,
      eventsByDay: dayKeys.map((date) => ({ date, count: countsByDay.get(date) ?? 0 })),
      eventsByType: eventsByType.map((item) => ({
        type: item.type,
        count: item._count._all,
      })),
      eventsBySource: eventsBySource.map((item) => ({
        source: item.source,
        count: item._count._all,
      })),
    },
    blockchainHealth: {
      byStatus: blockchainByStatus.map((item) => ({
        status: item.status,
        count: item._count._all,
      })),
      wallet,
    },
    openAlerts,
  };

  return <AdminDashboard data={data} />;
}
