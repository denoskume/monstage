# MonStage

**MonStage** is a private, responsive internship intelligence workspace built on top of the existing **Stage Intelligence France** data source. It turns a private Google Sheet into a modern job-board experience optimized for desktop and mobile while keeping runtime access restricted to one authorized Google account.

## Product preview

![MonStage Jobs view](docs/assets/monstage-jobs-preview.png)

*Authenticated Jobs view — internship discovery, relevance ranking, search, and multi-criteria filtering across France. The live workspace remains intentionally restricted; the preview is sanitized for public display.*

## What it includes

- Google Sign-In gate for one authorized account
- Job-board style offers list with desktop split view
- Mobile one-column browsing and dedicated offer detail
- Search, filters, sorting, and personalized ranking
- Shortlist view
- Application pipeline view
- Compact decision dashboard
- Responsive layouts from **360px** through large desktop screens
- Structural dark-mode support

## Architecture

```text
GitHub Pages — React / TypeScript / Vite
        |
        | Google Identity Services ID token
        v
Cloudflare Worker — authentication + authorization gateway
        |
        | server-only POST + gateway secret
        v
Google Apps Script Web App
        |
        v
Private Google Sheet — Stage Intelligence France
```

The browser never calls Apps Script directly in production. The Cloudflare Worker verifies the Google ID token, checks the configured single-user allowlist, and only then proxies a sanitized offers request to Apps Script. Direct Apps Script GET access returns no internship data.

## Security model

The public repository contains frontend and Worker source code, but no private runtime credentials.

Never commit:

- private spreadsheet IDs
- the authorized Google email address
- Apps Script deployment URLs used by the Worker
- `MONSTAGE_GATEWAY_SECRET` / `APPS_SCRIPT_GATEWAY_SECRET`
- Cloudflare API tokens
- Google OAuth client secrets
- bearer tokens
- `.env.local`
- private notes from `Notes / stratégie`

Public configuration may include:

- the Google OAuth **Web Client ID**
- the public Cloudflare Worker origin
- the GitHub Pages origin

The Google OAuth client ID is intentionally public; authorization is enforced server-side by the Worker.

## Local frontend setup

Requirements: Node.js 22+ and npm.

```bash
npm install
cp .env.example .env.local
```

Set public development values in `.env.local`:

```bash
VITE_GOOGLE_CLIENT_ID=YOUR_WEB_CLIENT_ID.apps.googleusercontent.com
VITE_MONSTAGE_API_URL=https://YOUR_WORKER.workers.dev
```

Then run:

```bash
npm run dev
```

## Cloudflare Worker

Worker source lives in `worker/`.

```bash
npm --prefix worker install
npm run test:worker
npm run typecheck:worker
```

Worker configuration:

Public/non-secret bindings:

- `GOOGLE_CLIENT_ID`
- `ALLOWED_ORIGINS`

Worker secrets:

- `ALLOWED_EMAIL`
- `APPS_SCRIPT_URL`
- `APPS_SCRIPT_GATEWAY_SECRET`

Deploy with Wrangler after configuring the bindings and secrets.

## Google Apps Script backend

See [`apps-script/README.md`](apps-script/README.md) for deployment instructions.

Required Script Properties:

- `SPREADSHEET_ID`
- `MONSTAGE_GATEWAY_SECRET`

`MONSTAGE_GATEWAY_SECRET` must match the Worker secret `APPS_SCRIPT_GATEWAY_SECRET`. Apps Script serves offers only from a secret-gated POST request. Its direct GET endpoint returns no offers.

## Tests

```bash
npm test
npm run test:worker
npm run typecheck:worker
npm run build
npm run test:e2e
```

The E2E suite covers desktop Chrome, mobile Chrome, and a 360×800 viewport, including authentication and horizontal-overflow checks.

## Deployment

GitHub Pages deploys from `main` through `.github/workflows/deploy-pages.yml`.

Repository setting required once:

- **Settings → Pages → Build and deployment → Source: GitHub Actions**

Public GitHub Actions repository variables required:

- `VITE_GOOGLE_CLIENT_ID` → Google OAuth Web Client ID
- `VITE_MONSTAGE_API_URL` → public Cloudflare Worker origin

The workflow explicitly rejects an Apps Script URL as `VITE_MONSTAGE_API_URL` and scans the production bundle for protected values before deployment.

The Vite base path is `/monstage/`, and client routing uses `HashRouter` so direct navigation does not produce GitHub Pages 404 errors.

## Product name

**MonStage — Private internship intelligence workspace**
