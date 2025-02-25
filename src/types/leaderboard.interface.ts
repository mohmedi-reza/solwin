export interface LeaderboardEntry {
  _id: string;
  pdaAddress: string;
  gameHistory: {
    timestamp: string;
    winnings: number;
    buyInAmount: number;
    hand: Array<{
      suit: string;
      value: number;
      display: string;
      imagePath: string;
    }>;
    handType: string;
  };
}

export interface LeaderboardResponse {
  success: boolean;
  error?: string;
  data: LeaderboardEntry[];
}
