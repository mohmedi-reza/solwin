import { AxiosError } from "axios";
import Cookies from "js-cookie";
import { AuthError, RefreshTokenResponse } from "../types/auth.interface";
import apiClient from "./api.service";

const COOKIE_OPTIONS = {
  expires: 7,
  secure: true,
  sameSite: "Strict",
} as const;

// Add new cookie names
const COOKIE_NAMES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  PDA_ADDRESS: "pdaAddress",
  PDA_BALANCE: "pdaBalance",
} as const;

interface LoginResponse {
  user: {
    id: string;
    username: string;
    avatar: string;
    createdAt: string;
    lastLogin: string;
    balance: {
      available: number;
      locked: number;
      pdaBalance: string;
      totalDeposited: number;
      totalWithdrawn: number;
    };
    stats: {
      totalGames: number;
      wins: number;
      losses: number;
      winRate: number;
    };
    userPda: {
      pdaAddress: string;
      rentFee: number;
      balance: number;
    };
  };
  accessToken: string;
  refreshToken: string;
}

// Add new auth state type
export type AuthState = "authenticated" | "unauthenticated" | "authenticating";

export const AuthService = {
  getNonce: async (publicKey: string): Promise<string> => {
    try {
      const response = await apiClient.get<{ nonce: string }>(
        `/auth/nonce/${publicKey}`
      );
      return response.data.nonce;
    } catch (err) {
      const error = err as AxiosError<{ error: string; code: string }>;
      console.error("Error fetching nonce:", error);
      throw error;
    }
  },

  // Change from private property to regular property with underscore convention
  _authState: "unauthenticated" as AuthState,

  getAuthState(): AuthState {
    return this._authState;
  },

  setAuthState(state: AuthState) {
    this._authState = state;
  },

  async login(
    publicKey: string,
    signature: string,
    nonce: string
  ): Promise<boolean> {
    this.setAuthState("authenticating");
    try {
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        publicKey,
        signature,
        nonce,
      });

      if (response.data?.accessToken && response.data?.refreshToken) {
        this.setTokens(response.data.accessToken, response.data.refreshToken);
        if (response.data.user?.userPda) {
          this.setPdaData(
            response.data.user.userPda.pdaAddress,
            response.data.user.userPda.balance.toString()
          );
        }
        this.setAuthState("authenticated");
        return true;
      }
      this.setAuthState("unauthenticated");
      return false;
    } catch (err) {
      this.setAuthState("unauthenticated");
      const error = err as AxiosError<{ error: string; code: string }>;
      console.error("Login error:", error.response?.data);
      this.clearTokens();
      throw error;
    }
  },

  setTokens(accessToken: string, refreshToken: string) {
    Cookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, COOKIE_OPTIONS);
    Cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, COOKIE_OPTIONS);
  },

  setPdaData(pdaAddress: string, pdaBalance: string) {
    Cookies.set(COOKIE_NAMES.PDA_ADDRESS, pdaAddress, COOKIE_OPTIONS);
    Cookies.set(
      COOKIE_NAMES.PDA_BALANCE,
      pdaBalance.toString(),
      COOKIE_OPTIONS
    );
  },

  getPdaData() {
    const pdaAddress = Cookies.get(COOKIE_NAMES.PDA_ADDRESS);
    const pdaBalance = Cookies.get(COOKIE_NAMES.PDA_BALANCE);
    return {
      pdaAddress: pdaAddress || null,
      pdaBalance: pdaBalance ? pdaBalance : null,
    };
  },

  clearTokens() {
    Cookies.remove(COOKIE_NAMES.ACCESS_TOKEN);
    Cookies.remove(COOKIE_NAMES.REFRESH_TOKEN);
    Cookies.remove(COOKIE_NAMES.PDA_ADDRESS);
    Cookies.remove(COOKIE_NAMES.PDA_BALANCE);
  },

  async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = Cookies.get(COOKIE_NAMES.REFRESH_TOKEN);
      if (!refreshToken) {
        console.log("No refresh token found");
        return false;
      }

      const response = await apiClient.post<RefreshTokenResponse>(
        "/auth/refresh-token",
        { refreshToken }
      );

      if (response.data?.accessToken && response.data?.refreshToken) {
        this.setTokens(response.data.accessToken, response.data.refreshToken);
        return true;
      }

      console.error("Refresh response missing tokens:", response.data);
      return false;
    } catch (err) {
      const error = err as AxiosError<AuthError>;
      console.error(
        "Token refresh failed:",
        error.response?.data || error.message
      );
      this.clearTokens();
      return false;
    }
  },

  async logout() {
    try {
      if (this.isAuthenticated()) {
        await apiClient.post("/auth/logout");
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      this.setAuthState("unauthenticated");
      this.clearTokens();
    }
  },

  getAccessToken(): string | undefined {
    return Cookies.get(COOKIE_NAMES.ACCESS_TOKEN);
  },

  isAuthenticated(): boolean {
    return Boolean(
      Cookies.get(COOKIE_NAMES.ACCESS_TOKEN) &&
        Cookies.get(COOKIE_NAMES.REFRESH_TOKEN)
    );
  },
};
