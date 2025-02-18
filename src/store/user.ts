import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface IUserTokens {
  accessToken: string;
  refreshToken: string;
}

type UserState = {
  userTokens: IUserTokens | null;
  walletAddress: string | null;
  login: (data: { userTokens: IUserTokens; walletAddress: string }) => void;
  reset: () => void;
  isAuthenticated: () => boolean;
};

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userTokens: null,
      walletAddress: null,

      login: ({ userTokens, walletAddress }) => {
        set({ userTokens, walletAddress });
      },

      reset: () => {
        set({ userTokens: null, walletAddress: null });
      },

      isAuthenticated: () => {
        const tokens = get().userTokens;
        return !!tokens?.accessToken;
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
