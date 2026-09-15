# MonStage Private Google Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make MonStage a private single-user workspace that only accepts the configured Google account and protects internship data behind a verified Cloudflare Worker gateway.

**Architecture:** The React/Vite app remains on GitHub Pages and uses Google Identity Services (GIS) only to obtain a Google ID credential. A Cloudflare Worker becomes the only browser-facing data API: it verifies the Google JWT with Google JWKS, checks audience, expiry, verified email, and the server-side allowed-email secret, then POSTs a server-only gateway secret to Apps Script. Apps Script returns offers only from `doPost` when that gateway secret matches; direct `GET /exec` never returns offers.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Vitest, Playwright, Google Identity Services, Cloudflare Workers, Wrangler, `jose`, Google Apps Script, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-15-private-google-auth-design.md`

## Global Constraints

- Exactly one Google account is authorized; the allowed email is a Worker secret and must not appear in the public frontend bundle.
- GitHub Pages remains the frontend host.
- The Google Sheet remains private.
- The browser must never call Apps Script directly after migration.
- No JSONP in the production data path.
- Apps Script must read offers only after a valid gateway secret arrives in a POST body.
- Google bearer tokens, gateway secrets, Apps Script URL, and allowed email must never be logged or committed.
- Frontend tokens use `sessionStorage`, never `localStorage`.
- Legacy offer cache `monstage:offers-cache:v1` must be removed on startup/logout and never used after migration.
- `401` invalidates the local session; `403` shows the private-workspace denial state and never falls back to cached data.
- Protected responses use `Cache-Control: no-store`.
- Production CORS allows only `https://denoskume.github.io`.
- Official company names and official job titles remain unchanged.
- All MonStage UI copy remains English.
- Normal personal usage must stay within free-tier tooling.

---

## File Structure

### Frontend

- `src/auth/session.ts` — sessionStorage token helpers, JWT expiry parsing, legacy cache cleanup.
- `src/auth/session.test.ts` — storage and expiry tests.
- `src/auth/googleIdentity.ts` — GIS script loading, initialization, button rendering, auto-select disable.
- `src/auth/googleIdentity.test.ts` — GIS wrapper tests with a mocked `window.google`.
- `src/auth/AuthProvider.tsx` — authoritative frontend auth state and Worker session validation.
- `src/auth/AuthProvider.test.tsx` — signed-out, authorized, denied, expired, and logout behavior.
- `src/auth/useAuth.ts` — typed context accessor.
- `src/auth/ProtectedApp.tsx` — auth gate between login and application routes.
- `src/features/auth/LoginPage.tsx` — professional private-workspace login UI.
- `src/features/auth/AccountMenu.tsx` — authenticated email + sign-out.
- `src/api/authClient.ts` — `/api/session` request and auth-specific errors.
- `src/api/client.ts` — bearer-authenticated `/api/offers`; remove JSONP and persistent cache.
- `src/hooks/useOffers.ts` — consume auth token and invalidate session on `401`.
- `src/app/App.tsx` — mount `AuthProvider` and `ProtectedApp`.
- `src/app/AppShell.tsx` / `src/components/TopNav.tsx` — account menu integration.
- `src/vite-env.d.ts` / `.env.example` — public GIS client ID + Worker URL.
- `src/styles/globals.css` / `src/styles/responsive.css` — login/account menu styling.
- `e2e/responsive.spec.ts` — signed-out, authorized, denied, logout, responsive flows.

### Worker

- `worker/package.json` — isolated Worker scripts/dependencies.
- `worker/tsconfig.json` — Worker TypeScript config.
- `worker/wrangler.toml` — Worker entry/config with non-secret vars only.
- `worker/src/env.ts` — binding types.
- `worker/src/cors.ts` — exact-origin allowlist and no-store headers.
- `worker/src/auth.ts` — Google JWT verification and single-email authorization.
- `worker/src/appsScript.ts` — server-to-server POST proxy.
- `worker/src/index.ts` — `/api/session`, `/api/offers`, `OPTIONS` routing.
- `worker/test/auth.test.ts` — token claim/signature authorization tests.
- `worker/test/index.test.ts` — route, CORS, backend proxy, secret-handling tests.

### Apps Script / deployment

- `apps-script/Code.gs` — remove public GET offers, add secret-gated POST.
- `apps-script/README.md` — deployment + Script Property instructions.
- `.github/workflows/deploy-pages.yml` — build public frontend config only; remove direct Apps Script verification.
- `README.md` / `SECURITY.md` — private-auth architecture and secret handling.

---

### Task 1: Harden Apps Script Behind a POST Gateway Secret

**Files:**
- Modify: `apps-script/Code.gs`
- Modify: `apps-script/README.md`

**Interfaces:**
- Consumes: Script Properties `SPREADSHEET_ID`, `MONSTAGE_GATEWAY_SECRET`.
- Produces: `doPost(e)` JSON endpoint that returns `{ generatedAt, source, offers }` only for a valid secret; `doGet()` returns an error payload with no offers.

- [ ] **Step 1: Add a failing Apps Script contract test locally as a pure-function testable module expectation**

Create `src/api/appsScriptContract.test.ts` with a source-text regression test so the public repo cannot accidentally reintroduce JSONP or public `doGet` offer reads:

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'apps-script/Code.gs'), 'utf8');

test('Apps Script exposes offers only through secret-gated POST', () => {
  expect(source).toContain("getProperty('MONSTAGE_GATEWAY_SECRET')");
  expect(source).toMatch(/function doPost\(e\)/);
  expect(source).toMatch(/function doGet\(\)/);
  expect(source).not.toContain('callback(');
  expect(source).not.toContain('isSafeJsonpCallback_');
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test -- src/api/appsScriptContract.test.ts`

Expected: FAIL because current `Code.gs` still exposes JSONP and has no `MONSTAGE_GATEWAY_SECRET` check.

- [ ] **Step 3: Replace the Apps Script public entry points**

Keep existing sanitization helpers and `getOffers_()`, but replace JSONP helpers and request handlers with:

```js
function jsonOutput_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function secureEquals_(left, right) {
  left = String(left || '');
  right = String(right || '');
  if (left.length !== right.length) return false;
  var mismatch = 0;
  for (var i = 0; i < left.length; i += 1) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return mismatch === 0;
}

function readGatewaySecret_(e) {
  if (!e || !e.postData || !e.postData.contents) return null;
  try {
    var body = JSON.parse(e.postData.contents);
    return normalizeText_(body.gatewaySecret);
  } catch (error) {
    return null;
  }
}

function doGet() {
  return jsonOutput_({
    error: 'NOT_FOUND',
    message: 'Not found'
  });
}

function doPost(e) {
  try {
    var expectedSecret = PropertiesService
      .getScriptProperties()
      .getProperty('MONSTAGE_GATEWAY_SECRET');
    var providedSecret = readGatewaySecret_(e);

    if (!expectedSecret || !secureEquals_(providedSecret, expectedSecret)) {
      return jsonOutput_({
        error: 'UNAUTHORIZED',
        message: 'Unauthorized'
      });
    }

    return jsonOutput_({
      generatedAt: new Date().toISOString(),
      source: 'Stage Intelligence France',
      offers: getOffers_()
    });
  } catch (error) {
    console.error('MonStage backend error');
    return jsonOutput_({
      error: 'MONSTAGE_API_ERROR',
      message: 'Unable to load offers'
    });
  }
}
```

Do not log `e`, request bodies, or secrets.

- [ ] **Step 4: Update deployment documentation**

Document exact Script Properties:

```text
SPREADSHEET_ID=<existing private spreadsheet id>
MONSTAGE_GATEWAY_SECRET=<64-hex-character secret generated with openssl rand -hex 32>
```

Document that the Web App remains `Execute as: Me`, access `Anyone`, but direct GET returns no data and POST requires the server-side secret.

- [ ] **Step 5: Run test and full frontend suite**

Run: `npm test -- src/api/appsScriptContract.test.ts && npm test`

Expected: PASS, no JSONP regression.

- [ ] **Step 6: Commit**

```bash
git add apps-script/Code.gs apps-script/README.md src/api/appsScriptContract.test.ts
git commit -m "security: gate Apps Script offers behind server secret"
```

---

### Task 2: Build the Cloudflare Worker Authentication Gateway

**Files:**
- Create: `worker/package.json`
- Create: `worker/tsconfig.json`
- Create: `worker/wrangler.toml`
- Create: `worker/src/env.ts`
- Create: `worker/src/cors.ts`
- Create: `worker/src/auth.ts`
- Create: `worker/src/appsScript.ts`
- Create: `worker/src/index.ts`
- Create: `worker/test/auth.test.ts`
- Create: `worker/test/index.test.ts`

**Interfaces:**
- Consumes: `GOOGLE_CLIENT_ID`, `ALLOWED_ORIGINS`, `ALLOWED_EMAIL`, `APPS_SCRIPT_URL`, `APPS_SCRIPT_GATEWAY_SECRET`.
- Produces: `GET /api/session`, `GET /api/offers`, `OPTIONS`; exported `verifyAuthorizedUser(token, env)` and Worker `fetch(request, env)`.

- [ ] **Step 1: Create Worker package/config**

`worker/package.json`:

```json
{
  "name": "monstage-auth-gateway",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "dev": "wrangler dev",
    "deploy": "wrangler deploy"
  },
  "dependencies": {
    "jose": "^6.1.0"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20260915.0",
    "typescript": "~5.9.2",
    "vitest": "^3.2.4",
    "wrangler": "^4.37.1"
  }
}
```

`worker/wrangler.toml`:

```toml
name = "monstage-auth-gateway"
main = "src/index.ts"
compatibility_date = "2026-09-15"

[vars]
ALLOWED_ORIGINS = "https://denoskume.github.io"
```

No email, Apps Script URL, or gateway secret belongs in `wrangler.toml`.

- [ ] **Step 2: Write failing auth tests**

In `worker/test/auth.test.ts`, generate an ephemeral RSA key pair with `jose`, sign tokens, and mock JWKS resolution. Cover these exact outcomes:

```ts
expect(await authorize({ token: missingToken })).toEqual({ status: 401 });
expect(await authorize({ token: wrongAudienceToken })).toEqual({ status: 401 });
expect(await authorize({ token: expiredToken })).toEqual({ status: 401 });
expect(await authorize({ token: unverifiedEmailToken })).toEqual({ status: 401 });
expect(await authorize({ token: otherUserToken })).toEqual({ status: 403 });
expect((await authorize({ token: allowedToken })).status).toBe(200);
```

Use test dependency injection for JWKS resolution; production still uses Google JWKS.

- [ ] **Step 3: Run Worker tests and verify RED**

Run: `cd worker && npm install --no-audit --no-fund && npm test`

Expected: FAIL because Worker source does not exist.

- [ ] **Step 4: Implement environment + CORS helpers**

`worker/src/env.ts`:

```ts
export interface Env {
  GOOGLE_CLIENT_ID: string;
  ALLOWED_ORIGINS: string;
  ALLOWED_EMAIL: string;
  APPS_SCRIPT_URL: string;
  APPS_SCRIPT_GATEWAY_SECRET: string;
}
```

`worker/src/cors.ts` exports:

```ts
export function allowedOrigin(request: Request, env: Env): string | null;
export function responseHeaders(origin: string | null): Headers;
```

`responseHeaders` must include `Cache-Control: no-store`, `Vary: Origin`, JSON content type, and `Access-Control-Allow-Origin` only for an exact configured origin.

- [ ] **Step 5: Implement Google JWT verification**

Use `jose`:

```ts
import { createRemoteJWKSet, jwtVerify } from 'jose';

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

export interface AuthorizedUser {
  email: string;
  name: string | null;
  picture: string | null;
}

export async function verifyAuthorizedUser(
  token: string,
  env: Env,
  jwks = GOOGLE_JWKS,
): Promise<AuthorizedUser> {
  const { payload, protectedHeader } = await jwtVerify(token, jwks, {
    audience: env.GOOGLE_CLIENT_ID,
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    algorithms: ['RS256'],
  });

  if (protectedHeader.alg !== 'RS256') throw new AuthError(401, 'INVALID_TOKEN');
  if (payload.email_verified !== true || typeof payload.email !== 'string') {
    throw new AuthError(401, 'INVALID_TOKEN');
  }
  if (payload.email.toLowerCase() !== env.ALLOWED_EMAIL.toLowerCase()) {
    throw new AuthError(403, 'ACCESS_DENIED');
  }

  return {
    email: payload.email,
    name: typeof payload.name === 'string' ? payload.name : null,
    picture: typeof payload.picture === 'string' ? payload.picture : null,
  };
}
```

`jwtVerify` performs signature, `exp`, `iss`, and `aud` validation. Never include the raw token in thrown/logged errors.

- [ ] **Step 6: Implement Apps Script proxy**

`worker/src/appsScript.ts`:

```ts
export async function fetchOffersFromAppsScript(env: Env): Promise<unknown> {
  const response = await fetch(env.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gatewaySecret: env.APPS_SCRIPT_GATEWAY_SECRET }),
  });
  if (!response.ok) throw new Error('BACKEND_UNAVAILABLE');
  return response.json();
}
```

Validate that the backend payload has `source === 'Stage Intelligence France'`, an ISO-like `generatedAt` string, and an `offers` array before returning it to the browser.

- [ ] **Step 7: Implement Worker routes**

`worker/src/index.ts` behavior:

```ts
if (request.method === 'OPTIONS') return preflight(...);
if (url.pathname === '/api/session' && request.method === 'GET') {
  const user = await requireUser(request, env);
  return json({ user }, 200, headers);
}
if (url.pathname === '/api/offers' && request.method === 'GET') {
  await requireUser(request, env);
  const payload = await fetchOffersFromAppsScript(env);
  return json(payload, 200, headers);
}
return json({ error: 'NOT_FOUND' }, 404, headers);
```

Missing/invalid bearer credential -> `401`; valid wrong account -> `403`; invalid backend payload/backend failure -> `502`.

- [ ] **Step 8: Add route/CORS/backend tests**

Test exact origin allow/deny, `OPTIONS`, no-store headers, bearer enforcement, wrong-account `403`, successful `/api/session`, successful `/api/offers`, and verify the mocked Apps Script call body contains `gatewaySecret` while the Worker response does not.

- [ ] **Step 9: Run Worker verification**

Run: `cd worker && npm test && npm run typecheck`

Expected: all Worker tests PASS and TypeScript exit 0.

- [ ] **Step 10: Commit**

```bash
git add worker
git commit -m "feat: add authenticated MonStage security gateway"
```

---

### Task 3: Replace Persistent Offer Caching and Direct Apps Script Client

**Files:**
- Modify: `src/api/client.ts`
- Modify: `src/api/client.test.ts`
- Create: `src/api/authClient.ts`
- Create: `src/api/authClient.test.ts`
- Create: `src/auth/session.ts`
- Create: `src/auth/session.test.ts`
- Modify: `src/vite-env.d.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `fetchSession(token)`, `fetchOffers(token)`, `readSessionToken()`, `writeSessionToken(token)`, `clearProtectedSession()`, `isTokenExpiredForUx(token)`.
- Consumes later: `AuthProvider` and `useOffers`.

- [ ] **Step 1: Write failing storage/API tests**

Test these exact expectations:

```ts
expect(localStorage.getItem('monstage:offers-cache:v1')).toBeNull();
expect(sessionStorage.getItem('monstage:google-id-token:v1')).toBe(token);
expect(request.headers.get('Authorization')).toBe(`Bearer ${token}`);
expect(request.url).toBe('https://gateway.example/api/offers');
```

Also assert no script element/JSONP callback is created by `fetchOffers`.

- [ ] **Step 2: Run targeted tests and verify RED**

Run: `npm test -- src/auth/session.test.ts src/api/authClient.test.ts src/api/client.test.ts`

Expected: FAIL because auth/session modules do not exist and current client still uses JSONP/localStorage.

- [ ] **Step 3: Implement session helpers**

Use constants:

```ts
const TOKEN_KEY = 'monstage:google-id-token:v1';
const LEGACY_OFFERS_CACHE_KEY = 'monstage:offers-cache:v1';
```

`clearProtectedSession()` removes both keys. `cleanupLegacyOfferCache()` runs on startup. `isTokenExpiredForUx()` base64url-decodes the JWT payload and returns true when `exp * 1000 <= Date.now()`; parsing failures count as expired.

- [ ] **Step 4: Implement authenticated API clients**

`src/api/authClient.ts`:

```ts
export class ApiAuthError extends Error {
  constructor(public readonly status: 401 | 403) {
    super(status === 403 ? 'ACCESS_DENIED' : 'UNAUTHORIZED');
  }
}

export async function fetchSession(token: string): Promise<SessionResponse> {
  const response = await fetch(`${requiredApiBase()}/api/session`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (response.status === 401 || response.status === 403) {
    throw new ApiAuthError(response.status);
  }
  if (!response.ok) throw new Error('SESSION_UNAVAILABLE');
  return response.json();
}
```

Rewrite `fetchOffers(token)` as normal CORS fetch to `${VITE_MONSTAGE_API_URL}/api/offers`, with bearer auth and no-store. Remove `buildJsonpUrl`, `requiresJsonp`, JSONP callbacks, `saveCachedOffers`, and `loadCachedOffers`.

- [ ] **Step 5: Update environment typing/example**

`src/vite-env.d.ts`:

```ts
interface ImportMetaEnv {
  readonly VITE_MONSTAGE_API_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}
```

`.env.example` contains only public placeholders:

```text
VITE_MONSTAGE_API_URL=https://monstage-auth-gateway.<account>.workers.dev
VITE_GOOGLE_CLIENT_ID=000000000000-example.apps.googleusercontent.com
```

- [ ] **Step 6: Run targeted + full frontend tests**

Run: `npm test -- src/auth/session.test.ts src/api/authClient.test.ts src/api/client.test.ts && npm test`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/api src/auth/session.ts src/auth/session.test.ts src/vite-env.d.ts .env.example
git commit -m "security: require bearer auth for MonStage data"
```

---

### Task 4: Add Google Identity and Frontend Auth State

**Files:**
- Create: `src/auth/googleIdentity.ts`
- Create: `src/auth/googleIdentity.test.ts`
- Create: `src/auth/AuthProvider.tsx`
- Create: `src/auth/AuthProvider.test.tsx`
- Create: `src/auth/useAuth.ts`
- Create: `src/auth/ProtectedApp.tsx`
- Create: `src/features/auth/LoginPage.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces `AuthContextValue`:

```ts
interface AuthContextValue {
  status: 'checking' | 'signedOut' | 'authenticated' | 'denied';
  token: string | null;
  user: { email: string; name: string | null; picture: string | null } | null;
  signInWithCredential(credential: string): Promise<void>;
  signOut(): void;
  invalidateSession(): void;
}
```

- [ ] **Step 1: Write AuthProvider tests first**

Cover:

```ts
it('shows signed-out state with no stored token');
it('validates a stored non-expired token before authenticating');
it('clears an expired stored token without calling the Worker');
it('stores credential only after /api/session returns 200');
it('enters denied state on 403 and stores no token');
it('signOut clears protected session and GIS auto-select');
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/auth/AuthProvider.test.tsx src/auth/googleIdentity.test.ts`

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement the GIS wrapper**

Define the minimal global types inside `googleIdentity.ts`. Load `https://accounts.google.com/gsi/client` once, then expose:

```ts
export async function renderGoogleSignInButton(
  target: HTMLElement,
  clientId: string,
  onCredential: (credential: string) => void,
): Promise<void>;

export function disableGoogleAutoSelect(): void;
```

Initialize with:

```ts
google.accounts.id.initialize({
  client_id: clientId,
  callback: ({ credential }) => onCredential(credential),
  auto_select: false,
  cancel_on_tap_outside: true,
});
```

Render a standard Google button with `theme: 'outline'`, `size: 'large'`, `text: 'signin_with'`, `shape: 'rectangular'`.

- [ ] **Step 4: Implement AuthProvider**

On mount:

1. call `cleanupLegacyOfferCache()`;
2. read the session token;
3. if absent -> `signedOut`;
4. if UX-expired -> clear and `signedOut`;
5. otherwise call `fetchSession(token)`;
6. `200` -> `authenticated`;
7. `401` -> clear + `signedOut`;
8. `403` -> clear + `denied`;
9. other errors -> clear + `signedOut` and expose a temporary sign-in-unavailable message.

`signInWithCredential` follows the same server-authoritative validation before storing the token.

- [ ] **Step 5: Implement auth gate and login UI**

`ProtectedApp` behavior:

```tsx
if (status === 'checking') return <AuthLoadingScreen />;
if (status === 'authenticated') return <AppRoutes />;
return <LoginPage denied={status === 'denied'} />;
```

`LoginPage` displays:

```text
MonStage
Private internship intelligence workspace
Sign in with Google
Access denied — This MonStage workspace is private.   // only denied state
```

It must render no job navigation, offer count, shortlist, application, or dashboard data.

- [ ] **Step 6: Mount the auth boundary**

`App.tsx` becomes:

```tsx
export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <ProtectedApp />
      </AuthProvider>
    </HashRouter>
  );
}
```

- [ ] **Step 7: Run auth tests + full frontend tests**

Run: `npm test -- src/auth && npm test`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/auth src/features/auth/LoginPage.tsx src/app/App.tsx
git commit -m "feat: add private Google sign-in gate"
```

---

### Task 5: Wire Protected Offers and Account Sign-Out Into the App Shell

**Files:**
- Modify: `src/hooks/useOffers.ts`
- Modify: `src/features/offers/OffersPage.tsx`
- Create: `src/features/auth/AccountMenu.tsx`
- Create: `src/features/auth/AccountMenu.test.tsx`
- Modify: `src/app/AppShell.tsx`
- Modify: `src/components/TopNav.tsx`
- Modify: `src/styles/globals.css`
- Modify: `src/styles/responsive.css`

**Interfaces:**
- Consumes: `useAuth()` token/user/signOut/invalidateSession; `fetchOffers(token)`.
- Produces: authenticated-only offer loading and account menu.

- [ ] **Step 1: Write failing integration tests**

Test:

```ts
expect(fetchOffers).toHaveBeenCalledWith('valid-id-token');
expect(screen.getByText('denoskume77@gmail.com')).toBeInTheDocument();
await user.click(screen.getByRole('button', { name: 'Sign out' }));
expect(signOut).toHaveBeenCalled();
```

For a mocked `401` from offers, assert `invalidateSession()` is called and no stale offers remain rendered.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/features/auth/AccountMenu.test.tsx src/hooks`

Expected: FAIL until protected offer integration exists.

- [ ] **Step 3: Update `useOffers`**

Remove initial cache hydration. Require the authenticated token from `useAuth`. Call `fetchOffers(token)`. If the error is `ApiAuthError(401)`, clear local offer state and call `invalidateSession()`. On `403`, clear data and surface access denied rather than retaining stale data.

Use English generic failure copy: `MonStage data is temporarily unavailable.`

- [ ] **Step 4: Add AccountMenu**

Render authenticated email and `Sign out`. The email comes only from the Worker-validated session response, never decoded client-side as authorization evidence.

- [ ] **Step 5: Integrate menu into navigation**

Pass no auth props through routes; `TopNav` can consume `useAuth()` directly or render `AccountMenu` which does. Replace the current right-side metadata-only area with a compact wrapper containing:

```tsx
<span className="top-nav__meta">Internship Intelligence France · M2 2027</span>
<AccountMenu />
```

- [ ] **Step 6: Style desktop/mobile states**

Ensure login card fits 360px width, account email truncates safely, sign-out is keyboard accessible, and no horizontal overflow is introduced.

- [ ] **Step 7: Run frontend suite**

Run: `npm test && npm run build`

Expected: all tests PASS and TypeScript/Vite build exits 0.

- [ ] **Step 8: Commit**

```bash
git add src/hooks src/features/auth src/app/AppShell.tsx src/components/TopNav.tsx src/styles
git commit -m "feat: protect offers and add account sign-out"
```

---

### Task 6: Update Responsive E2E for Authentication

**Files:**
- Modify: `e2e/responsive.spec.ts`
- Modify: `playwright.config.ts` only if an additional env default is required.

**Interfaces:**
- Tests production-like browser flow with mocked GIS + Worker endpoints.

- [ ] **Step 1: Add a GIS browser mock helper**

Intercept `https://accounts.google.com/gsi/client` and return JavaScript that defines:

```js
window.google = {
  accounts: {
    id: {
      initialize(config) { window.__gisCallback = config.callback; },
      renderButton(target) {
        const button = document.createElement('button');
        button.textContent = 'Sign in with Google';
        button.addEventListener('click', () => window.__gisCallback({ credential: 'e2e-token' }));
        target.appendChild(button);
      },
      disableAutoSelect() {}
    }
  }
};
```

- [ ] **Step 2: Mock Worker session/offers routes**

For authorized tests:

```ts
await page.route('**/api/session', route => route.fulfill({
  status: 200,
  contentType: 'application/json',
  body: JSON.stringify({ user: { email: 'denoskume77@gmail.com', name: 'Denos Kume', picture: null } }),
}));
```

Assert the incoming request has `Authorization: Bearer e2e-token`. Reuse the existing offers payload for `/api/offers` and assert the same bearer header.

- [ ] **Step 3: Add signed-out and wrong-account tests**

Desktop and mobile must verify the login screen contains no `Jobs` navigation before sign-in. A `/api/session` `403` response after GIS callback must display exactly:

```text
Access denied — This MonStage workspace is private.
```

and still no app navigation.

- [ ] **Step 4: Adapt existing desktop/mobile happy-path tests**

Each happy path first clicks `Sign in with Google`, waits for `Jobs`, then executes the current jobs/detail/filter/navigation assertions. Add sign-out at the end and assert the login screen reappears and jobs disappear.

- [ ] **Step 5: Run E2E**

Run: `npm run test:e2e`

Expected: PASS on Desktop Chrome, Mobile Chrome, and Small Mobile 360px; no horizontal overflow.

- [ ] **Step 6: Commit**

```bash
git add e2e/responsive.spec.ts playwright.config.ts
git commit -m "test: cover private authentication end to end"
```

---

### Task 7: Wire CI for Frontend + Worker Without Exposing Backend Secrets

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `package.json`
- Modify: `README.md`
- Modify: `SECURITY.md`

**Interfaces:**
- CI consumes public repository variables `VITE_GOOGLE_CLIENT_ID` and `VITE_MONSTAGE_API_URL` for the frontend build.
- Worker secrets remain configured in Cloudflare and are never printed by GitHub Actions.

- [ ] **Step 1: Add root Worker verification scripts**

Add:

```json
{
  "scripts": {
    "test:worker": "npm --prefix worker test",
    "typecheck:worker": "npm --prefix worker run typecheck"
  }
}
```

Keep all existing scripts.

- [ ] **Step 2: Update the Pages workflow**

Remove the direct Apps Script URL and `curl` verification entirely. Set build env from public GitHub repository variables:

```yaml
env:
  VITE_GOOGLE_CLIENT_ID: ${{ vars.VITE_GOOGLE_CLIENT_ID }}
  VITE_MONSTAGE_API_URL: ${{ vars.VITE_MONSTAGE_API_URL }}
```

Add fail-fast public-config checks without echoing values:

```yaml
- name: Verify public auth configuration
  run: |
    test -n "$VITE_GOOGLE_CLIENT_ID"
    test -n "$VITE_MONSTAGE_API_URL"
```

After root dependency install, install/test Worker:

```yaml
- name: Install Worker dependencies
  run: npm --prefix worker install --no-audit --no-fund
- name: Worker tests
  run: npm run test:worker
- name: Worker typecheck
  run: npm run typecheck:worker
```

Do not deploy Worker from GitHub in this first rollout; Wrangler deployment is manual until a narrowly scoped Cloudflare token is intentionally added later.

- [ ] **Step 3: Update README / SECURITY**

README documents the runtime chain `GitHub Pages -> Google GIS -> Worker -> Apps Script -> private Sheet`.

SECURITY explicitly classifies these as secrets:

```text
ALLOWED_EMAIL
APPS_SCRIPT_URL
APPS_SCRIPT_GATEWAY_SECRET
MONSTAGE_GATEWAY_SECRET
Cloudflare API tokens
Google credentials other than the public OAuth client ID
```

and these as public configuration:

```text
VITE_GOOGLE_CLIENT_ID
VITE_MONSTAGE_API_URL
```

- [ ] **Step 4: Run complete local verification**

Run:

```bash
npm install --no-audit --no-fund
npm --prefix worker install --no-audit --no-fund
npm test
npm run test:worker
npm run typecheck:worker
npm run build
npm run test:e2e
```

Expected: every command exits 0.

- [ ] **Step 5: Commit**

```bash
git add package.json .github/workflows/deploy-pages.yml README.md SECURITY.md
git commit -m "ci: verify private auth frontend and worker"
```

---

### Task 8: Configure Google, Cloudflare, Apps Script, and Perform Secure Rollout

**Files:**
- No committed secrets.
- Update documentation only if the real provider setup exposes a discrepancy.

**Interfaces:**
- Produces production `GOOGLE_CLIENT_ID`, Worker URL, Worker secrets, Apps Script gateway secret, and hardened Apps Script deployment.

- [ ] **Step 1: Create Google OAuth Web Client**

In Google Cloud Console create an OAuth 2.0 Client ID of type `Web application` named `MonStage`. Authorized JavaScript origin:

```text
https://denoskume.github.io
```

Add `http://localhost:5173` only for local development if needed. Copy the public Client ID; do not create or use a client secret for GIS ID-token sign-in.

- [ ] **Step 2: Generate one gateway secret**

Run locally:

```bash
openssl rand -hex 32
```

Use that same 64-hex-character value in exactly two secret stores: Apps Script Script Property `MONSTAGE_GATEWAY_SECRET` and Cloudflare Worker secret `APPS_SCRIPT_GATEWAY_SECRET`.

- [ ] **Step 3: Configure Apps Script**

Set Script Properties:

```text
SPREADSHEET_ID=<existing value>
MONSTAGE_GATEWAY_SECRET=<generated value>
```

Paste/deploy the hardened `apps-script/Code.gs` as a new Web App version. Keep `Execute as: Me` and `Who has access: Anyone` so the Worker can reach it without Google user cookies.

- [ ] **Step 4: Configure/deploy Worker**

From `worker/`:

```bash
npx wrangler login
npx wrangler secret put ALLOWED_EMAIL
npx wrangler secret put APPS_SCRIPT_URL
npx wrangler secret put APPS_SCRIPT_GATEWAY_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler deploy
```

Enter the authorized email only into `ALLOWED_EMAIL`; enter the Apps Script `/exec` URL only into `APPS_SCRIPT_URL`; enter the shared random secret only into `APPS_SCRIPT_GATEWAY_SECRET`; enter the Google OAuth Client ID into `GOOGLE_CLIENT_ID`.

Record only the public Worker URL.

- [ ] **Step 5: Prove direct Apps Script access is closed**

Open/curl the Apps Script `/exec` URL with GET. Expected JSON contains `error: "NOT_FOUND"` and no `offers` key.

POST without a secret and with a wrong secret. Expected JSON contains `error: "UNAUTHORIZED"` and no `offers` key.

- [ ] **Step 6: Configure GitHub public variables**

Set repository Actions variables:

```text
VITE_GOOGLE_CLIENT_ID=<public Google OAuth client id>
VITE_MONSTAGE_API_URL=<public Cloudflare Worker origin, no trailing /api/offers>
```

No secret is added to frontend variables.

- [ ] **Step 7: Verify Worker security before frontend deployment**

Without bearer token:

```bash
curl -i "$WORKER_URL/api/session"
```

Expected: `401`.

With a valid Google ID token from another account: expected `403`.

With the authorized account token: `/api/session` -> `200`; `/api/offers` -> `200` with `Stage Intelligence France` and offers array.

- [ ] **Step 8: Security bundle scan before merge**

Build frontend, then verify no private identifiers are embedded:

```bash
npm run build
grep -R "script.google.com/macros/s/" dist && exit 1 || true
grep -R "denoskume77@gmail.com" dist && exit 1 || true
grep -R "MONSTAGE_GATEWAY_SECRET" dist && exit 1 || true
```

Expected: all scans return no matches.

- [ ] **Step 9: Create PR and review**

Compare `feature/private-google-auth` to `main`; confirm only auth/security/deployment/docs changes. Open PR titled:

```text
feat: protect MonStage with private Google authentication
```

Require fresh green CI before merge.

- [ ] **Step 10: Merge and verify production**

After merge, wait for the `main` Pages workflow to complete. Verify at `https://denoskume.github.io/monstage/`:

1. signed-out page exposes no internship data;
2. authorized account signs in and loads offers;
3. another account is denied;
4. sign-out immediately removes offers/navigation;
5. refresh after sign-out remains signed out;
6. desktop/mobile/360px remain usable;
7. direct Apps Script GET still exposes no offers.

- [ ] **Step 11: Commit any documentation-only provider corrections, if required by observed provider UI**

Only if actual Google/Cloudflare labels differ materially from the documented instructions, update docs with the observed labels and commit:

```bash
git add README.md SECURITY.md apps-script/README.md
git commit -m "docs: align private auth deployment instructions"
```
