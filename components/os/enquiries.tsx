"use client";

import { MessageCircle, Phone } from "lucide-react";
import { useOs, useAction } from "@/lib/os/context";
import type { Branch, Enquiry } from "@/lib/os/types";
import { Avatar, Chip, Empty, ErrorNote, dateLabel, inputCls } from "./ui";

const STATUSES: Enquiry["status"][] = ["new", "contacted", "toured", "enrolled", "lost"];
const TONE: Record<Enquiry["status"], "orange" | "sun" | "plum" | "ok" | "muted"> = { new: "orange", contacted: "sun", toured: "plum", enrolled: "ok", lost: "muted" };

// Website enquiries → visit pipeline. The director can route unassigned
// ones to a branch.
export function EnquiryList({ enquiries, branches }: { enquiries: Enquiry[]; branches?: Branch[] }) {
  const { api } = useOs();
  const { run, error } = useAction();
  if (!enquiries.length) return <Empty title="No enquiries yet" sub="Visit requests from the website land here." />;
  return (
    <div>
      {enquiries.map((e) => (
        <div key={e.id} className="os-row flex-wrap items-start">
          <Avatar name={e.parent_name} />
          <div className="flex-1 min-w-[200px]">
            <p className="font-semibold text-[var(--plum-900)]">{e.parent_name} <Chip tone={TONE[e.status]}>{e.status}</Chip></p>
            <p className="text-[13px] text-[var(--ink-muted)]">
              {e.child_age ? `Child ${e.child_age} · ` : ""}{e.preferred_date ? `wants to visit ${dateLabel(e.preferred_date)} · ` : ""}received {dateLabel(e.created_at)}
            </p>
            {e.message && <p className="text-[14.5px] mt-1">&ldquo;{e.message}&rdquo;</p>}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <a className="os-btn os-btn--secondary os-btn--sm" href={`tel:+${e.phone.replace(/\D/g, "")}`}><Phone className="w-3.5 h-3.5" />Call</a>
            <a className="os-btn os-btn--secondary os-btn--sm" target="_blank" rel="noopener noreferrer"
              href={`https://wa.me/${e.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${e.parent_name.split(" ")[0]}, thank you for your interest in Pikadon!`)}`}>
              <MessageCircle className="w-3.5 h-3.5" />WhatsApp
            </a>
            {branches && (
              <select aria-label="Branch" className={`${inputCls} !min-h-[36px] !py-1 !w-auto text-sm`} value={e.branch_id ?? ""}
                onChange={(ev) => run(() => api.updateEnquiry(e.id, { branch_id: ev.target.value || null }))}>
                <option value="">Unassigned</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            )}
            <select aria-label="Status" className={`${inputCls} !min-h-[36px] !py-1 !w-auto text-sm`} value={e.status}
              onChange={(ev) => run(() => api.updateEnquiry(e.id, { status: ev.target.value as Enquiry["status"] }))}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      ))}
      <ErrorNote error={error} />
    </div>
  );
}
