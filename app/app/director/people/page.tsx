"use client";

import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useOs, useData, useAction } from "@/lib/os/context";
import { ROLE_LABEL, type Role } from "@/lib/os/types";
import { Avatar, Button, Card, CardHead, Chip, Empty, ErrorNote, Field, Loading, PageHeader, Sheet, inputCls } from "@/components/os/ui";

export default function PeoplePage() {
  const { api } = useOs();
  const { data, error } = useData(async (a) => {
    const [team, invites, branches] = await Promise.all([a.listTeam(), a.listInvites(), a.listBranches()]);
    return { team, invites, branches };
  }, []);
  const [open, setOpen] = useState(false);
  const act = useAction();
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const { team, invites, branches } = data;
  const bname = (id: string | null) => (id ? branches.find((b) => b.id === id)?.name ?? "—" : "All branches");
  const group = (roles: Role[]) => team.filter((m) => roles.includes(m.role));
  const section = (title: string, sub: string, roles: Role[]) => (
    <Card>
      <CardHead title={title} sub={sub} />
      {group(roles).length === 0 ? <Empty title="Nobody yet" /> : group(roles).map((m) => (
        <div key={m.membership_id} className="os-row flex-wrap">
          <Avatar name={m.name} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--plum-900)]">{m.name}</p>
            <p className="text-[12.5px] text-[var(--ink-muted)]">{ROLE_LABEL[m.role]} · {bname(m.branch_id)}</p>
          </div>
          {!m.active && <Chip tone="muted">Access removed</Chip>}
          {m.role !== "director" && <Button size="sm" variant="ghost" onClick={() => act.run(() => api.setMemberActive(m.membership_id, !m.active))}>{m.active ? "Remove access" : "Restore"}</Button>}
        </div>
      ))}
    </Card>
  );
  return (
    <>
      <PageHeader eyebrow="People" title="Who can see what" sub="Directors see everything. Managers and caregivers see one branch. Investors see network numbers only — never children."
        actions={<Button onClick={() => setOpen(true)}><UserPlus className="w-4 h-4" />Invite someone</Button>} />
      <div className="grid lg:grid-cols-2 gap-4">
        {section("Directors & investors", "Network-wide access", ["director", "investor"])}
        {section("Branch managers", "One branch each", ["manager"])}
        {section("Caregivers", "Invited by their branch manager", ["staff"])}
        <Card>
          <CardHead title="Pending invites" sub="They appear above after their first sign-in." />
          {invites.length === 0 ? <Empty title="None pending" /> : invites.map((i) => (
            <div key={i.id} className="os-row flex-wrap">
              <Mail className="w-5 h-5 text-[var(--orange-600)]" />
              <div className="flex-1 min-w-0"><p className="font-semibold text-[var(--plum-900)]">{i.full_name || i.email}</p><p className="text-[12.5px] text-[var(--ink-muted)]">{i.email} · {ROLE_LABEL[i.role]} · {bname(i.branch_id)}</p></div>
              <Button size="sm" variant="ghost" onClick={() => act.run(() => api.deleteInvite(i.id))}>Cancel</Button>
            </div>
          ))}
        </Card>
      </div>
      <ErrorNote error={act.error} />
      <InviteSheet open={open} onClose={() => setOpen(false)} branches={branches} />
    </>
  );
}

function InviteSheet({ open, onClose, branches }: { open: boolean; onClose: () => void; branches: { id: string; name: string }[] }) {
  const { api } = useOs();
  const [role, setRole] = useState<Role>("manager");
  const [branch, setBranch] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { run, busy, error } = useAction();
  const scoped = role === "manager" || role === "staff";
  return (
    <Sheet open={open} onClose={onClose} title="Invite someone">
      <form className="flex flex-col gap-4" onSubmit={async (e) => {
        e.preventDefault();
        if ((await run(() => api.createInvite({ email, role, branch_id: scoped ? branch : null, full_name: name }))) !== undefined) { setEmail(""); setName(""); onClose(); }
      }}>
        <Field label="Role">
          <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="manager">Branch manager</option><option value="staff">Caregiver</option>
            <option value="investor">Investor (numbers only)</option><option value="director">Director (full access)</option>
          </select>
        </Field>
        {scoped && (
          <Field label="Branch">
            <select required className={inputCls} value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="">Choose a branch</option>{branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
        )}
        {role === "director" && <p className="text-sm rounded-xl bg-[var(--sun-50)] border border-[var(--sun-100)] px-3 py-2">Directors can see every child and every branch, and add branches. Only invite co-founders or senior leadership.</p>}
        <Field label="Full name"><input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Email they'll sign in with"><input required type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <ErrorNote error={error} />
        <Button size="lg" disabled={busy || (scoped && !branch)}>Send invite</Button>
      </form>
    </Sheet>
  );
}
