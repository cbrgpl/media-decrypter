const DB_NAME = 'dirHandleDB';
const STORE_NAME = 'handles';
const CACHED_DIR_HANDLE_KEY = 'cached_dir_handle';

const getDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const dbRequest = indexedDB.open(DB_NAME, 2);

    dbRequest.onupgradeneeded = (event) => {
      const db = (event.target as any).result as IDBDatabase;
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    };

    dbRequest.onsuccess = async (event) => {
      const db = (event.target as any).result as IDBDatabase;
      resolve(db);
    };

    dbRequest.onerror = (event) => {
      reject((event.target as any).error);
    };
  });

const verifyPermission = async (dirHandle: FileSystemDirectoryHandle) => {
  const options: FileSystemHandlePermissionDescriptor = { mode: 'read' };

  // Check if permission was already granted. If so, return true.
  if ((await dirHandle.queryPermission(options)) === 'granted') {
    return true;
  }
  // Request permission. If the user grants permission, return true.
  if ((await dirHandle.requestPermission(options)) === 'granted') {
    return true;
  }
  // The user didn't grant permission, so return false.
  return false;
};

export const saveDirHandle = (dirHandle: FileSystemDirectoryHandle) =>
  new Promise(async (resolve, reject) => {
    const granted = await verifyPermission(dirHandle);
    if (!granted) {
      return;
    }

    const db = await getDb();
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const dirStore = tx.objectStore(STORE_NAME);

    const request = dirStore.put({ id: CACHED_DIR_HANDLE_KEY, handle: dirHandle });

    request.onsuccess = () => {
      resolve(null);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });

export const getDirHandle = () =>
  new Promise<FileSystemDirectoryHandle | null>(async (resolve, reject) => {
    const db = await getDb();
    const tx = db.transaction([STORE_NAME], 'readwrite');
    const dirStore = tx.objectStore(STORE_NAME);

    const request = dirStore.get(CACHED_DIR_HANDLE_KEY);

    request.onsuccess = async () => {
      const storedHandle = request.result?.handle as FileSystemDirectoryHandle | undefined;

      if (!storedHandle) {
        resolve(null);
        return;
      }

      const granted = await verifyPermission(storedHandle);

      if (!granted) {
        resolve(null);
        return;
      }

      resolve(storedHandle);
    };
    request.onerror = () => reject(request.error);
  });
