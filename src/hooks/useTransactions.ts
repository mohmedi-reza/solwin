import { useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { TransactionService } from '../services/transaction.service';
import { QUERY_KEYS } from './useWalletBalance';

interface PageParam {
  page: number;
  before?: string;
}

export function useTransactions(limit: number = 20) {
  return useInfiniteQuery({
    queryKey: [QUERY_KEYS.TRANSACTIONS, limit],
    queryFn: ({ pageParam }: { pageParam: PageParam }) => 
      TransactionService.getTransactions({
        limit,
        page: pageParam.page,
        before: pageParam.before
      }),
    initialPageParam: { page: 1 } as PageParam,
    getNextPageParam: (lastPage): PageParam | undefined => 
      lastPage.pagination.hasMore 
        ? {
            page: lastPage.pagination.currentPage + 1,
            before: lastPage.pagination.nextBeforeSignature
          }
        : undefined,
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Changed from cacheTime to gcTime
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    refetchInterval: 5000, // Refetch every 5 seconds
    retry: 2,
    throwOnError: (error: Error) => {
      toast.error(`Failed to fetch transactions: ${error.message}`);
      return false;
    }
  });
} 