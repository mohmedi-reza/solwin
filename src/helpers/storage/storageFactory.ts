import { LocalStorage } from "./localStorage";
import { SessionStorage } from "./sessionStorage";
import { IndexedDBStorage } from "./indexedDBStorage";
import { IStorage, StorageOptions } from "./storage.types";

/** Options for creating IndexedDB storage */
interface IndexedDBOptions extends StorageOptions {
  dbName: string;
  storeName: string;
}

// Interface for when the type is 'local' or 'session'
interface CreateStorageParamsBase<T> {
  type: "local" | "session";
  options?: StorageOptions;
}

// Interface for when the type is 'indexedDB'
interface CreateStorageParamsIndexedDB<T> {
  type: "indexedDB";
  options: IndexedDBOptions;
}

// Union type to ensure that options are provided when type is 'indexedDB'
type CreateStorageParams<T> =
  | CreateStorageParamsBase<T>
  | CreateStorageParamsIndexedDB<T>;

/**
 * Creates a storage instance based on the specified type
 * @template T The type of data being stored
 * @param params - An object containing the storage type and options
 * @returns An instance of IStorage
 * @throws Error if invalid storage type is provided
 * @example
 * const localStorage: IStorage<ChatData> = createStorage({ type: "local", options: { defaultExpiry: 3600 } }); // 60 * 60 * 1 : 1 hour
 * const indexedDBStorage: IStorage<ChatData> = createStorage({ type: "indexedDB", options: { dbName: "MyDB", storeName: "MyStore", defaultExpiry: 86400 } });
 */
export function createStorage<T>(params: CreateStorageParams<T>): IStorage<T> {
  switch (params.type) {
    case "local":
      return new LocalStorage<T>(params.options);
    case "session":
      return new SessionStorage<T>(params.options);
    case "indexedDB":
      return new IndexedDBStorage<T>(
        params.options.dbName,
        params.options.storeName,
        params.options
      );
    default:
      throw new Error("Invalid storage type");
  }
}
