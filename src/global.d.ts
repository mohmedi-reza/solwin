interface Window {
  solana?: {
    publicKey: import('@solana/web3.js').PublicKey;
    signAndSendTransaction: (transaction: import('@solana/web3.js').Transaction) => Promise<{ signature: string }>;
    isPhantom?: boolean;
  };
} 