import { NextRequest, NextResponse } from "next/server";
import { blockchainService } from "@/features/blockchain/blockchain.service";
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
        {
          status: 503,
        },
      );
    }

    if (!receivedSecret || receivedSecret !== configuredSecret) {
      return NextResponse.json(
        {
          ok: false,
          error: "Operação não autorizada.",
        },
        {
          status: 401,
        },
      );
    }

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("eventId" in body) ||
      typeof body.eventId !== "string" ||
      body.eventId.trim().length === 0
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "eventId é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    const eventId = body.eventId.trim();

    const event = await prisma.protectionEvent.findUnique({
      where: {
        id: eventId,
      },
      include: {
        child: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        {
          ok: false,
          error: "Evento não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const existingRecord = await prisma.blockchainRecord.findUnique({
      where: {
        eventId,
      },
    });

    if (existingRecord?.status === "CONFIRMED") {
      return NextResponse.json(
        {
          ok: false,
          error: "O evento já foi registrado na blockchain.",
          record: {
            ...existingRecord,
            slot: existingRecord.slot?.toString() ?? null,
          },
        },
        {
          status: 409,
        },
      );
    }

    const eventHash = await blockchainService.hashEvent(event);
    const result = await blockchainService.submitEvent(eventHash);

    const record = await prisma.$transaction(async (transaction) => {
      const updatedRecord = await transaction.blockchainRecord.upsert({
        where: {
          eventId,
        },
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

      await transaction.protectionEvent.update({
        where: {
          id: eventId,
        },
        data: {
          status: "VALIDATED",
          validatedAt: new Date(),
        },
      });

      return updatedRecord;
    });

    return NextResponse.json({
      ok: true,
      record: {
        ...record,
        slot: record.slot?.toString() ?? null,
      },
      transaction: result,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";

    console.error("Falha ao submeter evento para blockchain:", message);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}
