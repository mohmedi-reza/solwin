export interface Transaction {
  signature: string;
  timestamp: string;
  slot: number;
  status: 'success' | 'pending' | 'failed';
  amount: number;
  fee: number;
  memo?: string;
  type: TransactionType;
  programId?: string; // To identify which program processed the transaction
  data?: {
    instruction?: string;
    gameType?: string;
    result?: string;
  };
}

export const VALID_TRANSACTION_TYPES = ['DEPOSIT', 'WITHDRAW', 'UNKNOWN'] as const;

export type TransactionType = typeof VALID_TRANSACTION_TYPES[number];

export function determineTransactionType(tx: any): TransactionType {
  // If type is already set and valid, use it
  if (tx.type && VALID_TRANSACTION_TYPES.includes(tx.type)) {
    return tx.type;
  }

  // Simple amount-based detection
  if (tx.amount > 0) {
    return 'DEPOSIT';
  } 
  
  if (tx.amount < 0) {
    return 'WITHDRAW';
  }

  return 'UNKNOWN';
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    hasMore: boolean;
    nextBeforeSignature?: string;
    limit: number;
    currentPage: number;
  };
  pdaAddress: string;
}

export interface TransactionError {
  success: false;
  error: string;
  details?: string;
} 