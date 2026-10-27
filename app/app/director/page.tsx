"use client";

import Link from "next/link";
import { ArrowRight, Building2, Inbox, Plus, ShieldAlert } from "lucide-react";
import { useData } from "@/lib/os/context";
import { Button, Card, CardHead, Chip, Empty, ErrorNote, Loading, PageHeader, shortUgx } from "@/components/os/ui";
import { DemandCard, NetworkStats, OccupancyBar, StatusChip } from "@/components/os/network";
import { IncidentCard } from "@/components/os/incidents";

export default function DirectorHome() {
  const { data, error } = useData(async (a) => {
    const [summary, incidents, requests, enquiries, branches] = await Promise.all([
      a.networkSummary(), a.listIncidents({}), a.listLocationRequests(), a.listEnquiries(), a.listBranches(),
    ]);
    return { summary, incidents, requests, enquiries, branches };
  }, []);
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const { summary, incidents, requests, enquiries, branches } = data;
  const toReview = incidents.filter((i) => !i.director_reviewed_at && (i.severity !== "minor" || i.kind === "pickup_alert" || i.kind === "safeguarding"));
  const unassigned = enquiries.filter((e) => !e.branch_id && e.status === "new");

  return (
    <>
      <PageHeader eyebrow="Pikadon network" title="Every branch at a glance"
        sub="Live from each branch: children here, ratios, money and safety. Open any branch to work as its manager."
        actions={<Link href="/app/director/branches?add=1" className="os-btn os-btn--primary os-btn--md"><Plus className="w-4 h-4" />Add a branch</Link>} />
      <NetworkStats rows={summary} />

      <div className="grid xl:grid-cols-[1.5fr_1fr] gap-4 mt-5">
        <Card>
          <CardHead title="Branches" icon={<Building2 className="w-5 h-5" />} right={<Link href="/app/director/branches" className="text-sm font-semibold text-[var(--orange-700)]">Manage</Link>} />
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[14px] min-w-[640px]">
              <thead>
                <tr className="text-left text-[12px] text-[var(--ink-muted)] uppercase tracking-wide">
                  <th className="px-2 py-2 font-bold">Branch</th><th className="px-2 py-2 font-bold w-40">Full</th>
                  <th className="px-2 py-2 font-bold text-right">Here</th><th className="px-2 py-2 font-bold text-right">Collected</th>
                  <th className="px-2 py-2 font-bold text-right">Alerts</th><th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody>
                {summary.map((b) => (
                  <tr key={b.branch_id} className="border-t border-[var(--rule)]">
                    <td className="px-2 py-3"><p className="font-semibold text-[var(--plum-900)]">{b.branch_name}</p><StatusChip status={b.status} /></td>
                    <td className="px-2 py-3"><OccupancyBar enrolled={b.enrolled} capacity={b.capacity} /><p className="text-[12px] text-[var(--ink-muted)]">{b.enrolled}/{b.capacity}</p></td>
                    <td className="px-2 py-3 text-right font-semibold">{b.present_today}<span className="text-[var(--ink-muted)] font-normal"> · {b.staff_on_duty} staff</span></td>
                    <td className="px-2 py-3 text-right">{shortUgx(b.collected_month)}{b.overdue_ugx > 0 && <p className="text-[12px] text-[var(--alert)]">{shortUgx(b.overdue_ugx)} overdue</p>}</td>
                    <td className="px-2 py-3 text-right">{b.open_incidents ? <Chip tone="alert">{b.open_incidents}</Chip> : <Chip tone="ok">0</Chip>}</td>
                    <td className="px-2 py-3 text-right">
                      {b.status !== "planning" && <Link href={`/app/branch?b=${b.branch_id}`} className="os-btn os-btn--secondary os-btn--sm">Open<ArrowRight className="w-3.5 h-3.5" /></Link>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <Card>
          <CardHead title="Safety to review" sub="Serious incidents, safeguarding concerns and refused pickups across all branches." icon={<ShieldAlert className="w-5 h-5" />}
            right={<Link href="/app/director/safety" className="text-sm font-semibold text-[var(--orange-700)]">All</Link>} />
          {toReview.length === 0 ? <Empty title="Nothing waiting" sub="You're up to date." /> :
            <div className="flex flex-col gap-3">{toReview.slice(0, 3).map((i) => <IncidentCard key={i.id} incident={i} canReview branchName={branches.find((b) => b.id === i.branch_id)?.name} />)}</div>}
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-4">
        <DemandCard requests={requests} />
        <Card>
          <CardHead title="Website enquiries" sub={`${enquiries.filter((e) => e.status === "new").length} new · ${unassigned.length} need a branch`} icon={<Inbox className="w-5 h-5" />} />
          {enquiries.slice(0, 4).map((e) => (
            <div key={e.id} className="os-row">
              <div className="flex-1 min-w-0"><p className="font-semibold text-[var(--plum-900)] truncate">{e.parent_name}</p><p className="text-[12.5px] text-[var(--ink-muted)] truncate">{e.message ?? e.child_age}</p></div>
              <Chip tone={e.branch_id ? "plum" : "orange"}>{branches.find((b) => b.id === e.branch_id)?.area ?? "Unassigned"}</Chip>
            </div>
          ))}
          <Link href="/app/director/enquiries" className="mt-3 inline-block"><Button variant="secondary" size="sm">Open enquiries</Button></Link>
        </Card>
      </div>
    </>
  );
}
