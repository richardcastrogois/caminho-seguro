import { createHash } from "node:crypto";

export function createBlockchainActorHash(userId: string): string {
  const salt = process.env.BLOCKCHAIN_IDENTITY_SALT;

  if (!salt) {
    throw new Error("BLOCKCHAIN_IDENTITY_SALT nao configurado.");
  }

  return createHash("sha256").update(`${salt}:${userId}`).digest("hex");
}

export function tryCreateBlockchainActorHash(userId: string): string | null {
  try {
    return createBlockchainActorHash(userId);
  } catch {
    return null;
  }
}