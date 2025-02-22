import {
  Connection,
  Transaction,
  SystemProgram,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import apiClient from "./api.service";
import { AuthService } from "./auth.service";

export interface WithdrawResponse {
  success: boolean;
  balance: number;
  txHash: string;
}

export interface DepositDetails {
  pdaAddress: string;
  projectId: string;
}

export class WalletService {
  static getDepositDetails(): DepositDetails {
    const pdaData = AuthService.getPdaData();
    if (!pdaData.pdaAddress) {
      throw new Error("PDA address not found");
    }

    return {
      pdaAddress: pdaData.pdaAddress,
      projectId: import.meta.env.VITE_CONTRACT_PROJECT_ID,
    };
  }

  static async deposit(amount: number): Promise<boolean> {
    try {
      const { pdaAddress } = this.getDepositDetails();
      const connection = new Connection(import.meta.env.VITE_RPC_URL);
      const wallet = window.solana;

      if (!wallet) {
        throw new Error("Wallet not connected");
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: new PublicKey(pdaAddress),
          lamports: Math.round(amount * LAMPORTS_PER_SOL),
        })
      );

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      // Sign and send the transaction
      const signed = await wallet.signAndSendTransaction(transaction);
      await connection.confirmTransaction(signed.signature);
      return true;
    } catch (error) {
      console.error("Deposit error:", error);
      throw error;
    }
  }

  static async withdraw(amount: number): Promise<WithdrawResponse> {
    try {
      // The Bearer token is automatically handled by apiClient interceptors
      const response = await apiClient.post<WithdrawResponse>(
        "/wallet/withdraw",
        {
          amount,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Withdrawal error:", error);
      throw error;
    }
  }
}
