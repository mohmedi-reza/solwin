import { Card, HAND_MULTIPLIERS, HandResult, HandType } from "../types/poker";

function getCardImagePath(card: Omit<Card, "imagePath">): string {
  const suitMap = {
    hearts: "Hearts",
    diamonds: "Diamonds",
    clubs: "Clubs",
    spades: "Spades",
  };

  const valueMap: Record<string, number> = {
    A: 1,
    K: 2,
    Q: 3,
    J: 4,
    "10": 5,
    "9": 6,
    "8": 7,
    "7": 8,
    "6": 9,
    "5": 10,
    "4": 11,
    "3": 12,
    "2": 13,
  };

  const imageNumber = valueMap[card.display];
  const imageNumberStr = imageNumber.toString().padStart(2, "0");
  const path = `${import.meta.env.BASE_URL}assets/${
    suitMap[card.suit]
  }-${imageNumberStr}.png`;
  return path;
}

export class PokerGame {
  private deck: Card[] = [];
  private readonly MIN_BET = 10;
  private readonly MAX_BET = 1000;
  private readonly MIN_RISK = 0.5;
  private readonly MAX_RISK = 2.0;

  constructor() {
    this.initializeDeck();
  }

  private initializeDeck(): void {
    const suits = ["hearts", "diamonds", "clubs", "spades"] as const;

    const displays = [
      "A",
      "K",
      "Q",
      "J",
      "10",
      "9",
      "8",
      "7",
      "6",
      "5",
      "4",
      "3",
      "2",
    ];

    const values = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

    this.deck = [];

    suits.forEach((suit) => {
      displays.forEach((display, index) => {
        const card = {
          suit,
          value: values[index],
          display,
        };
        const imagePath = getCardImagePath(card);
        this.deck.push({
          ...card,
          imagePath,
        });
      });
    });

    this.shuffle();
  }

  private shuffle(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      const j = array[0] % (i + 1);
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  public drawHand(): Card[] {
    this.initializeDeck();
    this.shuffle();
    const hand = this.deck.slice(0, 5);

    return hand.map((card) => ({
      ...card,
      imagePath: getCardImagePath(card),
    }));
  }

  public evaluateHand(cards: Card[]): HandResult {
    if (this.isRoyalFlush(cards)) {
      return {
        type: HandType.ROYAL_FLUSH,
        multiplier: HAND_MULTIPLIERS[HandType.ROYAL_FLUSH],
      };
    }
    if (this.isStraightFlush(cards)) {
      return {
        type: HandType.STRAIGHT_FLUSH,
        multiplier: HAND_MULTIPLIERS[HandType.STRAIGHT_FLUSH],
      };
    }
    if (this.isFourOfAKind(cards)) {
      return {
        type: HandType.FOUR_OF_KIND,
        multiplier: HAND_MULTIPLIERS[HandType.FOUR_OF_KIND],
      };
    }
    if (this.isFullHouse(cards)) {
      return {
        type: HandType.FULL_HOUSE,
        multiplier: HAND_MULTIPLIERS[HandType.FULL_HOUSE],
      };
    }
    if (this.isFlush(cards)) {
      return {
        type: HandType.FLUSH,
        multiplier: HAND_MULTIPLIERS[HandType.FLUSH],
      };
    }
    if (this.isStraight(cards)) {
      return {
        type: HandType.STRAIGHT,
        multiplier: HAND_MULTIPLIERS[HandType.STRAIGHT],
      };
    }
    if (this.isThreeOfAKind(cards)) {
      return {
        type: HandType.THREE_OF_KIND,
        multiplier: HAND_MULTIPLIERS[HandType.THREE_OF_KIND],
      };
    }
    if (this.isTwoPair(cards)) {
      return {
        type: HandType.TWO_PAIR,
        multiplier: HAND_MULTIPLIERS[HandType.TWO_PAIR],
      };
    }
    if (this.isOnePair(cards)) {
      return {
        type: HandType.ONE_PAIR,
        multiplier: HAND_MULTIPLIERS[HandType.ONE_PAIR],
      };
    }

    return {
      type: HandType.HIGH_CARD,
      multiplier: HAND_MULTIPLIERS[HandType.HIGH_CARD],
    };
  }

  public validateBet(bet: number, riskLevel: number): string | null {
    if (bet < this.MIN_BET) return `Minimum bet is ${this.MIN_BET}`;
    if (bet > this.MAX_BET) return `Maximum bet is ${this.MAX_BET}`;
    if (riskLevel < this.MIN_RISK) return `Minimum risk is ${this.MIN_RISK}`;
    if (riskLevel > this.MAX_RISK) return `Maximum risk is ${this.MAX_RISK}`;
    return null;
  }

  public calculateWinnings(
    bet: number,
    riskLevel: number,
    handResult: HandResult
  ): number {
    if (handResult.multiplier > 0) {
      return Math.floor(bet * handResult.multiplier * (1 + riskLevel));
    }

    return -Math.floor(bet * riskLevel);
  }

  private isRoyalFlush(cards: Card[]): boolean {
    return (
      this.isStraightFlush(cards) && cards.some((card) => card.value === 14)
    );
  }

  private isStraightFlush(cards: Card[]): boolean {
    return this.isFlush(cards) && this.isStraight(cards);
  }

  private isFlush(cards: Card[]): boolean {
    const firstSuit = cards[0].suit;
    return cards.every((card) => card.suit === firstSuit);
  }

  private isStraight(cards: Card[]): boolean {
    const values = cards.map((card) => card.value).sort((a, b) => a - b);
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i - 1] + 1) return false;
    }
    return true;
  }

  private isFourOfAKind(cards: Card[]): boolean {
    const values = cards.map((card) => card.value);
    const counts = new Map<number, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    return Array.from(counts.values()).includes(4);
  }

  private isFullHouse(cards: Card[]): boolean {
    const values = cards.map((card) => card.value);
    const counts = new Map<number, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    const countValues = Array.from(counts.values());
    return countValues.includes(3) && countValues.includes(2);
  }

  private isThreeOfAKind(cards: Card[]): boolean {
    const values = cards.map((card) => card.value);
    const counts = new Map<number, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    return Array.from(counts.values()).includes(3);
  }

  private isTwoPair(cards: Card[]): boolean {
    const values = cards.map((card) => card.value);
    const counts = new Map<number, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    return (
      Array.from(counts.values()).filter((count) => count === 2).length === 2
    );
  }

  private isOnePair(cards: Card[]): boolean {
    const values = cards.map((card) => card.value);
    const counts = new Map<number, number>();
    values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
    return Array.from(counts.values()).includes(2);
  }
}
