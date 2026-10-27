"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Search, UserPlus, X } from "lucide-react";
import { useOs, useData, useAction, useBranchId, branchRole } from "@/lib/os/context";
import type { Child, NewChildInput } from "@/lib/os/types";
import { Avatar, Button, Card, CardHead, Chip, Empty, ErrorNote, Field, Loading, PageHeader, Sheet, age, fullName, inputCls } from "@/components/os/ui";
import { PickBranch } from "@/components/os/pick-branch";

export default function ChildrenPage() {
  const branchId = useBranchId();
  if (!branchId) return <PickBranch />;
  return <Children branchId={branchId} />;
}

function Children({ branchId }: { branchId: string }) {
  const { api, user } = useOs();
  const role = branchRole(user, branchId);
  const canManage = role === "manager" || role === "director";
  const { data, error } = useData(async (a) => {
    const [rooms, children, pickups] = await Promise.all([a.listRooms(branchId), a.listChildren(branchId), a.listPickups({ branchId })]);
    return { rooms, children, pickups };
  }, [branchId]);
  const [search, setSearch] = useState("");
  const [enrolOpen, setEnrolOpen] = useState(false);
  const decide = useAction();

  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const { rooms, children, pickups } = data;
  const pending = pickups.filter((p) => p.status === "pending");
  const enrolled = children.filter((c) => c.status === "enrolled" && fullName(c).toLowerCase().includes(search.toLowerCase()));
  const link = (c: Child) => `/app/branch/child?id=${c.id}${role === "director" ? `&b=${branchId}` : ""}`;

  return (
    <>
      <PageHeader eyebrow="Children" title={`${children.filter((c) => c.status === "enrolled").length} enrolled`}
        sub="Health notes, families and approved pickup people for every child."
        actions={canManage ? <Button onClick={() => setEnrolOpen(true)}><UserPlus className="w-4 h-4" />Enrol a child</Button> : undefined} />

      {canManage && pending.length > 0 && (
        <Card tone="sun" className="mb-5">
          <CardHead title="Pickup people waiting for approval" sub="Parents asked for these people to be allowed to collect. Check ID before approving." />
          <div>
            {pending.map((p) => {
              const c = children.find((x) => x.id === p.child_id);
              return (
                <div key={p.id} className="os-row flex-wrap">
                  <Avatar name={p.full_name} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--plum-900)]">{p.full_name} <span className="font-normal text-[var(--ink-muted)]">· {p.relationship}</span></p>
                    <p className="text-[12.5px] text-[var(--ink-muted)]">For {c ? fullName(c) : "a child"}{p.phone ? ` · ${p.phone}` : ""}</p>
                  </div>
                  <Button size="sm" variant="secondary" disabled={decide.busy} onClick={() => decide.run(() => api.decidePickup(p.id, false))}><X className="w-3.5 h-3.5" />Decline</Button>
                  <Button size="sm" disabled={decide.busy} onClick={() => decide.run(() => api.decidePickup(p.id, true))}><Check className="w-3.5 h-3.5" />Approve</Button>
                </div>
              );
            })}
          </div>
          <ErrorNote error={decide.error} />
        </Card>
      )}

      <div className="relative mb-4 max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
        <input className={`${inputCls} pl-10`} placeholder="Find a child" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Find a child" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {[...rooms, { id: "__none", name: "No room yet", age_band: null } as const].map((r) => {
          const kids = enrolled.filter((c) => (c.room_id ?? "__none") === r.id);
          if (!kids.length && r.id === "__none") return null;
          return (
            <Card key={r.id}>
              <CardHead title={r.name} sub={`${kids.length} children${r.age_band ? ` · ${r.age_band}` : ""}`} />
              {kids.length === 0 ? <Empty title="No children in this room" /> : kids.map((c) => (
                <Link key={c.id} href={link(c)} className="os-row hover:bg-[var(--plum-50)] rounded-xl">
                  <Avatar name={fullName(c)} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--plum-900)] truncate">{fullName(c)}</p>
                    <p className="text-[12.5px] text-[var(--ink-muted)]">{age(c.date_of_birth)} · {c.care_plan.replace("_", " ")}</p>
                  </div>
                  {c.allergies && <Chip tone="alert">{c.allergies}</Chip>}
                  {c.medical_notes && !c.allergies && <Chip tone="sun">Health note</Chip>}
                </Link>
              ))}
            </Card>
          );
        })}
      </div>

      <EnrolSheet open={enrolOpen} onClose={() => setEnrolOpen(false)} branchId={branchId} rooms={rooms} />
    </>
  );
}

const blank = (branch_id: string): NewChildInput => ({
  branch_id, room_id: null, first_name: "", last_name: "", date_of_birth: null, allergies: "", medical_notes: "", dietary_notes: "",
  care_plan: "full_day", guardian_name: "", guardian_relationship: "Mother", guardian_phone: "", guardian_email: "",
});

function EnrolSheet({ open, onClose, branchId, rooms }: { open: boolean; onClose: () => void; branchId: string; rooms: { id: string; name: string }[] }) {
  const { api } = useOs();
  const [f, setF] = useState<NewChildInput>(blank(branchId));
  const { run, busy, error } = useAction();
  const set = <K extends keyof NewChildInput>(k: K, v: NewChildInput[K]) => setF({ ...f, [k]: v });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await run(() => api.addChild(f))) { setF(blank(branchId)); onClose(); }
  };
  return (
    <Sheet open={open} onClose={onClose} title="Enrol a child" wide>
      <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
        <Field label="First name"><input required className={inputCls} value={f.first_name} onChange={(e) => set("first_name", e.target.value)} /></Field>
        <Field label="Last name"><input required className={inputCls} value={f.last_name} onChange={(e) => set("last_name", e.target.value)} /></Field>
        <Field label="Date of birth"><input type="date" className={inputCls} value={f.date_of_birth ?? ""} onChange={(e) => set("date_of_birth", e.target.value || null)} /></Field>
        <Field label="Room">
          <select className={inputCls} value={f.room_id ?? ""} onChange={(e) => set("room_id", e.target.value || null)}>
            <option value="">Choose later</option>
            {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>
        <Field label="Care plan">
          <select className={inputCls} value={f.care_plan} onChange={(e) => set("care_plan", e.target.value as NewChildInput["care_plan"])}>
            <option value="full_day">Full day</option><option value="half_day">Half day</option><option value="hourly">Hourly / drop-in</option>
          </select>
        </Field>
        <Field label="Allergies" hint="Shown in red at check-in"><input className={inputCls} value={f.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="None" /></Field>
        <Field label="Medical notes" className="sm:col-span-2"><input className={inputCls} value={f.medical_notes} onChange={(e) => set("medical_notes", e.target.value)} placeholder="Conditions, medication, doctor" /></Field>
        <div className="sm:col-span-2 pt-2 border-t border-[var(--rule)]">
          <p className="font-semibold text-[var(--plum-900)]">Parent / guardian</p>
          <p className="text-[12.5px] text-[var(--ink-muted)]">With an email, they get access to the parent app straight away (they sign in with a code sent to that email).</p>
        </div>
        <Field label="Full name"><input required className={inputCls} value={f.guardian_name} onChange={(e) => set("guardian_name", e.target.value)} /></Field>
        <Field label="Relationship">
          <select className={inputCls} value={f.guardian_relationship} onChange={(e) => set("guardian_relationship", e.target.value)}>
            {["Mother", "Father", "Guardian", "Grandparent", "Other"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>
        <Field label="Phone (WhatsApp)"><input className={inputCls} inputMode="tel" value={f.guardian_phone} onChange={(e) => set("guardian_phone", e.target.value)} placeholder="2567…" /></Field>
        <Field label="Email (for the parent app)"><input type="email" className={inputCls} value={f.guardian_email} onChange={(e) => set("guardian_email", e.target.value)} /></Field>
        <div className="sm:col-span-2 flex flex-col gap-3">
          <ErrorNote error={error} />
          <Button size="lg" disabled={busy}>{busy ? "Saving…" : "Enrol child"}</Button>
        </div>
      </form>
    </Sheet>
  );
}
