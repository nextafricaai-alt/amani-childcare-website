"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertTriangle, Baby, Clock, LogIn, LogOut, NotebookPen, Phone, Search, Users } from "lucide-react";
import { useOs, useData, useAction, useBranchId, branchRole } from "@/lib/os/context";
import { today } from "@/lib/os/api";
import type { Attendance, Child, Guardian } from "@/lib/os/types";
import { Avatar, Button, Card, CardHead, Chip, Empty, ErrorNote, Field, Loading, PageHeader, Segmented, Sheet, Stat, inputCls, time, fullName } from "@/components/os/ui";
import { CheckInSheet, CheckOutSheet, LogSheet } from "@/components/os/gate";
import { PickBranch } from "@/components/os/pick-branch";

type Filter = "all" | "here" | "waiting" | "home";

export default function BranchToday() {
  const branchId = useBranchId();
  if (!branchId) return <PickBranch />;
  return <Today branchId={branchId} />;
}

function Today({ branchId }: { branchId: string }) {
  const { user } = useOs();
  const role = branchRole(user, branchId);
  const q = role === "director" ? `?b=${branchId}` : "";
  const { data, error } = useData(async (a) => {
    const [branches, rooms, children, attendance, shifts, absences, incidents, pickups] = await Promise.all([
      a.listBranches(), a.listRooms(branchId), a.listChildren(branchId), a.listAttendance({ branchId }),
      a.listShifts(branchId), a.listAbsences({ branchId }), a.listIncidents({ branchId }), a.listPickups({ branchId }),
    ]);
    return { branch: branches.find((b) => b.id === branchId), rooms, children: children.filter((c) => c.status === "enrolled"), attendance, shifts, absences, incidents, pickups };
  }, [branchId]);

  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [checkIn, setCheckIn] = useState<Child | null>(null);
  const [checkOut, setCheckOut] = useState<Child | null>(null);
  const [logFor, setLogFor] = useState<Child[] | null>(null);
  const [followUp, setFollowUp] = useState<Child[] | null>(null);
  const [clockOpen, setClockOpen] = useState(false);

  const byChild = useMemo(() => new Map<string, Attendance>((data?.attendance ?? []).map((a) => [a.child_id, a])), [data]);
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;

  const { branch, rooms, children, shifts, absences, incidents, pickups } = data;
  const absentToday = new Set(absences.filter((a) => a.day === today()).map((a) => a.child_id));
  const here = children.filter((c) => byChild.get(c.id) && !byChild.get(c.id)!.checked_out_at);
  const home = children.filter((c) => byChild.get(c.id)?.checked_out_at);
  const waiting = children.filter((c) => !byChild.get(c.id) && !absentToday.has(c.id));
  const now = new Date();
  const pastCutoff = now.getHours() * 60 + now.getMinutes() >= 9 * 60 + 30;
  const unexplained = pastCutoff ? waiting : [];
  const openShifts = shifts.filter((s) => !s.clocked_out_at);
  const myShift = openShifts.find((s) => s.user_id === user?.id);
  const openAlerts = incidents.filter((i) => i.status === "open" && (i.kind === "pickup_alert" || i.severity === "serious"));
  const pendingPickups = pickups.filter((p) => p.status === "pending");

  const roomStats = rooms.map((r) => {
    const kids = here.filter((c) => (byChild.get(c.id)?.room_id ?? c.room_id) === r.id).length;
    const staff = openShifts.filter((s) => s.room_id === r.id).length;
    const allowed = staff * r.ratio;
    return { room: r, kids, staff, ok: kids === 0 || kids <= allowed, need: Math.max(0, Math.ceil(kids / r.ratio) - staff) };
  });
  const ratioBreaches = roomStats.filter((s) => !s.ok);

  const list = (filter === "here" ? here : filter === "waiting" ? children.filter((c) => !byChild.get(c.id)) : filter === "home" ? home : children)
    .filter((c) => fullName(c).toLowerCase().includes(search.toLowerCase()));

  const greeting = now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <PageHeader eyebrow={`${greeting}, ${user?.name.split(" ")[0]} · ${now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}`}
        title={branch?.name ?? "Today"}
        actions={<>
          <Button variant="secondary" onClick={() => setClockOpen(true)}><Clock className="w-4 h-4" />{myShift ? "Clock out" : "Clock in"}</Button>
          <Button onClick={() => setLogFor(here)} disabled={!here.length}><NotebookPen className="w-4 h-4" />Log for the room</Button>
        </>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Children here" value={`${here.length}/${children.length}`} sub={`${home.length} gone home`} icon={<Baby className="w-4 h-4" />} />
        <Stat label="Not arrived" value={waiting.length} tone={unexplained.length ? "warn" : "plain"} sub={`${absentToday.size} reported absent`} />
        <Stat label="Staff on duty" value={openShifts.length} tone={ratioBreaches.length ? "alert" : "ok"} sub={ratioBreaches.length ? "Below safe ratio" : "Ratios safe"} icon={<Users className="w-4 h-4" />} />
        <Stat label="Safety alerts" value={openAlerts.length} tone={openAlerts.length ? "alert" : "ok"} sub={<Link href={`/app/branch/safety${q}`} className="underline underline-offset-2">Open safety</Link>} />
      </div>

      {/* Things that need attention now */}
      {(ratioBreaches.length > 0 || openAlerts.length > 0 || unexplained.length > 0 || (pendingPickups.length > 0 && role !== "staff")) && (
        <Card tone="alert" className="mb-5">
          <CardHead title="Needs attention now" icon={<AlertTriangle className="w-5 h-5 !text-[var(--alert)]" />} />
          <ul className="flex flex-col gap-3 text-[14.5px]">
            {ratioBreaches.map((s) => (
              <li key={s.room.id} className="flex flex-wrap items-center gap-2"><Chip tone="alert">Ratio</Chip>
                <span><strong>{s.room.name}</strong>: {s.kids} children with {s.staff} caregiver{s.staff === 1 ? "" : "s"} — needs {s.need} more (max {s.room.ratio} per caregiver).</span></li>
            ))}
            {openAlerts.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center gap-2"><Chip tone="alert">{i.kind === "pickup_alert" ? "Pickup alert" : "Serious"}</Chip>
                <span>{i.description}</span></li>
            ))}
            {unexplained.length > 0 && (
              <li className="flex flex-wrap items-center gap-2"><Chip tone="sun">Absence</Chip>
                <span>{unexplained.length} child{unexplained.length === 1 ? " hasn't" : "ren haven't"} arrived and no reason was given after 9:30.</span>
                <Button size="sm" variant="secondary" onClick={() => setFollowUp(unexplained)}><Phone className="w-3.5 h-3.5" />Call families</Button></li>
            )}
            {role !== "staff" && pendingPickups.length > 0 && (
              <li className="flex flex-wrap items-center gap-2"><Chip tone="plum">Pickup request</Chip>
                <span>{pendingPickups.length} new pickup person{pendingPickups.length === 1 ? "" : "s"} waiting for your approval.</span>
                <Link href={`/app/branch/children${q}`} className="font-semibold text-[var(--orange-700)] underline underline-offset-2 text-sm">Review</Link></li>
            )}
          </ul>
        </Card>
      )}

      {/* Rooms */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        {roomStats.map((s) => (
          <Card key={s.room.id} className="!p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-[var(--font-heading)] font-semibold text-[var(--plum-900)]">{s.room.name}</p>
                <p className="text-[12.5px] text-[var(--ink-muted)]">{s.room.age_band ?? "All ages"} · 1 caregiver per {s.room.ratio}</p>
              </div>
              <Chip tone={s.ok ? "ok" : "alert"}>{s.ok ? "Ratio safe" : "Over ratio"}</Chip>
            </div>
            <div className="flex items-end gap-6 mt-3">
              <div><p className="text-[28px] font-bold font-[var(--font-heading)] leading-none text-[var(--plum-900)]">{s.kids}</p><p className="text-[12px] text-[var(--ink-muted)] mt-1">children in</p></div>
              <div><p className="text-[28px] font-bold font-[var(--font-heading)] leading-none text-[var(--plum-700)]">{s.staff}</p><p className="text-[12px] text-[var(--ink-muted)] mt-1">caregivers</p></div>
              <div className="ml-auto text-right text-[12px] text-[var(--ink-muted)]">
                {openShifts.filter((x) => x.room_id === s.room.id).map((x) => x.staff_name).join(", ") || "Nobody clocked in"}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Gate list */}
      <Card>
        <CardHead title="Arrivals & pickups" sub="Tap a child to check them in or release them to a verified person." />
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]" />
            <input className={`${inputCls} pl-10`} placeholder="Find a child" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Find a child" />
          </div>
          <Segmented<Filter> value={filter} onChange={setFilter} options={[
            { value: "all", label: `All ${children.length}` }, { value: "waiting", label: `Not in ${children.length - here.length - home.length}` },
            { value: "here", label: `Here ${here.length}` }, { value: "home", label: `Home ${home.length}` },
          ]} />
        </div>
        {list.length === 0 ? <Empty title="Nobody in this list" /> : (
          <div>
            {list.map((c) => {
              const a = byChild.get(c.id);
              const room = rooms.find((r) => r.id === (a?.room_id ?? c.room_id));
              const absent = absences.find((x) => x.child_id === c.id && x.day === today());
              return (
                <div key={c.id} className="os-row flex-wrap sm:flex-nowrap">
                  <Avatar name={fullName(c)} />
                  <Link href={`/app/branch/child?id=${c.id}${role === "director" ? `&b=${branchId}` : ""}`} className="min-w-0 flex-1">
                    <span className="font-semibold text-[var(--plum-900)] block truncate">{fullName(c)}</span>
                    <span className="text-[12.5px] text-[var(--ink-muted)] flex flex-wrap gap-x-2">
                      <span>{room?.name ?? "No room"}</span>
                      {a && !a.checked_out_at && <span>· In since {time(a.checked_in_at)}{a.dropped_by ? ` (${a.dropped_by})` : ""}</span>}
                      {a?.checked_out_at && <span>· Home {time(a.checked_out_at)} with {a.picked_up_by}</span>}
                      {!a && absent && <span>· {absent.reason}</span>}
                    </span>
                  </Link>
                  <div className="flex items-center gap-2 ml-auto">
                    {c.allergies && <Chip tone="alert" className="hidden sm:inline-flex">{c.allergies}</Chip>}
                    {!a && absent && <Chip tone="muted">Absent</Chip>}
                    {!a && <Button size="sm" onClick={() => setCheckIn(c)}><LogIn className="w-3.5 h-3.5" />Check in</Button>}
                    {a && !a.checked_out_at && <>
                      <Button size="sm" variant="ghost" onClick={() => setLogFor([c])} aria-label={`Log for ${c.first_name}`}><NotebookPen className="w-4 h-4" /></Button>
                      <Button size="sm" variant="plum" onClick={() => setCheckOut(c)}><LogOut className="w-3.5 h-3.5" />Pickup</Button>
                    </>}
                    {a?.checked_out_at && <Chip tone="ok">{a.pickup_verified === "pickup_code" ? "Code ✓" : "Verified ✓"}</Chip>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <CheckInSheet child={checkIn} onClose={() => setCheckIn(null)} />
      <CheckOutSheet child={checkOut} onClose={() => setCheckOut(null)} />
      <LogSheet open={!!logFor} kids={logFor ?? []} onClose={() => setLogFor(null)} />
      <FollowUpSheet kids={followUp} onClose={() => setFollowUp(null)} />
      <ClockSheet open={clockOpen} onClose={() => setClockOpen(false)} branchId={branchId} rooms={rooms} shiftId={myShift?.id ?? null} />
    </>
  );
}

function FollowUpSheet({ kids, onClose }: { kids: Child[] | null; onClose: () => void }) {
  const { api } = useOs();
  const { data: guardians } = useData(async (a) => {
    const all = await Promise.all((kids ?? []).map((k) => a.listGuardians(k.id)));
    return all.flat();
  }, [kids?.map((k) => k.id).join(",")]);
  const [reason, setReason] = useState<Record<string, string>>({});
  const { run, error } = useAction();
  return (
    <Sheet open={!!kids} onClose={onClose} title="Unexplained absences">
      <p className="text-sm text-[var(--ink-muted)] mb-4">Call each family. A child who is missing without a reason is a safeguarding signal — record what you learn.</p>
      <div className="flex flex-col gap-4">
        {(kids ?? []).map((k) => {
          const g = (guardians ?? []).filter((x: Guardian) => x.child_id === k.id);
          return (
            <div key={k.id} className="rounded-2xl border border-[var(--rule)] p-4 bg-white">
              <p className="font-semibold text-[var(--plum-900)]">{fullName(k)}</p>
              <div className="flex flex-wrap gap-2 my-2">
                {g.filter((x) => x.phone).map((x) => (
                  <a key={x.id} href={`tel:+${x.phone}`} className="os-btn os-btn--secondary os-btn--sm"><Phone className="w-3.5 h-3.5" />{x.full_name}</a>
                ))}
              </div>
              <div className="flex gap-2">
                <input className={inputCls} placeholder="What did the family say?" value={reason[k.id] ?? ""} onChange={(e) => setReason({ ...reason, [k.id]: e.target.value })} />
                <Button disabled={!reason[k.id]?.trim()} onClick={() => run(() => api.reportAbsence({ child_id: k.id, day: today(), reason: reason[k.id], source: "staff" }))}>Save</Button>
              </div>
            </div>
          );
        })}
        <ErrorNote error={error} />
      </div>
    </Sheet>
  );
}

function ClockSheet({ open, onClose, branchId, rooms, shiftId }: { open: boolean; onClose: () => void; branchId: string; rooms: { id: string; name: string }[]; shiftId: string | null }) {
  const { api } = useOs();
  const [room, setRoom] = useState<string>("");
  const { run, busy, error } = useAction();
  return (
    <Sheet open={open} onClose={onClose} title={shiftId ? "Clock out" : "Clock in"}>
      {shiftId ? (
        <div className="flex flex-col gap-4">
          <p className="text-[var(--ink-muted)]">Before you leave, make sure your room still has enough caregivers. The Today board will flag it if not.</p>
          <ErrorNote error={error} />
          <Button size="lg" variant="plum" disabled={busy} onClick={async () => { if ((await run(() => api.clockOut(shiftId))) !== undefined) onClose(); }}>Clock out now</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Field label="Which room are you working in?" hint="Ratios are worked out per room from who is clocked in.">
            <select className={inputCls} value={room} onChange={(e) => setRoom(e.target.value)}>
              <option value="">Choose a room</option>
              {rooms.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              <option value="float">Floating / kitchen / office</option>
            </select>
          </Field>
          <ErrorNote error={error} />
          <Button size="lg" disabled={busy || !room} onClick={async () => { if ((await run(() => api.clockIn(branchId, room === "float" ? null : room))) !== undefined) onClose(); }}>Clock in</Button>
        </div>
      )}
    </Sheet>
  );
}
