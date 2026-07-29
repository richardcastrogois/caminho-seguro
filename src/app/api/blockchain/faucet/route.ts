import { NextRequest, NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { blockchainService } from "@/features/blockchain/blockchain.service";

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

    const body: unknown = await request.json();

    if (
      typeof body !== "object" ||
      body === null ||
      !("publicKey" in body) ||
      typeof body.publicKey !== "string"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "publicKey é obrigatório.",
        },
        { status: 400 },
      );
    }

    try {
      new PublicKey(body.publicKey);
    } catch {
      return NextResponse.json(
        {
          ok: false,
          error: "A chave pública informada é inválida.",
        },
        { status: 400 },
      );
    }

    const transactionHash = await blockchainService.requestAirdrop(body.publicKey);

    const balance = await blockchainService.getBalance(body.publicKey);

    return NextResponse.json({
      ok: true,
      message: "Airdrop solicitado com sucesso na Solana Devnet.",
      publicKey: body.publicKey,
      transactionHash,
      balance,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";

    console.error("Falha no airdrop:", message);

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 500 },
    );
  }
}
