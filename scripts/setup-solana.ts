import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  console.log("");
  console.log("========================================");
  console.log(" Guardian Network - Setup Solana Wallet");
  console.log("========================================");
  console.log("");

  const wallet = Keypair.generate();
  const publicKey = wallet.publicKey.toBase58();
  const privateKey = bs58.encode(Buffer.from(wallet.secretKey));

  console.log(" Wallet criada com sucesso!");
  console.log("");
  console.log(` Endereço (publicKey): ${publicKey}`);
  console.log(` Private Key (base58): ${privateKey}`);
  console.log("");
  console.log(" ⚠️  Guarde a private key em segredo. Nunca compartilhe.");
  console.log("");

  const envPath = path.resolve(__dirname, "..", ".env.local");
  const examplePath = path.resolve(__dirname, "..", ".env.example");

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      console.log(" 📄 .env.local criado a partir do .env.example");
    } else {
      fs.writeFileSync(envPath, "");
      console.log(" 📄 .env.local criado");
    }
  }

  let envContent = fs.readFileSync(envPath, "utf-8");

  if (envContent.includes("SOLANA_PRIVATE_KEY=")) {
    envContent = envContent.replace(
      /SOLANA_PRIVATE_KEY=.*/,
      `SOLANA_PRIVATE_KEY=${privateKey}`,
    );
  } else {
    envContent += `\n# Solana\nSOLANA_RPC_URL=https://api.devnet.solana.com\nSOLANA_NETWORK=solana-devnet\nSOLANA_PRIVATE_KEY=${privateKey}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log(` 💾 Private key salva em .env.local`);
  console.log("");

  const answer = await ask(" Solicitar SOL de teste (airdrop) agora? (s/N): ");

  if (answer.toLowerCase() === "s") {
    const { Connection, LAMPORTS_PER_SOL } = await import("@solana/web3.js");

    const connection = new Connection("https://api.devnet.solana.com", "confirmed");

    console.log(" Solicitando airdrop de 1 SOL...");
    try {
      const txHash = await connection.requestAirdrop(
        wallet.publicKey,
        1 * LAMPORTS_PER_SOL,
      );
      await connection.confirmTransaction(txHash, "confirmed");
      const balance = await connection.getBalance(wallet.publicKey);
      console.log(` ✅ Airdrop confirmado! TX: ${txHash}`);
      console.log(` 💰 Saldo: ${balance / LAMPORTS_PER_SOL} SOL`);
    } catch {
      console.log(" ❌ Airdrop temporariamente indisponível (rate limit).");
      console.log("    Solicite manualmente em: https://faucet.solana.com");
      console.log(`    Endereço: ${wallet.publicKey.toBase58()}`);
    }
  }

  console.log("");
  console.log(" Setup concluído! Agora é só:");
  console.log("  npm run dev");
  console.log(`  POST /api/blockchain/submit { "eventId": "..." }`);
  console.log("");

  rl.close();
}

main().catch((err) => {
  console.error("Erro:", err);
  process.exit(1);
});
