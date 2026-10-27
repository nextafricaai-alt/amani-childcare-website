"use client";

import { useState } from "react";
import { Mail, UserPlus } from "lucide-react";
import { useOs, useData, useAction, useBranchId } from "@/lib/os/context";
import { ROLE_LABEL } from "@/lib/os/types";
import { Avatar, Button, Card, CardHead, Chip, Empty, ErrorNote, Field, Loading, PageHeader, Sheet, inputCls, time } from "@/components/os/ui";
import { PickBranch } from "@/components/os/pick-branch";

export default function TeamPage() {
  const branchId = useBranchId();
  if (!branchId) return <PickBranch />;
  return <Team branchId={branchId} />;
}

function Team({ branchId }: { branchId: string }) {
  const { api, user } = useOs();
  const { data, error } = useData(async (a) => {
    const [team, invites, shifts, rooms] = await Promise.all([a.listTeam(branchId), a.listInvites(branchId), a.listShifts(branchId), a.listRooms(branchId)]);
    return { team, invites, shifts, rooms };
  }, [branchId]);
  const [open, setOpen] = useState(false);
  const act = useAction();
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const staff = data.team.filter((m) => m.role === "manager" || m.role === "staff");
  const parents = data.team.filter((m) => m.role === "parent");

  return (
    <>
      <PageHeader eyebrow="Team & families" title="Who has access to this branch" sub="Caregivers see the branch's children. Parents see only their own child. Remove access the day someone leaves."
        actions={<Button onClick={() => setOpen(true)}><UserPlus className="w-4 h-4" />Invite a caregiver</Button>} />
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHead title="Team" sub={`${staff.length} people`} />
          {staff.map((m) => {
            const shift = data.shifts.find((s) => s.user_id === m.user_id && !s.clocked_out_at);
            return (
              <div key={m.membership_id} className="os-row flex-wrap">
                <Avatar name={m.name} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--plum-900)]">{m.name}</p>
                  <p className="text-[12.5px] text-[var(--ink-muted)]">{ROLE_LABEL[m.role]}{shift ? ` · on duty since ${time(shift.clocked_in_at)} in ${data.rooms.find((r) => r.id === shift.room_id)?.name ?? "float"}` : " · off duty"}</p>
                </div>
                {!m.active && <Chip tone="muted">Access removed</Chip>}
                {m.role === "staff" && m.user_id !== user?.id && (
                  <Button size="sm" variant="ghost" onClick={() => act.run(() => api.setMemberActive(m.membership_id, !m.active))}>{m.active ? "Remove access" : "Restore"}</Button>
                )}
              </div>
            );
          })}
        </Card>
        <Card>
          <CardHead title="Parents on the app" sub={`${parents.length} accounts · invite more from a child's page`} />
          {parents.length === 0 ? <Empty title="No parents yet" /> : parents.map((m) => (
            <div key={m.membership_id} className="os-row">
              <Avatar name={m.name} />
              <p className="flex-1 font-semibold text-[var(--plum-900)]">{m.name}</p>
              {!m.active && <Chip tone="muted">Access removed</Chip>}
              <Button size="sm" variant="ghost" onClick={() => act.run(() => api.setMemberActive(m.membership_id, !m.active))}>{m.active ? "Remove access" : "Restore"}</Button>
            </div>
          ))}
        </Card>
        <Card className="lg:col-span-2">
          <CardHead title="Invites not yet accepted" sub="People appear above once they sign in with the invited email." />
          {data.invites.length === 0 ? <Empty title="No pending invites" /> : data.invites.map((i) => (
            <div key={i.id} className="os-row flex-wrap">
              <Mail className="w-5 h-5 text-[var(--orange-600)]" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[var(--plum-900)]">{i.full_name || i.email}</p>
                <p className="text-[12.5px] text-[var(--ink-muted)]">{i.email} · {ROLE_LABEL[i.role]}</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => act.run(() => api.deleteInvite(i.id))}>Cancel</Button>
            </div>
          ))}
          <ErrorNote error={act.error} />
        </Card>
      </div>
      <InviteSheet open={open} onClose={() => setOpen(false)} branchId={branchId} />
    </>
  );
}

function InviteSheet({ open, onClose, branchId }: { open: boolean; onClose: () => void; branchId: string }) {
  const { api } = useOs();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { run, busy, error } = useAction();
  return (
    <Sheet open={open} onClose={onClose} title="Invite a caregiver">
      <form className="flex flex-col gap-4" onSubmit={async (e) => {
        e.preventDefault();
        if ((await run(() => api.createInvite({ email, role: "staff", branch_id: branchId, full_name: name }))) !== undefined) { setEmail(""); setName(""); onClose(); }
      }}>
        <p className="text-sm text-[var(--ink-muted)]">Only invite someone after their police clearance, references and training are complete.</p>
        <Field label="Full name"><input required className={inputCls} value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Email"><input required type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <ErrorNote error={error} />
        <Button size="lg" disabled={busy}>Send invite</Button>
      </form>
    </Sheet>
  );
}
