import React, { createContext, useContext, useState } from 'react';

interface GameState {
  balance: number;
  currentBet: number | null;
  stats: {
    gamesPlayed: number;
    totalWinnings: number;
    biggestWin: number;
  };
}

const GameContext = createContext<GameState | null>(null);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state] = useState<GameState>({
    balance: 1000,
    currentBet: null,
    stats: {
      gamesPlayed: 0,
      totalWinnings: 0,
      biggestWin: 0
    }
  });

  return <GameContext.Provider value={state}>{children}</GameContext.Provider>;
};

export const useGameState = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameState must be used within GameProvider');
  return context;
}; 