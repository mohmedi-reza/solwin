import { useWallet } from '@solana/wallet-adapter-react';
import { useQuery } from '@tanstack/react-query';
import { AuthService } from '../services/auth.service';
import { UserService, WalletBalanceResponse } from '../services/user.service';

export const QUERY_KEYS = {
  WALLET_BALANCE: 'wallet-balance',
  USER_PROFILE: 'user-profile',
  GAME_HISTORY: 'game-history',
  LEADERBOARD: 'leaderboard',
  TOP_PLAYERS: 'top-players',
  TRANSACTIONS: 'transactions'
} as const;

export function useWalletBalance() {
  const { publicKey, connected } = useWallet();
  const isAuthenticated = AuthService.isAuthenticated();

  return useQuery<WalletBalanceResponse>({
    queryKey: [QUERY_KEYS.WALLET_BALANCE],
    queryFn: UserService.getWalletBalance,
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    // Only enable if wallet is connected AND authenticated
    enabled: !!publicKey && connected && isAuthenticated,
    throwOnError: (error: Error) => {
      // Only show error if we're actually connected
      if (connected && isAuthenticated) {
        // toast.error(`Failed to fetch wallet balance: ${error.message}`);
        console.error(`Failed to fetch wallet balance: ${error.message}`);
      }
      return false;
    }
  });
} 