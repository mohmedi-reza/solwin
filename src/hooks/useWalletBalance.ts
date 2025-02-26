import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { UserService, WalletBalanceResponse } from '../services/user.service';

export const QUERY_KEYS = {
  WALLET_BALANCE: 'wallet-balance',
  USER_PROFILE: 'user-profile',
  GAME_HISTORY: 'game-history',
  LEADERBOARD: 'leaderboard',
  TOP_PLAYERS: 'top-players'
} as const;

export function useWalletBalance() {
  return useQuery<WalletBalanceResponse>({
    queryKey: [QUERY_KEYS.WALLET_BALANCE],
    queryFn: UserService.getWalletBalance,
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    throwOnError: (error: Error) => {
      toast.error(`Failed to fetch wallet balance: ${error.message}`);
      return false;
    }
  });
} 