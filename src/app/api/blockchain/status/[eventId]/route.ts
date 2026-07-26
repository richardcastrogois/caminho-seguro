import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await params;

    const record = await prisma.blockchainRecord.findUnique({
      where: { eventId },
    });

    if (!record) {
      return NextResponse.json(
        { ok: false, error: "Nenhum registro blockchain encontrado para este evento" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      record: {
        ...record,
        slot: record.slot?.toString(),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
