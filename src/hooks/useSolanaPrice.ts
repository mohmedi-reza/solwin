import { useQuery } from '@tanstack/react-query';
import { PriceService } from '../services/price.service';

export const QUERY_KEYS = {
  SOLANA_PRICE: 'solana-price',
} as const;

interface UseSolanaPriceOptions {
  enabled?: boolean;
  refetchInterval?: number;
}

export function useSolanaPrice(options: UseSolanaPriceOptions = {}) {
  const { enabled = true, refetchInterval = 30000 } = options;

  const query = useQuery({
    queryKey: [QUERY_KEYS.SOLANA_PRICE],
    queryFn: PriceService.getSolanaPrice,
    enabled,
    refetchInterval,
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const convertSolToUsd = (solAmount: number): number => {
    if (!query.data) return 0;
    return solAmount * query.data;
  };

  return {
    price: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    convertSolToUsd,
  };
} 