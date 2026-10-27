"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, MessageCirclePlus, Send } from "lucide-react";
import { useOs, useData, useAction, primaryRole } from "@/lib/os/context";
import { useParam } from "@/lib/os/use-param";
import { ROLE_LABEL, type Thread } from "@/lib/os/types";
import { Button, Card, Chip, Empty, ErrorNote, Field, Loading, PageHeader, Sheet, dateLabel, fullName, inputCls, time } from "@/components/os/ui";
import { cn } from "@/lib/utils";

const KIND_LABEL: Record<Thread["kind"], string> = { family: "Family", branch: "Branch ↔ Director", investor: "Investors" };

export default function MessagesPage() {
  const { user } = useOs();
  const role = primaryRole(user);
  const initial = useParam("t");
  const { data, error } = useData(async (a) => {
    const [threads, children, branches] = await Promise.all([a.listThreads(), a.listChildren().catch(() => []), a.listBranches()]);
    return { threads, children, branches };
  }, []);
  const [active, setActive] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  useEffect(() => { if (initial) setActive(initial); }, [initial]);

  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const { threads, children, branches } = data;
  const label = (t: Thread) => {
    if (t.kind === "family") { const c = children.find((x) => x.id === t.child_id); return c ? `${fullName(c)}'s family` : t.subject; }
    if (t.kind === "branch") return branches.find((b) => b.id === t.branch_id)?.name ?? "Branch";
    return "Investor updates";
  };
  const current = threads.find((t) => t.id === active) ?? null;

  return (
    <>
      <PageHeader eyebrow="Messages" title="Conversations" sub={
        role === "parent" ? "Talk to your child's branch. The manager and caregivers see these messages."
          : role === "investor" ? "Your line to the Pikadon director."
            : "Families, branches and the director — every conversation in one place."}
        actions={<Button onClick={() => setNewOpen(true)}><MessageCirclePlus className="w-4 h-4" />New message</Button>} />
      <div className="grid lg:grid-cols-[340px_1fr] gap-4">
        <Card className={cn("!p-2", current && "hidden lg:block")}>
          {threads.length === 0 ? <Empty title="No conversations yet" /> : threads.map((t) => (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={cn("w-full text-left px-3 py-3 rounded-2xl flex flex-col gap-0.5", active === t.id ? "bg-[var(--orange-50)]" : "hover:bg-[var(--plum-50)]")}>
              <span className="flex items-center gap-2"><span className="font-semibold text-[var(--plum-900)] truncate flex-1">{label(t)}</span><span className="text-[12px] text-[var(--ink-muted)]">{dateLabel(t.last_message_at)}</span></span>
              <span className="text-[13px] text-[var(--ink-muted)] truncate">{t.subject}</span>
              {role !== "parent" && <Chip tone="muted" className="w-fit mt-1">{KIND_LABEL[t.kind]}</Chip>}
            </button>
          ))}
        </Card>
        {current ? <Conversation thread={current} title={label(current)} onBack={() => setActive(null)} />
          : <Card className="hidden lg:block"><Empty title="Choose a conversation" sub="Or start a new one." /></Card>}
      </div>
      <NewThreadSheet open={newOpen} onClose={() => setNewOpen(false)} onCreated={(id) => { setNewOpen(false); setActive(id); }}
        role={role} kids={children} branches={branches} />
    </>
  );
}

function Conversation({ thread, title, onBack }: { thread: Thread; title: string; onBack: () => void }) {
  const { api, user } = useOs();
  const { data } = useData((a) => a.listMessages(thread.id), [thread.id]);
  const [body, setBody] = useState("");
  const { run, busy, error } = useAction();
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [data?.length]);
  return (
    <Card className="flex flex-col min-h-[60vh] !p-0 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--rule)]">
        <button className="lg:hidden w-9 h-9 grid place-items-center rounded-full hover:bg-[var(--plum-50)]" onClick={onBack} aria-label="Back"><ArrowLeft className="w-4 h-4" /></button>
        <div className="min-w-0"><p className="font-semibold text-[var(--plum-900)] truncate">{title}</p><p className="text-[12.5px] text-[var(--ink-muted)] truncate">{thread.subject}</p></div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 bg-[var(--cream)]">
        {!data ? <Loading /> : data.map((m) => {
          const mine = m.sender_id === user?.id;
          return (
            <div key={m.id} className={cn("max-w-[82%] flex flex-col", mine ? "self-end items-end" : "self-start items-start")}>
              <span className="text-[11.5px] text-[var(--ink-muted)] mb-1 px-1">{mine ? "You" : m.sender_name} · {ROLE_LABEL[m.sender_role]} · {time(m.created_at)}</span>
              <span className={cn("px-4 py-2.5 rounded-[20px] text-[15px] whitespace-pre-wrap", mine ? "bg-[var(--plum-900)] text-[var(--cream)] rounded-br-md" : "bg-[var(--cream-raised)] border border-[var(--rule)] rounded-bl-md")}>{m.body}</span>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <form className="flex gap-2 p-3 border-t border-[var(--rule)] bg-[var(--cream-raised)]" onSubmit={async (e) => {
        e.preventDefault();
        if (!body.trim()) return;
        if ((await run(() => api.sendMessage(thread.id, body.trim()))) !== undefined) setBody("");
      }}>
        <input className={inputCls} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message" aria-label="Message" />
        <Button disabled={busy || !body.trim()} aria-label="Send"><Send className="w-4 h-4" /></Button>
      </form>
      <div className="px-3 pb-2"><ErrorNote error={error} /></div>
    </Card>
  );
}

function NewThreadSheet({ open, onClose, onCreated, role, kids, branches }: {
  open: boolean; onClose: () => void; onCreated: (id: string) => void; role: ReturnType<typeof primaryRole>;
  kids: { id: string; first_name: string; last_name: string; branch_id: string }[]; branches: { id: string; name: string }[];
}) {
  const { api, user } = useOs();
  const options = useMemo(() => {
    const o: { key: string; label: string; kind: Thread["kind"]; branch_id: string | null; child_id: string | null }[] = [];
    if (role === "parent") kids.forEach((c) => o.push({ key: `f-${c.id}`, label: `${c.first_name}'s branch team`, kind: "family", branch_id: c.branch_id, child_id: c.id }));
    if (role === "manager") {
      const b = user?.memberships.find((m) => m.role === "manager")?.branch_id ?? null;
      o.push({ key: "director", label: "The director", kind: "branch", branch_id: b, child_id: null });
      kids.forEach((c) => o.push({ key: `f-${c.id}`, label: `${fullName(c)}'s family`, kind: "family", branch_id: c.branch_id, child_id: c.id }));
    }
    if (role === "staff") kids.forEach((c) => o.push({ key: `f-${c.id}`, label: `${fullName(c)}'s family`, kind: "family", branch_id: c.branch_id, child_id: c.id }));
    if (role === "director") {
      branches.forEach((b) => o.push({ key: `b-${b.id}`, label: `${b.name} manager`, kind: "branch", branch_id: b.id, child_id: null }));
      o.push({ key: "investors", label: "Investors", kind: "investor", branch_id: null, child_id: null });
    }
    if (role === "investor") o.push({ key: "investors", label: "The director", kind: "investor", branch_id: null, child_id: null });
    return o;
  }, [role, kids, branches, user]);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const { run, busy, error } = useAction();
  useEffect(() => { if (open) { setTo(options[0]?.key ?? ""); setSubject(""); setBody(""); } }, [open, options]);
  return (
    <Sheet open={open} onClose={onClose} title="New message">
      <form className="flex flex-col gap-4" onSubmit={async (e) => {
        e.preventDefault();
        const o = options.find((x) => x.key === to);
        if (!o) return;
        const id = await run(() => api.startThread({ kind: o.kind, branch_id: o.branch_id, child_id: o.child_id, subject: subject || "Message", body }));
        if (id) onCreated(id);
      }}>
        <Field label="To"><select className={inputCls} value={to} onChange={(e) => setTo(e.target.value)}>{options.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select></Field>
        <Field label="Subject"><input className={inputCls} value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Pickup time today" /></Field>
        <Field label="Message"><textarea required className={inputCls} value={body} onChange={(e) => setBody(e.target.value)} /></Field>
        <ErrorNote error={error} />
        <Button size="lg" disabled={busy || !body.trim() || !to}>Send</Button>
      </form>
    </Sheet>
  );
}
