import { GameType } from "./game.interface";

// Game-specific data interfaces
export interface PokerGameData {
  hand: string[];
  bet: number;
  position: number;
  action: string;
  potSize: number;
  result: string;
}

export interface CrashGameData {
  crashPoint: number;
  exitPoint: number;
  betAmount: number;
  multiplier: number;
}

export type GameData = PokerGameData | CrashGameData;

// Core user preferences and stats
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  soundEnabled: boolean;
  notifications: boolean;
  autoExitCrash: boolean;
  defaultBetAmount: number;
}

export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  totalBets: number;
  totalWinnings: number;
  highestWin: number;
  lastGamePlayed: Date;
  winRate: number;
  totalWagered: number;
  netProfit: number;
  favoriteGame: string;
  gamesPlayed: {
    poker: number;
    crash: number;
  };
}

// Financial and transaction interfaces
export interface UserBalance {
  available: number;
  locked: number;
  pdaBalance: string;
  totalDeposited: number;
  totalWithdrawn: number;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "bet" | "win";
  amount: number;
  timestamp: Date;
  status: "pending" | "completed" | "failed";
  txHash?: string;
  matchId?: string;
}

export interface UserPda {
  pdaAddress: string;
  rentFee: number;
  balance: string;
}

// Game and match related interfaces
export interface GameHistory {
  startedAt: string;
  handType: string;
  buyInAmount: number;
  risk: number;
  winnings: number;
  hand: Array<{
    suit: string;
    value: number;
    display: string;
    imagePath: string;
  }>;
}

export interface ActiveGame {
  type: GameType;
  startedAt: Date;
  bet: number;
  gameData: GameData;
  matchId?: string;
}

export interface CurrentMatch {
  matchId: string;
  pda: {
    matchId: string;
    pdaAddress: string;
    balance: number;
  };
  players: string[];
  startedAt: string;
  betAmount: number;
  status: string;
}

export interface PlayerHistory {
  timestamp: string;
  playStartTime: string;
  winnings: number;
  hand: Array<{
    suit: string;
    value: number;
    display: string;
    imagePath: string;
  }>;
  handType: string;
  buyInAmount: number;
  risk: number;
  walletBalance: number;
  pdaBalance: number;
}

// Main user profile interface that combines all other interfaces
export interface UserProfile {
  id: string;
  username: string | null;
  avatar: string | null;
  createdAt: string;
  lastLogin: string;
  stats: UserStats;
  gameHistory: GameHistory[];
  transactions: Transaction[];
  preferences?: UserPreferences;
  balance: UserBalance;
  userPda: UserPda;
  activeGame: ActiveGame | null;
  currentMatch: CurrentMatch | null;
}
