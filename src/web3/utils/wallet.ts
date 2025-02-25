import { Idl } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey
} from "@solana/web3.js";
import { useMemo } from "react";
import { useQuery } from "react-query";
import { IRpcObject } from "./executor/IRpcObject";

export type DecodeType<T extends unknown, P extends Idl> = (
  buf: Buffer,
  pubkey: PublicKey
) => IRpcObject<T>;

export const fetchWalletBalance = (
  accountKey: PublicKey | null,
  connection: Connection
) => ({
  fetcher: async () => {
    if (accountKey) {
      const balance = await connection.getBalance(accountKey);

      return {
        pubkey: accountKey,
        balance,
      };
    } else {
      return null;
    }
  },
});

export const useWalletBalance = (
  /*
    this is needed for deserialization only. 
    unlike gpa fetch we don't need the program id to find accounts on chain.
  */
  accountId: PublicKey | null,
  /* 
    same decoder interface as in useGpa
  */
  connection: Connection,
  refetchInterval?: number
) => {
  const { fetcher } = useMemo(
    () => fetchWalletBalance(accountId, connection),
    [accountId, connection]
  );
const key = useMemo(
    () => (accountId ? [`wallet-balance-${accountId?.toBase58()}`] : []),
    [accountId]
  );

  const q = useQuery<{ balance: number }>(key, fetcher, {
    refetchOnMount: false,
    refetchInterval,
  });

  return q;
};
