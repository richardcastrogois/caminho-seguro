/*
Script de retry automático para eventos PENDING.

Uso:
  npx tsx scripts/retry-pending.ts              # executa uma vez
  npx tsx scripts/retry-pending.ts --watch       # executa a cada 5 minutos

Para agendar como cron (Windows):
  schtasks /create /tn "CaminhoSeguro-Retry" /tr "npx tsx C:\caminho\scripts\retry-pending.ts" /sc minute /mo 5

Para agendar como cron (Linux/Mac):
  env CRON=1 npx tsx scripts/retry-pending.ts   # a cada 5 minutos no crontab
*/

import dotenv from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { blockchainService } from "../src/features/blockchain/blockchain.service";

dotenv.config({ path: ".env.local" });

const connectionString =
  process.env.POSTGRES_PRISMA_URL ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_DATABASE_URL;

if (!connectionString) {
  console.error("POSTGRES_PRISMA_URL não configurada.");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const WATCH_INTERVAL_MS = 5 * 60 * 1000;

async function retryPending() {
  const records = await prisma.blockchainRecord.findMany({
    where: { status: "PENDING" },
    include: { event: { include: { child: true } } },
  });

  if (records.length === 0) {
    console.log(`[${new Date().toISOString()}] Nenhum evento PENDING.`);
    return { attempted: 0, succeeded: 0, failed: 0 };
  }

  let succeeded = 0;
  let failed = 0;

  for (const record of records) {
    try {
      const eventHash = await blockchainService.hashEvent(record.event);
      const result = await blockchainService.submitEvent(eventHash);

      await prisma.blockchainRecord.update({
        where: { id: record.id },
        data: {
          eventHash,
          transactionHash: result.transactionHash,
          slot: BigInt(result.slot),
          status: "CONFIRMED",
          submittedAt: new Date(),
          confirmedAt: new Date(),
          failureReason: null,
        },
      });

      await prisma.protectionEvent.update({
        where: { id: record.event.id },
        data: { status: "VALIDATED", validatedAt: new Date() },
      });

      console.log(
        `  ✅ ${record.event.publicId} -> CONFIRMED (tx: ${result.transactionHash.slice(0, 8)}...)`,
      );
      succeeded++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";

      await prisma.blockchainRecord.update({
        where: { id: record.id },
        data: { failureReason: message },
      });

      console.log(`  ❌ ${record.event.publicId} -> ${message}`);
      failed++;
    }
  }

  console.log(
    `[${new Date().toISOString()}] Retry: ${succeeded} sucesso(s), ${failed} falha(s)`,
  );
  return { attempted: records.length, succeeded, failed };
}

async function main() {
  const args = process.argv.slice(2);
  const isWatch = args.includes("--watch");

  console.log("=== Guardian Network - Retry Automático ===");

  if (isWatch) {
    console.log(`Modo watch: executando a cada ${WATCH_INTERVAL_MS / 1000}s`);
    console.log("");

    const run = async () => {
      try {
        await retryPending();
      } catch (error) {
        console.error("Erro no retry:", error);
      }
    };

    await run();
    setInterval(run, WATCH_INTERVAL_MS);
  } else {
    const result = await retryPending();
    console.log(`\nFinalizado: ${result.attempted} evento(s) processados.`);
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Falha fatal:", error);
  process.exit(1);
});
