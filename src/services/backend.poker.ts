import { Card, HandResult, HandType, HAND_MULTIPLIERS } from "../types/poker.interface";

export class BackendPoker {
  private static getCardImagePath(card: Omit<Card, "imagePath">): string {
    const suitMap = {
      hearts: "Hearts",
      diamonds: "Diamonds",
      clubs: "Clubs",
      spades: "Spades",
    };

    const valueMap: Record<string, string> = {
      "14": "01", // Ace
      "13": "13", // King
      "12": "12", // Queen
      "11": "11", // Jack
      "10": "10",
      "9": "09",
      "8": "08",
      "7": "07",
      "6": "06",
      "5": "05",
      "4": "04",
      "3": "03",
      "2": "02",
    };

    const imageNumber = valueMap[card.value.toString()];
    return `/assets/${suitMap[card.suit]}-${imageNumber}.png`;
  }

  private static generateDeck(): Card[] {
    const suits = ["hearts", "diamonds", "clubs", "spades"] as const;
    const values = Array.from({ length: 13 }, (_, i) => i + 2);
    const deck: Card[] = [];

    suits.forEach(suit => {
      values.forEach(value => {
        const display = value === 14 ? 'A' :
          value === 13 ? 'K' :
            value === 12 ? 'Q' :
              value === 11 ? 'J' :
                value.toString();

        const card = {
          suit,
          value,
          display,
          imagePath: ''
        };
        
        card.imagePath = BackendPoker.getCardImagePath(card);
        deck.push(card);
      });
    });

    return deck;
  }

  private static shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private static evaluateHand(cards: Card[]): HandResult {
    // Sort cards by value for easier evaluation
    const sortedCards = [...cards].sort((a, b) => b.value - a.value);
    
    if (BackendPoker.isRoyalFlush(sortedCards)) {
      return { type: HandType.ROYAL_FLUSH, multiplier: HAND_MULTIPLIERS[HandType.ROYAL_FLUSH] };
    }
    if (BackendPoker.isStraightFlush(sortedCards)) {
      return { type: HandType.STRAIGHT_FLUSH, multiplier: HAND_MULTIPLIERS[HandType.STRAIGHT_FLUSH] };
    }
    if (BackendPoker.isFourOfAKind(sortedCards)) {
      return { type: HandType.FOUR_OF_KIND, multiplier: HAND_MULTIPLIERS[HandType.FOUR_OF_KIND] };
    }
    if (BackendPoker.isFullHouse(sortedCards)) {
      return { type: HandType.FULL_HOUSE, multiplier: HAND_MULTIPLIERS[HandType.FULL_HOUSE] };
    }
    if (BackendPoker.isFlush(sortedCards)) {
      return { type: HandType.FLUSH, multiplier: HAND_MULTIPLIERS[HandType.FLUSH] };
    }
    if (BackendPoker.isStraight(sortedCards)) {
      return { type: HandType.STRAIGHT, multiplier: HAND_MULTIPLIERS[HandType.STRAIGHT] };
    }
    if (BackendPoker.isThreeOfAKind(sortedCards)) {
      return { type: HandType.THREE_OF_KIND, multiplier: HAND_MULTIPLIERS[HandType.THREE_OF_KIND] };
    }
    if (BackendPoker.isTwoPair(sortedCards)) {
      return { type: HandType.TWO_PAIR, multiplier: HAND_MULTIPLIERS[HandType.TWO_PAIR] };
    }
    if (BackendPoker.isOnePair(sortedCards)) {
      return { type: HandType.ONE_PAIR, multiplier: HAND_MULTIPLIERS[HandType.ONE_PAIR] };
    }
    
    return { type: HandType.HIGH_CARD, multiplier: HAND_MULTIPLIERS[HandType.HIGH_CARD] };
  }

  // Hand evaluation helper methods
  private static isRoyalFlush(cards: Card[]): boolean {
    return BackendPoker.isStraightFlush(cards) && cards[0].value === 14;
  }

  private static isStraightFlush(cards: Card[]): boolean {
    return BackendPoker.isFlush(cards) && BackendPoker.isStraight(cards);
  }

  private static isFourOfAKind(cards: Card[]): boolean {
    const valueCounts = BackendPoker.getValueCounts(cards);
    return Math.max(...valueCounts.values()) === 4;
  }

  private static isFullHouse(cards: Card[]): boolean {
    const valueCounts = BackendPoker.getValueCounts(cards);
    const counts = Array.from(valueCounts.values());
    return counts.includes(3) && counts.includes(2);
  }

  private static isFlush(cards: Card[]): boolean {
    return cards.every(card => card.suit === cards[0].suit);
  }

  private static isStraight(cards: Card[]): boolean {
    for (let i = 1; i < cards.length; i++) {
      if (cards[i].value !== cards[i - 1].value - 1) {
        return false;
      }
    }
    return true;
  }

  private static isThreeOfAKind(cards: Card[]): boolean {
    const valueCounts = BackendPoker.getValueCounts(cards);
    return Math.max(...valueCounts.values()) === 3;
  }

  private static isTwoPair(cards: Card[]): boolean {
    const valueCounts = BackendPoker.getValueCounts(cards);
    const pairs = Array.from(valueCounts.values()).filter(count => count === 2);
    return pairs.length === 2;
  }

  private static isOnePair(cards: Card[]): boolean {
    const valueCounts = BackendPoker.getValueCounts(cards);
    return Math.max(...valueCounts.values()) === 2;
  }

  private static getValueCounts(cards: Card[]): Map<number, number> {
    const counts = new Map<number, number>();
    cards.forEach(card => {
      counts.set(card.value, (counts.get(card.value) || 0) + 1);
    });
    return counts;
  }

  public static playGame(bet: number, risk: number): {
    hand: Card[];
    result: HandResult;
    winnings: number;
  } {
    // Generate and shuffle deck
    const deck = BackendPoker.shuffleDeck(BackendPoker.generateDeck());
    
    // Draw 5 cards
    const hand = deck.slice(0, 5);
    
    // Evaluate hand
    const result = BackendPoker.evaluateHand(hand);
    
    // Calculate winnings
    const winnings = result.multiplier > 0 
      ? Number((bet * result.multiplier * (1 + (risk - 0.5))).toFixed(9))
      : Number((-bet * risk).toFixed(9));

    return {
      hand,
      result,
      winnings
    };
  }
}
