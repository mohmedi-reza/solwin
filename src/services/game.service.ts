import apiClient from "./api.service";
import { Card, HandResult } from "../types/poker.interface";

interface GameResponse {
  hand: Card[];
  result: HandResult;
  winnings: number;
}

export class GameService {
  static async createNewGame(amount: number, risk: number): Promise<GameResponse> {
    try {
      const response = await apiClient.post<GameResponse>("/game/new", {
        amount,
        risk,
      });
      return response;
    } catch (error) {
      console.error("Error creating new game:", error);
      throw error;
    }
  }
}
