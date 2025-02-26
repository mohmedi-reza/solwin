import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { LeaderboardService } from '../services/leaderboard.service';
import { PlayerHistory } from '../types/user.interface';
import { QUERY_KEYS } from './useWalletBalance';

export function usePlayerHistory(limit: number = 100) {
  return useQuery<PlayerHistory[]>({
    queryKey: [QUERY_KEYS.GAME_HISTORY, limit],
    queryFn: () => LeaderboardService.getPlayerHistory(limit),
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2,
    throwOnError: (error: Error) => {
      toast.error(`Failed to fetch game history: ${error.message}`);
      return false;
    }
  });
} 