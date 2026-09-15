const GIS_SRC = 'https://accounts.google.com/gsi/client';

type CredentialResponse = { credential?: string };

type GoogleIdentityApi = {
  initialize: (options: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    auto_select?: boolean;
  }) => void;
  renderButton: (target: HTMLElement, options: Record<string, unknown>) => void;
  disableAutoSelect?: () => void;
};

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: GoogleIdentityApi;
    };
  };
};

let loadPromise: Promise<GoogleIdentityApi> | null = null;

function currentApi(): GoogleIdentityApi | null {
  return (window as GoogleWindow).google?.accounts?.id ?? null;
}

function loadGoogleIdentity(): Promise<GoogleIdentityApi> {
  const existing = currentApi();
  if (existing) return Promise.resolve(existing);
  if (loadPromise) return loadPromise;

  const pending = new Promise<GoogleIdentityApi>((resolve, reject) => {
    const prior = document.querySelector<HTMLScriptElement>('script[data-monstage-gis]');
    const script = prior ?? document.createElement('script');

    const finish = () => {
      const api = currentApi();
      if (api) resolve(api);
      else reject(new Error('Google Identity Services failed to initialize'));
    };

    const fail = () => reject(new Error('Google Identity Services failed to load'));

    script.addEventListener('load', finish, { once: true });
    script.addEventListener('error', fail, { once: true });

    if (!prior) {
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.monstageGis = 'true';
      document.head.appendChild(script);
    }
  }).catch((error) => {
    loadPromise = null;
    throw error;
  });

  loadPromise = pending;
  return pending;
}

export async function renderGoogleSignInButton(
  target: HTMLElement,
  clientId: string,
  onCredential: (credential: string) => void,
): Promise<void> {
  const api = await loadGoogleIdentity();
  target.replaceChildren();
  api.initialize({
    client_id: clientId,
    auto_select: false,
    callback: (response) => {
      if (typeof response.credential === 'string' && response.credential) {
        onCredential(response.credential);
      }
    },
  });
  api.renderButton(target, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular',
    logo_alignment: 'left',
  });
}

export function disableGoogleAutoSelect(): void {
  currentApi()?.disableAutoSelect?.();
}
