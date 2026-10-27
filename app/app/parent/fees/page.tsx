"use client";

import { Smartphone } from "lucide-react";
import { useData } from "@/lib/os/context";
import { Card, CardHead, Chip, Empty, ErrorNote, Loading, PageHeader, dateLabel, ugx } from "@/components/os/ui";

export default function ParentFees() {
  const { data, error } = useData(async (a) => {
    const [invoices, kids] = await Promise.all([a.listInvoices({}), a.listChildren()]);
    return { invoices, kids };
  }, []);
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const due = data.invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const total = due.reduce((s, i) => s + i.amount_ugx, 0);
  return (
    <>
      <PageHeader eyebrow="Fees" title={total ? `${ugx(total)} to pay` : "All paid up — thank you"} sub="The same published prices as on pikadon.ug. No hidden charges." />
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
        <Card>
          <CardHead title="Invoices" />
          {data.invoices.length === 0 ? <Empty title="No invoices yet" /> : data.invoices.map((i) => {
            const k = data.kids.find((c) => c.id === i.child_id);
            return (
              <div key={i.id} className="os-row flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--plum-900)]">{i.period}{k ? ` · ${k.first_name}` : ""}</p>
                  <p className="text-[12.5px] text-[var(--ink-muted)]">{i.status === "paid" ? `Paid ${i.paid_at ? dateLabel(i.paid_at) : ""}${i.reference ? ` · ref ${i.reference}` : ""}` : `Due ${dateLabel(i.due_on)}`}</p>
                </div>
                <span className="font-semibold">{ugx(i.amount_ugx)}</span>
                <Chip tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "alert" : "sun"}>{i.status === "sent" ? "due" : i.status}</Chip>
              </div>
            );
          })}
        </Card>
        <Card tone="sun">
          <CardHead title="How to pay" icon={<Smartphone className="w-5 h-5" />} />
          <ol className="list-decimal pl-5 space-y-2 text-[15px]">
            <li>Pay by <strong>MTN MoMo</strong>, <strong>Airtel Money</strong> or bank transfer to the Pikadon account your branch shared.</li>
            <li>Use your child&apos;s name as the reason.</li>
            <li>Send the transaction ID to the branch in Messages — the invoice is marked paid the same day.</li>
          </ol>
          <p className="text-[12.5px] text-[var(--ink-muted)] mt-4">Pikadon is cashless. Ask the branch for a receipt any time.</p>
        </Card>
      </div>
    </>
  );
}
