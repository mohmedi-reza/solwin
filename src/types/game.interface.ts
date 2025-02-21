export type GameType = 'poker' | 'crash';

export interface BaseGameData {
  bet: number;
  result?: number;
  profit?: number;
  timestamp: Date;
  status: 'active' | 'completed' | 'failed';
}

export interface PokerGameData extends BaseGameData {
  hand: string[];
  position: number;
  action: string;
  potSize: number;
}

export interface CrashGameData extends BaseGameData {
  crashPoint: number;
  exitPoint?: number;
  multiplier?: number;
}

export type GameData = PokerGameData | CrashGameData;

export interface GameCard {
  id: number;
  title: string;
  status: 'Active' | 'Trend' | 'Popular';
  image: string;
  minBet: number;
  maxBet: number;
  type: GameType;
}

export interface GameStats {
  minBet: number;
  maxBet: number;
  maxMultiplier: number;
  houseEdge: number;
} 