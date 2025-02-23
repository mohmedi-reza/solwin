import { UserService } from './user.service';

interface BalanceCache {
  pdaBalance: number;
  lastUpdated: number;
  pdaAddress: string | null;
}

export class BalanceCacheService {
  private static cache: BalanceCache = {
    pdaBalance: 0,
    lastUpdated: 0,
    pdaAddress: null
  };
  
  private static CACHE_DURATION = 30000; // 30 seconds
  private static listeners: (() => void)[] = [];

  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static getBalance(): BalanceCache {
    return this.cache;
  }

  static async setBalance(pdaBalance: number, pdaAddress: string | null = null) {
    this.cache = {
      pdaBalance,
      lastUpdated: Date.now(),
      pdaAddress
    };

    // Execute all listeners in sequence with delay to prevent race conditions
    await Promise.all(this.listeners.map(async (listener) => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        await listener();
      } catch (error) {
        console.error('Error in balance listener:', error);
      }
    }));
  }

  static async refreshAllData() {
    // Execute all listeners to force refresh
    await Promise.all(this.listeners.map(async (listener) => {
      try {
        await listener();
      } catch (error) {
        console.error('Error refreshing data:', error);
      }
    }));
  }

  static isCacheValid(): boolean {
    return Date.now() - this.cache.lastUpdated < this.CACHE_DURATION;
  }

  static clearCache() {
    this.cache = {
      pdaBalance: 0,
      lastUpdated: 0,
      pdaAddress: null
    };
    // Notify listeners of cache clear
    this.listeners.forEach(listener => listener());
  }

  static async updateAllData() {
    try {
      // Fetch fresh user profile data
      const userProfile = await UserService.getProfile();
      
      // Update cache with new balance
      await this.setBalance(Number(userProfile.balance.pdaBalance));
      
      // Execute all listeners to update components
      await Promise.all(this.listeners.map(async (listener) => {
        try {
          await listener();
        } catch (error) {
          console.error('Error in listener:', error);
        }
      }));

      return userProfile;
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  }
}