import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blockchainService } from "@/features/blockchain/blockchain.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const pendingRecords = await prisma.blockchainRecord.findMany({
      where: { status: "PENDING" },
      include: {
        event: {
          include: { child: true },
        },
      },
    });

    if (pendingRecords.length === 0) {
      return NextResponse.json({
        ok: true,
        message: "Nenhum evento PENDING para retentar",
        attempted: 0,
        succeeded: 0,
        failed: 0,
      });
    }

    const results: Array<{
      eventId: string;
      publicId: string;
      previousHash: string;
      status: "success" | "error";
      transactionHash?: string;
      slot?: string;
      error?: string;
    }> = [];

    for (const record of pendingRecords) {
      const event = record.event;

      try {
        const eventHash = await blockchainService.hashEvent(event);
        const submitResult = await blockchainService.submitEvent(eventHash);

        await prisma.blockchainRecord.update({
          where: { id: record.id },
          data: {
            eventHash,
            transactionHash: submitResult.transactionHash,
            slot: BigInt(submitResult.slot),
            status: "CONFIRMED",
            submittedAt: new Date(),
            confirmedAt: new Date(),
            failureReason: null,
          },
        });

        await prisma.protectionEvent.update({
          where: { id: event.id },
          data: { status: "VALIDATED", validatedAt: new Date() },
        });

        results.push({
          eventId: event.id,
          publicId: event.publicId,
          previousHash: record.eventHash,
          status: "success",
          transactionHash: submitResult.transactionHash,
          slot: submitResult.slot.toString(),
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro desconhecido";

        await prisma.blockchainRecord.update({
          where: { id: record.id },
          data: { failureReason: message },
        });

        results.push({
          eventId: event.id,
          publicId: event.publicId,
          previousHash: record.eventHash,
          status: "error",
          error: message,
        });
      }
    }

    const succeeded = results.filter((r) => r.status === "success").length;
    const failed = results.filter((r) => r.status === "error").length;

    return NextResponse.json({
      ok: true,
      message: `${succeeded} evento(s) confirmado(s), ${failed} falha(s)`,
      attempted: results.length,
      succeeded,
      failed,
      results,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha no retry automático:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
