export type OfficeFile = { id: string; name: string; bytes: ArrayBuffer; revision: number };

let connection: Promise<IDBDatabase> | undefined;
function database() {
  if (!connection) connection = new Promise<IDBDatabase>((resolve, reject) => {
    const open = indexedDB.open('monstage-office', 1);
    open.onupgradeneeded = () => open.result.createObjectStore('files', { keyPath: 'id' });
    open.onsuccess = () => resolve(open.result);
    open.onerror = () => { connection = undefined; reject(open.error); };
  });
  return connection;
}

export async function listFiles(): Promise<OfficeFile[]> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction('files').objectStore('files').getAll();
    request.onsuccess = () => resolve((request.result as OfficeFile[]).sort((a, b) => b.revision - a.revision));
    request.onerror = () => reject(request.error);
  });
}

export async function writeFile(file: OfficeFile, previousRevision: number): Promise<void> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('files', 'readwrite');
    const store = transaction.objectStore('files');
    const current = store.get(file.id);
    current.onsuccess = () => {
      if ((current.result?.revision ?? 0) !== previousRevision) {
        reject(new Error('Une autre fenêtre a modifié ce document. Télécharge ta copie avant de le rouvrir.'));
        transaction.abort();
      } else store.put(file);
    };
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error('Sauvegarde interrompue.'));
  });
}
