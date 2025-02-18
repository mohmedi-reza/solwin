import { GameCard } from "../types/game";

export const gameCards: GameCard[] = [
  {
    id: 1,
    title: "Poker",
    status: "Active",
    image: "cover-1.png",
    minBet: 10,
    maxBet: 1000,
    type: "poker",
  },
  {
    id: 2,
    title: "Blackjack",
    status: "Trend",
    image: "cover-2.png",
    minBet: 10,
    maxBet: 1000,
    type: "crash",
  },
  {
    id: 3,
    title: "Roulette",
    status: "Popular",
    image: "cover-3.png",
    minBet: 10,
    maxBet: 1000,
    type: "crash",
  },
];
