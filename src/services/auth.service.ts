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

// Add new auth state type
export type AuthState = "authenticated" | "unauthenticated" | "authenticating";

export const AuthService = {
  getNonce: async (
    publicKey: string
  ): Promise<{ nonce: string; message: string }> => {
    try {
      const response = await apiClient.get<{ nonce: string; message: string }>(
        `/auth/nonce?wallet=${publicKey}`
      );
      return response;
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
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

  async login(publicKey: string, signature: string): Promise<boolean> {
    this.setAuthState("authenticating");
    try {
      const response = await apiClient.post<{ token: string; message: string }>(
        "/auth",
        {
          publicKey,
          signature,
        }
      );

      if (!response?.token) {
        throw new Error('No token received from server');
      }

      // Store the JWT token
      this.setTokens(response.token, response.token);
      this.setAuthState("authenticated");
      return true;
    } catch (err) {
      this.setAuthState("unauthenticated");
      const error = err as AxiosError<{ error: string }>;
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
    Object.values(COOKIE_NAMES).forEach(cookieName => {
      Cookies.remove(cookieName);
    });
    this._authState = "unauthenticated";
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

      if (response?.accessToken && response.refreshToken) {
        this.setTokens(response.accessToken, response.refreshToken);
        return true;
      }

      console.error("Refresh response missing tokens:", response);
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
