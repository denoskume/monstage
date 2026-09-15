# MonStage

**MonStage** is a responsive internship intelligence frontend for the existing **Stage Intelligence France** system. It turns the Google Sheet source of truth into a modern job-board experience optimized for desktop and mobile.

## What it includes

- Job-board style offers list with desktop split view
- Mobile one-column browsing and dedicated offer detail
- Search, filters, sorting, and **Pour moi** ranking
- Shortlist view
- Application pipeline view
- Compact decision dashboard
- Cached-data fallback when the backend is temporarily unavailable
- Responsive layouts from **360px** through large desktop screens
- Structural dark-mode support

## Architecture

```text
Private Google Sheet
        ↓
Google Apps Script Web App
(read-only sanitized JSON/JSONP)
        ↓
React + TypeScript + Vite
        ↓
GitHub Pages
```

The Google Sheet remains the operational source of truth. MonStage does not scrape job boards and does not write to the Sheet in V1.

## Security and privacy

The public repository must never contain:

- the private spreadsheet ID
- Google credentials or OAuth secrets
- API credentials with write access
- `.env.local`
- private notes from `Notes / stratégie`
- automation email addresses or other personal data not intended for the public frontend

The Apps Script endpoint returns only the explicitly approved fields in `src/api/contract.ts`. `Notes / stratégie` is intentionally omitted from the public payload.

## Local setup

Requirements: Node.js 22+ and npm.

```bash
npm install
cp .env.example .env.local
```

Set the API endpoint in `.env.local`:

```bash
VITE_MONSTAGE_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Then run:

```bash
npm run dev
```

## Google Apps Script backend

See [`apps-script/README.md`](apps-script/README.md) for the one-time deployment steps.

In short:

1. Create a standalone Apps Script project named **MonStage API**.
2. Add the private spreadsheet ID as the Script Property `SPREADSHEET_ID`.
3. Deploy `apps-script/Code.gs` as a read-only Web App.
4. Put the resulting `/exec` URL in `.env.local` locally and in the GitHub repository variable `VITE_MONSTAGE_API_URL` for production.

Never hard-code the spreadsheet ID in this repository.

For the production GitHub Pages origin, MonStage uses a validated JSONP callback when the endpoint is a `script.google.com` Apps Script URL. This is a read-only transport workaround for Apps Script ContentService browser cross-origin limitations; non-Apps-Script endpoints continue to use normal `fetch()`.

## Tests

```bash
npm test
npm run build
npm run test:e2e
```

The E2E suite covers desktop Chrome, Pixel 7, and a 360×800 viewport, including horizontal-overflow checks.

## Deployment

GitHub Pages is deployed automatically from `main` using `.github/workflows/deploy-pages.yml`.

Repository setting required once:

- **Settings → Pages → Build and deployment → Source: GitHub Actions**

Repository variable required once:

- `VITE_MONSTAGE_API_URL` → the deployed Apps Script `/exec` URL

The Vite base path is `/monstage/`, and client routing uses `HashRouter` so direct navigation does not produce GitHub Pages 404 errors.

## Product name

**MonStage — Mes opportunités de stage**
