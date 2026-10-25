import { ApiAuthError, apiBaseUrl } from './authClient';

export interface NativeApplicationPayload {
  offerId: string;
  applicationUrl: string;
  provider: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  message: string;
  consent: boolean;
  company: string;
  title: string;
  attachments: Array<{ name: string; mimeType: string; dataBase64: string }>;
}

export interface NativeApplicationResult {
  submitted: boolean;
  provider: string;
  reference: string | null;
  message: string;
}

export async function submitNativeApplication(token: string | null, payload: NativeApplicationPayload): Promise<NativeApplicationResult> {
  if (!token) throw new ApiAuthError(401);

  const response = await fetch(apiBaseUrl() + '/api/applications/submit', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401 || response.status === 403) throw new ApiAuthError(response.status);
  const body = await response.json() as NativeApplicationResult & { error?: string };
  if (!response.ok) throw new Error(body.message || body.error || 'APPLICATION_SUBMISSION_FAILED');
  return body;
}


export interface ExternalApplicationPayload {
  company: string;
  title: string;
  city: string;
  applicationUrl: string;
  appliedAt: string;
  applicationStatus: string;
  nextAction: string;
  domain: string;
  specialization: string;
}

export interface ExternalApplicationResult {
  created: boolean;
  offerId: string;
  message: string;
}

export async function addExternalApplication(token: string | null, payload: ExternalApplicationPayload): Promise<ExternalApplicationResult> {
  if (!token) throw new ApiAuthError(401);

  const response = await fetch(apiBaseUrl() + '/api/applications/external', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401 || response.status === 403) throw new ApiAuthError(response.status);
  const body = await response.json() as ExternalApplicationResult & { error?: string };
  if (!response.ok) throw new Error(body.message || body.error || 'EXTERNAL_APPLICATION_CREATE_FAILED');
  return body;
}

export async function saveApplicationStatus(token: string | null, offerId: string, status: string): Promise<void> {
  if (!token) throw new ApiAuthError(401);
  const response = await fetch(apiBaseUrl() + '/api/applications/status', {
    method: 'POST', cache: 'no-store',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ offerId, status }),
  });
  if (response.status === 401 || response.status === 403) throw new ApiAuthError(response.status);
  if (!response.ok) {
    const result = await response.json().catch(() => ({})) as { message?: string; error?: string };
    throw new Error(result.message || result.error || 'Impossible de sauvegarder le statut.');
  }
}
