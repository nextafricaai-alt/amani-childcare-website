"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Building2, Plus, Trash2 } from "lucide-react";
import { useOs, useData, useAction } from "@/lib/os/context";
import { useParam } from "@/lib/os/use-param";
import type { Branch, NewBranchInput } from "@/lib/os/types";
import { Button, Card, Chip, ErrorNote, Field, Loading, PageHeader, Sheet, inputCls } from "@/components/os/ui";
import { OccupancyBar, StatusChip } from "@/components/os/network";

export default function BranchesPage() {
  const { api } = useOs();
  const addParam = useParam("add");
  const { data, error } = useData(async (a) => {
    const [branches, summary, rooms, team, invites] = await Promise.all([a.listBranches(), a.networkSummary(), a.listRooms(), a.listTeam(), a.listInvites()]);
    return { branches, summary, rooms, team, invites };
  }, []);
  const [open, setOpen] = useState(false);
  const act = useAction();
  useEffect(() => { if (addParam) setOpen(true); }, [addParam]);
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;

  const setStatus = (b: Branch, status: Branch["status"]) => act.run(() => api.updateBranch(b.id, { status }));

  return (
    <>
      <PageHeader eyebrow="Branches" title={`${data.branches.length} branches`} sub="Add a branch the day the lease is signed. Its manager is invited at the same time and trains in an open branch before opening day."
        actions={<Button onClick={() => setOpen(true)}><Plus className="w-4 h-4" />Add a branch</Button>} />
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.branches.map((b) => {
          const s = data.summary.find((x) => x.branch_id === b.id);
          const rooms = data.rooms.filter((r) => r.branch_id === b.id);
          const managers = data.team.filter((m) => m.branch_id === b.id && m.role === "manager");
          const pending = data.invites.filter((i) => i.branch_id === b.id && i.role === "manager");
          return (
            <Card key={b.id} className="flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5"><Building2 className="w-5 h-5 text-[var(--orange-600)]" /><p className="font-semibold text-[var(--plum-900)] leading-tight">{b.name}</p></div>
                <StatusChip status={b.status} />
              </div>
              <p className="text-sm text-[var(--ink-muted)]">{b.area}{b.address ? ` · ${b.address}` : ""}</p>
              <p className="text-sm text-[var(--ink-muted)]">Open {b.opens_at.slice(0, 5)}–{b.closes_at.slice(0, 5)} · {rooms.length} room{rooms.length === 1 ? "" : "s"}: {rooms.map((r) => r.name).join(", ") || "none yet"}</p>
              <div className="my-3"><OccupancyBar enrolled={s?.enrolled ?? 0} capacity={b.capacity} /><p className="text-[12px] text-[var(--ink-muted)] mt-1">{s?.enrolled ?? 0} of {b.capacity} places filled</p></div>
              <p className="text-sm"><span className="text-[var(--ink-muted)]">Manager: </span>
                {managers.length ? managers.map((m) => m.name).join(", ") : pending.length ? <Chip tone="sun">Invited: {pending[0].full_name || pending[0].email}</Chip> : <Chip tone="alert">No manager</Chip>}</p>
              <div className="flex flex-wrap gap-2 mt-auto pt-4">
                {b.status !== "planning" && <Link href={`/app/branch?b=${b.id}`} className="os-btn os-btn--secondary os-btn--sm">Open branch<ArrowRight className="w-3.5 h-3.5" /></Link>}
                {b.status === "planning" && <Button size="sm" onClick={() => setStatus(b, "open")}>Mark as open</Button>}
                {b.status === "open" && <Button size="sm" variant="ghost" onClick={() => setStatus(b, "paused")}>Pause</Button>}
                {b.status === "paused" && <Button size="sm" onClick={() => setStatus(b, "open")}>Re-open</Button>}
              </div>
            </Card>
          );
        })}
      </div>
      <ErrorNote error={act.error} />
      <AddBranchSheet open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const DEFAULT_ROOMS = [
  { name: "Toddlers", age_band: "2–3 yrs", capacity: 14, ratio: 5 },
  { name: "Preschool", age_band: "3–5 yrs", capacity: 20, ratio: 8 },
];

function AddBranchSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { api } = useOs();
  const blank: NewBranchInput = { name: "Pikadon ", area: "", address: "", phone: "", capacity: 34, opens_at: "07:00", closes_at: "18:00", status: "planning", rooms: DEFAULT_ROOMS, manager_email: "", manager_name: "" };
  const [f, setF] = useState<NewBranchInput>(blank);
  const { run, busy, error } = useAction();
  const [done, setDone] = useState<string | null>(null);
  const set = <K extends keyof NewBranchInput>(k: K, v: NewBranchInput[K]) => setF({ ...f, [k]: v });
  const setRoom = (i: number, k: string, v: string | number) => set("rooms", f.rooms.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const close = () => { setDone(null); setF(blank); onClose(); };
  return (
    <Sheet open={open} onClose={close} title="Add a branch" wide>
      {done ? (
        <div className="text-center py-4">
          <Building2 className="w-10 h-10 mx-auto text-[var(--orange-600)] mb-3" />
          <p className="font-[var(--font-heading)] font-bold text-xl text-[var(--plum-900)]">{done} is set up</p>
          <p className="text-[var(--ink-muted)] mt-2 max-w-md mx-auto">Rooms are ready{f.manager_email ? <> and <strong>{f.manager_name || f.manager_email}</strong> is invited as branch manager — they sign in at <strong>pikadon.ug/app</strong> with {f.manager_email}</> : ""}. Investors now see it in the expansion pipeline. Mark it open on opening day.</p>
          <Button className="mt-5" onClick={close}>Done</Button>
        </div>
      ) : (
        <form className="grid sm:grid-cols-2 gap-4" onSubmit={async (e) => {
          e.preventDefault();
          const id = await run(() => api.addBranch({ ...f, name: f.name.trim(), area: f.area.trim() }));
          if (id) setDone(f.name.trim());
        }}>
          <Field label="Branch name"><input required className={inputCls} value={f.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Area / town" hint="Shown on the website and used to match enquiries"><input required className={inputCls} value={f.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Mukono" /></Field>
          <Field label="Address"><input className={inputCls} value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Branch phone / WhatsApp"><input className={inputCls} value={f.phone} onChange={(e) => set("phone", e.target.value)} placeholder="2567…" /></Field>
          <Field label="Licensed places"><input type="number" min={1} className={inputCls} value={f.capacity} onChange={(e) => set("capacity", Number(e.target.value))} /></Field>
          <Field label="Status">
            <select className={inputCls} value={f.status} onChange={(e) => set("status", e.target.value as Branch["status"])}>
              <option value="planning">Opening soon (preparing)</option><option value="open">Open now</option>
            </select>
          </Field>
          <Field label="Opens"><input type="time" className={inputCls} value={f.opens_at} onChange={(e) => set("opens_at", e.target.value)} /></Field>
          <Field label="Closes"><input type="time" className={inputCls} value={f.closes_at} onChange={(e) => set("closes_at", e.target.value)} /></Field>

          <div className="sm:col-span-2 pt-3 border-t border-[var(--rule)]">
            <p className="font-semibold text-[var(--plum-900)]">Rooms</p>
            <p className="text-[12.5px] text-[var(--ink-muted)] mb-3">Set the children-per-caregiver limit from the licence — the Today board warns the moment a room goes over it.</p>
            <div className="flex flex-col gap-2">
              {f.rooms.map((r, i) => (
                <div key={i} className="grid grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] gap-2 items-end">
                  <Field label={i === 0 ? "Room" : ""}><input className={inputCls} value={r.name} onChange={(e) => setRoom(i, "name", e.target.value)} /></Field>
                  <Field label={i === 0 ? "Ages" : ""}><input className={inputCls} value={r.age_band} onChange={(e) => setRoom(i, "age_band", e.target.value)} /></Field>
                  <Field label={i === 0 ? "Places" : ""}><input type="number" min={1} className={inputCls} value={r.capacity} onChange={(e) => setRoom(i, "capacity", Number(e.target.value))} /></Field>
                  <Field label={i === 0 ? "1 adult per" : ""}><input type="number" min={1} className={inputCls} value={r.ratio} onChange={(e) => setRoom(i, "ratio", Number(e.target.value))} /></Field>
                  <button type="button" aria-label="Remove room" className="h-[46px] w-10 grid place-items-center rounded-xl hover:bg-[var(--plum-50)]" onClick={() => set("rooms", f.rooms.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" className="w-fit" onClick={() => set("rooms", [...f.rooms, { name: "", age_band: "", capacity: 12, ratio: 6 }])}><Plus className="w-3.5 h-3.5" />Add room</Button>
            </div>
          </div>

          <div className="sm:col-span-2 pt-3 border-t border-[var(--rule)]">
            <p className="font-semibold text-[var(--plum-900)]">Branch manager</p>
            <p className="text-[12.5px] text-[var(--ink-muted)]">They get access only to this branch. You can leave this empty and invite them later from People.</p>
          </div>
          <Field label="Name"><input className={inputCls} value={f.manager_name} onChange={(e) => set("manager_name", e.target.value)} /></Field>
          <Field label="Email they'll sign in with"><input type="email" className={inputCls} value={f.manager_email} onChange={(e) => set("manager_email", e.target.value)} /></Field>
          <div className="sm:col-span-2 flex flex-col gap-3">
            <ErrorNote error={error} />
            <Button size="lg" disabled={busy || !f.area.trim() || f.name.trim().length < 3}>{busy ? "Creating…" : "Create branch"}</Button>
          </div>
        </form>
      )}
    </Sheet>
  );
}
