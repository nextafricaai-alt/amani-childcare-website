"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useOs, useAction } from "@/lib/os/context";
import type { Child, Incident, IncidentKind } from "@/lib/os/types";
import { Button, Chip, ErrorNote, Field, Sheet, fullName, inputCls, time, dateLabel } from "./ui";

export const INCIDENT_LABEL: Record<IncidentKind, string> = {
  injury: "Injury / accident", illness: "Illness", behaviour: "Behaviour", safeguarding: "Safeguarding concern",
  pickup_alert: "Pickup alert", near_miss: "Near miss", property: "Property / building",
};

export function IncidentCard({ incident: i, childName, canClose, canReview, canAck, branchName }:
  { incident: Incident; childName?: string; canClose?: boolean; canReview?: boolean; canAck?: boolean; branchName?: string }) {
  const { api } = useOs();
  const { run, busy, error } = useAction();
  const serious = i.severity === "serious" || i.kind === "pickup_alert";
  return (
    <div className={`rounded-2xl border p-4 ${serious && i.status === "open" ? "bg-[var(--alert-50)] border-[var(--alert-100)]" : "bg-white border-[var(--rule)]"}`}>
      <div className="flex flex-wrap items-center gap-2 mb-1.5">
        <Chip tone={serious ? "alert" : i.severity === "moderate" ? "sun" : "plum"}>{INCIDENT_LABEL[i.kind]}</Chip>
        <Chip tone="muted">{i.severity}</Chip>
        {childName && <span className="font-semibold text-[var(--plum-900)]">{childName}</span>}
        {branchName && <span className="text-[13px] text-[var(--ink-muted)]">· {branchName}</span>}
        <span className="ml-auto text-[12.5px] text-[var(--ink-muted)]">{dateLabel(i.occurred_at)} · {time(i.occurred_at)}</span>
      </div>
      <p className="text-[15px]">{i.description}</p>
      {i.action_taken && <p className="text-[14px] text-[var(--ink-muted)] mt-1"><strong className="text-[var(--ink-body)]">Action:</strong> {i.action_taken}</p>}
      <div className="flex flex-wrap items-center gap-2 mt-3 text-[12.5px]">
        {i.child_id && (i.parent_ack_at
          ? <Chip tone="ok"><CheckCircle2 className="w-3 h-3" />Parent read it {time(i.parent_ack_at)}</Chip>
          : i.parent_notified_at ? <Chip tone="sun">Parent notified — not yet read</Chip> : <Chip tone="muted">Parent not notified</Chip>)}
        {i.director_reviewed_at && <Chip tone="plum">Director reviewed</Chip>}
        <Chip tone={i.status === "open" ? "orange" : "muted"}>{i.status}</Chip>
        <span className="ml-auto flex gap-2">
          {canAck && !i.parent_ack_at && <Button size="sm" disabled={busy} onClick={() => run(() => api.acknowledgeIncident(i.id))}>I've read this</Button>}
          {canReview && !i.director_reviewed_at && <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(() => api.reviewIncident(i.id))}>Mark reviewed</Button>}
          {canClose && i.status === "open" && <Button size="sm" variant="secondary" disabled={busy} onClick={() => run(() => api.closeIncident(i.id))}>Close</Button>}
        </span>
      </div>
      <ErrorNote error={error} />
    </div>
  );
}

export function IncidentSheet({ open, onClose, branchId, kids }: { open: boolean; onClose: () => void; branchId: string; kids: Child[] }) {
  const { api } = useOs();
  const [childId, setChildId] = useState<string>("");
  const [kind, setKind] = useState<IncidentKind>("injury");
  const [severity, setSeverity] = useState<Incident["severity"]>("minor");
  const [description, setDescription] = useState("");
  const [action, setAction] = useState("");
  const [notify, setNotify] = useState(true);
  const { run, busy, error } = useAction();
  useEffect(() => { if (open) { setChildId(kids.length === 1 ? kids[0].id : ""); setDescription(""); setAction(""); setNotify(true); } }, [open, kids]);
  return (
    <Sheet open={open} onClose={onClose} title="Report an incident" wide>
      <form className="grid sm:grid-cols-2 gap-4" onSubmit={async (e) => {
        e.preventDefault();
        const ok = await run(() => api.addIncident({ branch_id: branchId, child_id: childId || null, kind, severity, description, action_taken: action || null, notify_parent: notify }));
        if (ok !== undefined) onClose();
      }}>
        <Field label="Child (leave empty for building/visitor incidents)">
          <select className={inputCls} value={childId} onChange={(e) => setChildId(e.target.value)}>
            <option value="">No specific child</option>
            {kids.map((c) => <option key={c.id} value={c.id}>{fullName(c)}</option>)}
          </select>
        </Field>
        <Field label="Type">
          <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as IncidentKind)}>
            {(Object.keys(INCIDENT_LABEL) as IncidentKind[]).filter((k) => k !== "pickup_alert").map((k) => <option key={k} value={k}>{INCIDENT_LABEL[k]}</option>)}
          </select>
        </Field>
        <Field label="How serious?" className="sm:col-span-2" group>
          <div className="flex gap-2">
            {(["minor", "moderate", "serious"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setSeverity(s)}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold capitalize ${severity === s ? (s === "serious" ? "bg-[var(--alert)] text-white border-[var(--alert)]" : "bg-[var(--plum-900)] text-[var(--cream)] border-[var(--plum-900)]") : "bg-white border-[var(--rule)]"}`}>{s}</button>
            ))}
          </div>
        </Field>
        <Field label="What happened?" className="sm:col-span-2"><textarea required className={inputCls} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Facts only: where, when, who was there." /></Field>
        <Field label="What did you do?" className="sm:col-span-2"><textarea className={inputCls} value={action} onChange={(e) => setAction(e.target.value)} placeholder="First aid, who you called, how the child is now." /></Field>
        {childId && (
          <label className="sm:col-span-2 flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" className="w-5 h-5 accent-[var(--orange-600)]" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
            Notify the parents now (they'll be asked to confirm they've read it)
          </label>
        )}
        {severity === "serious" && <p className="sm:col-span-2 text-sm rounded-xl bg-[var(--alert-50)] border border-[var(--alert-100)] px-3 py-2">Serious incidents go straight to the director&apos;s safety screen. Phone the parents too — don&apos;t rely on the app alone.</p>}
        <div className="sm:col-span-2 flex flex-col gap-3">
          <ErrorNote error={error} />
          <Button size="lg" disabled={busy || !description.trim()}>Save report</Button>
        </div>
      </form>
    </Sheet>
  );
}
