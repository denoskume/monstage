import { ApiAuthError, apiBaseUrl } from '../../api/authClient';

export type ApplicationDocumentKind = 'cv' | 'letter' | 'other';
export interface ApplicationDocument {
  id: string;
  kind: ApplicationDocumentKind;
  name: string;
  url: string;
  createdAt: string;
  modifiedAt?: string;
}
export interface DocumentCollection {
  documents: ApplicationDocument[];
  folderUrl: string | null;
}

async function requestDocuments(token: string | null, action: string, document: Record<string, unknown>): Promise<Record<string, unknown>> {
  if (!token) throw new ApiAuthError(401);
  const response = await fetch(apiBaseUrl() + '/api/applications/documents', {
    method: 'POST', cache: 'no-store',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, document }),
  });
  const result = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok || (typeof result.status === 'number' && (result.status < 200 || result.status >= 300)) || result.error) {
    throw new Error(String(result.message || result.error || 'Erreur Google Drive'));
  }
  return result;
}
export async function listApplicationDocuments(offerId: string, token: string | null): Promise<DocumentCollection> {
  const result = await requestDocuments(token, 'listApplicationDocuments', { offerId });
  return { documents: Array.isArray(result.documents) ? result.documents as ApplicationDocument[] : [], folderUrl: typeof result.folderUrl === 'string' ? result.folderUrl : null };
}
export async function saveApplicationDocument(offerId: string, kind: ApplicationDocumentKind, file: File, token: string | null, company: string): Promise<ApplicationDocument> {
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) throw new Error('Document PDF requis.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Fichier trop volumineux (5 Mo max).');
  const buffer = new Uint8Array(await file.arrayBuffer());
  if (buffer.length < 5 || String.fromCharCode(...buffer.slice(0, 5)) !== '%PDF-') throw new Error('Fichier PDF invalide.');
  let binary = '';
  const sliceSize = 8192;
  for (let i = 0; i < buffer.length; i += sliceSize) {
    binary += String.fromCharCode(...buffer.subarray(i, i + sliceSize));
  }
  const result = await requestDocuments(token, 'uploadApplicationDocument', {
    offerId, company, kind, name: file.name, contentBase64: btoa(binary),
  });
  if (result.saved !== true || typeof result.id !== 'string') throw new Error('Google Drive ne confirme pas la sauvegarde du PDF.');
  // Confirm that the saved PDF is actually retrievable from the application's Drive folder.
  // Drive listings can be briefly delayed, so retry before declaring an archive failure.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const collection = await listApplicationDocuments(offerId, token);
    const saved = collection.documents.find(document => document.id === result.id);
    if (saved) return saved;
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 500 * (attempt + 1)));
  }
  throw new Error('Le PDF a été envoyé, mais sa présence dans le dossier Google Drive reste à vérifier.');
}
export async function removeApplicationDocument(offerId: string, documentId: string, token: string | null): Promise<void> {
  await requestDocuments(token, 'deleteApplicationDocument', { offerId, documentId });
}
