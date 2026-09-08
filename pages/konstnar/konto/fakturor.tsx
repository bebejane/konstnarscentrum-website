import s from "./fakturor.module.scss";
import requireAuthentication from "/lib/auth/requireAuthentication";
import client from "/lib/client";
import Link from "next/link";
import { format, parseISO } from "date-fns";

type InvoiceRecord = {
  id: string;
  fortnox_document_number?: string;
  payment_status?: string;
  payment_date?: string | null;
  invoice_year?: number;
  total?: number;
  region?: string;
};

export type InvoiceRow = {
  id: string;
  documentNumber: string | null;
  invoiceYear: number | null;
  paymentStatus: string | null;
  paymentDate: string | null;
  total: number | null;
  region: string | null;
};

export type Props = {
  invoices: InvoiceRow[];
  customerNumber: string | null;
};

const parseDate = (d?: string | null) =>
  d ? (Number.isNaN(Date.parse(d)) ? null : d) : null;

const statusLabel = (status: string | null) => {
  switch ((status ?? '').toUpperCase()) {
    case 'FULLYPAID':
    case 'PAID':
      return 'betald';
    case 'PARTIALLYPAID':
    case 'PARTLYPAID':
      return 'delvis betald';
    default:
      return 'inte betald';
  }
};

export default function Fakturor({ invoices, customerNumber }: Props) {
  const list = invoices
    .slice()
    .sort((a, b) => (b.invoiceYear ?? 0) - (a.invoiceYear ?? 0));

  return (
    <div className={s.container}>
      <h1>Fakturor</h1>
      <p className="intro">
        Här ser du dina historiska medlemsavgifter och om de är betalda.
      </p>

      {!customerNumber ? (
        <p>
          Vi har ännu ingen faktura kopplad till ditt konto. Din första faktura
          skickas ut när medlemsavgiften faktureras.
        </p>
      ) : list.length === 0 ? (
        <p>Inga fakturor ännu.</p>
      ) : (
        <table className={s.invoiceTable}>
          <thead>
            <tr>
              <th>Fakturanr</th>
              <th>År</th>
              <th>Förfaller</th>
              <th>Belopp</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map(inv => (
              <tr key={inv.id}>
                <td>{inv.documentNumber ?? '-'}</td>
                <td>{inv.invoiceYear ?? '-'}</td>
                <td>
                  {inv.paymentDate
                    ? format(parseISO(inv.paymentDate), 'yyyy-MM-dd')
                    : '-'}
                </td>
                <td>{inv.total != null ? `${inv.total.toFixed(2)} kr` : '-'}</td>
                <td>
                  {statusLabel(inv.paymentStatus) === 'betald' ? (
                    <span className={s.paid}>Betald</span>
                  ) : statusLabel(inv.paymentStatus) === 'delvis betald' ? (
                    <span className={s.partiallyPaid}>Delvis betald</span>
                  ) : (
                    <span className={s.unpaid}>Inte betald</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Link href="/konstnar/konto">Tillbaka till konto</Link>
    </div>
  );
}

Fakturor.page = { title: 'Fakturor', crumbs: [{ title: 'Konto', regional: false }, { title: 'Fakturor', regional: false }] } as PageProps;

export const getServerSideProps = requireAuthentication(
  async ({ props }: any, session: any) => {
    const email = session.user?.email;
    if (!email) return { props: {} };

    const members = await client.items.list({
      filter: {
        type: "member",
        fields: { email: { eq: email.toLowerCase() } }
      }
    });
    const member = members[0] as
      | {
          id: string;
          email?: string;
          region?: string;
          fortnox_customer_number?: string;
          invoices?: (string | InvoiceRecord)[];
        }
      | undefined;

    if (!member?.fortnox_customer_number)
      return { props: { ...props, invoices: [], customerNumber: null } };

    if (!Array.isArray(member.invoices) || member.invoices.length === 0)
      return { props: { ...props, invoices: [], customerNumber: member.fortnox_customer_number } };

    const ids = member.invoices.map(i => (typeof i === 'string' ? i : (i as any).id));
    const records: InvoiceRecord[] = [];
    for (const id of ids) {
      const nested = member.invoices.find(i => typeof i !== 'string' && (i as any).id === id);
      if (nested && typeof nested !== 'string') {
        records.push(nested as InvoiceRecord);
      } else {
        try {
          records.push(await client.items.find(id));
        } catch {
          // skip missing
        }
      }
    }

    const list: InvoiceRow[] = records.map(inv => ({
      id: inv.id,
      documentNumber: inv.fortnox_document_number ?? null,
      invoiceYear: inv.invoice_year ?? null,
      paymentStatus: inv.payment_status ?? null,
      paymentDate: parseDate(inv.payment_date),
      total: typeof inv.total === 'number' ? inv.total : null,
      region: inv.region ?? null
    }));

    return {
      props: {
        ...props,
        invoices: list,
        customerNumber: member.fortnox_customer_number
      }
    };
  }
);