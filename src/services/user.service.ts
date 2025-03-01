import apiClient from "./api.service";
import { UserProfile } from "../types/user.interface";

export interface WalletBalance {
  balance: number;
  wallet: number;
  pdaAddress: string;
}

export interface WalletBalanceResponse {
  success: boolean;
  balance: number;
  wallet: string;
  pdaAddress: string;
  error?: string;
}

export class UserService {
  private static readonly BASE_PATH = "/api/user";

  static async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>(
        `${this.BASE_PATH}/profile`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  }

  static async updateProfile(
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const response = await apiClient.patch<UserProfile>(
        "/auth/profile",
        updates
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  static async getWalletBalance(): Promise<WalletBalanceResponse> {
    try {
      const response = await apiClient.get<WalletBalanceResponse>(
        "/wallet/balance"
      );
      if (!response.data) {
        throw new Error("Failed to fetch wallet balance");
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      throw error;
    }
  }
}
