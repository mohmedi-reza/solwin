import { LeaderboardEntry } from "../types/leaderboard.interface";
import { PlayerHistory } from "../types/user.interface";
import apiClient, { createPublicClient } from "./api.service";

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
}

interface PlayerHistoryResponse {
  success: boolean;
  data: PlayerHistory[];
}

export class LeaderboardService {
  private static readonly BASE_PATH = "/api/leaderboard";

  static async getRecentWins(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      const publicClient = createPublicClient();
      const response = await publicClient.get<LeaderboardResponse>(
        `${this.BASE_PATH}/history/all?limit=${limit}`
      );

      if (!response.data?.success) {
        throw new Error("Failed to fetch leaderboard");
      }

      // Sort by winnings in descending order
      const sortedWinners = response.data.data.sort(
        (a: LeaderboardEntry, b: LeaderboardEntry) =>
          b.gameHistory.winnings - a.gameHistory.winnings
      );

      return sortedWinners;
    } catch (error) {
      console.error("Error fetching recent wins:", error);
      return [];
    }
  }

  static async getPlayerHistory(limit: number = 10): Promise<PlayerHistory[]> {
    try {
      const response = await apiClient.get<PlayerHistoryResponse>(
        `${this.BASE_PATH}/player/history?limit=${limit}`
      );

      if (!response.data?.success) {
        throw new Error("Failed to fetch player history");
      }

      return response.data.data;
    } catch (error) {
      console.error("Error fetching player history:", error);
      return [];
    }
  }
}
