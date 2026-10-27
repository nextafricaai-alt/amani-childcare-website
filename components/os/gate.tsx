"use client";

// Gate actions shared by the Today board and the child page:
// check-in, verified check-out, and quick daily-log entries.
import { useEffect, useState } from "react";
import { BadgeCheck, CheckCircle2, KeyRound, ShieldAlert, UserCheck, UserX } from "lucide-react";
import { useOs, useAction } from "@/lib/os/context";
import type { AuthorizedPickup, CheckoutResult, Child, Guardian, LogKind } from "@/lib/os/types";
import { Button, Chip, ErrorNote, Field, Segmented, Sheet, fullName, inputCls } from "./ui";
import { cn } from "@/lib/utils";

function usePeople(childId: string | null) {
  const { api, version } = useOs();
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [pickups, setPickups] = useState<AuthorizedPickup[]>([]);
  useEffect(() => {
    if (!childId) return;
    api.listGuardians(childId).then(setGuardians).catch(() => setGuardians([]));
    api.listPickups({ childId }).then(setPickups).catch(() => setPickups([]));
  }, [api, childId, version]);
  return { guardians, approved: pickups.filter((p) => p.status === "approved") };
}

export function CheckInSheet({ child, onClose }: { child: Child | null; onClose: () => void }) {
  const { api } = useOs();
  const { guardians, approved } = usePeople(child?.id ?? null);
  const [by, setBy] = useState("");
  const { run, busy, error } = useAction();
  useEffect(() => { setBy(""); }, [child?.id]);
  if (!child) return null;
  const names = [...guardians.map((g) => g.full_name), ...approved.map((p) => p.full_name)];
  const submit = async () => { if ((await run(() => api.checkIn(child.id, by))) !== undefined) onClose(); };
  return (
    <Sheet open={!!child} onClose={onClose} title={`Check in ${child.first_name}`}>
      <div className="flex flex-col gap-4">
        {(child.allergies || child.medical_notes) && (
          <div className="rounded-2xl bg-[var(--alert-50)] border border-[var(--alert-100)] px-4 py-3 text-sm">
            <p className="font-bold text-[var(--alert)] mb-0.5">Health notes</p>
            {child.allergies && <p>Allergies: <strong>{child.allergies}</strong></p>}
            {child.medical_notes && <p>{child.medical_notes}</p>}
          </div>
        )}
        <Field label="Dropped off by" group>
          <div className="flex flex-wrap gap-2 mb-2">
            {names.map((n) => (
              <button key={n} type="button" onClick={() => setBy(n)}
                className={cn("px-3.5 py-2 rounded-full border text-sm font-semibold", by === n ? "bg-[var(--plum-900)] text-[var(--cream)] border-[var(--plum-900)]" : "border-[var(--rule)] bg-white")}>
                {n}
              </button>
            ))}
          </div>
          <input className={inputCls} value={by} onChange={(e) => setBy(e.target.value)} placeholder="Or type a name" aria-label="Dropped off by" />
        </Field>
        <ErrorNote error={error} />
        <Button size="lg" onClick={submit} disabled={busy || !by.trim()}><UserCheck className="w-4 h-4" />Check in now</Button>
      </div>
    </Sheet>
  );
}

type Mode = "list" | "code" | "other";

export function CheckOutSheet({ child, onClose }: { child: Child | null; onClose: () => void }) {
  const { api } = useOs();
  const { guardians, approved } = usePeople(child?.id ?? null);
  const [mode, setMode] = useState<Mode>("list");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<{ r: CheckoutResult; who: string } | null>(null);
  const { run, busy, error } = useAction();
  useEffect(() => { setMode("list"); setCode(""); setName(""); setResult(null); }, [child?.id]);
  if (!child) return null;

  const release = async (fn: () => Promise<CheckoutResult>, who: string) => {
    const r = await run(fn);
    if (r) setResult({ r, who });
  };

  return (
    <Sheet open={!!child} onClose={onClose} title={`Pickup — ${child.first_name}`}>
      {result ? (
        result.r === "refused" ? (
          <div className="text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--alert-50)] grid place-items-center mb-3"><ShieldAlert className="w-8 h-8 text-[var(--alert)]" /></div>
            <p className="font-[var(--font-heading)] font-bold text-xl text-[var(--alert)]">Do not release {child.first_name}</p>
            <p className="text-[var(--ink-muted)] mt-2">{result.who || "This person"} is not approved and had no valid code. Keep {child.first_name} inside. A pickup alert has gone to the branch manager and {child.first_name}&apos;s parents.</p>
            <Button className="mt-5" variant="secondary" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-[var(--ok-50)] grid place-items-center mb-3"><CheckCircle2 className="w-8 h-8 text-[var(--ok)]" /></div>
            <p className="font-[var(--font-heading)] font-bold text-xl text-[var(--ok)]">Released to {result.who}</p>
            <p className="text-[var(--ink-muted)] mt-2">Verified {result.r === "guardian" ? "as a parent on file" : result.r === "approved_pickup" ? "as an approved pickup person" : "with today's one-time code"}. The parents can see who collected and when.</p>
            <Button className="mt-5" onClick={onClose}>Done</Button>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-4">
          <Segmented<Mode> value={mode} onChange={setMode} options={[
            { value: "list", label: "Approved people" }, { value: "code", label: "Has a code" }, { value: "other", label: "Someone else" },
          ]} />
          {mode === "list" && (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-[var(--ink-muted)]">Check their face and ID against the list, then tap who is collecting.</p>
              {guardians.map((g) => (
                <button key={g.id} disabled={busy} onClick={() => release(() => api.checkOut(child.id, { kind: "guardian", guardianId: g.id }), g.full_name)}
                  className="flex items-center gap-3 text-left px-4 py-3 rounded-2xl border border-[var(--rule)] bg-white hover:border-[var(--ok)]">
                  <BadgeCheck className="w-5 h-5 text-[var(--ok)] shrink-0" />
                  <span className="flex-1"><span className="font-semibold block">{g.full_name}</span><span className="text-[12.5px] text-[var(--ink-muted)]">{g.relationship}{g.phone ? ` · ${g.phone}` : ""}</span></span>
                  <Chip tone="ok">Parent</Chip>
                </button>
              ))}
              {approved.map((p) => (
                <button key={p.id} disabled={busy} onClick={() => release(() => api.checkOut(child.id, { kind: "pickup", pickupId: p.id }), p.full_name)}
                  className="flex items-center gap-3 text-left px-4 py-3 rounded-2xl border border-[var(--rule)] bg-white hover:border-[var(--ok)]">
                  <BadgeCheck className="w-5 h-5 text-[var(--ok)] shrink-0" />
                  <span className="flex-1"><span className="font-semibold block">{p.full_name}</span><span className="text-[12.5px] text-[var(--ink-muted)]">{p.relationship}{p.id_note ? ` · ${p.id_note}` : ""}</span></span>
                  <Chip tone="plum">Approved</Chip>
                </button>
              ))}
            </div>
          )}
          {mode === "code" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-[var(--ink-muted)]">The parent generated a 6-digit code in their app and gave it to the person collecting. It works once, today only.</p>
              <Field label="Their name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="Pickup code">
                <input className={`${inputCls} text-center text-2xl tracking-[0.4em] font-semibold`} inputMode="numeric" maxLength={6}
                  value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" />
              </Field>
              <Button size="lg" disabled={busy || code.length < 6 || !name.trim()}
                onClick={() => release(() => api.checkOut(child.id, { kind: "code", code, name }), name)}>
                <KeyRound className="w-4 h-4" />Verify code
              </Button>
            </div>
          )}
          {mode === "other" && (
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl bg-[var(--sun-50)] border border-[var(--sun-100)] px-4 py-3 text-sm">
                Not on the list and no code? <strong>Do not release the child.</strong> Record the attempt — the manager and parents are alerted straight away. The parent can add this person or send a code, and you can try again.
              </div>
              <Field label="Name of the person at the gate"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Button variant="danger" size="lg" disabled={busy || !name.trim()}
                onClick={() => release(() => api.checkOut(child.id, { kind: "unlisted", name }), name)}>
                <UserX className="w-4 h-4" />Record & alert parents
              </Button>
            </div>
          )}
          <ErrorNote error={error} />
        </div>
      )}
    </Sheet>
  );
}

const LOG_KINDS: { value: LogKind; label: string; prompt: string }[] = [
  { value: "meal", label: "🍽 Meal", prompt: "What and how much did they eat?" },
  { value: "nap", label: "😴 Nap", prompt: "e.g. Slept 12:50–14:20" },
  { value: "nappy", label: "🧷 Nappy/toilet", prompt: "e.g. Wet, all normal" },
  { value: "activity", label: "🎨 Activity", prompt: "What did they do or learn?" },
  { value: "mood", label: "😊 Mood", prompt: "How are they feeling?" },
  { value: "milestone", label: "⭐ Milestone", prompt: "Something new they did for the first time" },
  { value: "medication", label: "💊 Medication", prompt: "Name, dose, time — as agreed with the parent" },
  { value: "note", label: "📝 Note", prompt: "Anything else" },
];

export function LogSheet({ kids, open, onClose }: { kids: Child[]; open: boolean; onClose: () => void }) {
  const { api } = useOs();
  const [kind, setKind] = useState<LogKind>("meal");
  const [detail, setDetail] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [visible, setVisible] = useState(true);
  const { run, busy, error } = useAction();
  useEffect(() => { if (open) { setPicked(kids.length === 1 ? [kids[0].id] : []); setDetail(""); setVisible(true); } }, [open, kids]);
  const submit = async () => {
    const ok = await run(async () => {
      for (const id of picked) await api.addLog({ child_id: id, kind, detail: detail.trim(), visible_to_parent: visible });
      return true;
    });
    if (ok) onClose();
  };
  return (
    <Sheet open={open} onClose={onClose} title="Add to the daily log" wide>
      <div className="flex flex-col gap-4">
        {kids.length > 1 && (
          <Field label={`Who? (${picked.length} selected)`} group>
            <div className="flex flex-wrap gap-2">
              {kids.map((c) => {
                const on = picked.includes(c.id);
                return (
                  <button key={c.id} type="button" onClick={() => setPicked(on ? picked.filter((x) => x !== c.id) : [...picked, c.id])}
                    className={cn("px-3 py-2 rounded-full border text-sm font-semibold", on ? "bg-[var(--plum-900)] text-[var(--cream)] border-[var(--plum-900)]" : "bg-white border-[var(--rule)]")}>
                    {c.first_name}
                  </button>
                );
              })}
              <button type="button" className="px-3 py-2 text-sm font-semibold text-[var(--orange-700)]" onClick={() => setPicked(kids.map((c) => c.id))}>Select all</button>
            </div>
          </Field>
        )}
        <Field label="Type" group>
          <div className="flex flex-wrap gap-2">
            {LOG_KINDS.map((k) => (
              <button key={k.value} type="button" onClick={() => setKind(k.value)}
                className={cn("px-3 py-2 rounded-full border text-sm font-semibold", kind === k.value ? "bg-[var(--orange-50)] border-[var(--orange)] text-[var(--orange-700)]" : "bg-white border-[var(--rule)]")}>
                {k.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="Details">
          <textarea className={inputCls} value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={LOG_KINDS.find((k) => k.value === kind)?.prompt} />
        </Field>
        <label className="flex items-center gap-3 text-sm font-semibold">
          <input type="checkbox" className="w-5 h-5 accent-[var(--orange-600)]" checked={visible} onChange={(e) => setVisible(e.target.checked)} />
          Parents can see this
          {!visible && <Chip tone="muted">Team only</Chip>}
        </label>
        <ErrorNote error={error} />
        <Button size="lg" onClick={submit} disabled={busy || !detail.trim() || picked.length === 0}>Save {picked.length > 1 ? `for ${picked.length} children` : ""}</Button>
      </div>
    </Sheet>
  );
}

export function childLabel(c: Child) { return fullName(c); }
