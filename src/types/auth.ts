import { UserProfile } from "./user";

export interface SignInMessage {
  message: string;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface AuthError {
  error: string;
  code?: string;
  message?: string;
}

export interface NonceResponse {
  nonce: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
