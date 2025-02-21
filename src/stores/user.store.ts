import { create } from "zustand";
import { UserProfile } from "../types/user.interface";
import { AuthService } from "../services/auth.service";
import apiClient from "../services/api.service";
import { StateCreator } from "zustand";

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>(((set) => ({
  user: null,
  isLoading: false,
  error: null,

  fetchUser: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get("/auth/profile");
      set({ user: response.data, isLoading: false });
    } catch {
      set({
        error: "Failed to fetch user profile",
        isLoading: false,
      });
      AuthService.logout();
    }
  },

  setUser: (user: UserProfile | null) => set({ user }),
  clearUser: () => set({ user: null, error: null }),
})) as StateCreator<UserState>);
