export enum BlockchainProofType {
  EVENT = 0,
  ALERT = 1,
  IDENTIFIER = 2,
}

export enum BlockchainProofStatus {
  ACTIVE = 0,
  REVOKED = 1,
}

export type BlockchainSubmitResult = {
  transactionHash: string;
  slot: number;
};

export type BlockchainVerifyResult = {
  verified: boolean;
  eventHash: string;
  onChainHash: string | null;
  transactionHash: string | null;
  slot: string | null;
  timestamp: string | null;
  status: string;
};
