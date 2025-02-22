import apiClient from "./api.service";
import { UserProfile } from "../types/user.interface";

export interface WalletBalance {
  available: number;
  locked: number;
  pdaBalance: string;
  totalDeposited: number;
  totalWithdrawn: number;
}

export class UserService {
  static async getProfile(): Promise<UserProfile> {
    try {
      const response = await apiClient.get<UserProfile>("/auth/profile");
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
      const response = await apiClient.patch("/auth/profile", updates);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  static async getWalletBalance(): Promise<WalletBalance> {
    try {
      const response = await apiClient.get("/wallet/balance");
      return response.data;
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      throw error;
    }
  }
}
