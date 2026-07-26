import { NextResponse } from "next/server";
import { blockchainService } from "@/services/blockchain.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const wallet = await blockchainService.createAndFundWallet();

    return NextResponse.json({
      ok: true,
      message:
        "Wallet criada. Copie a privateKey para o .env.local. NÃO compartilhe esta chave.",
      publicKey: wallet.publicKey,
      privateKey: wallet.privateKey,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha ao criar wallet:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
