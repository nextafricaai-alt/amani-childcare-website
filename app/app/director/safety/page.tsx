"use client";

import { useState } from "react";
import { useData } from "@/lib/os/context";
import { Card, Empty, ErrorNote, Loading, PageHeader, Segmented, Stat } from "@/components/os/ui";
import { IncidentCard } from "@/components/os/incidents";

export default function NetworkSafety() {
  const { data, error } = useData(async (a) => {
    const [incidents, branches] = await Promise.all([a.listIncidents({}), a.listBranches()]);
    return { incidents, branches };
  }, []);
  const [view, setView] = useState<"review" | "open" | "all">("review");
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  const { incidents, branches } = data;
  const review = incidents.filter((i) => !i.director_reviewed_at);
  const open = incidents.filter((i) => i.status === "open");
  const list = view === "review" ? review : view === "open" ? open : incidents;
  const unread = incidents.filter((i) => i.parent_notified_at && !i.parent_ack_at).length;
  return (
    <>
      <PageHeader eyebrow="Network safety" title="Incidents across every branch" sub="Read every serious incident and refused pickup. Mark each one reviewed so the branch knows you've seen it." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Waiting for your review" value={review.length} tone={review.length ? "warn" : "ok"} />
        <Stat label="Open" value={open.length} tone={open.some((i) => i.severity === "serious") ? "alert" : "plain"} />
        <Stat label="Pickup alerts (all time)" value={incidents.filter((i) => i.kind === "pickup_alert").length} />
        <Stat label="Parents yet to read" value={unread} tone={unread ? "warn" : "ok"} />
      </div>
      <div className="mb-4"><Segmented value={view} onChange={setView} options={[{ value: "review", label: `To review ${review.length}` }, { value: "open", label: `Open ${open.length}` }, { value: "all", label: "All" }]} /></div>
      <Card>
        {list.length === 0 ? <Empty title="Nothing here" /> : (
          <div className="flex flex-col gap-3">
            {list.map((i) => <IncidentCard key={i.id} incident={i} canReview canClose branchName={branches.find((b) => b.id === i.branch_id)?.name} />)}
          </div>
        )}
      </Card>
    </>
  );
}
