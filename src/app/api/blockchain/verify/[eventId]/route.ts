import { NextRequest, NextResponse } from "next/server";
import { blockchainService } from "@/services/blockchain.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> },
) {
  try {
    const { eventId } = await params;
    const result = await blockchainService.verifyEvent(eventId);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
