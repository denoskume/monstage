# MonStage API — Google Apps Script

This Web App is the private server-side data adapter between the Cloudflare security gateway and the `Stage Intelligence France` spreadsheet. The Sheet remains private and authoritative.

## V3 autonomy engine

MonStage can automatically reconcile the application pipeline from external evidence:

- Gmail confirmation → `Candidature envoyée`
- recruiter/application email → `Réponse recruteur`
- interview email or matching Calendar event → `Entretien`
- assessment/test email → `Test technique`
- offer email → `Offre reçue`
- rejection email → `Refus`

The engine **never** treats an `Apply` click as a submitted application.

### Privacy

The scanner reads only enough Gmail/Calendar metadata to classify and match application events. It does **not** persist email bodies or calendar descriptions. The `Application Events` sheet stores only:

`Event ID · Offer ID · Company · Type · Confidence · Source · Timestamp · Generic evidence summary`

### Automation cadence

Run `installAutonomyTriggers()` once after deploying this version. It installs a 15-minute Apps Script trigger for `syncApplicationEvents()` and performs an initial sync.

Because Gmail and Calendar require additional Google OAuth scopes, Google will request one-time authorization when this feature is enabled.

## Deployment

1. Create or open the standalone Apps Script project named **MonStage API**.
2. In **Project Settings → Script properties**, configure:

```text
SPREADSHEET_ID=<existing private spreadsheet id>
MONSTAGE_GATEWAY_SECRET=<64-hex-character secret generated with openssl rand -hex 32>
```

3. Paste `Code.gs` and `appsscript.json` from this folder into the Apps Script project.
4. Deploy as **Web App** with:
   - **Execute as:** Me
   - **Who has access:** Anyone
5. Copy the resulting `/exec` URL into the Cloudflare Worker secret `APPS_SCRIPT_URL`.
6. Store the exact same `MONSTAGE_GATEWAY_SECRET` value as the Cloudflare Worker secret `APPS_SCRIPT_GATEWAY_SECRET`.
7. Run `installAutonomyTriggers()` once and approve the requested Gmail/Calendar read-only scopes.
8. Never commit spreadsheet IDs, gateway secrets, OAuth secrets, Google credentials, Cloudflare tokens, or `.env.local`.

## Security model

The browser never calls Apps Script directly.

- `GET /exec` returns only a generic `NOT_FOUND` payload.
- Offers are available only through `POST /exec`.
- The POST JSON body must contain the correct `gatewaySecret`.
- Apps Script validates the secret before any private Sheet data is read.
- Gmail and Calendar are read-only inputs to the autonomy engine.
- MonStage writes only derived status fields and the privacy-minimized `Application Events` audit log.

## Privacy boundary

Even after gateway authentication, the API returns only sanitized offer fields plus privacy-safe autonomy evidence. It excludes private notes, message content, spreadsheet identifiers, credentials and raw Gmail/Calendar data.
