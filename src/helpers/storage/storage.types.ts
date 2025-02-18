/**
 * Interface for storage operations
 * @template T The type of data being stored
 */
export interface IStorage<T> {
  /**
   * Retrieves an item from storage
   * @param key - The key of the item to retrieve
   * @returns A promise that resolves to the stored value or null if not found
   */
  getItem(key: string): Promise<T | null>;

  /**
   * Stores an item in storage
   * @param key - The key under which to store the value
   * @param value - The value to store
   * @param ttl - Optional time to live in seconds. If not provided, the default expiry will be used.
   * @returns A promise that resolves when the operation is complete
   */
  setItem(key: string, value: T, ttl?: number): Promise<void>;

  /**
   * Removes an item from storage
   * @param key - The key of the item to remove
   * @returns A promise that resolves when the operation is complete
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clears all items from storage
   * @returns A promise that resolves when the operation is complete
   */
  clear(): Promise<void>;
}

/**
 * Options for creating a storage instance
 */
export interface StorageOptions {
  /**
   * Default expiry time in seconds
   */
  defaultExpiry?: number;
}
