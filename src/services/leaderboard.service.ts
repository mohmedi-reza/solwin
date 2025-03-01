import { LeaderboardEntry } from "../types/leaderboard.interface";
import { PlayerHistory } from "../types/user.interface";
import apiClient, { createPublicClient } from "./api.service";

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface PlayerHistoryResponse {
  success: boolean;
  data: PlayerHistory[];
  pagination: PaginationResponse;
}

interface AggregatedLeaderboardEntry {
  pdaAddress: string;
  totalWinnings: number;
  gamesPlayed: number;
  bestHand: {
    handType: string;
    winnings: number;
  };
  rank?: number;
}

interface AggregatedLeaderboardResponse {
  success: boolean;
  data: AggregatedLeaderboardEntry[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class LeaderboardService {
  private static readonly BASE_PATH = "/api/leaderboard";

  static async getRecentWins(page: number = 1, limit: number = 10): Promise<LeaderboardResponse> {
    try {
      const publicClient = createPublicClient();
      const response = await publicClient.get<LeaderboardResponse>(
        `${this.BASE_PATH}/history/all?page=${page}&limit=${limit}`
      );

      if (!response.data?.success) {
        throw new Error("Failed to fetch leaderboard");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching recent wins:", error);
      throw error;
    }
  }

  static async getPlayerHistory(page: number = 1, limit: number = 10): Promise<PlayerHistoryResponse> {
    try {
      const response = await apiClient.get<PlayerHistoryResponse>(
        `${this.BASE_PATH}/player/history?page=${page}&limit=${limit}`
      );

      if (!response.data?.success) {
        throw new Error("Failed to fetch player history");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching player history:", error);
      throw error;
    }
  }

  static async getTopPlayers(page: number = 1, limit: number = 10): Promise<AggregatedLeaderboardResponse> {
    try {
      const publicClient = createPublicClient();
      const response = await publicClient.get<LeaderboardResponse>(
        `${this.BASE_PATH}/history/all?page=${page}&limit=100`
      );

      if (!response.data?.success) {
        throw new Error("Failed to fetch leaderboard");
      }

      // Aggregate player stats from game history
      const aggregatedData = response.data.data.reduce((acc: { [key: string]: AggregatedLeaderboardEntry }, entry) => {
        const pdaAddress = entry.pdaAddress;
        
        if (!acc[pdaAddress]) {
          acc[pdaAddress] = {
            pdaAddress,
            totalWinnings: 0,
            gamesPlayed: 0,
            bestHand: {
              handType: entry.gameHistory.handType,
              winnings: entry.gameHistory.winnings
            },
            rank: 0
          };
        }

        acc[pdaAddress].totalWinnings += entry.gameHistory.winnings;
        acc[pdaAddress].gamesPlayed += 1;

        if (entry.gameHistory.winnings > acc[pdaAddress].bestHand.winnings) {
          acc[pdaAddress].bestHand = {
            handType: entry.gameHistory.handType,
            winnings: entry.gameHistory.winnings
          };
        }

        return acc;
      }, {});

      // Convert to array and sort by total winnings
      const allPlayers = Object.values(aggregatedData)
        .sort((a, b) => b.totalWinnings - a.totalWinnings)
        .map((player, index) => ({ ...player, rank: index + 1 }));

      // Manual pagination
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedData = allPlayers.slice(start, end);

      const totalPlayers = allPlayers.length;
      const totalPages = Math.ceil(totalPlayers / limit);

      return {
        success: true,
        data: paginatedData,
        pagination: {
          total: totalPlayers,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error("Error fetching top players:", error);
      throw error;
    }
  }
}
