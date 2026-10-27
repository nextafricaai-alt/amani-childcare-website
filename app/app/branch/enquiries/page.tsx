"use client";

import { useData, useBranchId } from "@/lib/os/context";
import { Card, ErrorNote, Loading, PageHeader } from "@/components/os/ui";
import { EnquiryList } from "@/components/os/enquiries";
import { PickBranch } from "@/components/os/pick-branch";

export default function BranchEnquiries() {
  const branchId = useBranchId();
  const { data, error } = useData((a) => (branchId ? a.listEnquiries(branchId) : Promise.resolve([])), [branchId]);
  if (!branchId) return <PickBranch />;
  if (error) return <ErrorNote error={error} />;
  if (!data) return <Loading />;
  return (
    <>
      <PageHeader eyebrow="Enquiries" title="Families who want to visit" sub="Sent from the 'Book a Visit' form on pikadon.ug. Reply within one working day." />
      <Card><EnquiryList enquiries={data} /></Card>
    </>
  );
}
