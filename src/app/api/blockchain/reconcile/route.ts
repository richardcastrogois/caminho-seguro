import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const records = await prisma.blockchainRecord.findMany({
      where: { status: "CONFIRMED" },
      include: {
        event: { select: { id: true, status: true } },
      },
    });

    const toFix = records.filter((r) => r.event.status !== "VALIDATED");

    if (toFix.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "Nenhum evento inconsistente encontrado",
        fixed: 0,
      });
    }

    await Promise.all(
      toFix.map((r) =>
        prisma.protectionEvent.update({
          where: { id: r.event.id },
          data: { status: "VALIDATED", validatedAt: new Date() },
        }),
      ),
    );

    return NextResponse.json({
      ok: true,
      message: `${toFix.length} evento(s) reconciliado(s)`,
      fixed: toFix.length,
      events: toFix.map((r) => ({
        eventId: r.event.id,
        eventStatus: r.event.status,
        blockchainStatus: r.status,
      })),
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha na reconciliação:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
