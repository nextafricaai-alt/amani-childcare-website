"use client";

import { useState } from "react";
import { CalendarX2, Home, School, ShieldAlert, Sparkles } from "lucide-react";
import { useOs, useData, useAction } from "@/lib/os/context";
import { today } from "@/lib/os/api";
import type { Child } from "@/lib/os/types";
import { Avatar, Button, Card, CardHead, Chip, Empty, ErrorNote, Field, Loading, Sheet, age, dateLabel, fullName, inputCls, time } from "@/components/os/ui";
import { DayTimeline } from "@/components/os/timeline";
import { IncidentCard } from "@/components/os/incidents";
import { cn } from "@/lib/utils";

export default function ParentToday() {
  const { user } = useOs();
  const { data: kids, error } = useData((a) => a.listChildren(), []);
  const [pick, setPick] = useState<string | null>(null);
  if (error) return <ErrorNote error={error} />;
  if (!kids) return <Loading />;
  if (!kids.length) return <Empty title="No child linked yet" sub="Ask your branch manager to link your account to your child." />;
  const child = kids.find((k) => k.id === pick) ?? kids[0];
  return (
    <>
      <p className="os-eyebrow mb-1.5">Hello {user?.name.split(" ")[0]} · {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
      {kids.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {kids.map((k) => (
            <button key={k.id} onClick={() => setPick(k.id)} className={cn("flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full border font-semibold",
              k.id === child.id ? "bg-[var(--plum-900)] text-[var(--cream)] border-[var(--plum-900)]" : "bg-white border-[var(--rule)]")}>
              <Avatar name={fullName(k)} size={30} />{k.first_name}
            </button>
          ))}
        </div>
      )}
      <ChildDay child={child} />
    </>
  );
}

function ChildDay({ child }: { child: Child }) {
  const { data, error } = useData(async (a) => {
    const [attendance, logs, sleep, incidents, absences, branches] = await Promise.all([
      a.listAttendance({ childId: child.id, day: today() }), a.listLogs({ childId: child.id }), a.listSleepChecks({ childId: child.id }),
      a.listIncidents({ childId: child.id }), a.listAbsences({ childId: child.id }), a.listBranches(),
    ]);
    return { att: attendance[0], logs, sleep, incidents, absences, branch: branches.find((b) => b.id === child.branch_id) };
  }, [child.id]);
  const [absenceOpen, setAbsenceOpen] = useState(false);
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const { att, logs, sleep, incidents, absences, branch } = data;
  const toAck = incidents.filter((i) => i.parent_notified_at && !i.parent_ack_at);
  const todays = incidents.filter((i) => new Date(i.occurred_at).toDateString() === new Date().toDateString());
  const absentToday = absences.find((a) => a.day === today());
  const upcoming = absences.filter((a) => a.day > today());
  const meals = logs.filter((l) => l.kind === "meal").length;
  const milestones = logs.filter((l) => l.kind === "milestone");

  const status = att?.checked_out_at
    ? { icon: <Home className="w-6 h-6" />, line: `${child.first_name} went home at ${time(att.checked_out_at)}`, sub: `Collected by ${att.picked_up_by} — verified at the gate.` }
    : att ? { icon: <School className="w-6 h-6" />, line: `${child.first_name} is at Pikadon`, sub: `Arrived ${time(att.checked_in_at)}${att.dropped_by ? `, dropped off by ${att.dropped_by}` : ""}.` }
      : absentToday ? { icon: <CalendarX2 className="w-6 h-6" />, line: `${child.first_name} is staying home today`, sub: absentToday.reason }
        : { icon: <School className="w-6 h-6" />, line: `${child.first_name} hasn't arrived yet`, sub: `${branch?.name ?? "Your branch"} opens at ${branch?.opens_at?.slice(0, 5) ?? "07:00"}.` };

  return (
    <>
      <Card tone="plum" className="mb-4 relative overflow-hidden">
        <div aria-hidden className="absolute -right-16 -top-16 w-56 h-56 rounded-full" style={{ background: "radial-gradient(circle, rgba(245,190,20,0.35), transparent 65%)" }} />
        <div className="relative flex items-start gap-4">
          <span className="w-12 h-12 rounded-2xl bg-[rgba(245,190,20,0.18)] text-[var(--sun)] grid place-items-center shrink-0">{status.icon}</span>
          <div className="min-w-0">
            <h1 className="font-[var(--font-heading)] font-bold text-[clamp(1.4rem,3vw,1.9rem)] leading-tight">{status.line}</h1>
            <p className="text-[rgba(255,249,242,0.75)] mt-1">{status.sub}</p>
            <p className="text-[13px] text-[var(--sun)] mt-3">{fullName(child)} · {age(child.date_of_birth)} · {branch?.name}</p>
          </div>
        </div>
        <div className="relative grid grid-cols-3 gap-2 mt-5">
          {[["Meals", meals], ["Sleep checks", sleep.length], ["Milestones", milestones.length]].map(([l, v]) => (
            <div key={l as string} className="rounded-2xl bg-[rgba(255,249,242,0.07)] px-3 py-2.5">
              <p className="text-[22px] font-bold font-[var(--font-heading)] text-[var(--cream)]">{v}</p>
              <p className="text-[12px] text-[rgba(255,249,242,0.65)]">{l}</p>
            </div>
          ))}
        </div>
      </Card>

      {toAck.length > 0 && (
        <Card tone="alert" className="mb-4">
          <CardHead title="Please read" sub="The branch recorded this and is waiting for you to confirm you've seen it." icon={<ShieldAlert className="w-5 h-5 !text-[var(--alert)]" />} />
          <div className="flex flex-col gap-3">{toAck.map((i) => <IncidentCard key={i.id} incident={i} canAck />)}</div>
        </Card>
      )}

      {milestones.length > 0 && (
        <Card tone="sun" className="mb-4">
          <div className="flex gap-3 items-start">
            <Sparkles className="w-6 h-6 text-[var(--orange-600)] shrink-0" />
            <div><p className="font-semibold text-[var(--plum-900)]">New today!</p>{milestones.map((m) => <p key={m.id} className="text-[15px]">{m.detail}</p>)}</div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
        <Card>
          <CardHead title={`${child.first_name}'s day`} sub="Updates arrive as the caregivers record them." />
          <DayTimeline attendance={att} logs={logs} sleep={sleep} incidents={todays.filter((i) => i.parent_ack_at || !i.parent_notified_at)} />
        </Card>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHead title="Staying home?" sub="Let the branch know — so nobody worries when they don't arrive." />
            {upcoming.length > 0 && <div className="mb-3 flex flex-col gap-1.5">{upcoming.map((a) => <p key={a.id} className="text-sm"><Chip tone="plum">{dateLabel(a.day)}</Chip> {a.reason}</p>)}</div>}
            <Button variant="secondary" className="w-full" onClick={() => setAbsenceOpen(true)}><CalendarX2 className="w-4 h-4" />Report an absence</Button>
          </Card>
          {(child.allergies || child.medical_notes) && (
            <Card>
              <CardHead title="Health notes on file" sub="Shown to caregivers at every check-in." />
              {child.allergies && <p className="text-sm"><Chip tone="alert">Allergy</Chip> {child.allergies}</p>}
              {child.medical_notes && <p className="text-sm mt-2">{child.medical_notes}</p>}
              <p className="text-[12.5px] text-[var(--ink-muted)] mt-3">Something changed? Message the branch and they&apos;ll update it.</p>
            </Card>
          )}
        </div>
      </div>
      <AbsenceSheet open={absenceOpen} onClose={() => setAbsenceOpen(false)} child={child} />
    </>
  );
}

function AbsenceSheet({ open, onClose, child }: { open: boolean; onClose: () => void; child: Child }) {
  const { api } = useOs();
  const [day, setDay] = useState(today());
  const [reason, setReason] = useState("");
  const { run, busy, error } = useAction();
  return (
    <Sheet open={open} onClose={onClose} title={`${child.first_name} is staying home`}>
      <form className="flex flex-col gap-4" onSubmit={async (e) => {
        e.preventDefault();
        if ((await run(() => api.reportAbsence({ child_id: child.id, day, reason, source: "parent" }))) !== undefined) { setReason(""); onClose(); }
      }}>
        <Field label="Which day?"><input type="date" min={today()} className={inputCls} value={day} onChange={(e) => setDay(e.target.value)} /></Field>
        <Field label="Reason" group hint="If it's an illness, say what — the branch watches for anything spreading.">
          <div className="flex flex-wrap gap-2 mb-2">
            {["Unwell — fever", "Doctor's appointment", "Family travel", "Visiting relatives"].map((r) => (
              <button key={r} type="button" onClick={() => setReason(r)} className={cn("px-3 py-1.5 rounded-full border text-sm font-semibold", reason === r ? "bg-[var(--plum-900)] text-[var(--cream)] border-[var(--plum-900)]" : "bg-white border-[var(--rule)]")}>{r}</button>
            ))}
          </div>
          <input required className={inputCls} value={reason} onChange={(e) => setReason(e.target.value)} aria-label="Reason" />
        </Field>
        <ErrorNote error={error} />
        <Button size="lg" disabled={busy || !reason.trim()}>Tell the branch</Button>
      </form>
    </Sheet>
  );
}
