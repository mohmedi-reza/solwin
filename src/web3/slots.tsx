import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import idl from "./target/types/slots.json";
import { ComputeBudgetProgram, Keypair, PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, NATIVE_MINT } from '@solana/spl-token';
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Slots } from './target/types/slots';
import { transactionSenderAndConfirmationWaiter } from './utils/common';
import {
    programAuthority,
    programWSOLAccount,
    // provider,
    // wallet,
    // program,
    jupiterProgramId,
    // connection,
    // getAdressLookupTableAccounts,
    instructionDataToTransactionInstruction,
} from "./utils/helper";

export const useGameWeb3 = () => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { publicKey } = useWallet();

    // publicKey as PublicKey;

    const provider = new anchor.AnchorProvider(connection, wallet as any, {
        preflightCommitment: "confirmed",
    });
    const hybridSwap = new PublicKey(idl.metadata.address);
    const swapInterface = JSON.parse(JSON.stringify(idl));
    const program = new Program<Slots>(
        swapInterface,
        hybridSwap,
        provider
    );
    // const revenue_share_wallet = new PublicKey('9gTxg9WwVXBJt2ipmk1QABbLfVo7McSQ3K6gaHwnWV8F')
    const server_wallet = Keypair.fromSecretKey(
        bs58.decode(
            // ""
            "23q7TVsvjjdSgoUsVEgwmJNf2wN8EgdAguq4TGTy5kh4iQuRKhXjujzuHd8SNNeQYKTshGBXzgVqyEEgJ8oyzEHH"
        ) as any
    ).publicKey;
    const server_keypair = Keypair.fromSecretKey(
        bs58.decode(
            "23q7TVsvjjdSgoUsVEgwmJNf2wN8EgdAguq4TGTy5kh4iQuRKhXjujzuHd8SNNeQYKTshGBXzgVqyEEgJ8oyzEHH"
        ) as any
    );

    class MyWallet {
        payer: anchor.web3.Keypair;

        constructor(payer: anchor.web3.Keypair) {
            this.payer = payer
        }
        async signTransaction(tx: { partialSign: (arg0: any) => void; }) {
            tx.partialSign(this.payer);
            return tx;
        }

        async signAllTransactions(txs: any[]) {
            return txs.map((t: { partialSign: (arg0: any) => void; }) => {
                t.partialSign(this.payer);
                return t;
            });
        }
        get publicKey() {
            return this.payer.publicKey;
        }
    }
    const wallet2 = new MyWallet(server_keypair)
    const provider2 = new anchor.AnchorProvider(connection, wallet2 as any, {
        preflightCommitment: "confirmed",
    });
    const program2 = new Program<Slots>(
        swapInterface,
        hybridSwap,
        provider2
    )

    const API_ENDPOINT = "https://quote-api.jup.ag/v6";
    const getQuote = async (
        fromMint: PublicKey,
        toMint: PublicKey,
        amount: number
    ) => {
        return fetch(
            `${API_ENDPOINT}/quote?outputMint=${toMint.toBase58()}&inputMint=${fromMint.toBase58()}&amount=${amount}&slippage=0.5&onlyDirectRoutes=true`
        ).then((response) => response.json());
    };
    /// Initialize UserPDA
    const initUserPda = async () => {
        const [userPDA] = PublicKey
            .findProgramAddressSync(
                [Buffer.from("slots", "utf-8"), (publicKey as PublicKey).toBuffer()],
                program.programId
            )
        console.log("user pda:", userPDA.toString())
        // init user pda Signer: Server
        const txid = await program2.methods.initUserPda().accounts({
            signer: server_wallet,
            player: publicKey as PublicKey,
            server: server_wallet, userPda: userPDA,
            systemProgram: SystemProgram.programId
        }).signers([server_keypair]).transaction()
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 300000
        });
        const transaction = new Transaction()
        transaction.add(txid).add(addPriorityFee)
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash
        transaction.feePayer = server_wallet
        const recentBlockhashInfo = await connection.getLatestBlockhash();
        const transactionResponse = await transactionSenderAndConfirmationWaiter({
            connection,
            transaction: transaction,
            blockhashWithExpiryBlockHeight: recentBlockhashInfo,
            sendOptions: { skipPreflight: true }
        });

        const txID = transactionResponse?.transaction.signatures[0];
        const error = transactionResponse?.meta?.err;

        if (!transactionResponse || error) {
            throw `transaction error:   ${error}`
        }
        console.log("Done: ", txID)
        console.log("Init User PDA Done")
    }

    /*const getSwapIx = async (user: PublicKey, outputAccount: PublicKey, quote: any) => {
        const data = {
            quoteResponse: quote,
            userPublicKey: user.toBase58(),
            destinationTokenAccount: outputAccount.toBase58(),
            useSharedAccounts: true,
        };
        return fetch(`${API_ENDPOINT}/swap-instructions`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).then((response) => response.json());
    };
*/
    const swapToSol = async (swapPayload: any) => {
        const [userPDA] = PublicKey
            .findProgramAddressSync(
                [Buffer.from("slots", "utf-8"), (publicKey as PublicKey).toBuffer()],
                program.programId
            )
        console.log("wsol account: ", programWSOLAccount.toString())
        console.log("wsol account: ", programAuthority.toString())
        console.log("user Pda: ", userPDA.toString())
        console.log()
        const swapInstruction = instructionDataToTransactionInstruction(swapPayload);
        const transaction = new Transaction()
        const txid = await program.methods
            .swapToSol((swapInstruction as anchor.web3.TransactionInstruction).data)
            .accounts({
                programAuthority: programAuthority,
                programWsolAccount: programWSOLAccount,
                userAccount: wallet.publicKey as PublicKey,
                solMint: NATIVE_MINT,
                jupiterProgram: jupiterProgramId,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                signer: publicKey as PublicKey,
                userPda: userPDA
            })
            .remainingAccounts((swapInstruction as anchor.web3.TransactionInstruction).keys)
            .transaction()

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 300000
        });
        transaction.add(txid).add(addPriorityFee)
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash
        transaction.feePayer = wallet.publicKey as PublicKey
        //.signers([server_keypair]).rpc({skipPreflight: true}); 
        const signedTransactions = await (wallet as any).signTransaction(transaction)

        const tx = signedTransactions
        const recentBlockhashInfo = await connection.getLatestBlockhash();
        const transactionResponse = await transactionSenderAndConfirmationWaiter({
            connection,
            transaction: tx,
            blockhashWithExpiryBlockHeight: recentBlockhashInfo,
            sendOptions: { skipPreflight: true }
        });

        const txID = transactionResponse?.transaction.signatures[0];
        const error = transactionResponse?.meta?.err;

        // TODO: Retry if transactionResponse is null, or error is NOT null
        if (!transactionResponse || error) {
            throw `transaction error:   ${error}`
        }
        console.log("Done: ", txID)

    }

    //// User send solana to userPDA
    const SendSol = async (amount: number) => {

        const [userPDA] = PublicKey
            .findProgramAddressSync(
                [Buffer.from("slots", "utf-8"), (publicKey as PublicKey).toBuffer()],
                program2.programId
            )

        console.log("user pda: ", userPDA.toString())

        // NOTE - at any time player can deposit into his/her pda 
        const solAmount = amount * 10 ** 9
        const tx_data = new Transaction().add(anchor.web3.SystemProgram.transfer({
            fromPubkey: publicKey as PublicKey,
            toPubkey: userPDA,
            lamports: solAmount,
        }));
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 300000
        });
        const transaction = new Transaction()
        transaction.add(tx_data).add(addPriorityFee)
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash
        transaction.feePayer = wallet.publicKey as PublicKey
        const signedTransactions = await (wallet as any).signTransaction(transaction)
        const recentBlockhashInfo = await connection.getLatestBlockhash();
        const transactionResponse = await transactionSenderAndConfirmationWaiter({
            connection,
            transaction: signedTransactions,
            blockhashWithExpiryBlockHeight: recentBlockhashInfo,
            sendOptions: { skipPreflight: true }
        });

        const txID = transactionResponse?.transaction.signatures[0];
        const error = transactionResponse?.meta?.err;
        // TODO: Retry if transactionResponse is null, or error is NOT null
        if (!transactionResponse || error) {
            throw `transaction error:   ${error}`
        }
        console.log("Done: ", txID)
        console.log("Send Sol Done from user")
        return true
    }
    /// Server send solana to server wallet from userPDA  
    const freedeposit = async (player: string, transferTo: string, amount: number) => {
        // find match pda account for game
        const playerPubkey = new PublicKey(player)
        const transferToPubkey = new PublicKey(transferTo)

        const [userPDA] = PublicKey
            .findProgramAddressSync(
                [Buffer.from("slingo", "utf-8"), playerPubkey.toBuffer()],
                program2.programId
            )
        const SolAmount = amount * 10 ** 9
        const txid = await program2.methods.freeDeposit(new anchor.BN(SolAmount))
            .accounts({
                signer: server_wallet, player: playerPubkey, transferTo: transferToPubkey, server: server_wallet, userPda: userPDA
            }).signers([server_keypair]).transaction()

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 300000
        });
        const transaction = new Transaction()
        transaction.add(txid).add(addPriorityFee)
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash
        transaction.feePayer = server_wallet
        // const signedTransactions = transaction.sign(server_keypair)
        const recentBlockhashInfo = await connection.getLatestBlockhash();
        const transactionResponse = await transactionSenderAndConfirmationWaiter({
            connection,
            transaction: transaction,
            blockhashWithExpiryBlockHeight: recentBlockhashInfo,
            sendOptions: { skipPreflight: true }
        });

        const txID = transactionResponse?.transaction.signatures[0];
        const error = transactionResponse?.meta?.err;
        // TODO: Retry if transactionResponse is null, or error is NOT null
        if (!transactionResponse || error) {
            throw `transaction error:   ${error}`
        }
        console.log("Done: ", txID)
        // let info = await program2.account.gameState.fetch(matchPDA)
        // console.log("Match Satus: ", info.status)
        console.log("Free Deposit Done")

    }

    /// User withdraw solana from userPDA to his wallet
    const withdrawFromUserPDA = async (amount: number) => {

        const [userPDA, user_pda_bump] = PublicKey
            .findProgramAddressSync(
                [Buffer.from("slots", "utf-8"), (publicKey as PublicKey).toBuffer()],
                program.programId
            )
        console.log("user pda: ", userPDA.toString())
        const SolAmount = amount * 10 ** 9
        const txid = await program.methods.withdrawFromUserPda(user_pda_bump, new anchor.BN(SolAmount))
            .accounts({
                signer: publicKey as PublicKey, userPda: userPDA, player: publicKey as PublicKey
            }).transaction()

        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 300000
        });
        const transaction = new Transaction()
        transaction.add(txid).add(addPriorityFee)
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash
        transaction.feePayer = wallet.publicKey as PublicKey
        const signedTransactions = await (wallet as any).signTransaction(transaction)
        const tx = signedTransactions
        const recentBlockhashInfo = await connection.getLatestBlockhash();
        const transactionResponse = await transactionSenderAndConfirmationWaiter({
            connection,
            transaction: tx,
            blockhashWithExpiryBlockHeight: recentBlockhashInfo,
            sendOptions: { skipPreflight: true }
        });

        const txID = transactionResponse?.transaction.signatures[0];
        const error = transactionResponse?.meta?.err;

        // TODO: Retry if transactionResponse is null, or error is NOT null
        if (!transactionResponse || error) {
            throw `transaction error:   ${error}`
        }
        console.log("Done: ", txID)
        console.log("Withdraw Done")
        return true
    }

    /// Send solana from server to userPDA
    const SendSolfromserver = async (user: string, amount: number) => {
        const userPubkey = new PublicKey(user)
        const [userPDA] = PublicKey
            .findProgramAddressSync(
                [Buffer.from("slots", "utf-8"), (userPubkey as PublicKey).toBuffer()],
                program.programId
            )
        // NOTE - at any time player can deposit into his/her pda 
        const solAmount = amount * 10 ** 9
        const tx_data = new Transaction().add(anchor.web3.SystemProgram.transfer({
            fromPubkey: server_wallet,
            toPubkey: userPDA,
            lamports: solAmount,
        }));
        const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 300000
        });
        const transaction = new Transaction()
        transaction.add(tx_data).add(addPriorityFee)
        transaction.recentBlockhash = (await connection.getLatestBlockhash('confirmed')).blockhash
        transaction.feePayer = server_wallet
        // const signedTransactions = transaction.sign(server_keypair)
        const recentBlockhashInfo = await connection.getLatestBlockhash();
        const transactionResponse = await transactionSenderAndConfirmationWaiter({
            connection,
            transaction: transaction,
            blockhashWithExpiryBlockHeight: recentBlockhashInfo,
            sendOptions: { skipPreflight: true }
        });

        const txID = transactionResponse?.transaction.signatures[0];
        const error = transactionResponse?.meta?.err;
        // TODO: Retry if transactionResponse is null, or error is NOT null
        if (!transactionResponse || error) {
            throw `transaction error:   ${error}`
        }
        console.log("Done: ", txID)
        console.log("Send Sol Done from server")
    }

    /// userPDA balance
    // const pubKey = new PublicKey(user)
    const userPDAbalance = async () => {
        const [userPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from("slots", "utf-8"), (publicKey as PublicKey).toBuffer()],
            program.programId
        )
        const userPDABalance = await connection.getBalance(userPDA) / (10 ** 9)
        console.log("User PDA Balance: ", userPDABalance)
        return (userPDABalance)

    }

    return {
        initUserPda,
        getQuote,
        swapToSol,
        SendSol,
        freedeposit,
        withdrawFromUserPDA,
        SendSolfromserver,
        userPDAbalance
    };
}

export default useGameWeb3;