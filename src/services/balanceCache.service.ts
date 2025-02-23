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

    // Execute all listeners in sequence
    for (const listener of this.listeners) {
      try {
        await listener();
      } catch (error) {
        console.error('Error in balance listener:', error);
      }
    }
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
} 