# Fortnox integration — testing guide

Everything below runs against the **dev DatoCMS environment** (`DATOCMS_ENVIRONMENT=dev` in `.env`). Do not run these against production data. Only the `ost` region is enabled (`FORTNOX_ENABLED_REGIONS` in `lib/fortnox/constants.ts`) during testing.

## Safety rails

- **Email allowlist** — `.env` sets `FORTNOX_EMAIL_ALLOWLIST=bjorn@konst-teknik.se,mattias@konst-teknik.se`. When invoices are created, only these emails get the Fortnox email. Unset the var (leave empty) in production so everyone is emailed.
- **Region guard** — `FORTNOX_ENABLED_REGIONS = ['ost']`. Nothing outside that region is touched.
- **Amount/account** — `FORTNOX_INVOICE_AMOUNT` and `FORTNOX_INVOICE_ACCOUNT` in `.env`. Set a test amount (e.g. `100`) before creating invoices; a 0-amount may be rejected.

## Prerequisites

1. `.env` must contain `FORTNOX_CLIENT_ID`, `FORTNOX_CLIENT_SECRET`, and per-region refresh token for `ost`:
   - `FORTNOX_OST_REFRESH_TOKEN` (access tokens are *not* required — they're fetched via refresh and only live in process memory; a static `FORTNOX_OST_ACCESS_TOKEN` is optional and only used as a last-resort fallback)
2. If the token is missing, authorize via the OAuth callback:

   ```
   https://apps.fortnox.se/oauth-v1/auth?client_id=<CLIENT_ID>&redirect_uri=http://localhost:3000/api/fortnox/callback&scope=customer+invoice&access_type=offline&response_type=code&state=ost
   ```

   With the dev server running, the callback prints the `FORTNOX_OST_REFRESH_TOKEN` line to paste into `.env`.

## Token persistence on Vercel (no database)

Fortnox **rotates** the refresh token on every OAuth refresh — the old one is
invalidated. On Vercel the `.env` file isn't writable, so rotated tokens are
persisted to **Vercel KV** (Upstash), using only `KV_REST_API_URL` and
`KV_REST_API_TOKEN` — no database, no extra package (the store calls the
Upstash REST API directly).

How `lib/fortnox/tokenStore.ts` picks a backend per write/read:

- **KV configured** (`KV_REST_API_URL` + `KV_REST_API_TOKEN` set) → read the
  freshest token from KV, write rotated tokens to KV.
- **No KV** (local dev/scripts) → write rotated tokens back to `.env` (current
  `FORTNOX_<REGION>_REFRESH_TOKEN`). The env value is the bootstrap: the first
  refresh on Vercel reads it if KV is empty, then stores the rotated result.

`lib/fortnox/auth.ts` also caches access tokens in-memory per region (4.5 min
TTL) to minimize refreshes, and on a failed refresh re-reads KV once before
throwing (a statically configured `FORTNOX_<REGION>_ACCESS_TOKEN` is used only
if present — it is *not* required).

### Vercel setup (one time)

1. In the Vercel dashboard: **Storage → Create Database → KV** (Upstash). Link
   it to this project; Vercel auto-injects `KV_REST_API_URL` and
   `KV_REST_API_TOKEN`.
2. Add these env vars in the project's Production environment (they are the
   bootstrap, not auto-injected from `.env`):
   - `FORTNOX_OST_REFRESH_TOKEN` (current value from `.env` — the *latest*
     one, since old values are invalidated by rotation)
   - `FORTNOX_CLIENT_ID`, `FORTNOX_CLIENT_SECRET`
   - `KV_REST_API_URL`, `KV_REST_API_TOKEN` (from the linked KV store; also
     auto-set by Vercel)
3. Verify: locally, set `KV_REST_API_URL` and `KV_REST_API_TOKEN` temporarily
   in the shell, then run `npm run testfortnox`. The rotated refresh token is
   written to KV (`fortnox:OST:refresh_token`) — check it via the Upstash
   console or a second run. Unset them again when done.

### Why not Fortnox Client Credentials?

Fortnox offers `grant_type=client_credentials` + a `TenantId` header (no
refresh token at all). Tried it — Fortnox returns
`401 consent_not_found`: client credentials require a consent created with
`account_type=service`, which doesn't apply to this app's CurrentCustomer
token. So rotation + KV persistence is the mechanism used.

### If the token chain ever breaks

The `FORTNOX_OST_REFRESH_TOKEN` in the Vercel env is only the bootstrap. As
long as a refresh succeeds at least once every ~60 days (the daily cron does),
KV keeps a valid rotated token. If it expires or the consent is revoked, the
OAuth callback re-issues everything: run the URL above again, update the Vercel
env bootstrap token, and rotate KV out of sync is harmless (next refresh
overwrites it).

## 1. Unit tests (no network / no credentials)

```
npm run test:fortnox
```

Covers invoice status mapping, eligibility logic, the member→customer mapping, and the email allowlist. No Fortnox or DatoCMS access required.

## 2. Connectivity smoke test

```
npm run testfortnox
```

Refreshes the token and lists customers read-only for `ost`. Confirms OAuth refresh + API wiring. Expected:

```
[ost] OK — <N> customers
  - <CustomerNumber>: <Name> <email>
```

Use this first; it will tell you whether `.env` tokens are valid.

## 3. Single-member round-trip

```
npm run syncfortknox          # first run only: link/create customers for all members
npm run testroundtrip -- bjorn@konst-teknik.se 2026
```

Creates an annual invoice in the Fortnox sandbox for one member, sends the Fortnox email **only if the email is allowlisted**, creates + links the DatoCMS `invoice` record, fetches the Fortnox status, then runs the payment-status sync. Verify afterward in the DatoCMS dev UI that the member now has a linked `invoice` record.

## 4. Manual endpoint smoke tests

These are the same endpoints the DatoCMS plugin and the daily cron call. Use Basic Auth (`BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD` from `.env`).

- **Bulk invoice creation** (warning: emails allowed members):

  ```
  curl -u konstnarscentrum:<password> -X POST http://localhost:3000/api/fortnox/invoices \
    -H "Content-Type: application/json" -d '{"invoiceYear": 2026}'
  ```

  Idempotent per `invoice_year` — members already invoiced for the year are skipped.

- **Payment status sync** (the daily cron at `0 6 * * *`):

  ```
  curl -u konstnarscentrum:<password> http://localhost:3000/api/fortnox/sync-status
  ```

- **Customer sync (DatoCMS webhook)**:

  ```
  curl -u konstnarscentrum:<password> -X POST http://localhost:3000/api/fortnox/customer-sync \
    -H "Content-Type: application/json" \
    -d '{"entity_type":"item","event_type":"item::create","related_entities":[{"id":"TYPE_ID","attributes":{"api_key":"member"}}],"entity":{"id":"MEMBER_ID","attributes":{"email":"bjorn@konst-teknik.se","first_name":"Björn","last_name":"Test","city":"Norrköping","region":"143685113"}}}'
  ```

  A new member (no `fortnox_customer_number`) is created in Fortnox for `ost` and
  the returned number is written back to the DatoCMS member. Re-run the same curl
  with the number added to confirm it updates instead of recreating. To register
  the real webhook in the DatoCMS project: **Project settings → Webhooks**,
  event type *Item*, events *Create* + *Update*, URL
  `https://<site>/api/fortnox/customer-sync`, HTTP Basic Auth
  (`BASIC_AUTH_USER` / `BASIC_AUTH_PASSWORD`). Non-member events are skipped
  with a 200.

- **Member invoices API** (requires a logged-in member session):

  ```
  curl http://localhost:3000/api/fortnox/member-invoices -H "Cookie: <session-cookie>"
  ```

## 5. Simulating payment

In the Fortnox sandbox (or via the API), mark the invoice as paid — set status `FULLYPAID` / a `FinalPayDate` or zero the balance — then re-run the sync:

```
npm run testroundtrip -- bjorn@konst-teknik.se 2026   # re-run also fine
# or
curl -u konstnarscentrum:<password> http://localhost:3000/api/fortnox/sync-status
```

Verify the DatoCMS `invoice` record's `payment_status` and `payment_date` update.

## 6. Browser check

Log in as a test member (dev) and open `/konstnar/konto/fakturor`. Confirm the linked invoices render with correct year, belopp and status, and that the "Visa mina fakturor" button on the account page works.

## Rollout checklist (later, outside dev)

- Increase `FORTNOX_INVOICE_AMOUNT` and set `FORTNOX_INVOICE_ACCOUNT` for real accounting.
- Clear `FORTNOX_EMAIL_ALLOWLIST` so all members get emailed.
- Test on one real region (add its slug to `FORTNOX_ENABLED_REGIONS`) before enabling the rest.
- Add tokens for the new region(s) to `.env` and the production env.
- Switch `DATOCMS_ENVIRONMENT` back to `main` only after the model migration has been applied there too.