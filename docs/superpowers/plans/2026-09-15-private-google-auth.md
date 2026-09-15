# MonStage Private Google Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make MonStage a private single-user workspace with Google authentication and a protected offers API.

**Architecture:** GitHub Pages remains the React/Vite host. Google Identity Services returns an ID token to the browser; a Cloudflare Worker verifies that token with Google JWKS, checks the configured single-user allowlist, and proxies authorized offer requests to Apps Script. Apps Script accepts offer reads only through a server-to-server POST containing a Worker-held gateway secret; direct GET access returns no offers.

**Tech Stack:** React 19, TypeScript 5.9, Vite 7, Vitest, Playwright, Google Identity Services, Cloudflare Workers, Wrangler, `jose`, Google Apps Script, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-09-15-private-google-auth-design.md`

## Global Constraints

- One Google account only; the allowed email is stored only as Worker secret `ALLOWED_EMAIL`.
- GitHub Pages remains the frontend host and the Google Sheet remains private.
- Browser code never calls Apps Script directly after migration and never uses JSONP.
- Apps Script reads offers only after a valid `MONSTAGE_GATEWAY_SECRET` arrives in a POST body.
- Bearer tokens, gateway secrets, Apps Script URL, allowed email, and Cloudflare credentials are never logged or committed.
- Google ID tokens use `sessionStorage`, never `localStorage`.
- Legacy `monstage:offers-cache:v1` is deleted and never hydrated after migration.
- Worker `401` clears the local session; `403` shows the private-workspace denial state and never falls back to cached data.
- Protected responses use `Cache-Control: no-store`; production CORS allows only `https://denoskume.github.io`.
- All UI remains English; official company names/job titles remain unchanged.
- Normal personal use must remain on free tiers.

---

## File Map

**Frontend:** `src/auth/session.ts`, `googleIdentity.ts`, `AuthProvider.tsx`, `useAuth.ts`, `ProtectedApp.tsx`; `src/features/auth/LoginPage.tsx`, `AccountMenu.tsx`; `src/api/authClient.ts`, `client.ts`; `src/hooks/useOffers.ts`; `src/app/App.tsx`, `AppShell.tsx`; `src/components/TopNav.tsx`; env/style/test files.

**Worker:** `worker/package.json`, `tsconfig.json`, `wrangler.toml`, `src/env.ts`, `cors.ts`, `auth.ts`, `appsScript.ts`, `index.ts`, plus Worker tests.

**Backend/deployment:** `apps-script/Code.gs`, `apps-script/README.md`, `.github/workflows/deploy-pages.yml`, `README.md`, `SECURITY.md`, `e2e/responsive.spec.ts`.

---

### Task 1: Harden Apps Script

**Files:**
- Modify: `apps-script/Code.gs`
- Modify: `apps-script/README.md`
- Create: `src/api/appsScriptContract.test.ts`

**Produces:** `doPost(e)` secret-gated JSON offers endpoint; `doGet()` non-data response.

- [ ] **Step 1: Write the failing contract test**

```ts
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'apps-script/Code.gs'), 'utf8');

test('Apps Script exposes offers only through secret-gated POST', () => {
  expect(source).toContain("getProperty('MONSTAGE_GATEWAY_SECRET')");
  expect(source).toMatch(/function doPost\(e\)/);
  expect(source).toMatch(/function doGet\(\)/);
  expect(source).not.toContain('isSafeJsonpCallback_');
  expect(source).not.toContain('callback +');
});
```

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/api/appsScriptContract.test.ts`

Expected: FAIL because current Apps Script still uses JSONP and has no gateway secret.

- [ ] **Step 3: Implement secret-gated handlers**

Keep the current sanitizers and `getOffers_()`. Replace JSONP helpers/handlers with:

```js
function jsonOutput_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
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
    return normalizeText_(JSON.parse(e.postData.contents).gatewaySecret);
  } catch (error) {
    return null;
  }
}

function doGet() {
  return jsonOutput_({ error: 'NOT_FOUND', message: 'Not found' });
}

function doPost(e) {
  try {
    var expectedSecret = PropertiesService.getScriptProperties()
      .getProperty('MONSTAGE_GATEWAY_SECRET');
    if (!expectedSecret || !secureEquals_(readGatewaySecret_(e), expectedSecret)) {
      return jsonOutput_({ error: 'UNAUTHORIZED', message: 'Unauthorized' });
    }
    return jsonOutput_({
      generatedAt: new Date().toISOString(),
      source: 'Stage Intelligence France',
      offers: getOffers_()
    });
  } catch (error) {
    console.error('MonStage backend error');
    return jsonOutput_({ error: 'MONSTAGE_API_ERROR', message: 'Unable to load offers' });
  }
}
```

Never log the request body or secret.

- [ ] **Step 4: Document Script Properties**

Document `SPREADSHEET_ID` and `MONSTAGE_GATEWAY_SECRET`. Generate the latter with `openssl rand -hex 32`. Web App remains `Execute as: Me` / `Anyone`; security is the gateway secret, not Google browser cookies.

- [ ] **Step 5: Verify GREEN**

Run: `npm test -- src/api/appsScriptContract.test.ts && npm test`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps-script src/api/appsScriptContract.test.ts
git commit -m "security: gate Apps Script offers behind server secret"
```

---

### Task 2: Build the Cloudflare Worker Gateway

**Files:**
- Create: `worker/package.json`, `worker/tsconfig.json`, `worker/wrangler.toml`
- Create: `worker/src/env.ts`, `cors.ts`, `auth.ts`, `appsScript.ts`, `index.ts`
- Create: `worker/test/auth.test.ts`, `index.test.ts`

**Produces:** `GET /api/session`, `GET /api/offers`, `OPTIONS`; `verifyAuthorizedUser(token, env, jwks?)`.

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
  "dependencies": { "jose": "^6.1.0" },
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

- [ ] **Step 2: Write failing auth tests with a defined status helper**

In `worker/test/auth.test.ts`, generate an ephemeral RSA key pair and signed JWTs with `jose`. Define:

```ts
async function statusForToken(token: string, env: Env, jwks: JWTVerifyGetKey) {
  try {
    await verifyAuthorizedUser(token, env, jwks);
    return 200;
  } catch (error) {
    return error instanceof AuthError ? error.status : 500;
  }
}
```

Assert missing/malformed/invalid-audience/expired/unverified-email -> `401`, valid wrong email -> `403`, authorized token -> `200`.

- [ ] **Step 3: Verify RED**

Run: `cd worker && npm install --no-audit --no-fund && npm test`

Expected: FAIL because Worker source is not implemented.

- [ ] **Step 4: Implement bindings and CORS**

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

`cors.ts` exports `allowedOrigin(request, env)` and `responseHeaders(origin)`. Headers must include JSON content type, `Cache-Control: no-store`, `Vary: Origin`; only an exact allowed origin receives `Access-Control-Allow-Origin`.

- [ ] **Step 5: Implement Google JWT verification**

```ts
import { createRemoteJWKSet, jwtVerify, type JWTVerifyGetKey } from 'jose';

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export class AuthError extends Error {
  constructor(public readonly status: 401 | 403, public readonly code: string) {
    super(code);
  }
}

export async function verifyAuthorizedUser(
  token: string,
  env: Env,
  jwks: JWTVerifyGetKey = GOOGLE_JWKS,
) {
  const { payload, protectedHeader } = await jwtVerify(token, jwks, {
    audience: env.GOOGLE_CLIENT_ID,
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
    algorithms: ['RS256'],
  });
  if (protectedHeader.alg !== 'RS256' || payload.email_verified !== true || typeof payload.email !== 'string') {
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

Wrap `jwtVerify` errors at the route boundary as generic `401`; never log token contents.

- [ ] **Step 6: Implement Apps Script proxy**

```ts
export async function fetchOffersFromAppsScript(env: Env): Promise<unknown> {
  const response = await fetch(env.APPS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gatewaySecret: env.APPS_SCRIPT_GATEWAY_SECRET }),
  });
  if (!response.ok) throw new Error('BACKEND_UNAVAILABLE');
  const payload = await response.json() as any;
  if (payload?.source !== 'Stage Intelligence France' || !Array.isArray(payload?.offers) || typeof payload?.generatedAt !== 'string') {
    throw new Error('INVALID_BACKEND_PAYLOAD');
  }
  return payload;
}
```

- [ ] **Step 7: Implement routes**

`GET /api/session` verifies bearer token and returns `{ user }`; `GET /api/offers` verifies then proxies; `OPTIONS` handles preflight; everything else -> `404`. Missing/invalid token -> `401`, wrong account -> `403`, backend failure -> `502`.

- [ ] **Step 8: Add route tests**

Test exact CORS allow/deny, no-store, bearer enforcement, `403`, successful session/offers, and assert the mocked Apps Script POST body contains `gatewaySecret` while no response exposes it.

- [ ] **Step 9: Verify GREEN**

Run: `cd worker && npm test && npm run typecheck`

Expected: PASS / exit 0.

- [ ] **Step 10: Commit**

```bash
git add worker
git commit -m "feat: add authenticated MonStage security gateway"
```

---

### Task 3: Replace JSONP/Persistent Cache With Bearer API Client

**Files:**
- Modify: `src/api/client.ts`, `src/api/client.test.ts`
- Create: `src/api/authClient.ts`, `src/api/authClient.test.ts`
- Create: `src/auth/session.ts`, `src/auth/session.test.ts`
- Modify: `src/vite-env.d.ts`, `.env.example`

**Produces:** `fetchSession(token)`, `fetchOffers(token)`, token storage/expiry helpers.

- [ ] **Step 1: Write failing tests**

Assert session token uses `sessionStorage`, legacy cache is removed, `/api/session` and `/api/offers` receive `Authorization: Bearer ...`, and no JSONP `<script>` is created.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/auth/session.test.ts src/api/authClient.test.ts src/api/client.test.ts`

- [ ] **Step 3: Implement session helpers**

```ts
const TOKEN_KEY = 'monstage:google-id-token:v1';
const LEGACY_OFFERS_CACHE_KEY = 'monstage:offers-cache:v1';

export const readSessionToken = () => sessionStorage.getItem(TOKEN_KEY);
export const writeSessionToken = (token: string) => sessionStorage.setItem(TOKEN_KEY, token);
export function clearProtectedSession() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_OFFERS_CACHE_KEY);
}
export function cleanupLegacyOfferCache() {
  localStorage.removeItem(LEGACY_OFFERS_CACHE_KEY);
}
```

Implement `isTokenExpiredForUx(token)` by base64url-decoding the JWT payload; parsing failure counts as expired.

- [ ] **Step 4: Implement auth/data clients**

`fetchSession(token)` calls `${VITE_MONSTAGE_API_URL}/api/session`; `fetchOffers(token)` calls `/api/offers`; both use `cache: 'no-store'` and bearer auth. Define `ApiAuthError(status: 401 | 403)`. Remove `buildJsonpUrl`, JSONP loader, `saveCachedOffers`, and `loadCachedOffers`.

- [ ] **Step 5: Update env typing**

```ts
interface ImportMetaEnv {
  readonly VITE_MONSTAGE_API_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
}
```

`.env.example` contains only public example values for Worker base URL and Google OAuth client ID.

- [ ] **Step 6: Verify GREEN**

Run: `npm test -- src/auth/session.test.ts src/api/authClient.test.ts src/api/client.test.ts && npm test`

- [ ] **Step 7: Commit**

```bash
git add src/api src/auth/session.ts src/auth/session.test.ts src/vite-env.d.ts .env.example
git commit -m "security: require bearer auth for MonStage data"
```

---

### Task 4: Add Google Identity + Auth Gate

**Files:**
- Create: `src/auth/googleIdentity.ts`, `googleIdentity.test.ts`
- Create: `src/auth/AuthProvider.tsx`, `AuthProvider.test.tsx`, `useAuth.ts`, `ProtectedApp.tsx`
- Create: `src/features/auth/LoginPage.tsx`
- Modify: `src/app/App.tsx`

**Produces:** `AuthContextValue` with `checking | signedOut | authenticated | denied`, token/user, sign-in, sign-out, invalidation.

- [ ] **Step 1: Write failing auth tests**

Cover no-token signed-out state, stored-token server validation, expired-token clearing, `200` stores/authorizes, `403` denies without storage, sign-out clears session and calls GIS auto-select disable.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/auth/AuthProvider.test.tsx src/auth/googleIdentity.test.ts`

- [ ] **Step 3: Implement GIS wrapper**

Load `https://accounts.google.com/gsi/client` once and export:

```ts
export async function renderGoogleSignInButton(
  target: HTMLElement,
  clientId: string,
  onCredential: (credential: string) => void,
): Promise<void>;
export function disableGoogleAutoSelect(): void;
```

Initialize `google.accounts.id` with `auto_select: false`; render standard large outline `Sign in with Google` button.

- [ ] **Step 4: Implement `AuthProvider`**

Startup: cleanup legacy cache -> read token -> reject UX-expired token -> validate remaining token with `/api/session`. `200` authenticates; `401` clears/signed-out; `403` clears/denied. `signInWithCredential()` validates before storing. `signOut()` clears protected state and disables Google auto-select.

- [ ] **Step 5: Implement auth gate/login page**

```tsx
if (status === 'checking') return <AuthLoadingScreen />;
if (status === 'authenticated') return <AppRoutes />;
return <LoginPage denied={status === 'denied'} />;
```

Login page copy: `MonStage`, `Private internship intelligence workspace`; denied copy exactly `Access denied — This MonStage workspace is private.` No protected navigation/data is rendered.

- [ ] **Step 6: Mount provider in `App.tsx`**

```tsx
<HashRouter>
  <AuthProvider>
    <ProtectedApp />
  </AuthProvider>
</HashRouter>
```

- [ ] **Step 7: Verify GREEN**

Run: `npm test -- src/auth/AuthProvider.test.tsx src/auth/googleIdentity.test.ts src/auth/session.test.ts && npm test`

- [ ] **Step 8: Commit**

```bash
git add src/auth src/features/auth/LoginPage.tsx src/app/App.tsx
git commit -m "feat: add private Google sign-in gate"
```

---

### Task 5: Protect Offer Loading + Add Account Menu

**Files:**
- Modify: `src/hooks/useOffers.ts`
- Create: `src/hooks/useOffers.test.tsx`
- Create: `src/features/auth/AccountMenu.tsx`, `AccountMenu.test.tsx`
- Modify: `src/app/AppShell.tsx`, `src/components/TopNav.tsx`
- Modify: `src/styles/globals.css`, `src/styles/responsive.css`

- [ ] **Step 1: Write failing integration tests**

`useOffers.test.tsx`: authenticated token calls `fetchOffers(token)`; mocked `401` clears data and invokes `invalidateSession`; `403` never retains stale data.

`AccountMenu.test.tsx`: render Worker-validated email, click `Sign out`, assert context `signOut()` called.

- [ ] **Step 2: Verify RED**

Run: `npm test -- src/hooks/useOffers.test.tsx src/features/auth/AccountMenu.test.tsx`

- [ ] **Step 3: Update `useOffers`**

Remove cache hydration. Consume token from `useAuth`; only fetch while authenticated. On `ApiAuthError(401)` clear data + invalidate session. On `403` clear data and expose denial/no stale content. Generic network copy: `MonStage data is temporarily unavailable.`

- [ ] **Step 4: Add account menu/navigation integration**

Render Worker-validated email + `Sign out`. In `TopNav` retain `Internship Intelligence France · M2 2027` and add `<AccountMenu />` beside it.

- [ ] **Step 5: Style responsive states**

Login card must fit 360px; email truncates; sign-out is keyboard accessible; no horizontal overflow.

- [ ] **Step 6: Verify GREEN**

Run: `npm test -- src/hooks/useOffers.test.tsx src/features/auth/AccountMenu.test.tsx && npm test && npm run build`

- [ ] **Step 7: Commit**

```bash
git add src/hooks src/features/auth src/app/AppShell.tsx src/components/TopNav.tsx src/styles
git commit -m "feat: protect offers and add account sign-out"
```

---

### Task 6: Authentication E2E

**Files:**
- Modify: `e2e/responsive.spec.ts`

- [ ] **Step 1: Mock GIS script in Playwright**

Intercept `https://accounts.google.com/gsi/client` and return JS that defines `window.google.accounts.id.initialize`, `renderButton`, and `disableAutoSelect`; the mock button triggers callback `{ credential: 'e2e-token' }`.

- [ ] **Step 2: Mock Worker routes**

`/api/session` authorized response:

```json
{"user":{"email":"authorized@example.test","name":"MonStage Owner","picture":null}}
```

Assert incoming `Authorization` equals `Bearer e2e-token`. `/api/offers` reuses the existing offers fixture and checks the same bearer header.

- [ ] **Step 3: Add signed-out/denied tests**

Before sign-in, no `Jobs` navigation or offers. A mocked `/api/session` `403` after GIS callback displays `Access denied — This MonStage workspace is private.` and still exposes no protected UI.

- [ ] **Step 4: Adapt desktop/mobile happy paths**

Sign in first, execute current jobs/detail/filter/navigation assertions, then sign out and assert login returns and protected UI disappears.

- [ ] **Step 5: Verify GREEN**

Run: `npm run test:e2e`

Expected: Desktop Chrome, Mobile Chrome, Small Mobile (360px) PASS with no horizontal overflow.

- [ ] **Step 6: Commit**

```bash
git add e2e/responsive.spec.ts
git commit -m "test: cover private authentication end to end"
```

---

### Task 7: CI + Security Documentation

**Files:**
- Modify: `package.json`, `.github/workflows/deploy-pages.yml`, `README.md`, `SECURITY.md`

- [ ] **Step 1: Add root Worker scripts**

Add `test:worker = npm --prefix worker test` and `typecheck:worker = npm --prefix worker run typecheck` while preserving existing scripts.

- [ ] **Step 2: Replace direct Apps Script CI configuration**

Remove the Apps Script URL and curl check. Use public GitHub Actions variables:

```yaml
env:
  VITE_GOOGLE_CLIENT_ID: ${{ vars.VITE_GOOGLE_CLIENT_ID }}
  VITE_MONSTAGE_API_URL: ${{ vars.VITE_MONSTAGE_API_URL }}
```

Fail fast with `test -n` checks, then install/test/typecheck Worker before frontend build/E2E. Do not deploy Worker from GitHub in this rollout.

- [ ] **Step 3: Update README/SECURITY**

Document `GitHub Pages -> GIS -> Worker -> Apps Script -> private Sheet`. Secret list: `ALLOWED_EMAIL`, `APPS_SCRIPT_URL`, `APPS_SCRIPT_GATEWAY_SECRET`, `MONSTAGE_GATEWAY_SECRET`, Cloudflare API tokens. Public config: Google OAuth client ID and Worker public URL.

- [ ] **Step 4: Full verification**

```bash
npm install --no-audit --no-fund
npm --prefix worker install --no-audit --no-fund
npm test
npm run test:worker
npm run typecheck:worker
npm run build
npm run test:e2e
```

Expected: all exit 0.

- [ ] **Step 5: Commit**

```bash
git add package.json .github/workflows/deploy-pages.yml README.md SECURITY.md
git commit -m "ci: verify private auth frontend and worker"
```

---

### Task 8: Production Provider Setup + Secure Rollout

**Files:** no secrets committed.

- [ ] **Step 1: Create Google OAuth Web Client**

Create a `Web application` OAuth client named `MonStage`; authorized JavaScript origin `https://denoskume.github.io`. Copy the public client ID. Add localhost only if local browser testing needs it.

- [ ] **Step 2: Generate gateway secret**

Run `openssl rand -hex 32`. Store the identical value only in Apps Script `MONSTAGE_GATEWAY_SECRET` and Cloudflare `APPS_SCRIPT_GATEWAY_SECRET`.

- [ ] **Step 3: Redeploy hardened Apps Script**

Set `SPREADSHEET_ID` (existing) + `MONSTAGE_GATEWAY_SECRET`; deploy new Web App version as owner/Anyone.

- [ ] **Step 4: Configure and deploy Worker**

Authenticate with `npx wrangler login`. Store secrets:

```bash
npx wrangler secret put ALLOWED_EMAIL
npx wrangler secret put APPS_SCRIPT_URL
npx wrangler secret put APPS_SCRIPT_GATEWAY_SECRET
```

Set shell variable `GOOGLE_CLIENT_ID` to the public OAuth client ID copied from Google Cloud, then deploy it as a normal non-secret Worker variable:

```bash
npx wrangler deploy --var GOOGLE_CLIENT_ID:$GOOGLE_CLIENT_ID
```

`ALLOWED_ORIGINS` remains the committed non-secret `https://denoskume.github.io` value.

- [ ] **Step 5: Prove Apps Script direct access is closed**

GET `/exec` -> payload has no `offers`. POST with no/wrong gateway secret -> no `offers`. Only Worker-held correct secret may retrieve the sanitized payload.

- [ ] **Step 6: Set GitHub Actions public variables**

Set `VITE_GOOGLE_CLIENT_ID` to the public OAuth client ID and `VITE_MONSTAGE_API_URL` to the Worker origin. No private value goes into Vite variables.

- [ ] **Step 7: Verify Worker access policy**

No bearer -> `401`; valid wrong Google account -> `403`; authorized Google account -> `/api/session` `200` and `/api/offers` `200`.

- [ ] **Step 8: Scan the production bundle before merge**

```bash
npm run build
grep -R "script.google.com/macros/s/" dist && exit 1 || true
grep -R "@gmail.com" dist && exit 1 || true
grep -R "MONSTAGE_GATEWAY_SECRET" dist && exit 1 || true
```

Expected: no matches.

- [ ] **Step 9: PR + fresh CI**

Compare branch to `main`, open PR `feat: protect MonStage with private Google authentication`, review diff, and require green frontend/Worker/unit/build/E2E checks.

- [ ] **Step 10: Merge + production acceptance**

After Pages deployment succeeds, verify: signed-out exposes zero internship data; authorized account signs in/loads data; other account is denied; sign-out removes UI/data; refresh remains signed-out; desktop/mobile/360px work; direct Apps Script GET still exposes no offers.
