import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [childrenCount, institutionsCount, eventsCount, alertsCount] =
      await Promise.all([
        prisma.child.count(),
        prisma.institution.count(),
        prisma.protectionEvent.count(),
        prisma.alert.count(),
      ]);

    return NextResponse.json(
      {
        ok: true,
        service: "caminho-seguro-database",
        database: "connected",
        timestamp: new Date().toISOString(),
        records: {
          children: childrenCount,
          institutions: institutionsCount,
          events: eventsCount,
          alerts: alertsCount,
        },
      },
      {
        status: 200,
      },
    );
  } catch (error: unknown) {
    console.error("Falha na verificação do banco:", error);

    return NextResponse.json(
      {
        ok: false,
        service: "caminho-seguro-database",
        database: "disconnected",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
      },
    );
  }
}
