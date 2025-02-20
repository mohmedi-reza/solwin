import { GameType } from "./game";

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

export interface GameHistory {
  id: string;
  gameType: GameType;
  startedAt: Date;
  endedAt: Date;
  bet: number;
  result: number;
  profit: number;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "bet" | "win";
  amount: number;
  timestamp: Date;
  status: "pending" | "completed" | "failed";
  txHash?: string;
}

export interface UserPda {
  pdaAddress: string;
  rentFee: number;
  balance: number;
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

export interface UserProfile {
  id: string;
  username: string | null;
  avatar: string | null;
  createdAt: string;
  lastLogin: string;
  stats: UserStats;
  gameHistory: GameHistory[];
  transactions: Transaction[];
  preferences: UserPreferences;
  balance: UserBalance;
  userPda: UserPda;
  activeGame: ActiveGame | null;
  currentMatch: CurrentMatch | null;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  soundEnabled: boolean;
  notifications: boolean;
  autoExitCrash: boolean;
  defaultBetAmount: number;
}

export interface UserBalance {
  available: number;
  locked: number;
  totalDeposited: number;
  totalWithdrawn: number;
}

export interface ActiveGame {
  type: GameType;
  startedAt: Date;
  bet: number;
  gameData: GameData;
}
