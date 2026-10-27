"use client";

import Link from "next/link";
import { LineChart, MessageCircle, Rocket, ShieldCheck } from "lucide-react";
import { useData } from "@/lib/os/context";
import { Card, CardHead, ErrorNote, Loading, PageHeader, dateLabel, shortUgx } from "@/components/os/ui";
import { DemandCard, NetworkStats, OccupancyBar, StatusChip, totals } from "@/components/os/network";

export default function InvestorHome() {
  const { data, error } = useData(async (a) => {
    const [summary, branches, requests] = await Promise.all([a.networkSummary(), a.listBranches(), a.listLocationRequests()]);
    return { summary, branches, requests };
  }, []);
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const t = totals(data.summary);
  const pipeline = data.branches.filter((b) => b.status === "planning");
  return (
    <>
      <PageHeader eyebrow="Investor overview" title="How the network is doing"
        sub="Live operating numbers from every branch. For children's privacy, investors never see names, photos or records — only totals."
        actions={<Link href="/app/messages" className="os-btn os-btn--secondary os-btn--md"><MessageCircle className="w-4 h-4" />Message the director</Link>} />
      <NetworkStats rows={data.summary} />
      <div className="grid xl:grid-cols-[1.5fr_1fr] gap-4 mt-5">
        <Card>
          <CardHead title="Branch performance this month" icon={<LineChart className="w-5 h-5" />} />
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-[14px] min-w-[560px]">
              <thead><tr className="text-left text-[12px] text-[var(--ink-muted)] uppercase tracking-wide">
                <th className="px-2 py-2 font-bold">Branch</th><th className="px-2 py-2 font-bold w-40">Occupancy</th>
                <th className="px-2 py-2 font-bold text-right">Invoiced</th><th className="px-2 py-2 font-bold text-right">Collected</th><th className="px-2 py-2 font-bold text-right">Overdue</th>
              </tr></thead>
              <tbody>
                {data.summary.map((b) => (
                  <tr key={b.branch_id} className="border-t border-[var(--rule)]">
                    <td className="px-2 py-3"><p className="font-semibold text-[var(--plum-900)]">{b.branch_name}</p><StatusChip status={b.status} /></td>
                    <td className="px-2 py-3"><OccupancyBar enrolled={b.enrolled} capacity={b.capacity} /></td>
                    <td className="px-2 py-3 text-right">{shortUgx(b.invoiced_month)}</td>
                    <td className="px-2 py-3 text-right font-semibold">{shortUgx(b.collected_month)}</td>
                    <td className={`px-2 py-3 text-right ${b.overdue_ugx ? "text-[var(--alert)]" : ""}`}>{shortUgx(b.overdue_ugx)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="flex flex-col gap-4">
          <Card tone="sun">
            <CardHead title="Expansion pipeline" icon={<Rocket className="w-5 h-5" />} sub={`${pipeline.length} branch${pipeline.length === 1 ? "" : "es"} opening soon`} />
            {pipeline.map((b) => (
              <div key={b.id} className="os-row">
                <div className="flex-1"><p className="font-semibold text-[var(--plum-900)]">{b.name}</p><p className="text-[12.5px] text-[var(--ink-muted)]">{b.capacity} places · added {dateLabel(b.created_at)}</p></div>
              </div>
            ))}
          </Card>
          <Card>
            <CardHead title="Safety, in numbers" icon={<ShieldCheck className="w-5 h-5" />} />
            <p className="text-[15px]"><strong className="text-[var(--plum-900)]">{t.incidents}</strong> open incident{t.incidents === 1 ? "" : "s"} across the network. Every incident is reviewed by the director; details stay with the branch and the family.</p>
          </Card>
        </div>
      </div>
      <div className="mt-4"><DemandCard requests={data.requests} /></div>
    </>
  );
}
