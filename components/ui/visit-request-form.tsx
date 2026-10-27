"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, PhoneCall } from "lucide-react";
import { submitEnquiry, isLiveSite, listPublicBranches, type PublicBranch } from "@/lib/os/public";
import { SITE_CONFIG } from "@/lib/site-config";

// "Prefer a call back?" — the backup to WhatsApp. Lands in the branch's
// Enquiries list inside Pikadon OS.
export default function VisitRequestForm() {
  const [branches, setBranches] = useState<PublicBranch[]>([]);
  const [f, setF] = useState({ parent_name: "", phone: "", child_age: "", preferred_date: "", branch_id: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  useEffect(() => { listPublicBranches().then(setBranches).catch(() => setBranches([])); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    const ok = await submitEnquiry({ ...f, preferred_date: f.preferred_date || null, branch_id: f.branch_id || null });
    if (!isLiveSite()) {
      const text = `Hello Pikadon, I'd like to book a visit.\nName: ${f.parent_name}\nPhone: ${f.phone}\nChild's age: ${f.child_age || "—"}\nPreferred day: ${f.preferred_date || "any"}\n${f.message}`;
      window.open(`https://wa.me/${SITE_CONFIG.phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    }
    setState(ok ? "done" : "error");
  };

  const input = "w-full min-h-[46px] px-4 py-2.5 rounded-2xl border-[1.5px] border-[rgba(67,31,55,0.16)] bg-white text-[15px] focus:outline-none focus:border-[var(--orange)] focus:shadow-[0_0_0_4px_rgba(234,90,45,0.14)]";
  const label = "flex flex-col gap-1.5 text-left text-[13px] font-semibold text-[var(--plum-900)]";

  if (state === "done") {
    return (
      <div className="max-w-xl mx-auto rounded-[28px] bg-white border border-[var(--rule)] p-8 text-center">
        <CheckCircle2 className="w-12 h-12 mx-auto text-[var(--orange-600)] mb-3" />
        <p className="font-semibold text-xl text-[var(--plum-900)]" style={{ fontFamily: "var(--font-heading)" }}>Thank you, {f.parent_name.split(" ")[0]}!</p>
        <p className="text-[var(--ink-body)] mt-2">We&apos;ll call you on {f.phone} within one working day to confirm your visit.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-xl mx-auto rounded-[28px] bg-white border border-[var(--rule)] p-6 sm:p-8 grid sm:grid-cols-2 gap-4 text-left">
      <div className="sm:col-span-2 flex items-center gap-3">
        <span className="w-10 h-10 rounded-2xl bg-[var(--sun-50)] text-[var(--orange-600)] grid place-items-center"><PhoneCall className="w-5 h-5" /></span>
        <div>
          <p className="font-semibold text-[var(--plum-900)]" style={{ fontFamily: "var(--font-heading)" }}>Prefer a call back?</p>
          <p className="text-[13px] text-[var(--ink-muted)]">Leave your number and the branch manager will call you.</p>
        </div>
      </div>
      <label className={label}>Your name<input required minLength={2} className={input} value={f.parent_name} onChange={(e) => setF({ ...f, parent_name: e.target.value })} /></label>
      <label className={label}>Phone (WhatsApp)<input required minLength={7} inputMode="tel" className={input} value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="07…" /></label>
      <label className={label}>Child&apos;s age<input className={input} value={f.child_age} onChange={(e) => setF({ ...f, child_age: e.target.value })} placeholder="e.g. 3 years" /></label>
      <label className={label}>Preferred day<input type="date" className={input} value={f.preferred_date} onChange={(e) => setF({ ...f, preferred_date: e.target.value })} /></label>
      {branches.length > 1 && (
        <label className={`${label} sm:col-span-2`}>Which branch?
          <select className={input} value={f.branch_id} onChange={(e) => setF({ ...f, branch_id: e.target.value })}>
            <option value="">Not sure — help me choose</option>
            {branches.filter((b) => b.status === "open").map((b) => <option key={b.id} value={b.id}>{b.name} ({b.area})</option>)}
          </select>
        </label>
      )}
      <label className={`${label} sm:col-span-2`}>Anything we should know? (optional)<textarea className={`${input} min-h-[84px]`} maxLength={1000} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} /></label>
      {state === "error" && <p className="sm:col-span-2 text-sm text-[var(--alert)]">Sorry, that didn&apos;t send. Please use the WhatsApp button above.</p>}
      <button className="btn-gold sm:col-span-2 justify-center" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Request a call back"}</button>
      <p className="sm:col-span-2 text-[12px] text-[var(--ink-muted)]">We only use your number to arrange your visit.</p>
    </form>
  );
}
