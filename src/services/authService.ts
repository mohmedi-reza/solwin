import apiClient from "./api.service";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useUserStore } from "../stores/userStore";
import { PublicKey } from '@solana/web3.js';
import { AuthError, AuthResponse, NonceResponse, RefreshTokenResponse } from "../types/auth";
import { AxiosError } from "axios";

const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 7,
  secure: true,
  sameSite: "Strict",
};

export const AuthService = {
  getNonce: async (publicKey: string): Promise<string> => {
    try {
      const response = await apiClient.get<NonceResponse>(`/auth/nonce/${publicKey}`);
      return response.data.nonce;
    } catch (err) {
      const error = err as AxiosError<AuthError>;
      console.error("Error fetching nonce:", error);
      toast.error(error.response?.data?.message || "Failed to get authentication nonce");
      throw error;
    }
  },

  async login(publicKey: PublicKey, signMessage: (message: Uint8Array) => Promise<Uint8Array>): Promise<boolean> {
    try {
      // Get nonce
      const nonce = await this.getNonce(publicKey.toString());
      
      // Sign nonce
      const messageBytes = new TextEncoder().encode(nonce);
      const signature = await signMessage(messageBytes);
      const signatureBase64 = Buffer.from(signature).toString('base64');

      // Login request
      const response = await apiClient.post<AuthResponse>('/auth/login', {
        publicKey: publicKey.toString(),
        signature: signatureBase64,
        nonce: nonce
      });

      if (response.data) {
        this.setTokens(response.data.accessToken, response.data.refreshToken);
        useUserStore.getState().setUser(response.data.user);
        return true;
      }
      return false;

    } catch (err) {
      const error = err as AxiosError<AuthError>;
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  },

  setTokens(accessToken: string, refreshToken: string) {
    Cookies.set("accessToken", accessToken, COOKIE_OPTIONS);
    Cookies.set("refreshToken", refreshToken, COOKIE_OPTIONS);
  },

  clearTokens() {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  },

  async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) return false;

      const response = await apiClient.post<RefreshTokenResponse>("/auth/refresh-token", {
        refreshToken
      });

      if (response.data) {
        this.setTokens(response.data.accessToken, response.data.refreshToken);
        return true;
      }
      return false;
    } catch (err) {
      const error = err as AxiosError<AuthError>;
      console.error("Token refresh failed:", error);
      this.clearTokens();
      return false;
    }
  },

  async logout() {
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      const error = err as AxiosError<AuthError>;
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
      useUserStore.getState().clearUser();
    }
  },

  getAccessToken(): string | undefined {
    return Cookies.get("accessToken");
  },

  isAuthenticated(): boolean {
    return Boolean(Cookies.get("accessToken") && Cookies.get("refreshToken"));
  },
};
