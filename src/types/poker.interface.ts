export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  display: string;
  value: number;
  imagePath: string;
  key?: number;
}

export interface HandResult {
  type: string;
  multiplier: number;
}

export interface GameState {
  isDrawing: boolean;
  currentHand: Card[];
  handResult: HandResult | null;
  balance: number;
  bet: number;
  risk: number;
}

export enum HandType {
  ROYAL_FLUSH = 'Royal Flush',
  STRAIGHT_FLUSH = 'Straight Flush',
  FOUR_OF_KIND = 'Four of a Kind',
  FULL_HOUSE = 'Full House',
  FLUSH = 'Flush',
  STRAIGHT = 'Straight',
  THREE_OF_KIND = 'Three of a Kind',
  TWO_PAIR = 'Two Pair',
  ONE_PAIR = 'One Pair',
  HIGH_CARD = 'High Card'
}

export const HAND_MULTIPLIERS: Record<HandType, number> = {
  [HandType.ROYAL_FLUSH]: 50,
  [HandType.STRAIGHT_FLUSH]: 10,
  [HandType.FOUR_OF_KIND]: 5,
  [HandType.FULL_HOUSE]: 4,
  [HandType.FLUSH]: 3,
  [HandType.STRAIGHT]: 2.5,
  [HandType.THREE_OF_KIND]: 2,
  [HandType.TWO_PAIR]: 1.5,
  [HandType.ONE_PAIR]: 1.2,
  [HandType.HIGH_CARD]: -1
}; 