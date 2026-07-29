import { NextResponse } from "next/server";
import { Keypair, Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import bs58 from "bs58";
import { blockchainConfig } from "@/features/blockchain/blockchain.config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LOW_BALANCE_THRESHOLD = 0.1 * LAMPORTS_PER_SOL;

function getConnection(): Connection {
  return new Connection(blockchainConfig.rpcUrl, "confirmed");
}

function getWalletPublicKey(): string | null {
  if (!blockchainConfig.privateKey) return null;

  try {
    const secret = bs58.decode(blockchainConfig.privateKey);
    const keypair = Keypair.fromSecretKey(secret);
    return keypair.publicKey.toBase58();
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const publicKey = getWalletPublicKey();

    if (!publicKey) {
      return NextResponse.json({
        ok: true,
        configured: false,
        message: "Nenhuma chave privada configurada no .env.local",
        publicKey: null,
        balance: null,
        balanceSOL: null,
        low: false,
      });
    }

    const connection = getConnection();
    const balance = await connection.getBalance(
      new (await import("@solana/web3.js")).PublicKey(publicKey),
    );
    const balanceSOL = balance / LAMPORTS_PER_SOL;
    const low = balance < LOW_BALANCE_THRESHOLD;

    return NextResponse.json({
      ok: true,
      configured: true,
      publicKey,
      balance,
      balanceSOL,
      low,
      message: low
        ? `Saldo baixo (${balanceSOL.toFixed(4)} SOL). Use o faucet para recarregar.`
        : `Saldo ok (${balanceSOL.toFixed(4)} SOL)`,
      thresholdSOL: LOW_BALANCE_THRESHOLD / LAMPORTS_PER_SOL,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Falha ao verificar saldo:", message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
