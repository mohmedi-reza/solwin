import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GameService } from '../services/game.service';
import { toast } from 'react-toastify';
import { QUERY_KEYS } from './useWalletBalance';

export function useGame() {
  const queryClient = useQueryClient();

  const startGameMutation = useMutation({
    mutationFn: ({ amount, risk }: { amount: number; risk: number }) => 
      GameService.createNewGame(amount, risk),
    onSuccess: () => {
      // Invalidate all relevant queries after a game starts
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.WALLET_BALANCE],
        refetchType: 'all'  // Force immediate refetch
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.GAME_HISTORY],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.USER_PROFILE],
        refetchType: 'all'
      });
      queryClient.invalidateQueries({ 
        queryKey: [QUERY_KEYS.LEADERBOARD],
        refetchType: 'all'
      });
      toast.success('Game started successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to start game: ${error.message}`);
    }
  });

  return {
    startGame: startGameMutation.mutate,
    isStarting: startGameMutation.isPending
  };
} 