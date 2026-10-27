"use client";

// Network-level building blocks shared by the director and investor views.
// Everything here is aggregate data — no child names.
import { MapPin } from "lucide-react";
import type { BranchSummary, LocationRequest } from "@/lib/os/types";
import { Card, CardHead, Chip, Empty, Stat, shortUgx } from "./ui";

export function totals(rows: BranchSummary[]) {
  const open = rows.filter((r) => r.status === "open");
  const sum = (k: keyof BranchSummary) => open.reduce((s, r) => s + Number(r[k] || 0), 0);
  return {
    branches: open.length, planning: rows.filter((r) => r.status === "planning").length,
    enrolled: sum("enrolled"), capacity: sum("capacity"), present: sum("present_today"), staff: sum("staff_on_duty"),
    invoiced: sum("invoiced_month"), collected: sum("collected_month"), overdue: sum("overdue_ugx"),
    incidents: sum("open_incidents"), enquiries: rows.reduce((s, r) => s + Number(r.new_enquiries || 0), 0),
  };
}

export function NetworkStats({ rows, money = true }: { rows: BranchSummary[]; money?: boolean }) {
  const t = totals(rows);
  const occ = t.capacity ? Math.round((t.enrolled / t.capacity) * 100) : 0;
  const coll = t.invoiced ? Math.round((t.collected / t.invoiced) * 100) : 0;
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat label="Occupancy" value={`${occ}%`} sub={`${t.enrolled} of ${t.capacity} places · ${t.branches} open branch${t.branches === 1 ? "" : "es"}`} tone={occ >= 80 ? "ok" : "plain"} />
      <Stat label="Here today" value={t.present} sub={`${t.staff} caregivers on duty`} />
      {money && <Stat label="Collected this month" value={shortUgx(t.collected)} sub={`${coll}% of ${shortUgx(t.invoiced)} invoiced`} tone={coll >= 85 ? "ok" : "warn"} />}
      {money && <Stat label="Overdue" value={shortUgx(t.overdue)} tone={t.overdue ? "alert" : "ok"} />}
    </div>
  );
}

export function OccupancyBar({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const pct = capacity ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 rounded-full bg-[var(--plum-50)] overflow-hidden" role="img" aria-label={`${pct}% full`}>
        <div className="h-full rounded-full bg-[var(--orange)]" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[12.5px] font-semibold w-10 text-right">{pct}%</span>
    </div>
  );
}

export function DemandCard({ requests }: { requests: LocationRequest[] }) {
  const byArea = Object.entries(requests.reduce<Record<string, number>>((m, r) => {
    const k = r.area.trim().replace(/\b\w/g, (c) => c.toUpperCase());
    m[k] = (m[k] ?? 0) + 1;
    return m;
  }, {})).sort((a, b) => b[1] - a[1]);
  const max = byArea[0]?.[1] ?? 1;
  return (
    <Card>
      <CardHead title="Where parents want Pikadon next" sub="From 'Request Pikadon in your area' on the website" icon={<MapPin className="w-5 h-5" />} />
      {byArea.length === 0 ? <Empty title="No requests yet" /> : (
        <div className="flex flex-col gap-2.5">
          {byArea.slice(0, 6).map(([area, n], i) => (
            <div key={area} className="flex items-center gap-3">
              <span className="w-24 font-semibold text-[var(--plum-900)] truncate">{area}</span>
              <div className="h-6 flex-1 rounded-lg bg-[var(--plum-50)] overflow-hidden">
                <div className="h-full rounded-lg" style={{ width: `${(n / max) * 100}%`, background: i === 0 ? "var(--orange)" : "var(--plum-700)" }} />
              </div>
              <span className="w-16 text-right text-sm">{n} famil{n === 1 ? "y" : "ies"}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function StatusChip({ status }: { status: BranchSummary["status"] }) {
  return <Chip tone={status === "open" ? "ok" : status === "planning" ? "sun" : "muted"}>{status === "planning" ? "Opening soon" : status}</Chip>;
}
