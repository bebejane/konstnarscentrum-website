# Fortnox integration — testing guide

Everything below runs against the **dev DatoCMS environment** (`DATOCMS_ENVIRONMENT=dev` in `.env`). Do not run these against production data. Only the `ost` region is enabled (`FORTNOX_ENABLED_REGIONS` in `lib/fortnox/constants.ts`) during testing.

## Safety rails

- **Email allowlist** — `.env` sets `FORTNOX_EMAIL_ALLOWLIST=bjorn@konst-teknik.se,mattias@konst-teknik.se`. When invoices are created, only these emails get the Fortnox email. Unset the var (leave empty) in production so everyone is emailed.
- **Region guard** — `FORTNOX_ENABLED_REGIONS = ['ost']`. Nothing outside that region is touched.
- **Amount/account** — `FORTNOX_INVOICE_AMOUNT` and `FORTNOX_INVOICE_ACCOUNT` in `.env`. Set a test amount (e.g. `100`) before creating invoices; a 0-amount may be rejected.

## Prerequisites

1. `.env` must contain `FORTNOX_CLIENT_ID`, `FORTNOX_CLIENT_SECRET`, and per-region tokens for `ost`:
   - `FORTNOX_OST_ACCESS_TOKEN`
   - `FORTNOX_OST_REFRESH_TOKEN`
2. If tokens are missing, authorize via the OAuth callback:

   ```
   https://apps.fortnox.se/oauth-v1/auth?client_id=<CLIENT_ID>&redirect_uri=http://localhost:3000/api/fortnox/callback&scope=customer+invoice&access_type=offline&response_type=code&state=ost
   ```

   With the dev server running, the callback prints the `FORTNOX_OST_*` lines to paste into `.env`.

   The refresh token is handled for you on local runs: `lib/fortnox/tokenStore.ts` writes rotated refresh tokens back to `.env`, so you don't need to re-capture after every run. On Vercel (`.env` not writable) a deployment still needs its refresh token refreshed manually if it rotates.

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