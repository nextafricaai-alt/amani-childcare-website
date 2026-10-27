"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import { useData } from "@/lib/os/context";
import { Card, Chip, Loading, PageHeader } from "./ui";

// Shown to the director on a branch screen without ?b= — pick a branch.
export function PickBranch() {
  const pathname = usePathname() || "/app/branch";
  const { data } = useData((a) => a.listBranches(), []);
  if (!data) return <Loading />;
  return (
    <>
      <PageHeader eyebrow="Choose a branch" title="Which branch?" sub="Open any branch to work exactly as its manager would." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((b) => (
          <Link key={b.id} href={`${pathname.replace(/\.html$/, "")}?b=${b.id}`}>
            <Card className="hover:border-[var(--orange)] transition">
              <Building2 className="w-6 h-6 text-[var(--orange-600)] mb-3" />
              <p className="font-semibold text-[var(--plum-900)]">{b.name}</p>
              <p className="text-sm text-[var(--ink-muted)] mb-2">{b.area}</p>
              <Chip tone={b.status === "open" ? "ok" : "sun"}>{b.status}</Chip>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
