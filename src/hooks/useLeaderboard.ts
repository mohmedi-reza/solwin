import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { LeaderboardService } from '../services/leaderboard.service';
import { LeaderboardEntry } from '../types/leaderboard.interface';
import { QUERY_KEYS } from './useWalletBalance';

export function useLeaderboard(limit: number = 10) {
  return useQuery<LeaderboardEntry[]>({
    queryKey: [QUERY_KEYS.LEADERBOARD, limit],
    queryFn: () => LeaderboardService.getRecentWins(limit),
    staleTime: 30000, // Consider data stale after 30 seconds
    retry: 2,
    throwOnError: (error: Error) => {
      toast.error(`Failed to fetch leaderboard: ${error.message}`);
      return false;
    }
  });
} 