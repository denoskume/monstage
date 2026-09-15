# MonStage API — Google Apps Script

This Web App is the private server-side data adapter between the Cloudflare security gateway and the `Stage Intelligence France` spreadsheet. The Sheet remains private and authoritative.

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
7. Never commit spreadsheet IDs, gateway secrets, OAuth secrets, Google credentials, Cloudflare tokens, or `.env.local`.

## Security model

The browser must never call Apps Script directly after the private-auth migration.

- `GET /exec` returns only a generic `NOT_FOUND` payload and never reads the Sheet.
- Offers are available only through `POST /exec`.
- The POST JSON body must contain the correct `gatewaySecret`.
- Apps Script validates the secret before `getOffers_()` is called.
- Missing or incorrect secrets return only a generic `UNAUTHORIZED` payload and no offer data.
- The gateway secret is transmitted server-to-server by the Cloudflare Worker in the POST body, never in a URL or query string.
- The Apps Script source must not log the request body or secret.

## Privacy boundary

Even after successful gateway authentication, the endpoint returns only the existing sanitized offer fields. It intentionally excludes `Notes / stratégie`, email addresses, spreadsheet identifiers, credentials, and write capability. `relevance` and `gaps` remain `null` until dedicated safe Sheet fields are approved.

## Rollout note

Do not deploy this hardened Apps Script version to production until the Cloudflare Worker is deployed and verified. Once deployed, direct browser access to the old JSON/JSONP endpoint stops working by design.
