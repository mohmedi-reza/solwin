export interface GameCard {
  id: number;
  title: string;
  status: 'Active' | 'Trend' | 'Popular';
  image: string;
}

export interface GameStats {
  minBet: number;
  maxMultiplier: number;
} 