# MonStage API — Google Apps Script

This read-only Web App exposes a sanitized JSON/JSONP view of the private `Stage Intelligence France` spreadsheet. The Sheet remains private and authoritative.

## One-time deployment

1. Create a standalone Apps Script project named **MonStage API**.
2. In **Project Settings → Script properties**, add `SPREADSHEET_ID` with the private Stage Intelligence France spreadsheet ID.
3. Paste `Code.gs` and `appsscript.json` from this folder into the Apps Script project.
4. Deploy as **Web App**, execute as the owner, with access set to **Anyone** for read-only sanitized output.
   - Plain requests return JSON.
   - Browser requests from GitHub Pages use the `callback` query parameter and receive JSONP, avoiding cross-origin `fetch` restrictions on Apps Script ContentService.
5. Copy the resulting `/exec` URL into the GitHub repository variable `VITE_MONSTAGE_API_URL` and your local `.env.local`.
6. Never commit `.env.local`, spreadsheet IDs, Google credentials, OAuth credentials, or write-capable secrets.

## Privacy boundary

The endpoint intentionally does **not** return `Notes / stratégie`, email addresses, spreadsheet identifiers, credentials, or any write capability. `relevance` and `gaps` remain `null` in V1 until a dedicated public-safe Sheet field is approved.

## Browser transport

Google Apps Script ContentService redirects responses to `script.googleusercontent.com` and does not provide a configurable CORS header. MonStage therefore uses a strict JSONP callback only for `script.google.com` web-app URLs. Callback names are validated server-side before being emitted. The endpoint is read-only and must return only public-safe sanitized fields.
