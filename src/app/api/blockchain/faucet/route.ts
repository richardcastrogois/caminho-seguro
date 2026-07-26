import { NextRequest, NextResponse } from "next/server";
import { blockchainService } from "@/services/blockchain.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { publicKey } = body;

    if (!publicKey) {
      return NextResponse.json(
        { ok: false, error: "publicKey é obrigatório" },
        { status: 400 },
      );
    }

    const txHash = await blockchainService.requestAirdrop(publicKey);
    const balance = await blockchainService.getBalance(publicKey);

    return NextResponse.json({
      ok: true,
      message: "Airdrop solicitado com sucesso!",
      publicKey,
      transactionHash: txHash,
      balance,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha no airdrop:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
