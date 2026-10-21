import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { isInvoicePaid, isInvoicePartiallyPaid, FortnoxInvoice } from "../lib/fortnox/invoices";
import { isEligibleForInvoiceFromRecords } from "../lib/fortnox/invoiceDispatch";
import {
  memberToCustomer,
  sanitizeText,
  checkCustomerOwnership,
  selectUniqueCustomerByEmail,
  dropRedundantClears,
  dataWouldChange,
  webhookEntityToMember,
  webhookModelApiKey
} from "../lib/fortnox/sync";
import { isEmailAllowedToSend, getInvoiceAccountNumber } from "../lib/fortnox/constants";
import { parseInvoiceAmount, regionAmountError } from "../lib/fortnox/invoiceAmount";
import {
  buildInvoiceEmailInformation,
  normalizeInvoiceEmailText,
  normalizeInvoiceEmailSubject
} from "../lib/fortnox/invoiceEmail";
import { normalizeTestEmail } from "../lib/fortnox/testEmail";
import { pickTestInvoiceMember } from "../lib/fortnox/invoiceDispatch";
import {
  canPersistTokens,
  hasDb,
  readRefreshTokenFromEnv
} from "../lib/fortnox/tokenStore";

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
    "inactive (vilande) → not eligible",
    !isEligibleForInvoiceFromRecords(member({ region: regionId, inactive: true }), 2026, [], true).eligible
  );

  assert(
    "inactive null → eligible",
    isEligibleForInvoiceFromRecords(member({ region: regionId, inactive: null }), 2026, [], true).eligible
  );

  assert(
    "inactive false → eligible",
    isEligibleForInvoiceFromRecords(member({ region: regionId, inactive: false }), 2026, [], true).eligible
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

  const clearedCity = memberToCustomer({ id: "Member3", email: "y@example.com", city: "" });
  assert("memberToCustomer empty-string city clears with API_BLANK", clearedCity.City === "API_BLANK");
  const whitespaceCity = memberToCustomer({ id: "Member4", email: "z@example.com", city: "   " });
  assert("memberToCustomer whitespace-only city clears with API_BLANK", whitespaceCity.City === "API_BLANK");
  const emptyEmail = memberToCustomer({ id: "Member5", email: "", city: "Stockholm" });
  assert("memberToCustomer email passed through (not optional-clearing)", emptyEmail.Email === "");
  ok("memberToCustomer runs");

  // ---------- sanitizeText ----------
  assert("sanitizeText removes emoji", sanitizeText("Roger von Reybekiel 🌏") === "Roger von Reybekiel");
  assert("sanitizeText keeps Swedish letters", sanitizeText("Åsa Öberg") === "Åsa Öberg");
  assert("sanitizeText collapses whitespace", sanitizeText("Anna   Andersson") === "Anna Andersson");
  assert("sanitizeText trims", sanitizeText("  Anna  ") === "Anna");
  assert("sanitizeText returns undefined for empty input", sanitizeText("") === undefined);
  assert("sanitizeText returns undefined when only symbols", sanitizeText("🌏🌏") === undefined);
  assert("sanitizeText passes undefined through", sanitizeText(undefined) === undefined);
  assert("sanitizeText removes leading BOM", sanitizeText("\uFEFFAnna") === "Anna");
  assert("sanitizeText removes zero-width space", sanitizeText("An\u200Bna") === "Anna");
  assert("sanitizeText removes zero-width joiner", sanitizeText("An\u200Dna") === "Anna");
  assert("sanitizeText removes soft hyphen", sanitizeText("An\u00ADna") === "Anna");
  ok("sanitizeText runs");

  // ---------- overwrite safeguards ----------
  const memberA = {
    id: "MemberA",
    email: "anna@example.com",
    first_name: "Anna",
    last_name: "Andersson",
    city: "Malmö"
  };
  const cust = (overrides: Record<string, any> = {}) =>
    ({
      CustomerNumber: "100",
      Email: "anna@example.com",
      Name: "Anna Andersson",
      City: "Malmö",
      ...overrides
    }) as any;

  assert(
    "ownership: own ExternalReference is ok",
    checkCustomerOwnership(cust({ ExternalReference: "MemberA" }), memberA).ok
  );
  assert(
    "ownership: different ExternalReference is refused",
    !checkCustomerOwnership(cust({ ExternalReference: "MemberB" }), memberA).ok
  );
  assert("ownership: no reference + matching email is ok", checkCustomerOwnership(cust(), memberA).ok);
  assert(
    "ownership: no reference + different email is refused",
    !checkCustomerOwnership(cust({ Email: "someone-else@example.com" }), memberA).ok
  );
  assert(
    "ownership: own reference + changed email is still ok",
    checkCustomerOwnership(cust({ ExternalReference: "MemberA", Email: "old@example.com" }), memberA).ok
  );
  ok("checkCustomerOwnership runs");

  const twoCustomers = [cust({ CustomerNumber: "100" }), cust({ CustomerNumber: "101", Email: "other@example.com" })];
  assert(
    "unique match: finds the single match",
    selectUniqueCustomerByEmail(twoCustomers, "anna@example.com").customer?.CustomerNumber === "100"
  );
  const noMatch = selectUniqueCustomerByEmail(twoCustomers, "nobody@example.com");
  assert("unique match: no match is not an error", !noMatch.error && noMatch.customer === undefined);
  assert(
    "unique match: duplicate emails are refused",
    !!selectUniqueCustomerByEmail(
      [cust({ CustomerNumber: "100" }), cust({ CustomerNumber: "101" })],
      "anna@example.com"
    ).error
  );
  ok("selectUniqueCustomerByEmail runs");

  const withCity = cust({ CustomerNumber: "100", City: "Malmö" });
  const noCity = cust({ CustomerNumber: "100", City: "" });
  assert(
    "dropRedundantClears: keeps API_BLANK when the customer has a value",
    dropRedundantClears({ City: "API_BLANK" }, withCity).City === "API_BLANK"
  );
  assert(
    "dropRedundantClears: drops API_BLANK when the customer is already empty",
    dropRedundantClears({ City: "API_BLANK" }, noCity).City === undefined
  );
  assert(
    "dataWouldChange: identical data is a no-op",
    !dataWouldChange({ Name: "Anna Andersson", City: "Malmö" }, withCity)
  );
  assert(
    "dataWouldChange: changed name is a change",
    dataWouldChange({ Name: "Anna A", City: "Malmö" }, withCity)
  );
  assert("dataWouldChange: API_BLANK against empty is a no-op", !dataWouldChange({ City: "API_BLANK" }, noCity));
  ok("overwrite safeguards run");

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

  // ---------- getInvoiceAccountNumber (sales account on the invoice row) ----------
  const prevGlobalAccount = process.env.FORTNOX_INVOICE_ACCOUNT;
  const prevRegionAccount = process.env.FORTNOX_OST_INVOICE_ACCOUNT;
  delete process.env.FORTNOX_INVOICE_ACCOUNT;
  delete process.env.FORTNOX_OST_INVOICE_ACCOUNT;

  assert("invoice account: default 3013", getInvoiceAccountNumber("ost") === 3013);

  process.env.FORTNOX_INVOICE_ACCOUNT = "3014";
  assert("invoice account: global env override", getInvoiceAccountNumber("ost") === 3014);

  process.env.FORTNOX_OST_INVOICE_ACCOUNT = "3015";
  assert("invoice account: region env wins over global", getInvoiceAccountNumber("ost") === 3015);
  assert("invoice account: other regions use global", getInvoiceAccountNumber("syd") === 3014);

  process.env.FORTNOX_OST_INVOICE_ACCOUNT = "0";
  assert("invoice account: 0 falls back to default", getInvoiceAccountNumber("ost") === 3013);

  process.env.FORTNOX_OST_INVOICE_ACCOUNT = "abc";
  assert("invoice account: garbage falls back to default", getInvoiceAccountNumber("ost") === 3013);

  if (prevGlobalAccount) process.env.FORTNOX_INVOICE_ACCOUNT = prevGlobalAccount;
  else delete process.env.FORTNOX_INVOICE_ACCOUNT;
  if (prevRegionAccount) process.env.FORTNOX_OST_INVOICE_ACCOUNT = prevRegionAccount;
  else delete process.env.FORTNOX_OST_INVOICE_ACCOUNT;
  ok("getInvoiceAccountNumber runs");

  // ---------- tokenStore ----------
  const prevTursoUrl = process.env.TURSO_DATABASE_URL;
  const prevEnvRefresh = process.env.FORTNOX_OST_REFRESH_TOKEN;

  delete process.env.TURSO_DATABASE_URL;
  assert("hasDb false without TURSO_DATABASE_URL", !hasDb());

  process.env.TURSO_DATABASE_URL = "file:./test-local.db";
  assert("hasDb true with TURSO_DATABASE_URL", hasDb());
  assert("canPersistTokens true in local dev", canPersistTokens());

  process.env.FORTNOX_OST_REFRESH_TOKEN = "test-refresh-token";
  assert("readRefreshTokenFromEnv reads FORTNOX_OST_REFRESH_TOKEN", readRefreshTokenFromEnv("ost") === "test-refresh-token");
  delete process.env.FORTNOX_OST_REFRESH_TOKEN;
  assert("readRefreshTokenFromEnv undefined when unset", readRefreshTokenFromEnv("ost") === undefined);

  if (prevTursoUrl) process.env.TURSO_DATABASE_URL = prevTursoUrl;
  else delete process.env.TURSO_DATABASE_URL;
  if (prevEnvRefresh) process.env.FORTNOX_OST_REFRESH_TOKEN = prevEnvRefresh;
  else delete process.env.FORTNOX_OST_REFRESH_TOKEN;
  ok("tokenStore runs");

  // ---------- webhookEntityToMember / webhookModelApiKey ----------
  const itemTypeId = "itemTypeMember";

  const entity = {
    id: "Member3",
    attributes: {
      email: "web@example.com",
      first_name: "Karin",
      last_name: "Karlsson",
      city: "Göteborg",
      inactive: false,
      fortnox_customer_number: "10001",
      region: "143685113"
    },
    relationships: {
      item_type: { data: { id: itemTypeId, type: "item_type" } },
      region: { data: { id: "143685113", type: "item_type" } }
    }
  };

  const m = webhookEntityToMember(entity as any);
  assert("webhookEntityToMember id", m.id === "Member3");
  assert("webhookEntityToMember email", m.email === "web@example.com");
  assert("webhookEntityToMember first_name", m.first_name === "Karin");
  assert("webhookEntityToMember last_name", m.last_name === "Karlsson");
  assert("webhookEntityToMember city", m.city === "Göteborg");
  assert("webhookEntityToMember inactive", m.inactive === false);
  assert(
    "webhookEntityToMember fortnox_customer_number",
    m.fortnox_customer_number === "10001"
  );
  assert("webhookEntityToMember region from attributes", m.region === "143685113");

  const noAttrs = webhookEntityToMember({ id: "Member4", relationships: { region: { data: { id: "143707759" } } } } as any);
  assert("webhookEntityToMember region falls back to relationships", noAttrs.region === "143707759");
  assert("webhookEntityToMember missing fields undefined", noAttrs.email === undefined);

  const payload = {
    entity,
    entity_type: "item",
    event_type: "item::create",
    related_entities: [
      { id: itemTypeId, type: "item_type", attributes: { api_key: "member" } },
      { id: "x", type: "item_type", attributes: { api_key: "region" } }
    ]
  };
  assert("webhookModelApiKey returns member", webhookModelApiKey(payload as any) === "member");
  assert("webhookModelApiKey undefined without related entity", webhookModelApiKey({ entity: { id: "a" } } as any) === undefined);
  assert("webhookModelApiKey undefined without payload", webhookModelApiKey({} as any) === undefined);
  ok("webhook entity helpers run");

  // ---------- parseInvoiceAmount (region.invoice_amount) ----------
  assert("parseInvoiceAmount 250 → 250", parseInvoiceAmount(250) === 250);
  assert("parseInvoiceAmount 350.5 → 350.5", parseInvoiceAmount(350.5) === 350.5);
  assert("parseInvoiceAmount 1 → 1", parseInvoiceAmount(1) === 1);
  assert("parseInvoiceAmount '300' → 300", parseInvoiceAmount("300") === 300);
  assert("parseInvoiceAmount null → invalid", parseInvoiceAmount(null) === null);
  assert("parseInvoiceAmount undefined → invalid", parseInvoiceAmount(undefined) === null);
  assert("parseInvoiceAmount 0 → invalid", parseInvoiceAmount(0) === null);
  assert("parseInvoiceAmount -5 → invalid", parseInvoiceAmount(-5) === null);
  assert("parseInvoiceAmount NaN → invalid", parseInvoiceAmount(NaN) === null);
  assert("parseInvoiceAmount '' → invalid", parseInvoiceAmount("") === null);
  assert("parseInvoiceAmount '   ' → invalid", parseInvoiceAmount("   ") === null);
  assert("parseInvoiceAmount 'abc' → invalid", parseInvoiceAmount("abc") === null);
  assert("parseInvoiceAmount {} → invalid", parseInvoiceAmount({}) === null);

  const missingRegionError = regionAmountError({ id: "143685114", slug: "ost", name: "Öst" });
  assert(
    "regionAmountError names the region",
    missingRegionError.includes("Öst") && missingRegionError.includes("Medlemsavgift per år")
  );
  ok("parseInvoiceAmount runs");

  // ---------- normalizeInvoiceEmailText (region.invoice_email_text) ----------
  assert(
    "normalizeInvoiceEmailText keeps interior line breaks",
    normalizeInvoiceEmailText("Hej!\n\nMed vänlig hälsning\nKonstnärscentrum") ===
      "Hej!\n\nMed vänlig hälsning\nKonstnärscentrum"
  );
  assert(
    "normalizeInvoiceEmailText trims surrounding whitespace only",
    normalizeInvoiceEmailText("  Hej igen  \n") === "Hej igen"
  );
  assert(
    "normalizeInvoiceEmailText normalises CRLF to LF",
    normalizeInvoiceEmailText("Rad ett\r\nRad två") === "Rad ett\nRad två"
  );
  assert("normalizeInvoiceEmailText '' → null", normalizeInvoiceEmailText("") === null);
  assert("normalizeInvoiceEmailText whitespace → null", normalizeInvoiceEmailText("   ") === null);
  assert("normalizeInvoiceEmailText newlines only → null", normalizeInvoiceEmailText("\n\n") === null);
  assert("normalizeInvoiceEmailText null → null", normalizeInvoiceEmailText(null) === null);
  assert("normalizeInvoiceEmailText undefined → null", normalizeInvoiceEmailText(undefined) === null);
  assert("normalizeInvoiceEmailText number → null", normalizeInvoiceEmailText(250) === null);
  assert("normalizeInvoiceEmailText {} → null", normalizeInvoiceEmailText({}) === null);

  // ---------- normalizeInvoiceEmailSubject (region.invoice_email_subject) ----------
  assert("normalizeInvoiceEmailSubject trims", normalizeInvoiceEmailSubject("  Medlemsavgift 2026  ") === "Medlemsavgift 2026");
  assert(
    "normalizeInvoiceEmailSubject collapses newlines",
    normalizeInvoiceEmailSubject("Medlemsavgift\n2026") === "Medlemsavgift 2026"
  );
  assert("normalizeInvoiceEmailSubject '' → null", normalizeInvoiceEmailSubject("") === null);
  assert("normalizeInvoiceEmailSubject whitespace → null", normalizeInvoiceEmailSubject("  \n ") === null);
  assert("normalizeInvoiceEmailSubject null → null", normalizeInvoiceEmailSubject(null) === null);
  assert("normalizeInvoiceEmailSubject number → null", normalizeInvoiceEmailSubject(2026) === null);
  ok("normalizeInvoiceEmailSubject runs");

  // ---------- buildInvoiceEmailInformation ----------
  const fallbackSubject = "Medlemsavgift 2026";
  const emailInfo = buildInvoiceEmailInformation({
    body: "Hej!\n\nMed vänlig hälsning",
    fallbackSubject
  });
  assert("buildInvoiceEmailInformation sets EmailBody", emailInfo?.EmailBody === "Hej!\n\nMed vänlig hälsning");
  assert("buildInvoiceEmailInformation falls back to the default subject", emailInfo?.EmailSubject === fallbackSubject);
  assert(
    "buildInvoiceEmailInformation sets nothing else",
    !!emailInfo && Object.keys(emailInfo).sort().join(",") === "EmailBody,EmailSubject"
  );

  const withOwnSubject = buildInvoiceEmailInformation({
    body: "Hej!",
    subject: "  Medlemsavgift\nför 2026 ",
    fallbackSubject
  });
  assert(
    "buildInvoiceEmailInformation uses the region subject",
    withOwnSubject?.EmailSubject === "Medlemsavgift för 2026"
  );

  const subjectOnly = buildInvoiceEmailInformation({ subject: "Bara rubrik", fallbackSubject });
  assert("buildInvoiceEmailInformation subject only → no body", !!subjectOnly && !("EmailBody" in subjectOnly));
  assert("buildInvoiceEmailInformation subject only keeps the subject", subjectOnly?.EmailSubject === "Bara rubrik");

  const testSend = buildInvoiceEmailInformation({
    body: "Hej!",
    addressTo: "karin@karinwillen.se",
    fallbackSubject
  });
  assert("buildInvoiceEmailInformation test send sets recipient", testSend?.EmailAddressTo === "karin@karinwillen.se");
  assert("buildInvoiceEmailInformation test send still has a subject", testSend?.EmailSubject === fallbackSubject);

  assert(
    "buildInvoiceEmailInformation nothing to say → undefined",
    buildInvoiceEmailInformation({ fallbackSubject }) === undefined
  );
  assert(
    "buildInvoiceEmailInformation null body → undefined",
    buildInvoiceEmailInformation({ body: null, subject: "", addressTo: "  ", fallbackSubject }) === undefined
  );
  ok("buildInvoiceEmailInformation runs");

  // ---------- normalizeTestEmail (region.test_email) ----------
  assert("normalizeTestEmail trims", normalizeTestEmail("  Karin@KarinWillen.se  ") === "karin@karinwillen.se");
  assert("normalizeTestEmail plain address", normalizeTestEmail("test@example.com") === "test@example.com");
  assert("normalizeTestEmail '' → null", normalizeTestEmail("") === null);
  assert("normalizeTestEmail '   ' → null", normalizeTestEmail("   ") === null);
  assert("normalizeTestEmail no @ → null", normalizeTestEmail("karin.karinwillen.se") === null);
  assert("normalizeTestEmail no domain dot → null", normalizeTestEmail("karin@karinwillen") === null);
  assert("normalizeTestEmail spaces inside → null", normalizeTestEmail("kar in@example.com") === null);
  assert("normalizeTestEmail null → null", normalizeTestEmail(null) === null);
  assert("normalizeTestEmail undefined → null", normalizeTestEmail(undefined) === null);
  assert("normalizeTestEmail number → null", normalizeTestEmail(42) === null);
  ok("normalizeTestEmail runs");

  // ---------- pickTestInvoiceMember ----------
  const testMembers = [
    { id: "m1", email: "a@example.com", last_name: "Alm", fortnox_customer_number: "10" },
    { id: "m2", email: "karin@karinwillen.se", last_name: "Willén", fortnox_customer_number: "400" },
    { id: "m3", email: "b@example.com", last_name: "Berg", fortnox_customer_number: undefined },
    { id: "m4", email: "c@example.com", last_name: "Ceder", fortnox_customer_number: "20" }
  ] as any;

  assert(
    "pickTestInvoiceMember prefers the member with the test email",
    pickTestInvoiceMember(testMembers, "Karin@karinwillen.se")?.id === "m2"
  );
  assert(
    "pickTestInvoiceMember falls back to the first with a customer number",
    pickTestInvoiceMember(testMembers, "nobody@example.com")?.id === "m1"
  );
  assert(
    "pickTestInvoiceMember never picks a member without a customer number",
    pickTestInvoiceMember(
      [{ id: "x", email: "x@example.com", last_name: "X", fortnox_customer_number: undefined }] as any,
      "nobody@example.com"
    ) === null
  );
  assert("pickTestInvoiceMember empty list → null", pickTestInvoiceMember([], "a@example.com") === null);
  assert("pickTestInvoiceMember invalid email → null", pickTestInvoiceMember(testMembers, "nope") === null);
  assert(
    "pickTestInvoiceMember prefers a non-dormant member",
    pickTestInvoiceMember(
      [
        { id: "d1", email: "d@example.com", last_name: "Ahl", fortnox_customer_number: "1", inactive: true },
        { id: "a1", email: "a@example.com", last_name: "Öberg", fortnox_customer_number: "2" }
      ] as any,
      "nobody@example.com"
    )?.id === "a1"
  );
  ok("pickTestInvoiceMember runs");

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