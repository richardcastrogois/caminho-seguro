import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Transaction,
} from "@solana/web3.js";
import { createMemoInstruction } from "@solana/spl-memo";
import bs58 from "bs58";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { blockchainConfig } from "./blockchain.config";
import type { BlockchainSubmitResult, BlockchainVerifyResult } from "./blockchain.types";

function getAuthority(): Keypair {
  const secret = bs58.decode(blockchainConfig.privateKey);
  return Keypair.fromSecretKey(secret);
}

function getConnection(): Connection {
  return new Connection(blockchainConfig.rpcUrl, "confirmed");
}

function hashEventData(params: {
  publicId: string;
  type: string;
  occurredAt: string;
  childPublicId: string;
  source: string;
  severity: string;
}): Buffer {
  const payload = [
    params.publicId,
    params.type,
    params.occurredAt,
    params.childPublicId,
    params.source,
    params.severity,
    "guardian-network-v1",
  ].join("|");

  return createHash("sha256").update(payload).digest();
}

export const blockchainService = {
  async hashEvent(event: {
    publicId: string;
    type: string;
    occurredAt: Date;
    child: { publicId: string };
    source: string;
    severity: string;
  }): Promise<string> {
    const buf = hashEventData({
      publicId: event.publicId,
      type: event.type,
      occurredAt: event.occurredAt.toISOString(),
      childPublicId: event.child.publicId,
      source: event.source,
      severity: event.severity,
    });
    return buf.toString("hex");
  },

  async submitEvent(
    eventHashHex: string,
  ): Promise<BlockchainSubmitResult> {
    if (!blockchainConfig.privateKey) {
      throw new Error(
        "SOLANA_PRIVATE_KEY não configurada. Crie uma wallet e configure no .env.local.",
      );
    }

    const connection = getConnection();
    const authority = getAuthority();

    const memo = `guardian-network:${eventHashHex}`;

    const memoIx = createMemoInstruction(memo, [authority.publicKey]);

    const blockhash = await connection.getLatestBlockhash("confirmed");

    const tx = new Transaction({
      feePayer: authority.publicKey,
      blockhash: blockhash.blockhash,
      lastValidBlockHeight: blockhash.lastValidBlockHeight,
    });
    tx.add(memoIx);
    tx.sign(authority);

    const txHash = await connection.sendRawTransaction(tx.serialize());

    const confirmation = await connection.confirmTransaction(
      {
        signature: txHash,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
      },
      "confirmed",
    );

    if (confirmation.value.err) {
      throw new Error(
        `Transação falhou: ${JSON.stringify(confirmation.value.err)}`,
      );
    }

    return {
      transactionHash: txHash,
      slot: confirmation.context.slot,
    };
  },

  async verifyEvent(eventId: string): Promise<BlockchainVerifyResult> {
    const record = await prisma.blockchainRecord.findUnique({
      where: { eventId },
      include: { event: { include: { child: true } } },
    });

    if (!record) {
      return {
        verified: false,
        eventHash: "",
        onChainHash: null,
        transactionHash: null,
        slot: null,
        timestamp: null,
        status: "no_record",
      };
    }

    const recalculatedHash = await this.hashEvent({
      publicId: record.event.publicId,
      type: record.event.type,
      occurredAt: record.event.occurredAt,
      child: { publicId: record.event.child.publicId },
      source: record.event.source,
      severity: record.event.severity,
    });

    const hashMatch = recalculatedHash === record.eventHash;
    const isConfirmed = record.status === "CONFIRMED";

    let onChainVerified = false;
    if (record.transactionHash && isConfirmed) {
      try {
        const connection = getConnection();
        const txResponse = await connection.getTransaction(
          record.transactionHash,
          { commitment: "confirmed" },
        );
        onChainVerified = txResponse !== null;
      } catch {
        onChainVerified = false;
      }
    }

    return {
      verified: hashMatch && isConfirmed && onChainVerified,
      eventHash: recalculatedHash,
      onChainHash: record.eventHash,
      transactionHash: record.transactionHash,
      slot: record.slot?.toString() ?? null,
      timestamp: record.confirmedAt?.toISOString() ?? null,
      status: isConfirmed
        ? hashMatch
          ? onChainVerified
            ? "verified"
            : "tx_not_found"
          : "hash_mismatch"
        : record.status.toLowerCase(),
    };
  },

  async createAndFundWallet(): Promise<{ publicKey: string; privateKey: string }> {
    const wallet = Keypair.generate();
    const publicKey = wallet.publicKey.toBase58();
    const privateKey = bs58.encode(Buffer.from(wallet.secretKey));

    return { publicKey, privateKey };
  },

  async requestAirdrop(publicKey: string): Promise<string> {
    const connection = getConnection();
    const pubkey = new PublicKey(publicKey);
    const txHash = await connection.requestAirdrop(pubkey, 2 * LAMPORTS_PER_SOL);
    await connection.confirmTransaction(txHash, "confirmed");
    return txHash;
  },

  async getBalance(publicKey: string): Promise<number> {
    const connection = getConnection();
    const pubkey = new PublicKey(publicKey);
    return connection.getBalance(pubkey);
  },
};
