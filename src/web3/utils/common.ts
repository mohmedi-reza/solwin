import {
  BlockhashWithExpiryBlockHeight,
  ComputeBudgetProgram,
  Connection,
  SendOptions,
  Transaction,
  TransactionExpiredBlockheightExceededError,
  TransactionInstruction,
  VersionedTransaction,
  VersionedTransactionResponse,
} from '@solana/web3.js';
import {
  SOLANA_DEFAULT_PRIORITY_FEE,
  SOLANA_MAX_PRIORITY_FEE,
} from './constants';
import {
  PriotitizationFeeLevels,
  getMeanPrioritizationFeeByPercentile,
} from './grpf';
import { SleepExact } from './sleep';
import promiseRetry from 'promise-retry';

export async function getPriorityFee(connection: Connection): Promise<number> {
  const meanPriorityFee = await getMeanPrioritizationFeeByPercentile(
    connection,
    {
      percentile: PriotitizationFeeLevels.HIGH, // The percentile to use when fetching the prioritization fees
    },
  ).catch((err) => {
    console.error('Error fetching prioritization fees', err);
    return SOLANA_DEFAULT_PRIORITY_FEE;
  });

  // If meanPriorityFee is 0, use the default priority fee
  const priorityFee = meanPriorityFee || SOLANA_DEFAULT_PRIORITY_FEE;

  // Limit the priority fee to the SOLANA_MAX_PRIORITY_FEE that should be high enough
  return Math.min(priorityFee, SOLANA_MAX_PRIORITY_FEE);
}

export async function getPriorityFeeIx(
  connection: Connection,
): Promise<TransactionInstruction> {
  const priorityFee = await getPriorityFee(connection);

  return ComputeBudgetProgram.setComputeUnitPrice({
    microLamports: priorityFee,
  });
}

type SerializedTransaction = Buffer | Uint8Array;

type TransactionSenderAndConfirmationWaiterArgs = {
  connection: Connection;
  transaction: SerializedTransaction | VersionedTransaction | Transaction;
  blockhashWithExpiryBlockHeight: BlockhashWithExpiryBlockHeight;
  sendOptions?: SendOptions;
};

export async function transactionSenderAndConfirmationWaiter({
  connection,
  transaction,
  blockhashWithExpiryBlockHeight,
  sendOptions,
}: TransactionSenderAndConfirmationWaiterArgs): Promise<VersionedTransactionResponse | null> {
  const shouldSerialize =
    transaction instanceof VersionedTransaction ||
    transaction instanceof Transaction;

  const serializedTransaction = shouldSerialize
    ? transaction.serialize()
    : transaction;

  const txid = await connection.sendRawTransaction(
    serializedTransaction,
    sendOptions,
  );

  const controller = new AbortController();
  const abortSignal = controller.signal;

  const abortableResender = async () => {
    while (true) {
      await SleepExact(2);

      if (abortSignal.aborted) return;
      try {
        await connection.sendRawTransaction(serializedTransaction, sendOptions);
      } catch (e) {
        console.warn(`Failed to resend transaction: ${e}`);
      }
    }
  };

  try {
    abortableResender();
    const lastValidBlockHeight =
      blockhashWithExpiryBlockHeight.lastValidBlockHeight ;
   // -150
    // this would throw TransactionExpiredBlockheightExceededError
    await Promise.race([
      connection.confirmTransaction(
        {
          ...blockhashWithExpiryBlockHeight,
          lastValidBlockHeight,
          signature: txid,
          abortSignal,
        },
        'confirmed',
      ),
      new Promise((resolve) => {
        const checkSignature = async () => {
          while (!abortSignal.aborted) {
            await SleepExact(2);
            const tx = await connection.getSignatureStatus(txid, {
              searchTransactionHistory: false,
            });
            if (tx?.value?.confirmationStatus === 'confirmed') {
              console.log("Tx confirmed");
              resolve(tx);
            }
          }
        };
        checkSignature();
      }),
    ]);
  } catch (e) {
    console.log({ e });
    if (e instanceof TransactionExpiredBlockheightExceededError) {
      // we consume this error and getTransaction would return null
      //return null;
      throw e;
    } else {
      // invalid state from web3.js
      throw e;
    }
  } finally {
    controller.abort();
  }

  // in case rpc is not synced yet, we add some retries
  const response = promiseRetry(
    async (retry: (error: Error) => never) => {
      const response = await connection.getTransaction(txid, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!response) {
        retry(new Error('Transaction not found'));
      }
      return response;
    },
    {
      retries: 5,
      minTimeout: 1e3,
    },
  );

  return response;
}
