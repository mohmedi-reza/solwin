import { IStorage, StorageOptions } from "./storage.types";

/**
 * SessionStorage implementation of IStorage
 * @template T The type of data being stored
 */
export class SessionStorage<T> implements IStorage<T> {
  private defaultExpiry: number | undefined;

  /**
   * Creates an instance of SessionStorage
   * @param options - Storage options
   */
  constructor(options?: StorageOptions) {
    this.defaultExpiry = options?.defaultExpiry;
  }

  /**
   * Retrieves an item from sessionStorage
   * @param key - The key of the item to retrieve
   * @returns A promise that resolves to the stored value or null if not found
   */
  async getItem(key: string): Promise<T | null> {
    const item = window.sessionStorage.getItem(key);
    if (!item) return null;
    const { data, expiry } = JSON.parse(item);
    if (expiry && Date.now() > expiry) {
      await this.removeItem(key);
      return null;
    }
    return data;
  }

  /**
   * Stores an item in sessionStorage
   * @param key - The key under which to store the value
   * @param value - The value to store
   * @param ttl - Optional time to live in seconds. If not provided, the default expiry will be used.
   * @returns A promise that resolves when the operation is complete
   */
  async setItem(key: string, value: T, ttl?: number): Promise<void> {
    const expiry =
      ttl || this.defaultExpiry
        ? Date.now() + (ttl || this.defaultExpiry!) * 1000
        : undefined;
    const item = { data: value, expiry };
    window.sessionStorage.setItem(key, JSON.stringify(item));
  }

  /**
   * Removes an item from sessionStorage
   * @param key - The key of the item to remove
   * @returns A promise that resolves when the operation is complete
   */
  async removeItem(key: string): Promise<void> {
    window.sessionStorage.removeItem(key);
  }

  /**
   * Clears all items from sessionStorage
   * @returns A promise that resolves when the operation is complete
   */
  async clear(): Promise<void> {
    window.sessionStorage.clear();
  }
}
