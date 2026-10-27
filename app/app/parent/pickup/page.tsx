"use client";

import { useState } from "react";
import { BadgeCheck, Clock, KeyRound, Share2, UserPlus } from "lucide-react";
import { useOs, useData, useAction } from "@/lib/os/context";
import type { Child } from "@/lib/os/types";
import { Avatar, Button, Card, CardHead, Chip, Empty, ErrorNote, Field, Loading, PageHeader, Sheet, inputCls } from "@/components/os/ui";

export default function PickupPage() {
  const { data: kids, error } = useData((a) => a.listChildren(), []);
  if (error) return <ErrorNote error={error} />;
  if (!kids) return <Loading />;
  if (!kids.length) return <Empty title="No child linked yet" />;
  return (
    <>
      <PageHeader eyebrow="Pickup" title="Who can collect your child" sub="Nobody leaves Pikadon with your child unless they're on this list or have today's one-time code from you." />
      <div className="flex flex-col gap-6">{kids.map((k) => <ChildPickups key={k.id} child={k} />)}</div>
    </>
  );
}

function ChildPickups({ child }: { child: Child }) {
  const { api } = useOs();
  const { data } = useData(async (a) => {
    const [guardians, pickups] = await Promise.all([a.listGuardians(child.id), a.listPickups({ childId: child.id })]);
    return { guardians, pickups };
  }, [child.id]);
  const [code, setCode] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const act = useAction();
  if (!data) return <Loading />;
  const active = data.pickups.filter((p) => p.status !== "revoked");
  const share = () => {
    const text = `Pikadon pickup code for ${child.first_name} today: ${code}. Show it at the gate with your ID. It works once, today only.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };
  return (
    <div className="grid lg:grid-cols-[1fr_1.1fr] gap-4">
      <Card tone="sun">
        <CardHead title={`Someone else collecting ${child.first_name} today?`} icon={<KeyRound className="w-5 h-5" />}
          sub="Create a one-time code and send it to them. They show it at the gate with their ID. It stops working after one use or at midnight." />
        {code ? (
          <div className="text-center">
            <p className="font-[var(--font-heading)] font-bold text-[clamp(2.4rem,9vw,3.4rem)] tracking-[0.25em] text-[var(--plum-900)] bg-white rounded-3xl py-4 border border-[var(--sun-100)]" aria-label={`Code ${code.split("").join(" ")}`}>{code}</p>
            <p className="text-sm text-[var(--ink-muted)] mt-2 flex items-center justify-center gap-1.5"><Clock className="w-4 h-4" />Valid today only · one use</p>
            <div className="flex gap-2 justify-center mt-4">
              <Button onClick={share}><Share2 className="w-4 h-4" />Send on WhatsApp</Button>
              <Button variant="secondary" onClick={() => act.run(async () => setCode(await api.issuePickupCode(child.id)))}>New code</Button>
            </div>
          </div>
        ) : (
          <Button size="lg" className="w-full" disabled={act.busy} onClick={() => act.run(async () => setCode(await api.issuePickupCode(child.id)))}><KeyRound className="w-4 h-4" />Create today&apos;s code</Button>
        )}
        <ErrorNote error={act.error} />
      </Card>
      <Card>
        <CardHead title="Always allowed" right={<Button size="sm" variant="secondary" onClick={() => setAddOpen(true)}><UserPlus className="w-3.5 h-3.5" />Add someone</Button>} />
        {data.guardians.map((g) => (
          <div key={g.id} className="os-row">
            <Avatar name={g.full_name} />
            <div className="flex-1"><p className="font-semibold text-[var(--plum-900)]">{g.full_name}</p><p className="text-[12.5px] text-[var(--ink-muted)]">{g.relationship}</p></div>
            <Chip tone="ok"><BadgeCheck className="w-3 h-3" />Parent</Chip>
          </div>
        ))}
        {active.length === 0 ? null : active.map((p) => (
          <div key={p.id} className="os-row flex-wrap">
            <Avatar name={p.full_name} />
            <div className="flex-1 min-w-0"><p className="font-semibold text-[var(--plum-900)]">{p.full_name}</p><p className="text-[12.5px] text-[var(--ink-muted)]">{p.relationship}{p.phone ? ` · ${p.phone}` : ""}</p></div>
            {p.status === "pending" ? <Chip tone="sun">Waiting for the manager</Chip> : <Chip tone="ok">Approved</Chip>}
            <Button size="sm" variant="ghost" onClick={() => act.run(() => api.revokePickup(p.id))}>Remove</Button>
          </div>
        ))}
        <p className="text-[12.5px] text-[var(--ink-muted)] mt-3">New people are checked by the branch manager (with their ID) before they can collect.</p>
      </Card>
      <AddPersonSheet open={addOpen} onClose={() => setAddOpen(false)} child={child} />
    </div>
  );
}

function AddPersonSheet({ open, onClose, child }: { open: boolean; onClose: () => void; child: Child }) {
  const { api } = useOs();
  const [f, setF] = useState({ full_name: "", relationship: "", phone: "", id_note: "" });
  const { run, busy, error } = useAction();
  return (
    <Sheet open={open} onClose={onClose} title={`Allow someone to collect ${child.first_name}`}>
      <form className="flex flex-col gap-4" onSubmit={async (e) => {
        e.preventDefault();
        if ((await run(() => api.requestPickup(child.id, f))) !== undefined) { setF({ full_name: "", relationship: "", phone: "", id_note: "" }); onClose(); }
      }}>
        <Field label="Full name (as on their ID)"><input required className={inputCls} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></Field>
        <Field label="Who are they to your child?"><input required className={inputCls} value={f.relationship} onChange={(e) => setF({ ...f, relationship: e.target.value })} placeholder="Aunt, grandparent, driver…" /></Field>
        <Field label="Their phone number"><input required className={inputCls} inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <ErrorNote error={error} />
        <Button size="lg" disabled={busy}>Send to the branch for approval</Button>
      </form>
    </Sheet>
  );
}
