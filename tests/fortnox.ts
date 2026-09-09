import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { isInvoicePaid, isInvoicePartiallyPaid, FortnoxInvoice } from "../lib/fortnox/invoices";
import { isEligibleForInvoiceFromRecords } from "../lib/fortnox/invoiceDispatch";
import { memberToCustomer, sanitizeText } from "../lib/fortnox/sync";
import { isEmailAllowedToSend } from "../lib/fortnox/constants";

// Tests for the Fortnox integration's pure logic (no network / no credentials).

type Result = { name: string; pass: boolean; msg?: string };
const results: Result[] = [];
let failures = 0;

const assert = (name: string, cond: boolean, msg?: string) => {
  results.push({ name, pass: !!cond, msg });
  if (!cond) failures++;
};

const ok = (name: string) => results.push({ name, pass: true });

async function main() {
  // ---------- isInvoicePaid ----------
  const inv = (status: string, extra: Record<string, any> = {}): FortnoxInvoice =>
    ({ Status: status, ...extra } as unknown as FortnoxInvoice);

  assert("FULLYPAID → paid", isInvoicePaid(inv("FULLYPAID")));
  assert("PAID → paid", isInvoicePaid(inv("PAID")));
  assert("UNPAID → not paid", !isInvoicePaid(inv("UNPAID")));
  assert("SENT → not paid", !isInvoicePaid(inv("SENT")));
  assert("PARTIALLYPAID → not fully paid", !isInvoicePaid(inv("PARTIALLYPAID")));
  assert("PARTLYPAID → not fully paid", !isInvoicePaid(inv("PARTLYPAID")));
  assert("FinalPayDate → paid (fallback)", isInvoicePaid(inv("UNPAID", { FinalPayDate: "2026-01-05" })));
  assert("Balance 0 → paid (fallback)", isInvoicePaid(inv("UNPAID", { Balance: 0 })));
  assert("Balance >0 → not paid", !isInvoicePaid(inv("UNPAID", { Balance: 250 })));
  ok("isInvoicePaid runs");

  // ---------- isInvoicePartiallyPaid ----------
  assert("PARTIALLYPAID → partially paid", isInvoicePartiallyPaid(inv("PARTIALLYPAID")));
  assert("PARTLYPAID → partially paid", isInvoicePartiallyPaid(inv("PARTLYPAID")));
  assert("FULLYPAID → not partially paid", !isInvoicePartiallyPaid(inv("FULLYPAID")));
  assert("UNPAID → not partially paid", !isInvoicePartiallyPaid(inv("UNPAID")));
  ok("isInvoicePartiallyPaid runs");

  // ---------- isEligibleForInvoiceFromRecords ----------
  const regionId = "143707759"; // a real region id (Riks)
  const member = (overrides: Record<string, any> = {}) => ({
    id: "Member1",
    email: "test@example.com",
    region: regionId,
    fortnox_customer_number: "10000",
    ...overrides
  });

  assert(
    "no region → not eligible",
    !isEligibleForInvoiceFromRecords({ id: "x", region: "NONEXISTENT" }, 2026, [], true).eligible
  );

  assert(
    "no credentials → not eligible",
    !isEligibleForInvoiceFromRecords(member({ region: regionId }), 2026, [], false).eligible
  );

  assert(
    "no customer number → not eligible",
    !isEligibleForInvoiceFromRecords(member({ region: regionId, fortnox_customer_number: undefined }), 2026, [], true).eligible
  );

  assert(
    "vilande → not eligible",
    !isEligibleForInvoiceFromRecords(member({ region: regionId, vilande: true }), 2026, [], true).eligible
  );

  assert(
    "already invoiced for year → not eligible",
    !isEligibleForInvoiceFromRecords(
      member({ region: regionId }),
      2026,
      [{ id: "Inv1", fortnox_document_number: "1", invoice_year: 2026 }],
      true
    ).eligible
  );

  const eligible = isEligibleForInvoiceFromRecords(member({ region: regionId }), 2026, [], true);
  assert("fully eligible → eligible", eligible.eligible, JSON.stringify(eligible));

  assert(
    "other year does not block",
    isEligibleForInvoiceFromRecords(
      member({ region: regionId }),
      2026,
      [{ id: "Inv1", fortnox_document_number: "1", invoice_year: 2025 }],
      true
    ).eligible
  );
  ok("isEligibleForInvoiceFromRecords runs");

  // ---------- memberToCustomer ----------
  const c = memberToCustomer({
    id: "Member1",
    email: "test@example.com",
    first_name: "Anna",
    last_name: "Andersson",
    city: "Malmö"
  });
  assert("memberToCustomer full name", c.Name === "Anna Andersson");
  assert("memberToCustomer email", c.Email === "test@example.com");
  assert("memberToCustomer city", c.City === "Malmö");
  assert("memberToCustomer stores member id in ExternalReference", (c as any).ExternalReference === "Member1");

  const noName = memberToCustomer({ id: "Member2", email: "x@example.com" });
  assert("memberToCustomer handles missing name", noName.Name === undefined);
  assert("memberToCustomer handles missing city", noName.City === undefined);
  ok("memberToCustomer runs");

  // ---------- sanitizeText ----------
  assert("sanitizeText removes emoji", sanitizeText("Roger von Reybekiel 🌏") === "Roger von Reybekiel");
  assert("sanitizeText keeps Swedish letters", sanitizeText("Åsa Öberg") === "Åsa Öberg");
  assert("sanitizeText collapses whitespace", sanitizeText("Anna   Andersson") === "Anna Andersson");
  assert("sanitizeText trims", sanitizeText("  Anna  ") === "Anna");
  assert("sanitizeText returns undefined for empty input", sanitizeText("") === undefined);
  assert("sanitizeText returns undefined when only symbols", sanitizeText("🌏🌏") === undefined);
  assert("sanitizeText passes undefined through", sanitizeText(undefined) === undefined);
  ok("sanitizeText runs");

  // ---------- isEmailAllowedToSend ----------
  const prevAllowlist = process.env.FORTNOX_EMAIL_ALLOWLIST;

  process.env.FORTNOX_EMAIL_ALLOWLIST = "bjorn@konst-teknik.se,mattias@konst-teknik.se";
  assert("allowlist: listed email allowed", isEmailAllowedToSend("bjorn@konst-teknik.se"));
  assert("allowlist: case-insensitive", isEmailAllowedToSend("MATTIAS@KONST-TEKNIK.SE"));
  assert("allowlist: unlisted email blocked", !isEmailAllowedToSend("nobody@example.com"));
  assert("allowlist: empty/undefined email blocked", !isEmailAllowedToSend(undefined));

  process.env.FORTNOX_EMAIL_ALLOWLIST = "";
  assert("empty allowlist: everyone allowed", isEmailAllowedToSend("anyone@example.com"));

  process.env.FORTNOX_EMAIL_ALLOWLIST = prevAllowlist;
  ok("isEmailAllowedToSend runs");

  // ---------- report ----------
  results.forEach(r => {
    if (r.pass) console.log(`  ✓ ${r.name}`);
    else console.error(`  ✗ ${r.name}${r.msg ? ` — ${r.msg}` : ""}`);
  });
  console.log(`\n${results.length} assertions, ${failures} failure(s)`);

  process.exit(failures ? 1 : 0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});