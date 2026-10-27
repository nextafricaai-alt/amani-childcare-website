"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, BadgeCheck, LogIn, LogOut, Mail, MessageCircle, NotebookPen, Phone, Plus, ShieldAlert } from "lucide-react";
import { useOs, useData, useAction, branchRole } from "@/lib/os/context";
import { useParam } from "@/lib/os/use-param";
import { today } from "@/lib/os/api";
import { Avatar, Button, Card, CardHead, Chip, Empty, ErrorNote, Field, Loading, Segmented, Sheet, age, dateLabel, fullName, inputCls, time, ugx } from "@/components/os/ui";
import { CheckInSheet, CheckOutSheet, LogSheet } from "@/components/os/gate";
import { DayTimeline } from "@/components/os/timeline";
import { IncidentSheet, IncidentCard } from "@/components/os/incidents";

type Tab = "today" | "family" | "safety" | "fees";

export default function ChildPage() {
  const id = useParam("id");
  if (id === undefined) return <Loading />;
  if (!id) return <Empty title="No child selected" />;
  return <ChildView id={id} />;
}

function ChildView({ id }: { id: string }) {
  const { api, user } = useOs();
  const { data, error } = useData(async (a) => {
    const children = await a.listChildren();
    const child = children.find((c) => c.id === id);
    if (!child) throw new Error("Child not found or you don't have access");
    const [rooms, guardians, pickups, attendance, logs, sleep, incidents, absences, invoices] = await Promise.all([
      a.listRooms(child.branch_id), a.listGuardians(id), a.listPickups({ childId: id }), a.listAttendance({ childId: id }),
      a.listLogs({ childId: id }), a.listSleepChecks({ childId: id }), a.listIncidents({ childId: id }), a.listAbsences({ childId: id }),
      a.listInvoices({ childId: id }).catch(() => []),
    ]);
    return { child, rooms, guardians, pickups, attendance, logs, sleep, incidents, absences, invoices };
  }, [id]);
  const [tab, setTab] = useState<Tab>("today");
  const [sheet, setSheet] = useState<"in" | "out" | "log" | "incident" | "pickup" | "invite" | null>(null);
  const act = useAction();

  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const { child, rooms, guardians, pickups, attendance, logs, sleep, incidents, invoices } = data;
  const role = branchRole(user, child.branch_id);
  const canManage = role === "manager" || role === "director";
  const q = role === "director" ? `?b=${child.branch_id}` : "";
  const todayAtt = attendance.find((a) => a.day === today());
  const room = rooms.find((r) => r.id === (todayAtt?.room_id ?? child.room_id));
  const familyThread = async () => {
    const threads = await api.listThreads();
    const existing = threads.find((t) => t.kind === "family" && t.child_id === child.id);
    const tid = existing?.id ?? await api.startThread({ kind: "family", branch_id: child.branch_id, child_id: child.id,
      subject: `${child.first_name} — family`, body: `Hello! This is ${user?.name} from Pikadon about ${child.first_name}.` });
    window.location.href = `/app/messages?t=${tid}${role === "director" ? `&b=${child.branch_id}` : ""}`;
  };

  return (
    <>
      <Link href={`/app/branch/children${q}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--plum-700)] mb-4"><ArrowLeft className="w-4 h-4" />Children</Link>

      <Card className="mb-5">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
          <Avatar name={fullName(child)} size={64} />
          <div className="flex-1 min-w-0">
            <h1 className="os-title !text-2xl">{fullName(child)}</h1>
            <p className="text-[var(--ink-muted)]">{age(child.date_of_birth)} · {room?.name ?? "No room"} · {child.care_plan.replace("_", " ")}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {todayAtt && !todayAtt.checked_out_at && <Chip tone="ok">Here since {time(todayAtt.checked_in_at)}</Chip>}
              {todayAtt?.checked_out_at && <Chip tone="muted">Went home {time(todayAtt.checked_out_at)} with {todayAtt.picked_up_by}</Chip>}
              {!todayAtt && <Chip tone="muted">Not checked in today</Chip>}
              {child.allergies && <Chip tone="alert">Allergy: {child.allergies}</Chip>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {!todayAtt && <Button onClick={() => setSheet("in")}><LogIn className="w-4 h-4" />Check in</Button>}
            {todayAtt && !todayAtt.checked_out_at && <>
              <Button variant="secondary" onClick={() => setSheet("log")}><NotebookPen className="w-4 h-4" />Log</Button>
              <Button variant="plum" onClick={() => setSheet("out")}><LogOut className="w-4 h-4" />Pickup</Button>
            </>}
            <Button variant="secondary" onClick={() => act.run(familyThread)}><MessageCircle className="w-4 h-4" />Message family</Button>
          </div>
        </div>
        {child.medical_notes && (
          <div className="mt-4 rounded-2xl bg-[var(--alert-50)] border border-[var(--alert-100)] px-4 py-3 text-sm"><strong className="text-[var(--alert)]">Health: </strong>{child.medical_notes}</div>
        )}
        <ErrorNote error={act.error} />
      </Card>

      <div className="mb-4">
        <Segmented<Tab> value={tab} onChange={setTab} options={[
          { value: "today", label: "Today" }, { value: "family", label: `Family & pickups` },
          { value: "safety", label: `Safety ${incidents.length ? `(${incidents.length})` : ""}` },
          ...(canManage ? [{ value: "fees" as Tab, label: "Fees" }] : []),
        ]} />
      </div>

      {tab === "today" && (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-4">
          <Card>
            <CardHead title="Today's log" sub="What the parents see in their app (team-only notes are marked)." right={<Button size="sm" variant="secondary" onClick={() => setSheet("log")} disabled={!todayAtt || !!todayAtt.checked_out_at}><Plus className="w-3.5 h-3.5" />Add</Button>} />
            <DayTimeline attendance={todayAtt} logs={logs} sleep={sleep} incidents={incidents.filter((i) => new Date(i.occurred_at).toDateString() === new Date().toDateString())} showHidden />
          </Card>
          <Card>
            <CardHead title="Recent attendance" />
            {attendance.length === 0 ? <Empty title="No attendance yet" /> : attendance.slice(-10).reverse().map((a) => (
              <div key={a.id} className="os-row text-sm">
                <span className="w-24 font-semibold text-[var(--plum-900)]">{dateLabel(a.day)}</span>
                <span className="flex-1 text-[var(--ink-muted)]">{time(a.checked_in_at)} – {a.checked_out_at ? time(a.checked_out_at) : "now"}</span>
                {a.picked_up_by && <Chip tone="ok">{a.picked_up_by}</Chip>}
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === "family" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardHead title="Parents & guardians" right={canManage ? <Button size="sm" variant="secondary" onClick={() => setSheet("invite")}><Mail className="w-3.5 h-3.5" />Invite to app</Button> : undefined} />
            {guardians.map((g) => (
              <div key={g.id} className="os-row">
                <Avatar name={g.full_name} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--plum-900)]">{g.full_name} {g.is_primary && <Chip tone="plum">Primary</Chip>}</p>
                  <p className="text-[12.5px] text-[var(--ink-muted)]">{g.relationship}{g.user_id ? " · uses the app" : " · not on the app yet"}</p>
                </div>
                {g.phone && <a href={`tel:+${g.phone}`} className="os-btn os-btn--ghost os-btn--sm" aria-label={`Call ${g.full_name}`}><Phone className="w-4 h-4" /></a>}
              </div>
            ))}
          </Card>
          <Card>
            <CardHead title="Who may collect" sub="Only these people (or someone with today's code from a parent) can take this child home."
              right={canManage ? <Button size="sm" variant="secondary" onClick={() => setSheet("pickup")}><Plus className="w-3.5 h-3.5" />Add</Button> : undefined} />
            {pickups.filter((p) => p.status !== "revoked").length === 0 ? <Empty title="Parents only" sub="No extra pickup people yet." /> :
              pickups.filter((p) => p.status !== "revoked").map((p) => (
                <div key={p.id} className="os-row flex-wrap">
                  <BadgeCheck className={`w-5 h-5 ${p.status === "approved" ? "text-[var(--ok)]" : "text-[var(--ink-muted)]"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[var(--plum-900)]">{p.full_name} <span className="font-normal text-[var(--ink-muted)]">· {p.relationship}</span></p>
                    <p className="text-[12.5px] text-[var(--ink-muted)]">{[p.phone, p.id_note].filter(Boolean).join(" · ") || "—"}</p>
                  </div>
                  {p.status === "pending" ? (canManage ? <>
                    <Button size="sm" variant="secondary" onClick={() => act.run(() => api.decidePickup(p.id, false))}>Decline</Button>
                    <Button size="sm" onClick={() => act.run(() => api.decidePickup(p.id, true))}>Approve</Button>
                  </> : <Chip tone="sun">Awaiting manager</Chip>) : (
                    canManage ? <Button size="sm" variant="ghost" onClick={() => act.run(() => api.revokePickup(p.id))}>Remove</Button> : <Chip tone="ok">Approved</Chip>
                  )}
                </div>
              ))}
          </Card>
        </div>
      )}

      {tab === "safety" && (
        <Card>
          <CardHead title="Incidents & alerts" sub="Parents see these in their app and confirm they've read them." right={<Button size="sm" onClick={() => setSheet("incident")}><ShieldAlert className="w-3.5 h-3.5" />Report</Button>} />
          {incidents.length === 0 ? <Empty title="Nothing reported" sub="Good. Anything that happens gets recorded here the same day." /> :
            <div className="flex flex-col gap-3">{incidents.map((i) => <IncidentCard key={i.id} incident={i} childName={child.first_name} canClose={canManage} />)}</div>}
        </Card>
      )}

      {tab === "fees" && canManage && (
        <Card>
          <CardHead title="Fees" />
          {invoices.length === 0 ? <Empty title="No invoices" /> : invoices.map((i) => (
            <div key={i.id} className="os-row">
              <span className="flex-1 font-semibold text-[var(--plum-900)]">{i.period}</span>
              <span className="text-sm">{ugx(i.amount_ugx)}</span>
              <Chip tone={i.status === "paid" ? "ok" : i.status === "overdue" ? "alert" : "sun"}>{i.status}</Chip>
            </div>
          ))}
        </Card>
      )}

      <CheckInSheet child={sheet === "in" ? child : null} onClose={() => setSheet(null)} />
      <CheckOutSheet child={sheet === "out" ? child : null} onClose={() => setSheet(null)} />
      <LogSheet open={sheet === "log"} kids={[child]} onClose={() => setSheet(null)} />
      <IncidentSheet open={sheet === "incident"} onClose={() => setSheet(null)} branchId={child.branch_id} kids={[child]} />
      <AddPickupSheet open={sheet === "pickup"} onClose={() => setSheet(null)} childId={child.id} />
      <InviteParentSheet open={sheet === "invite"} onClose={() => setSheet(null)} childId={child.id} branchId={child.branch_id} />
    </>
  );
}

function AddPickupSheet({ open, onClose, childId }: { open: boolean; onClose: () => void; childId: string }) {
  const { api } = useOs();
  const [f, setF] = useState({ full_name: "", relationship: "", phone: "", id_note: "" });
  const { run, busy, error } = useAction();
  return (
    <Sheet open={open} onClose={onClose} title="Add a pickup person">
      <form className="flex flex-col gap-4" onSubmit={async (e) => {
        e.preventDefault();
        if ((await run(() => api.requestPickup(childId, f))) !== undefined) { setF({ full_name: "", relationship: "", phone: "", id_note: "" }); onClose(); }
      }}>
        <Field label="Full name"><input required className={inputCls} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} /></Field>
        <Field label="Relationship to the child"><input required className={inputCls} value={f.relationship} onChange={(e) => setF({ ...f, relationship: e.target.value })} placeholder="Aunt, driver, grandparent…" /></Field>
        <Field label="Phone"><input className={inputCls} inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></Field>
        <Field label="ID check note" hint="e.g. National ID number ends 4F2K — checked in person"><input className={inputCls} value={f.id_note} onChange={(e) => setF({ ...f, id_note: e.target.value })} /></Field>
        <ErrorNote error={error} />
        <Button size="lg" disabled={busy}>Add as approved</Button>
      </form>
    </Sheet>
  );
}

function InviteParentSheet({ open, onClose, childId, branchId }: { open: boolean; onClose: () => void; childId: string; branchId: string }) {
  const { api } = useOs();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { run, busy, error } = useAction();
  const [done, setDone] = useState(false);
  return (
    <Sheet open={open} onClose={() => { setDone(false); onClose(); }} title="Invite a parent to the app">
      {done ? (
        <div className="text-center py-4">
          <p className="font-semibold text-[var(--plum-900)] text-lg mb-2">Invite saved</p>
          <p className="text-[var(--ink-muted)]">Ask {name || "them"} to open <strong>pikadon.ug/app</strong> and sign in with <strong>{email}</strong>. They'll see only this child.</p>
        </div>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={async (e) => {
          e.preventDefault();
          if ((await run(() => api.createInvite({ email, role: "parent", branch_id: branchId, child_id: childId, full_name: name, relationship: "Parent" }))) !== undefined) setDone(true);
        }}>
          <Field label="Parent's name"><input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email they'll sign in with"><input required type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <ErrorNote error={error} />
          <Button size="lg" disabled={busy}>Send invite</Button>
        </form>
      )}
    </Sheet>
  );
}

