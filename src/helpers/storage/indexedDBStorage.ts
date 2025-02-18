import { IStorage, StorageOptions } from "./storage.types";

/**
 * IndexedDB implementation of IStorage
 * @template T The type of data being stored
 */
export class IndexedDBStorage<T> implements IStorage<T> {
  private dbName: string;
  private storeName: string;
  private defaultExpiry: number | undefined;

  /**
   * Creates an instance of IndexedDBStorage
   * @param dbName - The name of the IndexedDB database
   * @param storeName - The name of the object store
   * @param options - Storage options
   */
  constructor(dbName: string, storeName: string, options?: StorageOptions) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.defaultExpiry = options?.defaultExpiry;
  }

  /**
   * Opens a connection to the IndexedDB database
   * @returns A promise that resolves to an IDBDatabase instance
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        db.createObjectStore(this.storeName, { keyPath: "key" });
      };
    });
  }

  /**
   * Retrieves an item from IndexedDB
   * @param key - The key of the item to retrieve
   * @returns A promise that resolves to the stored value or null if not found
   */
  async getItem(key: string): Promise<T | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (!request.result) {
          resolve(null);
        } else {
          const { data, expiry } = request.result;
          if (expiry && Date.now() > expiry) {
            this.removeItem(key).then(() => resolve(null));
          } else {
            resolve(data);
          }
        }
      };
    });
  }

  /**
   * Stores an item in IndexedDB
   * @param key - The key under which to store the value
   * @param value - The value to store
   * @param ttl - Optional time to live in seconds. If not provided, the default expiry will be used.
   * @returns A promise that resolves when the operation is complete
   */
  async setItem(key: string, value: T, ttl?: number): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const expiry =
        ttl || this.defaultExpiry
          ? Date.now() + (ttl || this.defaultExpiry!) * 1000
          : undefined;
      const request = store.put({ key, data: value, expiry });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Removes an item from IndexedDB
   * @param key - The key of the item to remove
   * @returns A promise that resolves when the operation is complete
   */
  async removeItem(key: string): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Clears all items from the IndexedDB object store
   * @returns A promise that resolves when the operation is complete
   */
  async clear(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
