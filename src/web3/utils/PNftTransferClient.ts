import { Metaplex } from "@metaplex-foundation/js";
import { MPL_TOKEN_AUTH_RULES_PROGRAM_ID as AUTH_PROG_ID } from '@metaplex-foundation/mpl-token-auth-rules';
import {
    AuthorizationData,
    Metadata,
    PROGRAM_ID as TMETA_PROG_ID,
} from "@metaplex-foundation/mpl-token-metadata";
import * as anchor from "@project-serum/anchor";
import { Idl } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey, SystemProgram, SYSVAR_INSTRUCTIONS_PUBKEY } from "@solana/web3.js";
import { Neptune } from "../target/types/slots";
import { fetchNft, findTokenRecordPDA } from "./pnft";

export class PNftTransferClient  {

    wallet: anchor.Wallet;
    provider!: anchor.Provider;
    program!: anchor.Program<Neptune>;
    connection: Connection;
    constructor(
        connection: Connection,
        wallet: anchor.Wallet,
        idl?: Idl,
        programId?: PublicKey
    ) {
        this.wallet = wallet;
        this.connection = connection;
        this.setProvider();
        this.setProgram(idl, programId);
    }

    setProvider() {
        this.provider = new anchor.AnchorProvider(
            this.connection,
            this.wallet,
            anchor.AnchorProvider.defaultOptions()
        );
        anchor.setProvider(this.provider);
    }

    setProgram(idl?: Idl, programId?: PublicKey) {
        //instantiating program depends on the environment
        if (idl && programId) {
            //means running in prod
            this.program = new anchor.Program<Neptune>(
                idl as any,
                programId,
                this.provider
            );
        } 
        // else {
        //     //means running inside test suite
        //     this.program = anchor.workspace.Neptune as anchor.Program<Neptune>;
        // }
    }

    async prepPnftAccounts({
        nftMetadata,
        nftMint,
        userAta,
        poolAta,
        authData = null,
    }: {
        nftMetadata?: PublicKey;
        nftMint: PublicKey;
        userAta: PublicKey;
        poolAta: PublicKey;
        authData?: AuthorizationData | null;
    }) {
        let meta;
        let creators: PublicKey[] = [];
        if (nftMetadata) {
            meta = nftMetadata;
        } else {
            const nft = await fetchNft(this.provider.connection, nftMint);
            meta = nft.metadataAddress;
            creators = nft.creators.map((c) => c.address);
        }
        
        const inflatedMeta = await Metadata.fromAccountAddress(
            this.provider.connection,
            meta
        );
        const ruleSet = inflatedMeta.programmableConfig?.ruleSet;

        const [ownerTokenRecordPda, ownerTokenRecordBump] =
            await findTokenRecordPDA(nftMint, userAta);

        //     [
        //         "metadata".as_bytes(),
        //         mpl_token_metadata::ID.as_ref(),
        //         nft_mint.key().as_ref(),
        //         "edition".as_bytes(),
        //         user_nft_account.key().as_ref()
        //     ],
        //     seeds::program = mpl_token_metadata::ID,
        //     bump
        // )]
        // console.log("ownerTokenRecordPda",ownerTokenRecordPda.toString());
        
        const [destTokenRecordPda, destTokenRecordBump] = await findTokenRecordPDA(
            nftMint,
            poolAta
        );

        //retrieve edition PDA
        const mplex = new Metaplex(this.provider.connection);
        const nftEditionPda = mplex.nfts().pdas().edition({ mint: nftMint });

        //have to re-serialize due to anchor limitations
        const authDataSerialized = authData
            ? {
                payload: Object.entries(authData.payload.map).map(([k, v]) => {
                    return { name: k, payload: v };
                }),
            }
            : null;

        return {
            meta,
            creators,
            ownerTokenRecordBump,
            ownerTokenRecordPda,
            destTokenRecordBump,
            destTokenRecordPda,
            ruleSet,
            nftEditionPda,
            authDataSerialized,
        };
    }

    async addLiquidity({
        nftMint,
        userAta,
        poolAta,
        owner,
        pool,
        id,
        proof,
        config,
        userData,
        tokenMint,
        hybridTokenAccount,
        nftAccountPdaAddress,
        userTokenAccount,
        splProgram
    }: {
        nftMint: PublicKey;
        userAta: PublicKey;
        poolAta: PublicKey;
        owner: PublicKey;
        pool: PublicKey;
        id: number;
        proof: Uint8Array[];
        config: PublicKey;
        userData: PublicKey;
        tokenMint: PublicKey;
        hybridTokenAccount: PublicKey;
        userTokenAccount: PublicKey;
        nftAccountPdaAddress: PublicKey;
        splProgram: PublicKey
    }) {
        //pnft
        const {
            meta,
            ownerTokenRecordBump,
            ownerTokenRecordPda,
            destTokenRecordBump,
            destTokenRecordPda,
            ruleSet,
            nftEditionPda,
            authDataSerialized,
        } = await this.prepPnftAccounts({
            nftMint,
            userAta:userAta,
            poolAta:nftAccountPdaAddress,
            authData: null, //currently useless
        });
        const remainingAccounts = [];
        if (!!ruleSet) {
            remainingAccounts.push({
                pubkey: ruleSet,
                isSigner: false,
                isWritable: false,
            });
        }
        
        const builder = this.program.methods
            .addLiquidityPnft(id,authDataSerialized, !!ruleSet)
            .accounts({
                signer:owner,
                userNftAccount: userAta,
                hybridNftAccount: nftAccountPdaAddress,
                ownerTokenRecord: ownerTokenRecordPda,
                poolTokenRecord: destTokenRecordPda,
                nftMint,
                edition: nftEditionPda,
                nftMetadata: meta,
                poolAccount:pool,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                pnftShared: {
                    authorizationRulesProgram: AUTH_PROG_ID,
                    tokenMetadataProgram: TMETA_PROG_ID,
                    instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                },
                config: config,
                userData: userData,
                tokenMint: tokenMint,
                hybridTokenAccount: hybridTokenAccount,
                userTokenAccount: userTokenAccount,
                splProgram: splProgram,
                nftAccountPdaAddress: poolAta,
            })
            .remainingAccounts(remainingAccounts).transaction()

        return builder
    }

    // async removeLiquidity({
    //     nftMint,
    //     userAta,
    //     poolAta,
    //     owner,
    //     pool,
    //     id,
    //     proof,
    //     config,
    //     userData,
    //     tokenMint,
    //     hybridTokenAccount,
    //     nftAccountPdaAddress,
    //     userTokenAccount
    // }: {
    //     nftMint: PublicKey;
    //     userAta: PublicKey;
    //     poolAta: PublicKey;
    //     owner: PublicKey;
    //     pool: PublicKey;
    //     id: number;
    //     proof: Uint8Array[];
    //     config: PublicKey;
    //     userData: PublicKey;
    //     tokenMint: PublicKey;
    //     hybridTokenAccount: PublicKey;
    //     userTokenAccount: PublicKey;
    //     nftAccountPdaAddress: PublicKey;
    // }) {
    //     //pnft
    //     const {
    //         meta,
    //         ownerTokenRecordBump,
    //         ownerTokenRecordPda,
    //         destTokenRecordBump,
    //         destTokenRecordPda,
    //         ruleSet,
    //         nftEditionPda,
    //         authDataSerialized,
    //     } = await this.prepPnftAccounts({
    //         nftMint,
    //         userAta:userAta,
    //         poolAta:nftAccountPdaAddress,
    //         authData: null, //currently useless
    //     });
    //     const remainingAccounts = [];
    //     if (!!ruleSet) {
    //         remainingAccounts.push({
    //             pubkey: ruleSet,
    //             isSigner: false,
    //             isWritable: false,
    //         });
    //     }
        
    //     const builder = this.program.methods
    //         .removeLiquidityPnft(id, destTokenRecordBump, new anchor.BN(1), authDataSerialized, !!ruleSet)
    //         .accounts({
    //             signer:owner,
    //             userNftAccount: userAta,
    //             hybridNftAccount: nftAccountPdaAddress,
    //             ownerTokenRecord: ownerTokenRecordPda,
    //             poolTokenRecord: destTokenRecordPda,
    //             nftMint,
    //             edition: nftEditionPda,
    //             nftMetadata: meta,
    //             poolAccount:pool,
    //             tokenProgram: TOKEN_PROGRAM_ID,
    //             systemProgram: SystemProgram.programId,
    //             rent: anchor.web3.SYSVAR_RENT_PUBKEY,
    //             associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
    //             pnftShared: {
    //                 authorizationRulesProgram: AUTH_PROG_ID,
    //                 tokenMetadataProgram: TMETA_PROG_ID,
    //                 instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
    //             },
    //             config: config,
    //             userData: userData,
    //             tokenMint: tokenMint,
    //             hybridTokenAccount: hybridTokenAccount,
    //             userTokenAccount: userTokenAccount,
    //             splProgram: TOKEN_2022_PROGRAM_ID,
    //             // nftAccountPdaAddress: poolAta,
    //         })
    //         .remainingAccounts(remainingAccounts)

    //     return builder
    // }

    async removeLiquidity({
        nftMint,
        userAta,
        poolAta,
        owner,
        pool,
        id,
        bump,
        proof,
        config,
        userData,
        tokenMint,
        hybridTokenAccount,
        nftAccountPdaAddress,
        userTokenAccount,
        splProgram
    }: {
        nftMint: PublicKey;
        userAta: PublicKey;
        poolAta: PublicKey;
        owner: PublicKey;
        pool: PublicKey;
        id: number;
        bump:number
        proof: Uint8Array[];
        config: PublicKey;
        userData: PublicKey;
        tokenMint: PublicKey;
        hybridTokenAccount: PublicKey;
        userTokenAccount: PublicKey;
        nftAccountPdaAddress: PublicKey;
        splProgram:PublicKey
      //  payar:Keypair
    }) {
        //pnft
        // const {
            
        //     authDataSerialized,
        // } = await this.prepPnftAccounts({
        //     nftMint,
        //     userAta:userAta,
        //     poolAta:nftAccountPdaAddress,
        //     authData: null, //currently useless
        // });
        // let authDataSerialized=null

        const {
            meta,
            ownerTokenRecordBump,
            ownerTokenRecordPda,
            destTokenRecordBump,
            destTokenRecordPda,
            ruleSet,
            nftEditionPda,
            authDataSerialized,
        } = await this.prepPnftAccounts({
            nftMint,
            userAta:userAta,
            poolAta:nftAccountPdaAddress,
            authData: null, //currently useless
        });
        const remainingAccounts = [];
        if (!!ruleSet) {
            remainingAccounts.push({
                pubkey: ruleSet,
                isSigner: false,
                isWritable: false,
            });
        }
        
        const nft = await fetchNft(this.provider.connection, nftMint);
        // let meta = nft.metadataAddress;
        const inflatedMeta = await Metadata.fromAccountAddress(
            this.provider.connection,
            meta
        );
        // const ruleSet = inflatedMeta.programmableConfig?.ruleSet;
        const mplex = new Metaplex(this.provider.connection);
        // const nftEditionPda = mplex.nfts().pdas().edition({ mint: nftMint });
            
        // const [ownerTokenRecordPda, ownerTokenRecordBump] =
        //     await findTokenRecordPDA(nftMint, userAta);
        // const [destTokenRecordPda, destTokenRecordBump] = await findTokenRecordPDA(
        //     nftMint,
        //     poolAta
        // );
        // const remainingAccounts = [];
        // if (!!ruleSet) {
        //     remainingAccounts.push({
        //         pubkey: ruleSet,
        //         isSigner: false,
        //         isWritable: false,
        //     });
        // }

        const builder = this.program.methods
            .removeLiquidityPnft(id,bump,new anchor.BN(1),authDataSerialized, !!ruleSet)
            .accounts({
                signer:owner,
                userNftAccount: userAta,
                hybridNftAccount: nftAccountPdaAddress,
                ownerTokenRecord: ownerTokenRecordPda,
                poolTokenRecord: destTokenRecordPda,
                nftMint,
                edition: nftEditionPda,
                nftMetadata: meta,
                poolAccount:pool,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                pnftShared: {
                    authorizationRulesProgram: AUTH_PROG_ID,
                    tokenMetadataProgram: TMETA_PROG_ID,
                    instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                },
                config: config,
                tokenMint: tokenMint,
                hybridTokenAccount: hybridTokenAccount,
                userTokenAccount: userTokenAccount,
                splProgram: splProgram,
                userData: userData,
                // nftAccountPdaAddress: poolAta,
            })    .remainingAccounts(remainingAccounts).transaction()

        return builder

    }

    async swapPnftToToken({
        nftMint,
        userAta,
        poolAta,
        owner,
        pool,
        id,
        bump,
        proof,
        config,
        userData,
        tokenMint,
        hybridTokenAccount,
        nftAccountPdaAddress,
        userTokenAccount,
        splProgram,
        feeReceiver1,
        feeReceiver2,
        feeReceiver3,
        // feeReceiver4,
        // feeReceiver5
    }: {
        nftMint: PublicKey;
        userAta: PublicKey;
        poolAta: PublicKey;
        owner: PublicKey;
        pool: PublicKey;
        id: number;
        bump:number
        proof: Uint8Array[];
        config: PublicKey;
        userData: PublicKey;
        tokenMint: PublicKey;
        hybridTokenAccount: PublicKey;
        userTokenAccount: PublicKey;
        nftAccountPdaAddress: PublicKey;
        splProgram:PublicKey,
        feeReceiver1:PublicKey,
        feeReceiver2:PublicKey,
        feeReceiver3:PublicKey,
        // feeReceiver4:PublicKey,
        // feeReceiver5:PublicKey
      //  payar:Keypair
    }) {
        //pnft
        // const {
            
        //     authDataSerialized,
        // } = await this.prepPnftAccounts({
        //     nftMint,
        //     userAta:userAta,
        //     poolAta:nftAccountPdaAddress,
        //     authData: null, //currently useless
        // });
        // let authDataSerialized=null

        const {
            meta,
            ownerTokenRecordBump,
            ownerTokenRecordPda,
            destTokenRecordBump,
            destTokenRecordPda,
            ruleSet,
            nftEditionPda,
            authDataSerialized,
        } = await this.prepPnftAccounts({
            nftMint,
            userAta:userAta,
            poolAta:nftAccountPdaAddress,
            authData: null, //currently useless
        });
        const remainingAccounts = [];
        if (!!ruleSet) {
            remainingAccounts.push({
                pubkey: ruleSet,
                isSigner: false,
                isWritable: false,
            });
        }
        
        const nft = await fetchNft(this.provider.connection, nftMint);
        // let meta = nft.metadataAddress;
        const inflatedMeta = await Metadata.fromAccountAddress(
            this.provider.connection,
            meta
        );
        // const ruleSet = inflatedMeta.programmableConfig?.ruleSet;
        const mplex = new Metaplex(this.provider.connection);
        // const nftEditionPda = mplex.nfts().pdas().edition({ mint: nftMint });
            
        // const [ownerTokenRecordPda, ownerTokenRecordBump] =
        //     await findTokenRecordPDA(nftMint, userAta);
        // const [destTokenRecordPda, destTokenRecordBump] = await findTokenRecordPDA(
        //     nftMint,
        //     poolAta
        // );
        // const remainingAccounts = [];
        // if (!!ruleSet) {
        //     remainingAccounts.push({
        //         pubkey: ruleSet,
        //         isSigner: false,
        //         isWritable: false,
        //     });
        // }

        const builder = this.program.methods
            .swapPnftToToken(id,bump,authDataSerialized, !!ruleSet)
            .accounts({
                signer:owner,
                userNftAccount: userAta,
                hybridNftAccount: nftAccountPdaAddress,
                ownerTokenRecord: ownerTokenRecordPda,
                poolTokenRecord: destTokenRecordPda,
                nftMint,
                edition: nftEditionPda,
                nftMetadata: meta,
                poolAccount:pool,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                // rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                pnftShared: {
                    authorizationRulesProgram: AUTH_PROG_ID,
                    tokenMetadataProgram: TMETA_PROG_ID,
                    instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                },
                config: config,
                tokenMint: tokenMint,
                hybridTokenAccount: hybridTokenAccount,
                userTokenAccount: userTokenAccount,
                splProgram: splProgram,
                // nftAccountPdaAddress: poolAta,
                feeReceiver1,
                feeReceiver2,
                feeReceiver3,
                rent:anchor.web3.SYSVAR_RENT_PUBKEY
                // metadataProgram:TMETA_PROG_ID,
                // sysvarInstructions:anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
                // feeReceiver4,
                // feeReceiver5
            })    .remainingAccounts(remainingAccounts).transaction()

        return builder

    }

    async swapTokenToPnft({
        nftMint,
        userAta,
        poolAta,
        owner,
        pool,
        id,
        bump,
        proof,
        config,
        userData,
        tokenMint,
        hybridTokenAccount,
        nftAccountPdaAddress,
        userTokenAccount,
        splProgram,
        feeReceiver1,
        feeReceiver2,
        feeReceiver3,
        // feeReceiver4,
        // feeReceiver5
    }: {
        nftMint: PublicKey;
        userAta: PublicKey;
        poolAta: PublicKey;
        owner: PublicKey;
        pool: PublicKey;
        id: number;
        bump:number
        proof: Uint8Array[];
        config: PublicKey;
        userData: PublicKey;
        tokenMint: PublicKey;
        hybridTokenAccount: PublicKey;
        userTokenAccount: PublicKey;
        nftAccountPdaAddress: PublicKey;
        splProgram:PublicKey,
        feeReceiver1:PublicKey,
        feeReceiver2:PublicKey,
        feeReceiver3:PublicKey,
        // feeReceiver4:PublicKey,
        // feeReceiver5:PublicKey
     //   payar:Keypair
    }) {
        //pnft
        // const {
            
        //     authDataSerialized,
        // } = await this.prepPnftAccounts({
        //     nftMint,
        //     userAta:userAta,
        //     poolAta:nftAccountPdaAddress,
        //     authData: null, //currently useless
        // });
        // let authDataSerialized=null

        const {
            meta,
            ownerTokenRecordBump,
            ownerTokenRecordPda,
            destTokenRecordBump,
            destTokenRecordPda,
            ruleSet,
            nftEditionPda,
            authDataSerialized,
        } = await this.prepPnftAccounts({
            nftMint,
            userAta:userAta,
            poolAta:nftAccountPdaAddress,
            authData: null, //currently useless
        });
        const remainingAccounts = [];
        if (!!ruleSet) {
            remainingAccounts.push({
                pubkey: ruleSet,
                isSigner: false,
                isWritable: false,
            });
        }
        
        const nft = await fetchNft(this.provider.connection, nftMint);
        // let meta = nft.metadataAddress;
        const inflatedMeta = await Metadata.fromAccountAddress(
            this.provider.connection,
            meta
        );
        // const ruleSet = inflatedMeta.programmableConfig?.ruleSet;
        const mplex = new Metaplex(this.provider.connection);
        // const nftEditionPda = mplex.nfts().pdas().edition({ mint: nftMint });
            
        // const [ownerTokenRecordPda, ownerTokenRecordBump] =
        //     await findTokenRecordPDA(nftMint, userAta);
        // const [destTokenRecordPda, destTokenRecordBump] = await findTokenRecordPDA(
        //     nftMint,
        //     poolAta
        // );
        // const remainingAccounts = [];
        // if (!!ruleSet) {
        //     remainingAccounts.push({
        //         pubkey: ruleSet,
        //         isSigner: false,
        //         isWritable: false,
        //     });
        // }

        const builder = this.program.methods
            .swapTokenToPnft(id,bump,authDataSerialized, !!ruleSet)
            .accounts({
                signer:owner,
                userNftAccount: userAta,
                hybridNftAccount: nftAccountPdaAddress,
                ownerTokenRecord: ownerTokenRecordPda,
                poolTokenRecord: destTokenRecordPda,
                nftMint,
                edition: nftEditionPda,
                nftMetadata: meta,
                poolAccount:pool,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
                // rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                pnftShared: {
                    authorizationRulesProgram: AUTH_PROG_ID,
                    tokenMetadataProgram: TMETA_PROG_ID,
                    instructions: SYSVAR_INSTRUCTIONS_PUBKEY,
                },
                config: config,
                tokenMint: tokenMint,
                hybridTokenAccount: hybridTokenAccount,
                userTokenAccount: userTokenAccount,
                splProgram: splProgram,
                feeReceiver1,
                feeReceiver2,
                feeReceiver3,
                //  feeReceiver4,
                //  feeReceiver5
         //       nftAccountPdaAddress: poolAta,
            })    .remainingAccounts(remainingAccounts).instruction()
            //transaction()

        return builder

    }
}