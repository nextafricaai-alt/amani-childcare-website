"use client";

// One child's day as a single timeline — the same view the parent gets.
import { BedDouble, DoorOpen, Home, ShieldAlert } from "lucide-react";
import type { Attendance, DailyLog, Incident, SleepCheck } from "@/lib/os/types";
import { Chip, Empty, time } from "./ui";

const KIND_ICON: Record<DailyLog["kind"], string> = {
  meal: "🍽", nap: "😴", nappy: "🧷", activity: "🎨", mood: "😊", medication: "💊", milestone: "⭐", note: "📝",
};
const KIND_LABEL: Record<DailyLog["kind"], string> = {
  meal: "Meal", nap: "Nap", nappy: "Nappy / toilet", activity: "Activity", mood: "Mood", medication: "Medication", milestone: "Milestone", note: "Note",
};

interface Item { at: string; icon: React.ReactNode; title: string; body?: React.ReactNode; tone?: "milestone" | "alert" | "hidden" }

export function DayTimeline({ attendance, logs, sleep, incidents, showHidden = false }:
  { attendance?: Attendance; logs: DailyLog[]; sleep: SleepCheck[]; incidents: Incident[]; showHidden?: boolean }) {
  const items: Item[] = [];
  if (attendance) {
    items.push({ at: attendance.checked_in_at, icon: <DoorOpen className="w-4 h-4" />, title: "Arrived", body: attendance.dropped_by ? `Dropped off by ${attendance.dropped_by}` : undefined });
    if (attendance.checked_out_at) {
      const how = attendance.pickup_verified === "pickup_code" ? "with your one-time code" : attendance.pickup_verified === "approved_pickup" ? "approved pickup person" : "parent on file";
      items.push({ at: attendance.checked_out_at, icon: <Home className="w-4 h-4" />, title: "Went home", body: `Collected by ${attendance.picked_up_by} · verified (${how})` });
    }
  }
  logs.filter((l) => showHidden || l.visible_to_parent).forEach((l) => items.push({
    at: l.logged_at, icon: <span className="text-[15px] leading-none">{KIND_ICON[l.kind]}</span>, title: KIND_LABEL[l.kind], body: l.detail,
    tone: !l.visible_to_parent ? "hidden" : l.kind === "milestone" ? "milestone" : undefined,
  }));
  // Sleep checks are grouped so a long nap doesn't flood the timeline.
  if (sleep.length) {
    const sorted = [...sleep].sort((a, b) => a.checked_at.localeCompare(b.checked_at));
    const concerns = sorted.filter((s) => !s.breathing_ok || s.position === "front");
    items.push({
      at: sorted[0].checked_at, icon: <BedDouble className="w-4 h-4" />, title: "Safe-sleep checks",
      body: `${sorted.length} check${sorted.length === 1 ? "" : "s"} between ${time(sorted[0].checked_at)} and ${time(sorted[sorted.length - 1].checked_at)} — ${concerns.length ? `${concerns.length} needed attention` : "sleeping safely on their back or side, breathing normally"}.`,
      tone: concerns.length ? "alert" : undefined,
    });
  }
  incidents.forEach((i) => items.push({ at: i.occurred_at, icon: <ShieldAlert className="w-4 h-4" />, title: i.kind === "pickup_alert" ? "Pickup alert" : `Incident · ${i.kind}`, body: i.description, tone: "alert" }));
  items.sort((a, b) => a.at.localeCompare(b.at));

  if (!items.length) return <Empty title="Nothing yet today" sub="Updates appear here as the day happens." />;
  return (
    <ol className="os-timeline flex flex-col gap-4">
      {items.map((it, idx) => (
        <li key={idx} className="relative flex gap-3">
          <span className={`relative z-10 w-10 h-10 shrink-0 rounded-full grid place-items-center border-2 ${
            it.tone === "alert" ? "bg-[var(--alert-50)] border-[var(--alert-100)] text-[var(--alert)]"
              : it.tone === "milestone" ? "bg-[var(--sun-100)] border-[var(--sun)] text-[#6B4500]"
                : "bg-[var(--cream-raised)] border-[var(--orange-100)] text-[var(--orange-700)]"}`}>{it.icon}</span>
          <div className="pt-1.5 min-w-0">
            <p className="text-[13px] text-[var(--ink-muted)] font-semibold">{time(it.at)} · <span className="text-[var(--plum-900)]">{it.title}</span>
              {it.tone === "hidden" && <Chip tone="muted" className="ml-2">Team only</Chip>}
              {it.tone === "milestone" && <Chip tone="sun" className="ml-2">New!</Chip>}
            </p>
            {it.body && <p className="text-[15px] text-[var(--ink)] mt-0.5">{it.body}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
