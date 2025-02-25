// import {
//   Connection,
//   Transaction,
//   SystemProgram,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";
// import apiClient from "./api.service";
// import { AuthService } from "./auth.service";

// export interface WithdrawResponse {
//   success: boolean;
//   balance: number;
//   txHash: string;
// }

// export interface DepositDetails {
//   pdaAddress: string;
//   projectId: string;
// }

// export class WalletService {
//   static getDepositDetails(): DepositDetails {
//     const pdaData = AuthService.getPdaData();
//     if (!pdaData.pdaAddress) {
//       throw new Error("PDA address not found");
//     }

//     return {
//       pdaAddress: pdaData.pdaAddress,
//       projectId: import.meta.env.VITE_CONTRACT_PROJECT_ID,
//     };
//   }

//   static async deposit(amount: number): Promise<boolean> {
//     try {
//       const { pdaAddress } = this.getDepositDetails();
//       const connection = new Connection(import.meta.env.VITE_RPC_URL);
//       const wallet = window.solana;

//       if (!wallet) {
//         throw new Error("Wallet not connected");
//       }

//       const transaction = new Transaction().add(
//         SystemProgram.transfer({
//           fromPubkey: wallet.publicKey,
//           toPubkey: new PublicKey(pdaAddress),
//           lamports: Math.round(amount * LAMPORTS_PER_SOL),
//         })
//       );

//       // Get the latest blockhash
//       const { blockhash } = await connection.getLatestBlockhash();
//       transaction.recentBlockhash = blockhash;
//       transaction.feePayer = wallet.publicKey;

//       // Sign and send the transaction
//       const signed = await wallet.signAndSendTransaction(transaction);
//       await connection.confirmTransaction(signed.signature);
//       return true;
//     } catch (error) {
//       console.error("Deposit error:", error);
//       throw error;
//     }
//   }

//   withdrawFromUserPDA = async (amount: number) => {
//     const [userPDA, user_pda_bump] = PublicKey.findProgramAddressSync(
//       [Buffer.from("slots", "utf-8"), (publicKey as PublicKey).toBuffer()],
//       program.programId
//     );
//     let SolAmount = amount * 10 ** 9;
//     let txid = await program.methods
//       .withdrawFromUserPda(user_pda_bump, new anchor.BN(SolAmount))
//       .accounts({
//         signer: publicKey as PublicKey,
//         userPda: userPDA,
//         player: publicKey as PublicKey,
//       })
//       .transaction();

//     const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
//       microLamports: 300000,
//     });
//     let transaction = new Transaction();
//     transaction.add(txid).add(addPriorityFee);
//     transaction.recentBlockhash = (
//       await connection.getLatestBlockhash("confirmed")
//     ).blockhash;
//     transaction.feePayer = wallet.publicKey as PublicKey;
//     let signedTransactions = await (wallet as any).signTransaction(transaction);
//     let tx = signedTransactions;
//     const recentBlockhashInfo = await connection.getLatestBlockhash();
//     const transactionResponse = await transactionSenderAndConfirmationWaiter({
//       connection,
//       transaction: tx,
//       blockhashWithExpiryBlockHeight: recentBlockhashInfo,
//       sendOptions: { skipPreflight: true },
//     });

//     const txID = transactionResponse?.transaction.signatures[0];
//     const error = transactionResponse?.meta?.err;

//     // TODO: Retry if transactionResponse is null, or error is NOT null
//     if (!transactionResponse || error) {
//       throw `transaction error:   ${error}`;
//     }
//     console.log("Done: ", txID);
//     console.log("Withdraw Done");
//   };

//   static async withdraw(amount: number): Promise<WithdrawResponse> {
//     try {
//       const { pdaAddress } = this.getDepositDetails();
//       const connection = new Connection(import.meta.env.VITE_RPC_URL);
//       const wallet = window.solana;

//       if (!wallet) {
//         throw new Error("Wallet not connected");
//       }

//       const transaction = new Transaction().add(
//         SystemProgram.transfer({
//           fromPubkey: wallet.publicKey,
//           toPubkey: new PublicKey(pdaAddress),
//           lamports: Math.round(amount * LAMPORTS_PER_SOL),
//         })
//       );

//       // Get the latest blockhash
//       const { blockhash } = await connection.getLatestBlockhash();
//       transaction.recentBlockhash = blockhash;
//       transaction.feePayer = wallet.publicKey;

//       // Sign and send the transaction
//       const signed = await wallet.signAndSendTransaction(transaction);
//       await connection.confirmTransaction(signed.signature);
//       return true;
//     } catch (error) {
//       console.error("Deposit error:", error);
//       throw error;
//     }
//   }
// }
