# Security

MonStage is a public-source frontend backed by a private runtime data path.

## Trust boundaries

The browser is not an authorization authority. Google Identity Services provides an ID token, but the Cloudflare Worker independently verifies the token signature and claims before authorizing any protected request.

The Worker is the public security boundary. It validates:

- Google JWT signature
- issuer
- audience
- expiry
- `email_verified`
- exact configured single-user email allowlist

Only an authorized request may reach the Apps Script backend.

Apps Script is not directly exposed as a readable offers API. It returns internship data only from a server-to-server POST containing the gateway secret shared with the Worker. Direct GET requests return no offers.

## Secrets

Never commit or expose in the browser bundle:

- authorized account email (`ALLOWED_EMAIL`)
- private spreadsheet ID
- Apps Script backend URL held by the Worker
- `MONSTAGE_GATEWAY_SECRET`
- `APPS_SCRIPT_GATEWAY_SECRET`
- Cloudflare API tokens
- Google OAuth client secrets
- Google bearer / ID tokens
- `.env.local`
- private Sheet notes or personal data not intentionally returned by the sanitized API

Public configuration is limited to values that are not credentials:

- Google OAuth Web Client ID
- public Cloudflare Worker origin
- allowed browser origin

## Client storage

Google ID tokens are stored only in `sessionStorage`, not `localStorage`. Protected offer payloads are not persisted in the legacy localStorage cache. Signing out or receiving an authentication failure clears protected client state.

## HTTP behavior

Protected Worker responses use `Cache-Control: no-store`. Production CORS is restricted to the MonStage GitHub Pages origin, but CORS is treated only as defense in depth; server-side token verification is mandatory for every protected request.

Expected protected endpoint behavior:

- `401` — missing, malformed, invalid, or expired credential
- `403` — valid Google identity but unauthorized account
- `502` — protected backend unavailable or invalid

## Reporting

If you discover a security issue, report it privately to the repository owner. Do not open a public issue containing tokens, deployment URLs, secrets, personal email addresses, private Sheet identifiers, or other sensitive data.
