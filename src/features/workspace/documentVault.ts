export type ApplicationDocumentKind = 'cv' | 'letter' | 'other';
export interface ApplicationDocument {
  id: string;
  offerId: string;
  kind: ApplicationDocumentKind;
  name: string;
  mimeType: string;
  createdAt: string;
  file: Blob;
}
const DB_NAME = 'monstage-application-documents';
const STORE_NAME = 'documents';
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('byOffer', 'offerId', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Database unavailable'));
  });
}
export async function listApplicationDocuments(offerId: string): Promise<ApplicationDocument[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).index('byOffer').getAll(offerId);
    request.onsuccess = () => resolve((request.result as ApplicationDocument[]).sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}
export async function saveApplicationDocument(offerId: string, kind: ApplicationDocumentKind, file: File): Promise<void> {
  if (!file.name.toLowerCase().endsWith('.pdf') || file.type && file.type !== 'application/pdf') throw new Error('Document PDF requis.');
  if (file.size > 10 * 1024 * 1024) throw new Error('Fichier trop volumineux (10 Mo max).');
  const db = await openDatabase();
  const item: ApplicationDocument = { id: crypto.randomUUID(), offerId, kind, name: file.name, mimeType: 'application/pdf', createdAt: new Date().toISOString(), file };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(item);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
export async function removeApplicationDocument(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
