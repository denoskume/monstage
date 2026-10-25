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
  if (!response.ok) throw new Error(String(result.message || result.error || 'Erreur Google Drive'));
  return result;
}
export async function listApplicationDocuments(offerId: string, token: string | null): Promise<DocumentCollection> {
  const result = await requestDocuments(token, 'listApplicationDocuments', { offerId });
  return { documents: Array.isArray(result.documents) ? result.documents as ApplicationDocument[] : [], folderUrl: typeof result.folderUrl === 'string' ? result.folderUrl : null };
}
export async function saveApplicationDocument(offerId: string, kind: ApplicationDocumentKind, file: File, token: string | null, company: string): Promise<void> {
  if (!/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) throw new Error('Document PDF requis.');
  if (file.size > 5 * 1024 * 1024) throw new Error('Fichier trop volumineux (5 Mo max).');
  const buffer = new Uint8Array(await file.arrayBuffer());
  if (buffer.length < 5 || String.fromCharCode(...buffer.slice(0, 5)) !== '%PDF-') throw new Error('Fichier PDF invalide.');
  let binary = '';
  const sliceSize = 8192;
  for (let i = 0; i < buffer.length; i += sliceSize) {
    binary += String.fromCharCode(...buffer.subarray(i, i + sliceSize));
  }
  await requestDocuments(token, 'uploadApplicationDocument', {
    offerId, company, kind, name: file.name, contentBase64: btoa(binary),
  });
}
export async function removeApplicationDocument(offerId: string, documentId: string, token: string | null): Promise<void> {
  await requestDocuments(token, 'deleteApplicationDocument', { offerId, documentId });
}
