# MonStage Private Google Authentication — Design

Date: 2026-09-15
Status: Approved architecture, implementation pending

## 1. Goal

Protect MonStage as a single-user private workspace while keeping the existing React/Vite frontend on GitHub Pages and the private Stage Intelligence France Google Sheet as the source of truth.

Access requirements:

- Authentication uses Google Identity Services (GIS).
- Exactly one configured Google account is authorized.
- A valid Google account that is not the configured account receives `403 Access denied`.
- Unauthenticated users cannot access Jobs, Shortlist, Applications, Dashboard, cached offers, or the offers API.
- The Google Sheet remains private.
- The public GitHub repository and static frontend source remain public by design; authentication protects runtime data access, not source-code visibility.
- No paid service is required.

## 2. Architecture

```text
GitHub Pages — MonStage React app
        |
        | Google Identity Services
        v
Google ID token
        |
        | Authorization: Bearer <ID_TOKEN>
        v
Cloudflare Worker — MonStage security gateway
        |
        | 1. Verify JWT signature against Google JWKS
        | 2. Verify iss / aud / exp / email_verified
        | 3. Require the configured allowed email
        | 4. Add server-only Apps Script gateway secret
        v
Google Apps Script Web App
        |
        | Require gateway secret before reading data
        v
Private Stage Intelligence France Sheet
```

The browser never calls Apps Script directly after migration. JSONP is removed from the production data path.

## 3. Security Boundary

### Frontend

The frontend is not a security authority. It controls UX only.

It may decode non-sensitive token claims for display and expiry UX, but it must never decide authorization based only on client-side claims. The Cloudflare Worker is the authorization authority.

The allowed account email must not be hard-coded into the public frontend bundle.

### Cloudflare Worker

The Worker is the public authenticated API boundary.

For every protected request it must:

1. Require `Authorization: Bearer <token>`.
2. Parse the JWT header and require `alg = RS256` and a valid `kid`.
3. Fetch/cache Google's public JWKS and verify the JWT signature with Web Crypto.
4. Require issuer `https://accounts.google.com` or `accounts.google.com`.
5. Require audience equal to the configured Google OAuth client ID.
6. Require a non-expired token.
7. Require `email_verified = true`.
8. Require the token email to match the single configured allowed account, case-insensitively.
9. Never log the bearer token or backend gateway secret.

The Worker exposes only:

- `GET /api/session` — validates the credential and returns minimal authenticated-user metadata.
- `GET /api/offers` — validates the credential and proxies the sanitized offers payload.
- `OPTIONS` — CORS preflight.

Responses use `Cache-Control: no-store` and `Vary: Origin`.

Expected status codes:

- `200` authenticated and authorized.
- `401` missing, malformed, invalid, or expired Google credential.
- `403` valid Google identity but wrong account.
- `502` protected backend unavailable or invalid.

### CORS

Production CORS allows only the MonStage GitHub Pages origin. Development may allow explicitly configured localhost origins.

CORS is defense-in-depth only; Google token verification and account allowlisting remain mandatory because non-browser clients can forge an Origin header.

## 4. Apps Script Hardening

The existing public JSONP/read endpoint must be converted into a gateway-only backend.

Apps Script Script Properties:

- `SPREADSHEET_ID` — existing private Sheet identifier.
- `MONSTAGE_GATEWAY_SECRET` — new high-entropy random secret.

The Worker stores the same gateway secret as a Cloudflare Worker secret.

The Worker calls Apps Script server-to-server with `POST` and places the gateway secret in the JSON request body. Apps Script parses the body and compares the submitted secret against `MONSTAGE_GATEWAY_SECRET` before any spreadsheet read occurs.

Direct `GET /exec` requests do not return offers. The old callback/JSONP code path is removed entirely.

If the POST body is missing, malformed, or contains an absent/wrong secret, Apps Script returns only a generic unauthorized error payload and never reads or returns offers.

The protected backend returns JSON only.

The gateway secret must never be committed to GitHub, placed in the frontend bundle, printed in CI logs, sent in a query string, or sent to the browser.

## 5. Google Identity Configuration

Create one Google OAuth 2.0 Web Client for MonStage.

Authorized JavaScript origins:

- `https://denoskume.github.io`
- development origin(s) only when needed, such as `http://localhost:5173`

The Google OAuth client ID is public configuration and may be exposed to the browser. It is not a secret.

The Worker independently validates that every ID token's `aud` claim equals this same client ID.

## 6. Frontend Authentication Flow

### Signed out

The application renders a dedicated professional login screen instead of the normal app shell.

Content:

- MonStage brand.
- `Private internship intelligence workspace`.
- Google Sign-In button.
- No offer counts, cached content, navigation, or dashboard data.

### Sign-in

1. GIS returns a Google ID credential to the browser.
2. The browser sends the credential to `GET /api/session` through the Worker.
3. Only after the Worker returns `200` does MonStage establish the local authenticated session.
4. If the Worker returns `403`, the UI shows `Access denied — This MonStage workspace is private.` and does not enter the app.
5. If the credential is invalid or expired, the UI returns to sign-in.

### Authenticated

The normal MonStage shell becomes available:

- Jobs
- Shortlist
- Applications
- Dashboard

The account menu shows the authenticated Google email and a `Sign out` action.

### Sign-out

Sign-out must:

- Clear the ID token.
- Clear authenticated user state.
- Clear authenticated offer/session caches.
- Call GIS `disableAutoSelect()` when available.
- Return to the login screen immediately.

It does not sign the user out of their global Google account.

## 7. Session Storage and Expiry

The Google ID token is stored in `sessionStorage`, not `localStorage`.

Reasons:

- It survives a page refresh in the same browser tab/session.
- It is removed when the browser session ends.
- It reduces persistence compared with localStorage.

The client reads the token `exp` claim for UX scheduling only. The Worker always performs the authoritative expiry check.

When the token expires:

- clear session state and protected caches;
- return to the login screen;
- require Google sign-in again.

Any Worker `401` response also invalidates the local session immediately.

## 8. Protected Data Caching

The current MonStage client stores offers in localStorage. That is incompatible with the new private security boundary.

Migration requirements:

- Remove persistent offer caching from localStorage.
- Delete the legacy `monstage:offers-cache:v1` key on startup/logout.
- Do not hydrate offers before authentication succeeds.
- If short-lived caching is retained, use authenticated in-memory state or sessionStorage only.
- Never render stale cached offers on the signed-out screen or after a `401`/`403`.

This protects future sessions. It cannot retroactively revoke data that may have been copied while the previous endpoint was public.

## 9. Frontend Components

New units:

- `src/auth/AuthProvider.tsx` — owns auth/session state.
- `src/auth/googleIdentity.ts` — loads GIS and handles credential callbacks.
- `src/auth/session.ts` — sessionStorage token helpers and expiry parsing.
- `src/auth/ProtectedApp.tsx` — chooses login vs authenticated app shell.
- `src/features/auth/LoginPage.tsx` — sign-in UI and access-denied state.
- `src/features/auth/AccountMenu.tsx` — authenticated account + sign-out.

Existing API client changes:

- `fetchOffers(token)` calls the Cloudflare Worker instead of Apps Script.
- sends `Authorization: Bearer <token>`.
- no JSONP.
- `401` triggers auth invalidation.
- `403` never falls back to cached protected data.

## 10. Worker Structure

New directory:

```text
worker/
  src/
    index.ts
    auth.ts
    googleJwks.ts
    appsScript.ts
    cors.ts
  test/
  wrangler.toml
```

Worker bindings:

Public/configuration variables:

- `GOOGLE_CLIENT_ID`
- `ALLOWED_ORIGINS`

Cloudflare secrets:

- `ALLOWED_EMAIL`
- `APPS_SCRIPT_URL`
- `APPS_SCRIPT_GATEWAY_SECRET`

The Worker must never expose these secret values in errors.

## 11. Deployment Configuration

Frontend production variables:

- `VITE_GOOGLE_CLIENT_ID`
- `VITE_MONSTAGE_API_URL` — Cloudflare Worker base URL, not Apps Script.

GitHub Actions must stop embedding the Apps Script URL into the browser build.

The existing direct Apps Script API verification step must be replaced with protected gateway verification that does not expose secrets in logs.

Cloudflare deployment can initially be performed through Wrangler. Future automatic deployment may use a narrowly scoped Cloudflare API token stored as a GitHub Actions secret.

No Cloudflare or Google secret is committed to the public repository.

## 12. Rollout Order

To keep the migration controlled:

1. Implement frontend authentication, Worker, Apps Script secret check, and tests on the feature branch.
2. Create the Google OAuth Web Client and configure the production origin.
3. Create/deploy the Cloudflare Worker and set Worker secrets.
4. Confirm Worker authentication using the authorized Google account.
5. Harden and redeploy Apps Script so direct GET requests and POST requests without the gateway secret return no offers.
6. Confirm direct Apps Script access no longer returns offer data.
7. Configure frontend production variables to point at the Worker.
8. Deploy MonStage from `main`.
9. Verify signed-out, authorized, unauthorized, expiry, sign-out, desktop, and mobile flows.

There may be a short maintenance window between Apps Script hardening and the new frontend deployment. No insecure fallback will be kept solely to avoid downtime.

## 13. Error Handling

User-facing messages remain concise and in English:

- GIS unavailable: `Google Sign-In is temporarily unavailable.`
- Invalid/expired session: `Your session has expired. Sign in again.`
- Wrong account: `Access denied — This MonStage workspace is private.`
- Worker/backend unavailable: `MonStage data is temporarily unavailable.`

Detailed technical errors remain in server-side logs and tests, not in the user-facing UI.

## 14. Testing Strategy

### Frontend unit tests

- signed-out state renders login only;
- authorized session unlocks the app;
- `403` renders access denied;
- expired token clears session;
- sign-out clears token and legacy offer cache;
- API requests include bearer credentials;
- unauthorized states never hydrate cached offers.

### Worker unit tests

- missing bearer token -> `401`;
- malformed JWT -> `401`;
- invalid signature -> `401`;
- wrong `aud` -> `401`;
- expired token -> `401`;
- unverified email -> `401`;
- valid token for wrong account -> `403`;
- valid authorized token -> backend proxy;
- backend POST body contains the gateway secret;
- protected responses are `no-store`;
- CORS allows only configured origins.

Google JWKS and Apps Script are mocked in unit tests.

### Apps Script tests/verification

- direct GET returns no offers;
- missing POST body returns no offers;
- missing gateway secret returns no offers;
- wrong gateway secret returns no offers;
- correct gateway secret returns only the existing sanitized public offer fields;
- private Sheet columns remain excluded.

### End-to-end acceptance

Desktop, mobile, and 360px small-mobile flows must cover:

- login screen;
- authorized login;
- wrong-account denial;
- protected navigation;
- offer loading through Worker;
- sign-out;
- no horizontal overflow.

## 15. Success Criteria

The feature is complete only when all of the following are true:

- The public MonStage URL shows no internship data before authentication.
- Only the configured Google account can obtain a `200` from protected Worker endpoints.
- Another valid Google account receives `403`.
- Direct Apps Script GET access returns no offers.
- Apps Script POST access without the Worker secret returns no offers.
- The browser production bundle contains no Apps Script URL, gateway secret, or allowed-account email.
- Logout and token expiry remove protected data from the UI and session caches.
- CI/unit/build/E2E checks pass.
- GitHub Pages remains the frontend host.
- Google Sheet remains private.
- The solution remains within free-tier tooling for normal personal use.
