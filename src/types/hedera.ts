export interface HederaAccount {
  accountId: string;
  privateKey: string;
  balance: string;
  tokens: TokenBalance[];
}

export interface TokenBalance {
  tokenId: string;
  balance: string;
  name?: string;
  symbol?: string;
  decimals?: number;
}

export interface TransactionResult {
  success: boolean;
  transactionId: string;
  message: string;
  receipt?: any;
}

export interface TokenCreationResult extends TransactionResult {
  tokenId?: string;
}

export interface TopicCreationResult extends TransactionResult {
  topicId?: string;
}

export interface TopicMessage {
  sequenceNumber: number;
  contents: string;
  timestamp: string;
  consensusTimestamp: string;
}

export interface TopicMessageResult extends TransactionResult {
  sequenceNumber?: number;
}