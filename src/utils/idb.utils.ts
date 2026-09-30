import { queryCacheStorageKey } from "../keys/storage.keys";

const queryStoreName = "queries";
const databaseVersion = 1;

let databasePromise: Promise<IDBDatabase> | null = null;

const resultOf = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const openDatabase = (): Promise<IDBDatabase> => {
  databasePromise ??= new Promise((resolve, reject) => {
    const request = indexedDB.open(queryCacheStorageKey, databaseVersion);
    request.onupgradeneeded = () =>
      request.result.createObjectStore(queryStoreName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return databasePromise;
};

const queryStoreOf = async (mode: IDBTransactionMode): Promise<IDBObjectStore> =>
  (await openDatabase())
    .transaction(queryStoreName, mode)
    .objectStore(queryStoreName);

export const readAllQueries = async <T>(): Promise<Record<string, T>> => {
  const store = await queryStoreOf("readonly");
  const [keys, values] = await Promise.all([
    resultOf(store.getAllKeys()),
    resultOf(store.getAll()),
  ]);
  return Object.fromEntries(
    keys.map((key, index) => [String(key), values[index] as T])
  );
};

export const putQuery = async <T>(key: string, value: T): Promise<void> => {
  const store = await queryStoreOf("readwrite");
  await resultOf(store.put(value, key));
};

export const clearQueries = async (): Promise<void> => {
  const store = await queryStoreOf("readwrite");
  await resultOf(store.clear());
};
