import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const configuredSecret = process.env.BLOCKCHAIN_ADMIN_SECRET;
    const receivedSecret = request.headers.get("x-blockchain-admin-secret");

    if (!configuredSecret) {
      return NextResponse.json(
        {
          ok: false,
          error: "BLOCKCHAIN_ADMIN_SECRET não está configurado no servidor.",
        },
        { status: 503 },
      );
    }

    if (!receivedSecret || receivedSecret !== configuredSecret) {
      return NextResponse.json(
        {
          ok: false,
          error: "Operação não autorizada.",
        },
        { status: 401 },
      );
    }

    const records = await prisma.blockchainRecord.findMany({
      where: {
        status: "CONFIRMED",
      },
      include: {
        event: {
          select: {
            id: true,
            publicId: true,
            status: true,
          },
        },
      },
    });

    const inconsistentRecords = records.filter(
      (record) => record.event.status !== "VALIDATED",
    );

    if (inconsistentRecords.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "Nenhum evento inconsistente encontrado.",
        fixed: 0,
        events: [],
      });
    }

    await prisma.$transaction(
      inconsistentRecords.map((record) =>
        prisma.protectionEvent.update({
          where: {
            id: record.event.id,
          },
          data: {
            status: "VALIDATED",
            validatedAt: new Date(),
          },
        }),
      ),
    );

    return NextResponse.json({
      ok: true,
      message: `${inconsistentRecords.length} evento(s) reconciliado(s).`,
      fixed: inconsistentRecords.length,
      events: inconsistentRecords.map((record) => ({
        eventId: record.event.id,
        publicId: record.event.publicId,
        previousEventStatus: record.event.status,
        blockchainStatus: record.status,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";

    console.error("Falha na reconciliação:", message);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
