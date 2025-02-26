import { useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { LeaderboardService } from '../services/leaderboard.service';
import { QUERY_KEYS } from './useWalletBalance';

export function usePlayerHistory(limit: number = 10) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.GAME_HISTORY, limit],
    queryFn: ({ pageParam = 1 }) => LeaderboardService.getPlayerHistory(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    getPreviousPageParam: (firstPage) => 
      firstPage.pagination.hasPrev ? firstPage.pagination.page - 1 : undefined,
    staleTime: 30000,
    retry: 2,
    throwOnError: (error: Error) => {
      toast.error(`Failed to fetch game history: ${error.message}`);
      return false;
    }
  });
} 