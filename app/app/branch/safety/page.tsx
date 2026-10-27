"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, BedDouble, CheckCircle2, ClipboardCheck, DoorOpen, Moon, Phone, ShieldAlert, Sun, UserRound } from "lucide-react";
import { useOs, useData, useAction, useBranchId, branchRole } from "@/lib/os/context";
import { today } from "@/lib/os/api";
import type { Child, RollReason, SleepCheck } from "@/lib/os/types";
import { Avatar, Button, Card, CardHead, Chip, Empty, ErrorNote, Field, Loading, PageHeader, Segmented, Sheet, Stat, fullName, inputCls, minutesSince, time, dateLabel } from "@/components/os/ui";
import { IncidentCard, IncidentSheet } from "@/components/os/incidents";
import { PickBranch } from "@/components/os/pick-branch";

// How often a sleeping child must be physically checked. Set this from
// the licence / safe-sleep policy for each centre.
const SLEEP_CHECK_MINUTES = 10;

type Tab = "sleep" | "roll" | "incidents" | "visitors" | "absences";

export default function SafetyPage() {
  const branchId = useBranchId();
  if (!branchId) return <PickBranch />;
  return <Safety branchId={branchId} />;
}

function useTick(ms: number) {
  const [, set] = useState(0);
  useEffect(() => { const t = setInterval(() => set((x) => x + 1), ms); return () => clearInterval(t); }, [ms]);
}

function Safety({ branchId }: { branchId: string }) {
  const { user } = useOs();
  const role = branchRole(user, branchId);
  const canManage = role === "manager" || role === "director";
  useTick(30_000);
  const { data, error } = useData(async (a) => {
    const [rooms, children, attendance, logs, sleep, rollCalls, incidents, visitors, absences] = await Promise.all([
      a.listRooms(branchId), a.listChildren(branchId), a.listAttendance({ branchId }), a.listLogs({ branchId }),
      a.listSleepChecks({ branchId }), a.listRollCalls({ branchId }), a.listIncidents({ branchId }), a.listVisitors(branchId), a.listAbsences({ branchId }),
    ]);
    return { rooms, children, attendance, logs, sleep, rollCalls, incidents, visitors, absences };
  }, [branchId]);
  const [tab, setTab] = useState<Tab>("sleep");

  const derived = useMemo(() => {
    if (!data) return null;
    const hereIds = new Set(data.attendance.filter((a) => !a.checked_out_at).map((a) => a.child_id));
    const here = data.children.filter((c) => hereIds.has(c.id));
    const sleeping = here.filter((c) => {
      const naps = data.logs.filter((l) => l.child_id === c.id && l.kind === "nap");
      return naps.length > 0 && naps[naps.length - 1].detail.startsWith("Fell asleep");
    });
    const lastCheck = (c: Child) => {
      const checks = data.sleep.filter((s) => s.child_id === c.id);
      const asleep = [...data.logs].reverse().find((l) => l.child_id === c.id && l.kind === "nap");
      return checks[0]?.checked_at ?? asleep?.logged_at ?? new Date().toISOString();
    };
    const overdue = sleeping.filter((c) => minutesSince(lastCheck(c)) >= SLEEP_CHECK_MINUTES);
    return { here, sleeping, lastCheck, overdue };
  }, [data]);

  if (error) return <ErrorNote error={error} />;
  if (!data || !derived) return <Loading />;
  const openIncidents = data.incidents.filter((i) => i.status === "open");
  const unresolvedRolls = data.rollCalls.filter((r) => !r.resolved);
  const onSite = data.visitors.filter((v) => !v.signed_out_at);

  return (
    <>
      <PageHeader eyebrow="Safety" title="Every child, seen and safe" sub="Checks the team does through the day. Each one is time-stamped and shows who did it." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Sleep checks due" value={derived.overdue.length} tone={derived.overdue.length ? "alert" : "ok"} sub={`${derived.sleeping.length} sleeping now`} icon={<BedDouble className="w-4 h-4" />} />
        <Stat label="Headcounts today" value={data.rollCalls.length} tone={unresolvedRolls.length ? "alert" : "ok"} sub={unresolvedRolls.length ? `${unresolvedRolls.length} not matching` : "All matched"} icon={<ClipboardCheck className="w-4 h-4" />} />
        <Stat label="Open incidents" value={openIncidents.length} tone={openIncidents.some((i) => i.severity === "serious") ? "alert" : openIncidents.length ? "warn" : "ok"} icon={<ShieldAlert className="w-4 h-4" />} />
        <Stat label="Visitors on site" value={onSite.length} tone={onSite.length ? "warn" : "plain"} sub={`${data.visitors.length} today`} icon={<DoorOpen className="w-4 h-4" />} />
      </div>
      <div className="mb-4">
        <Segmented<Tab> value={tab} onChange={setTab} options={[
          { value: "sleep", label: `Sleep${derived.overdue.length ? ` · ${derived.overdue.length} due` : ""}` },
          { value: "roll", label: "Headcounts" },
          { value: "incidents", label: `Incidents${openIncidents.length ? ` · ${openIncidents.length}` : ""}` },
          { value: "visitors", label: "Visitors" },
          { value: "absences", label: "Absences" },
        ]} />
      </div>
      {tab === "sleep" && <SleepPanel here={derived.here} sleeping={derived.sleeping} lastCheck={derived.lastCheck} checks={data.sleep} />}
      {tab === "roll" && <RollPanel branchId={branchId} rooms={data.rooms} here={derived.here} attendance={data.attendance} rollCalls={data.rollCalls} children={data.children} />}
      {tab === "incidents" && <IncidentsPanel branchId={branchId} incidents={data.incidents} kids={data.children} canManage={canManage} />}
      {tab === "visitors" && <VisitorsPanel branchId={branchId} visitors={data.visitors} />}
      {tab === "absences" && <AbsencePanel absences={data.absences} kids={data.children} />}
    </>
  );
}

// ── Safe sleep ──────────────────────────────────────────────────────────
function SleepPanel({ here, sleeping, lastCheck, checks }: { here: Child[]; sleeping: Child[]; lastCheck: (c: Child) => string; checks: SleepCheck[] }) {
  const { api } = useOs();
  const { run, busy, error } = useAction();
  const [checking, setChecking] = useState<Child | null>(null);
  const awake = here.filter((c) => !sleeping.includes(c));
  const startNap = (c: Child) => run(() => api.addLog({ child_id: c.id, kind: "nap", detail: "Fell asleep", visible_to_parent: true }));
  const endNap = (c: Child) => {
    const mins = minutesSince(lastCheck(c));
    return run(() => api.addLog({ child_id: c.id, kind: "nap", detail: `Woke up${mins > 0 ? " — slept well" : ""}`, visible_to_parent: true }));
  };
  return (
    <div className="grid lg:grid-cols-[1.3fr_1fr] gap-4">
      <Card>
        <CardHead title="Sleeping now" sub={`Check each sleeping child every ${SLEEP_CHECK_MINUTES} minutes: on their back, breathing normally, face clear.`} icon={<Moon className="w-5 h-5" />} />
        {sleeping.length === 0 ? <Empty icon={<BedDouble className="w-5 h-5" />} title="Nobody is asleep" sub="Mark a child as asleep below when nap time starts." /> : sleeping.map((c) => {
          const mins = minutesSince(lastCheck(c));
          const due = mins >= SLEEP_CHECK_MINUTES;
          return (
            <div key={c.id} className={`os-row flex-wrap rounded-2xl px-3 ${due ? "bg-[var(--alert-50)]" : ""}`}>
              <Avatar name={fullName(c)} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--plum-900)]">{fullName(c)}</p>
                <p className={`text-[13px] font-semibold ${due ? "text-[var(--alert)] os-pulse" : "text-[var(--ink-muted)]"}`}>
                  {due ? `Check overdue — last ${mins} min ago` : `Last checked ${mins} min ago · next in ${SLEEP_CHECK_MINUTES - mins} min`}
                </p>
              </div>
              <Button size="sm" variant={due ? "danger" : "primary"} onClick={() => setChecking(c)}><CheckCircle2 className="w-3.5 h-3.5" />Check</Button>
              <Button size="sm" variant="ghost" disabled={busy} onClick={() => endNap(c)}><Sun className="w-3.5 h-3.5" />Woke</Button>
            </div>
          );
        })}
        {awake.length > 0 && (
          <div className="mt-5 pt-4 border-t border-[var(--rule)]">
            <p className="text-[13px] font-semibold text-[var(--plum-900)] mb-2">Mark as asleep</p>
            <div className="flex flex-wrap gap-2">
              {awake.map((c) => <Button key={c.id} size="sm" variant="secondary" disabled={busy} onClick={() => startNap(c)}><Moon className="w-3.5 h-3.5" />{c.first_name}</Button>)}
            </div>
          </div>
        )}
        <ErrorNote error={error} />
      </Card>
      <Card>
        <CardHead title="Checks today" sub={`${checks.length} recorded`} />
        {checks.length === 0 ? <Empty title="No sleep checks yet" /> : checks.slice(0, 14).map((s) => {
          const c = here.find((x) => x.id === s.child_id);
          const concern = !s.breathing_ok || s.position === "front";
          return (
            <div key={s.id} className="os-row text-sm">
              <span className="w-12 font-semibold text-[var(--plum-900)]">{time(s.checked_at)}</span>
              <span className="flex-1 truncate">{c ? c.first_name : "Child"} · on {s.position}{s.note ? ` · ${s.note}` : ""}</span>
              <Chip tone={concern ? "alert" : "ok"}>{concern ? "Needed action" : "Safe"}</Chip>
            </div>
          );
        })}
      </Card>
      <SleepCheckSheet child={checking} onClose={() => setChecking(null)} />
    </div>
  );
}

function SleepCheckSheet({ child, onClose }: { child: Child | null; onClose: () => void }) {
  const { api } = useOs();
  const [position, setPosition] = useState<SleepCheck["position"]>("back");
  const [breathing, setBreathing] = useState(true);
  const [note, setNote] = useState("");
  const { run, busy, error } = useAction();
  useEffect(() => { setPosition("back"); setBreathing(true); setNote(""); }, [child?.id]);
  if (!child) return null;
  return (
    <Sheet open onClose={onClose} title={`Sleep check — ${child.first_name}`}>
      <div className="flex flex-col gap-4">
        <Field label="Sleeping position" group>
          <div className="grid grid-cols-3 gap-2">
            {(["back", "side", "front"] as const).map((p) => (
              <button key={p} type="button" onClick={() => setPosition(p)}
                className={`py-3 rounded-xl border font-semibold capitalize ${position === p ? (p === "front" ? "bg-[var(--alert)] text-white border-[var(--alert)]" : "bg-[var(--plum-900)] text-[var(--cream)] border-[var(--plum-900)]") : "bg-white border-[var(--rule)]"}`}>
                On {p}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Breathing normally, face and nose clear?" group>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setBreathing(true)} className={`py-3 rounded-xl border font-semibold ${breathing ? "bg-[var(--ok)] text-white border-[var(--ok)]" : "bg-white border-[var(--rule)]"}`}>Yes</button>
            <button type="button" onClick={() => setBreathing(false)} className={`py-3 rounded-xl border font-semibold ${!breathing ? "bg-[var(--alert)] text-white border-[var(--alert)]" : "bg-white border-[var(--rule)]"}`}>No — concern</button>
          </div>
        </Field>
        {(position === "front" || !breathing) && (
          <p className="text-sm rounded-xl bg-[var(--alert-50)] border border-[var(--alert-100)] px-3 py-2">
            {breathing ? "Gently turn the child onto their back now." : "Wake the child and call the manager immediately. Start first aid if needed."} This is recorded as a safety event.
          </p>
        )}
        <Field label="Note (optional)"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Rolled onto back" /></Field>
        <ErrorNote error={error} />
        <Button size="lg" disabled={busy} onClick={async () => { if ((await run(() => api.addSleepCheck({ child_id: child.id, position, breathing_ok: breathing, note }))) !== undefined) onClose(); }}>Record check</Button>
      </div>
    </Sheet>
  );
}

// ── Name-to-face headcounts ─────────────────────────────────────────────
const REASONS: { value: RollReason; label: string }[] = [
  { value: "opening", label: "Morning" }, { value: "transition", label: "Room change" }, { value: "outdoor", label: "Going outside" },
  { value: "outing", label: "Outing / trip" }, { value: "meal", label: "Meal" }, { value: "nap", label: "Nap" },
  { value: "closing", label: "Closing" }, { value: "drill", label: "Fire / emergency drill" },
];

function RollPanel({ branchId, rooms, here, attendance, rollCalls, children }: {
  branchId: string; rooms: { id: string; name: string }[]; here: Child[];
  attendance: { child_id: string; room_id: string | null; checked_out_at: string | null }[];
  rollCalls: import("@/lib/os/types").RollCall[]; children: Child[];
}) {
  const { api } = useOs();
  const [roomId, setRoomId] = useState(rooms[0]?.id ?? "");
  const [reason, setReason] = useState<RollReason>("transition");
  const [seen, setSeen] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const { run, busy, error } = useAction();
  const inRoom = here.filter((c) => (attendance.find((a) => a.child_id === c.id && !a.checked_out_at)?.room_id ?? c.room_id) === roomId);
  useEffect(() => { setSeen([]); }, [roomId]);
  const missing = inRoom.filter((c) => !seen.includes(c.id));
  const resolve = useAction();
  return (
    <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
      <Card>
        <CardHead title="Take a headcount" sub="Look at each child and tap their name. Anyone not tapped is flagged as missing." icon={<ClipboardCheck className="w-5 h-5" />} />
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <Field label="Room">
            <select className={inputCls} value={roomId} onChange={(e) => setRoomId(e.target.value)}>{rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
          </Field>
          <Field label="Why now?">
            <select className={inputCls} value={reason} onChange={(e) => setReason(e.target.value as RollReason)}>{REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
          </Field>
        </div>
        {inRoom.length === 0 ? <Empty title="No children checked in to this room" /> : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {inRoom.map((c) => {
              const on = seen.includes(c.id);
              return (
                <button key={c.id} type="button" onClick={() => setSeen(on ? seen.filter((x) => x !== c.id) : [...seen, c.id])}
                  className={`flex items-center gap-2 px-3 py-3 rounded-2xl border text-left font-semibold transition ${on ? "bg-[var(--ok-50)] border-[var(--ok)] text-[var(--ok)]" : "bg-white border-[var(--rule)] text-[var(--plum-900)]"}`}>
                  {on ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <UserRound className="w-5 h-5 shrink-0 opacity-40" />}<span className="truncate">{c.first_name}</span>
                </button>
              );
            })}
          </div>
        )}
        <Field label="Note (optional)"><input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <p className="text-sm font-semibold">{seen.length} of {inRoom.length} seen</p>
          {missing.length > 0 && seen.length > 0 && <Chip tone="alert">Missing: {missing.map((c) => c.first_name).join(", ")}</Chip>}
          <Button className="ml-auto" disabled={busy || inRoom.length === 0} onClick={async () => {
            const ok = await run(() => api.addRollCall({ branch_id: branchId, room_id: roomId, reason, expected: inRoom.length, counted: seen.length, missing_ids: missing.map((c) => c.id), note }));
            if (ok !== undefined) { setSeen([]); setNote(""); }
          }}>Save headcount</Button>
        </div>
        <ErrorNote error={error} />
      </Card>
      <Card>
        <CardHead title="Today's headcounts" />
        {rollCalls.length === 0 ? <Empty title="None yet" sub="Do one at every room change, before going outside and at closing." /> : rollCalls.map((r) => (
          <div key={r.id} className={`rounded-2xl p-3 mb-2 border ${r.resolved ? "border-[var(--rule)] bg-white" : "border-[var(--alert-100)] bg-[var(--alert-50)]"}`}>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-[var(--plum-900)]">{time(r.taken_at)}</span>
              <span>{rooms.find((x) => x.id === r.room_id)?.name} · {REASONS.find((x) => x.value === r.reason)?.label}</span>
              <Chip tone={r.counted === r.expected ? "ok" : "alert"} className="ml-auto">{r.counted}/{r.expected}</Chip>
            </div>
            {r.missing_ids.length > 0 && <p className="text-sm mt-1 text-[var(--alert)] font-semibold">Missing: {r.missing_ids.map((id) => children.find((c) => c.id === id)?.first_name).join(", ")}</p>}
            {r.note && <p className="text-sm text-[var(--ink-muted)] mt-1">{r.note}</p>}
            {!r.resolved && <Button size="sm" className="mt-2" variant="secondary" disabled={resolve.busy}
              onClick={() => { const n = window.prompt("Where were they found? (recorded with the headcount)"); if (n) resolve.run(() => api.resolveRollCall(r.id, n)); }}>
              <AlertTriangle className="w-3.5 h-3.5" />Mark found</Button>}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Incidents ───────────────────────────────────────────────────────────
function IncidentsPanel({ branchId, incidents, kids, canManage }: { branchId: string; incidents: import("@/lib/os/types").Incident[]; kids: Child[]; canManage: boolean }) {
  const [open, setOpen] = useState(false);
  const [show, setShow] = useState<"open" | "all">("open");
  const list = show === "open" ? incidents.filter((i) => i.status === "open") : incidents;
  return (
    <Card>
      <CardHead title="Incidents & alerts" sub="Injuries, illness, behaviour, safeguarding concerns and refused pickups."
        right={<Button size="sm" onClick={() => setOpen(true)}><ShieldAlert className="w-3.5 h-3.5" />Report</Button>} />
      <div className="mb-3"><Segmented value={show} onChange={setShow} options={[{ value: "open", label: "Open" }, { value: "all", label: "All" }]} /></div>
      {list.length === 0 ? <Empty title="Nothing open" /> : <div className="flex flex-col gap-3">
        {list.map((i) => <IncidentCard key={i.id} incident={i} childName={kids.find((c) => c.id === i.child_id)?.first_name} canClose={canManage} />)}
      </div>}
      <IncidentSheet open={open} onClose={() => setOpen(false)} branchId={branchId} kids={kids} />
    </Card>
  );
}

// ── Visitors ────────────────────────────────────────────────────────────
function VisitorsPanel({ branchId, visitors }: { branchId: string; visitors: import("@/lib/os/types").Visitor[] }) {
  const { api, user } = useOs();
  const blank = { full_name: "", purpose: "", phone: "", id_checked: false, escorted_by: user?.name ?? "" };
  const [f, setF] = useState(blank);
  const { run, busy, error } = useAction();
  return (
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
      <Card>
        <CardHead title="Sign a visitor in" sub="Anyone who isn't staff or a parent: tradespeople, inspectors, prospective families." icon={<DoorOpen className="w-5 h-5" />} />
        <form className="flex flex-col gap-3" onSubmit={async (e) => {
          e.preventDefault();
          if ((await run(() => api.signInVisitor({ branch_id: branchId, ...f, phone: f.phone || null, escorted_by: f.escorted_by || null }))) !== undefined) setF(blank);
        }}>
          <Field label="Full name"><input required className={inputCls} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></Field>
          <Field label="Reason for visit"><input required className={inputCls} value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} /></Field>
          <Field label="Phone"><input className={inputCls} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
          <Field label="Escorted by" hint="Visitors are never left alone with children."><input className={inputCls} value={f.escorted_by} onChange={(e) => setF({ ...f, escorted_by: e.target.value })} /></Field>
          <label className="flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" className="w-5 h-5 accent-[var(--orange-600)]" checked={f.id_checked} onChange={(e) => setF({ ...f, id_checked: e.target.checked })} />ID checked
          </label>
          <ErrorNote error={error} />
          <Button disabled={busy}>Sign in visitor</Button>
        </form>
      </Card>
      <Card>
        <CardHead title="Today's visitors" />
        {visitors.length === 0 ? <Empty title="No visitors today" /> : visitors.map((v) => (
          <div key={v.id} className="os-row flex-wrap">
            <Avatar name={v.full_name} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--plum-900)]">{v.full_name} {!v.id_checked && <Chip tone="sun">ID not checked</Chip>}</p>
              <p className="text-[12.5px] text-[var(--ink-muted)]">{v.purpose} · in {time(v.signed_in_at)}{v.signed_out_at ? ` · out ${time(v.signed_out_at)}` : ""}{v.escorted_by ? ` · with ${v.escorted_by}` : ""}</p>
            </div>
            {v.signed_out_at ? <Chip tone="muted">Left</Chip> : <Button size="sm" variant="secondary" onClick={() => run(() => api.signOutVisitor(v.id))}>Sign out</Button>}
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── Absences ────────────────────────────────────────────────────────────
function AbsencePanel({ absences, kids }: { absences: import("@/lib/os/types").Absence[]; kids: Child[] }) {
  const { api } = useOs();
  const { run, error } = useAction();
  const upcoming = absences.filter((a) => a.day >= today());
  const past = absences.filter((a) => a.day < today()).slice(0, 10);
  const row = (a: import("@/lib/os/types").Absence) => {
    const c = kids.find((k) => k.id === a.child_id);
    return (
      <div key={a.id} className="os-row flex-wrap">
        <Avatar name={c ? fullName(c) : "?"} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--plum-900)]">{c ? fullName(c) : "Child"} <span className="font-normal text-[var(--ink-muted)]">· {dateLabel(a.day)}</span></p>
          <p className="text-[13px] text-[var(--ink-muted)]">{a.reason} · reported by {a.source === "parent" ? "parent in the app" : "staff"}{a.outcome ? ` · ${a.outcome}` : ""}</p>
        </div>
        {a.followed_up_at ? <Chip tone="ok">Followed up</Chip> : (
          <Button size="sm" variant="secondary" onClick={() => { const o = window.prompt("Follow-up outcome (e.g. Called mum, fever down, back Thursday)"); if (o) run(() => api.followUpAbsence(a.id, o)); }}>
            <Phone className="w-3.5 h-3.5" />Follow up
          </Button>
        )}
      </div>
    );
  };
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card><CardHead title="Today & coming up" sub="Parents report these from their app; staff log the rest after calling." />{upcoming.length ? upcoming.map(row) : <Empty title="No absences reported" />}<ErrorNote error={error} /></Card>
      <Card><CardHead title="Recent" sub="Two children from one room off sick? Look for an outbreak." />{past.length ? past.map(row) : <Empty title="Nothing recent" />}</Card>
    </div>
  );
}

