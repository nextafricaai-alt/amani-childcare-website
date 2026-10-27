"use client";

import { useState } from "react";
import { FilePlus2, Wallet } from "lucide-react";
import { useOs, useData, useAction, useBranchId } from "@/lib/os/context";
import type { Invoice } from "@/lib/os/types";
import { Avatar, Button, Card, CardHead, Chip, Empty, ErrorNote, Field, Loading, PageHeader, Segmented, Sheet, Stat, dateLabel, fullName, inputCls, ugx } from "@/components/os/ui";
import { PickBranch } from "@/components/os/pick-branch";

export default function FeesPage() {
  const branchId = useBranchId();
  if (!branchId) return <PickBranch />;
  return <Fees branchId={branchId} />;
}

function Fees({ branchId }: { branchId: string }) {
  const { data, error } = useData(async (a) => {
    const [invoices, children] = await Promise.all([a.listInvoices({ branchId }), a.listChildren(branchId)]);
    return { invoices, children };
  }, [branchId]);
  const [filter, setFilter] = useState<"due" | "paid" | "all">("due");
  const [paying, setPaying] = useState<Invoice | null>(null);
  const [billOpen, setBillOpen] = useState(false);
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const { invoices, children } = data;
  const due = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const overdue = invoices.filter((i) => i.status === "overdue");
  const paid = invoices.filter((i) => i.status === "paid");
  const list = filter === "due" ? due : filter === "paid" ? paid : invoices;
  const total = (xs: Invoice[]) => xs.reduce((s, i) => s + i.amount_ugx, 0);
  const rate = invoices.length ? Math.round((total(paid) / Math.max(1, total(invoices.filter((i) => i.status !== "void")))) * 100) : 0;

  return (
    <>
      <PageHeader eyebrow="Fees" title="Money in" sub="Published fees, clear invoices, payments matched to a reference."
        actions={<Button onClick={() => setBillOpen(true)}><FilePlus2 className="w-4 h-4" />Bill this month</Button>} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Collected" value={ugx(total(paid))} tone="ok" icon={<Wallet className="w-4 h-4" />} />
        <Stat label="Still to collect" value={ugx(total(due))} sub={`${due.length} invoices`} />
        <Stat label="Overdue" value={ugx(total(overdue))} tone={overdue.length ? "alert" : "ok"} sub={`${overdue.length} families`} />
        <Stat label="Collection rate" value={`${rate}%`} tone={rate >= 85 ? "ok" : "warn"} />
      </div>
      <Card>
        <CardHead title="Invoices" right={<Segmented value={filter} onChange={setFilter} options={[{ value: "due", label: `Due ${due.length}` }, { value: "paid", label: `Paid ${paid.length}` }, { value: "all", label: "All" }]} />} />
        {list.length === 0 ? <Empty title="Nothing here" /> : list.map((i) => {
          const c = children.find((x) => x.id === i.child_id);
          return (
            <div key={i.id} className="os-row flex-wrap">
              <Avatar name={c ? fullName(c) : "?"} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--plum-900)]">{c ? fullName(c) : "Child"}</p>
                <p className="text-[12.5px] text-[var(--ink-muted)]">{i.period} · due {dateLabel(i.due_on)}{i.reference ? ` · ref ${i.reference}` : ""}</p>
              </div>
              <span className="font-semibold">{ugx(i.amount_ugx)}</span>
              <Chip tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "alert" : "sun"}>{i.status === "sent" ? "due" : i.status}</Chip>
              {i.status !== "paid" && i.status !== "void" && <Button size="sm" variant="secondary" onClick={() => setPaying(i)}>Record payment</Button>}
            </div>
          );
        })}
      </Card>
      <PaySheet invoice={paying} onClose={() => setPaying(null)} />
      <BillSheet open={billOpen} onClose={() => setBillOpen(false)} branchId={branchId} kids={children.filter((c) => c.status === "enrolled")} existing={invoices} />
    </>
  );
}

function PaySheet({ invoice, onClose }: { invoice: Invoice | null; onClose: () => void }) {
  const { api } = useOs();
  const [method, setMethod] = useState<NonNullable<Invoice["method"]>>("mtn_momo");
  const [ref, setRef] = useState("");
  const { run, busy, error } = useAction();
  if (!invoice) return null;
  return (
    <Sheet open onClose={onClose} title={`Record payment · ${ugx(invoice.amount_ugx)}`}>
      <div className="flex flex-col gap-4">
        <Field label="Paid by">
          <select className={inputCls} value={method} onChange={(e) => setMethod(e.target.value as NonNullable<Invoice["method"]>)}>
            <option value="mtn_momo">MTN Mobile Money</option><option value="airtel_money">Airtel Money</option><option value="bank">Bank transfer</option><option value="cash">Cash (receipt issued)</option>
          </select>
        </Field>
        <Field label="Transaction reference" hint="Each reference can be used once — this stops the same payment being counted twice.">
          <input className={inputCls} value={ref} onChange={(e) => setRef(e.target.value)} placeholder="e.g. MP2610271234" />
        </Field>
        <ErrorNote error={error} />
        <Button size="lg" disabled={busy || (method !== "cash" && !ref.trim())} onClick={async () => { if ((await run(() => api.markInvoicePaid(invoice.id, method, ref))) !== undefined) onClose(); }}>Mark as paid</Button>
      </div>
    </Sheet>
  );
}

function BillSheet({ open, onClose, branchId, kids, existing }: { open: boolean; onClose: () => void; branchId: string; kids: { id: string; first_name: string; last_name: string; care_plan: string }[]; existing: Invoice[] }) {
  const { api } = useOs();
  const month = new Date().toLocaleString("en-GB", { month: "long", year: "numeric" });
  const [full, setFull] = useState(450000);
  const [half, setHalf] = useState(300000);
  const [due, setDue] = useState(() => { const d = new Date(); d.setDate(5); if (d < new Date()) d.setMonth(d.getMonth() + 1); return d.toISOString().slice(0, 10); });
  const { run, busy, error } = useAction();
  const toBill = kids.filter((k) => k.care_plan !== "hourly" && !existing.some((i) => i.child_id === k.id && i.period === month));
  return (
    <Sheet open={open} onClose={onClose} title={`Bill ${month}`}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--ink-muted)]">{toBill.length} children don&apos;t have an invoice for {month} yet. Use the prices published on the website.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Full day (UGX)"><input type="number" className={inputCls} value={full} onChange={(e) => setFull(Number(e.target.value))} /></Field>
          <Field label="Half day (UGX)"><input type="number" className={inputCls} value={half} onChange={(e) => setHalf(Number(e.target.value))} /></Field>
        </div>
        <Field label="Due date"><input type="date" className={inputCls} value={due} onChange={(e) => setDue(e.target.value)} /></Field>
        <ErrorNote error={error} />
        <Button size="lg" disabled={busy || !toBill.length} onClick={async () => {
          const ok = await run(async () => {
            for (const k of toBill) await api.createInvoice({ branch_id: branchId, child_id: k.id, period: month, amount_ugx: k.care_plan === "half_day" ? half : full, due_on: due });
            return true;
          });
          if (ok) onClose();
        }}>Create {toBill.length} invoices</Button>
      </div>
    </Sheet>
  );
}
