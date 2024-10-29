import type { IEFilePointerIn, IEFileIn, IEFile } from '../types';

const DB_NAME = 'DecrypterDB';
const DB_VERSION = 3;

export enum EDbStore {
  FILE = 'EFile',
  POINTER = 'EFilePointer',
}

type IStoreContainedElsMapIn = {
  [EDbStore.FILE]: IEFileIn;
  [EDbStore.POINTER]: IEFilePointerIn;
};

type IStoreContainedElsMapOut = {
  [EDbStore.FILE]: IEFile;
  [EDbStore.POINTER]: IEFilePointerIn;
};

type IStoreValueIn<Store extends EDbStore> = IStoreContainedElsMapIn[Store];
type IStoreValueOut<Store extends EDbStore> = IStoreContainedElsMapOut[Store];

(() => {
  const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

  dbRequest.onupgradeneeded = (event) => {
    const db = (event.target as any).result as IDBDatabase;

    if (event.oldVersion < 1) {
      db.createObjectStore(EDbStore.FILE, { keyPath: 'id' });
    }

    if (event.oldVersion < 3) {
      const fileStore = dbRequest.transaction?.objectStore(EDbStore.FILE);

      if (!fileStore) {
        // TODO Better to log, but I dont have sentry. It's better to show snackbar at least ;(
        return;
      }

      fileStore.createIndex('name', 'name', { unique: true });
      db.createObjectStore(EDbStore.POINTER, { keyPath: 'fileId' });
    }
  };
})();

const getDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    try {
      const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

      dbRequest.onsuccess = async (event) => {
        const db = (event.target as any).result as IDBDatabase;
        resolve(db);
      };

      dbRequest.onerror = (event) => {
        reject((event.target as any).error);
      };
    } catch (err) {
      reject(err);
    }
  });

export const dbAdd = <Store extends EDbStore, T extends IStoreValueIn<Store>>(storeName: Store, data: T) =>
  new Promise<string>(async (resolve, reject) => {
    try {
      const db = await getDb();
      const tx = db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      const id = crypto.randomUUID();
      const request = store.add({ id, ...data });

      request.onsuccess = () => resolve(id);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });

export const dbGet = <Store extends EDbStore>(storeName: Store, val: string) =>
  new Promise<IStoreValueOut<Store> | null>(async (resolve, reject) => {
    try {
      const db = await getDb();
      const tx = db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      const request = store.get(val);
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });

export const dbGetAll = <Store extends EDbStore>(storeName: Store) =>
  new Promise<IStoreValueOut<Store>[]>(async (resolve, reject) => {
    try {
      const db = await getDb();
      const tx = db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      const request = store.getAll();

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });

export const dbIndex = <Store extends EDbStore>(storeName: Store, index: string, val: string) =>
  new Promise<IStoreValueOut<Store> | null>(async (resolve, reject) => {
    try {
      const db = await getDb();
      const tx = db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      const dbIndex = store.index(index);

      const request = dbIndex.get(val);

      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });

export const dbDelete = <Store extends EDbStore>(storeName: Store, val: string) =>
  new Promise(async (resolve, reject) => {
    try {
      const db = await getDb();
      const tx = db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);

      const request = store.delete(val);

      request.onsuccess = () => resolve(null);
      request.onerror = () => reject(request.error);
    } catch (err) {
      reject(err);
    }
  });
