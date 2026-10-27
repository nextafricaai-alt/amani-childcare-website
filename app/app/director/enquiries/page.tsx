"use client";

import { useData } from "@/lib/os/context";
import { Card, CardHead, ErrorNote, Loading, PageHeader, dateLabel } from "@/components/os/ui";
import { EnquiryList } from "@/components/os/enquiries";
import { DemandCard } from "@/components/os/network";

export default function DirectorEnquiries() {
  const { data, error } = useData(async (a) => {
    const [enquiries, branches, requests] = await Promise.all([a.listEnquiries(), a.listBranches(), a.listLocationRequests()]);
    return { enquiries, branches, requests };
  }, []);
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  return (
    <>
      <PageHeader eyebrow="From the website" title="Enquiries & demand" sub="Visit requests from pikadon.ug — route each one to the nearest branch. Area requests show where to open next." />
      <div className="grid xl:grid-cols-[1.6fr_1fr] gap-4">
        <Card><CardHead title="Visit requests" /><EnquiryList enquiries={data.enquiries} branches={data.branches.filter((b) => b.status !== "closed")} /></Card>
        <div className="flex flex-col gap-4">
          <DemandCard requests={data.requests} />
          <Card>
            <CardHead title="Latest area requests" />
            {data.requests.slice(0, 8).map((r) => (
              <div key={r.id} className="os-row text-sm">
                <span className="font-semibold text-[var(--plum-900)] w-24 truncate">{r.area}</span>
                <span className="flex-1 truncate">{r.full_name}{r.phone ? ` · ${r.phone}` : ""}</span>
                <span className="text-[var(--ink-muted)]">{dateLabel(r.created_at)}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </>
  );
}
