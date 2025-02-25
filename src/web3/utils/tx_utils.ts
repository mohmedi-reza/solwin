import { Commitment, Connection, SignatureStatus, Transaction, TransactionSignature } from "@solana/web3.js";
const DEFAULT_TIMEOUT = 120_000;

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendSignedTransaction({
                                                signedTransaction,
                                                connection,
                                                timeout = DEFAULT_TIMEOUT,
                                                skipPreflight = true,
                                            }: {
    signedTransaction: Transaction;
    connection: Connection;
    timeout?: number;
    skipPreflight?: boolean,
}): Promise<{
    result: Promise<void>,
    txid: string,
}> {
    const rawTransaction = signedTransaction.serialize();
    console.log(rawTransaction.length)

    const startTime = Date.now();
    let slot = 0;
    const txid: TransactionSignature = await connection.sendRawTransaction(
        rawTransaction,
        {
            skipPreflight:true
        },
    );

    console.log(txid)

    //console.log('Started awaiting confirmation for', txid);

    let done = false;
    (async () => {
        while (!done && Date.now() - startTime < timeout) {
            connection.sendRawTransaction(rawTransaction, {
                skipPreflight: true,
            });
            await sleep(6000);
        }
    })();
    const awaitResp = (async () => {
        try {
            const confirmation = await awaitTransactionSignatureConfirmation(
                txid,
                timeout,
                connection,
                'confirmed',
                true,
            );

            if (!confirmation)
                throw new Error('Timed out awaiting confirmation on transaction');

            if (confirmation.err) {
                console.error(confirmation.err);
                throw new Error('Transaction failed: Custom instruction error');
            }

            slot = confirmation?.slot || 0;
        } catch (err: any) {
            throw err
            // throw new Error('Transaction failed');
        } finally {
            done = true;
        }
    })();

    return {
        txid,
        result: awaitResp,
    };
}

export const awaitTransactionSignatureConfirmation = async (
    txid: TransactionSignature,
    timeout: number,
    connection: Connection,
    commitment: Commitment = "confirmed",
    queryStatus = false
): Promise<SignatureStatus | null | void> => {
    let done = false;
    let status: SignatureStatus | null | void = {
        slot: 0,
        confirmations: 0,
        err: null,
    };
    let subId = 0;
    status = await new Promise(async (resolve, reject) => {
        let timer: any = setTimeout(() => {
            if (done) {
                return;
            }
            done = true;
            console.log("Rejecting for timeout... " + txid);
            reject({ timeout: true });
        }, timeout);
        try {
            //console.log("COMMIMENT", commitment);
            subId = connection.onSignature(
                txid,
                (result: any, context: any) => {
                    done = true;
                    status = {
                        err: result.err,
                        slot: context.slot,
                        confirmations: 0,
                    };
                    if (result.err) {
                        console.log("Rejected via websocket", result.err);
                        reject(status);
                    } else {
                        console.log("Resolved via websocket", result);
                        resolve(status);
                    }
                },
                commitment
            );
        } catch (e) {
            done = true;
            console.error("WS error in setup", txid, e);
        }
        while (!done && queryStatus) {
            // eslint-disable-next-line no-loop-func
            (async () => {
                try {
                    const signatureStatuses = await connection.getSignatureStatuses([
                        txid,
                    ]);
                    status = signatureStatuses && signatureStatuses.value[0];
                    if (!done) {
                        if (!status) {
                            //console.log("REST null result for", txid, status);
                            if (timer === null) {
                                timer = setTimeout(() => {
                                    if (done) {
                                        return;
                                    }
                                    done = true;
                                    console.log("Rejecting for timeout... " + txid);
                                    reject({ timeout: true });
                                }, timeout);
                            }
                        } else if (status.err) {
                            console.log("REST error for", txid, status);
                            done = true;
                            reject(status.err);
                        } else if (!status.confirmations && !status.confirmationStatus) {
                            //console.log("REST no confirmations for", txid, status);
                        } else {
                            //console.log("REST confirmation for", txid, status);
                            if (timer !== null) {
                                clearTimeout(timer);
                                timer = null;
                            }
                            if (
                                !status.confirmationStatus ||
                                status.confirmationStatus == commitment
                            ) {
                                done = true;
                                resolve(status);
                            }
                        }
                    }
                } catch (e) {
                    if (!done) {
                        console.log("REST connection error: txid", txid, e);
                    }
                }
            })();
            await sleep(5000);
        }
    });

    done = true;
    console.log("Returning status ", status);
    return status;
};