export interface LeaderboardEntry {
  pdaAddress: string;
  totalWinnings: number;
  gamesPlayed: number;
  bestHand: {
    handType: string;
    winnings: number;
  };
  gameHistory: {
    timestamp: string;
    winnings: number;
    handType: string;
  };
}

export interface LeaderboardResponse {
  success: boolean;
  error?: string;
  data: LeaderboardEntry[];
}

export interface AggregatedLeaderboardEntry {
  pdaAddress: string;
  totalWinnings: number;
  gamesPlayed: number;
  bestHand: {
    handType: string;
    winnings: number;
  };
  rank?: number;
}
