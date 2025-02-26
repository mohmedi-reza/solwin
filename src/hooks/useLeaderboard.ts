import { useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { LeaderboardService } from '../services/leaderboard.service';
import { QUERY_KEYS } from './useWalletBalance';

export function useLeaderboard(limit: number = 10) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.LEADERBOARD, limit],
    queryFn: ({ pageParam = 1 }) => LeaderboardService.getRecentWins(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    getPreviousPageParam: (firstPage) => 
      firstPage.pagination.hasPrev ? firstPage.pagination.page - 1 : undefined,
    staleTime: 30000,
    retry: 2,
    throwOnError: (error: Error) => {
      toast.error(`Failed to fetch leaderboard: ${error.message}`);
      return false;
    }
  });
}

export function useTopPlayers(limit: number = 10) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.TOP_PLAYERS, limit],
    queryFn: ({ pageParam = 1 }) => LeaderboardService.getTopPlayers(pageParam, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination.hasNext ? lastPage.pagination.page + 1 : undefined,
    getPreviousPageParam: (firstPage) => 
      firstPage.pagination.hasPrev ? firstPage.pagination.page - 1 : undefined,
    staleTime: 30000,
    retry: 2,
    throwOnError: (error: Error) => {
      toast.error(`Failed to fetch top players: ${error.message}`);
      return false;
    }
  });
} 