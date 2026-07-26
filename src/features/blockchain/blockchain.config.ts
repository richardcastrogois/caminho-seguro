export const blockchainConfig = {
  rpcUrl: process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
  network: process.env.SOLANA_NETWORK ?? "solana-devnet",
  privateKey: process.env.SOLANA_PRIVATE_KEY ?? "",
};
