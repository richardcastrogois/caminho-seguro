import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blockchainService } from "@/features/blockchain/blockchain.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "eventId é obrigatório" },
        { status: 400 },
      );
    }

    const event = await prisma.protectionEvent.findUnique({
      where: { id: eventId },
      include: { child: true },
    });

    if (!event) {
      return NextResponse.json(
        { ok: false, error: "Evento não encontrado" },
        { status: 404 },
      );
    }

    const eventHash = await blockchainService.hashEvent(event);

    const existingRecord = await prisma.blockchainRecord.findUnique({
      where: { eventId },
    });

    if (existingRecord?.status === "CONFIRMED") {
      return NextResponse.json(
        {
          ok: false,
          error: "Evento já registrado na blockchain",
          record: {
            ...existingRecord,
            slot: existingRecord.slot?.toString(),
          },
        },
        { status: 409 },
      );
    }

    const result = await blockchainService.submitEvent(eventHash);

    const record = await prisma.blockchainRecord.upsert({
      where: { eventId },
      update: {
        eventHash,
        transactionHash: result.transactionHash,
        slot: BigInt(result.slot),
        status: "CONFIRMED",
        submittedAt: new Date(),
        confirmedAt: new Date(),
        network: "solana-devnet",
      },
      create: {
        eventId,
        eventHash,
        transactionHash: result.transactionHash,
        slot: BigInt(result.slot),
        status: "CONFIRMED",
        submittedAt: new Date(),
        confirmedAt: new Date(),
        network: "solana-devnet",
      },
    });

    await prisma.protectionEvent.update({
      where: { id: eventId },
      data: { status: "VALIDATED", validatedAt: new Date() },
    });

    const updatedEvent = await prisma.protectionEvent.findUnique({
      where: { id: eventId },
      select: { status: true, validatedAt: true },
    });

    return NextResponse.json({
      ok: true,
      event: updatedEvent,
      record: {
        ...record,
        slot: record.slot?.toString(),
      },
      transaction: result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha ao submeter evento para blockchain:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
