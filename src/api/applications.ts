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
