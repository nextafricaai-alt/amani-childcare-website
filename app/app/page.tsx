"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Mail, ShieldCheck } from "lucide-react";
import { useOs, primaryRole, homeFor } from "@/lib/os/context";
import { ROLE_LABEL, type Role } from "@/lib/os/types";
import Wordmark from "@/components/ui/wordmark";
import { Avatar, Button, ErrorNote, Field, inputCls } from "@/components/os/ui";

const ROLE_ORDER: Role[] = ["director", "manager", "staff", "parent", "investor"];
const ROLE_BLURB: Record<Role, string> = {
  director: "Every branch, safety across the network, adding new branches.",
  manager: "Runs one branch: the day, children, families, fees and team.",
  staff: "Check-in at the gate, daily log, sleep checks and roll calls.",
  parent: "Their own child's day, pickups, incidents, fees and messages.",
  investor: "Network numbers only — never children's records.",
};

export default function SignInPage() {
  const { api, user, setUser } = useOs();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && primaryRole(user)) router.replace(homeFor(primaryRole(user)));
  }, [user, router]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await api.sendCode(email.trim()); setStep("code"); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };
  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { setUser(await api.verifyCode(email.trim(), code)); }
    catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };
  const pick = async (id: string) => { if (api.signInAs) setUser(await api.signInAs(id)); };

  const personas = api.demoPersonas?.() ?? [];

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.05fr_1fr]">
      {/* Brand panel */}
      <section className="relative overflow-hidden bg-[var(--plum-900)] text-[var(--cream)] px-6 sm:px-10 lg:px-14 py-10 lg:py-14 flex flex-col">
        <div aria-hidden className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full" style={{ background: "radial-gradient(circle, rgba(245,190,20,0.28), transparent 65%)" }} />
        <div aria-hidden className="absolute -left-32 bottom-0 w-[380px] h-[380px] rounded-full" style={{ background: "radial-gradient(circle, rgba(234,90,45,0.22), transparent 65%)" }} />
        <a href="/" className="relative flex items-center gap-3 w-fit">
          <img src="/brand/pikadon-icon.svg" alt="" className="h-11 w-auto" />
          <Wordmark className="h-5 w-auto" color="var(--cream)" />
        </a>
        <div className="relative mt-auto pt-16 lg:pt-0 max-w-lg">
          <p className="text-[var(--sun)] font-bold tracking-[0.16em] text-xs uppercase mb-4">Pikadon OS</p>
          <h1 className="font-[var(--font-heading)] font-bold text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.05] tracking-[-0.02em]">
            One place where parents, caregivers and every branch <span className="text-[var(--sun)]">meet.</span>
          </h1>
          <ul className="mt-8 space-y-3 text-[15px] text-[rgba(255,249,242,0.8)]">
            <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-[var(--sun)] shrink-0" />Verified pickups — nobody leaves with a child unless a parent approved them.</li>
            <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-[var(--sun)] shrink-0" />Sleep checks, headcounts and incidents recorded as they happen.</li>
            <li className="flex gap-3"><ShieldCheck className="w-5 h-5 text-[var(--sun)] shrink-0" />Each person sees only what their role allows — enforced by the database.</li>
          </ul>
        </div>
        <div className="relative h-1.5 mt-10 rounded-full overflow-hidden brand-stripe" aria-hidden />
      </section>

      {/* Sign-in panel */}
      <section className="px-6 sm:px-10 lg:px-14 py-10 lg:py-14 flex flex-col justify-center bg-[var(--cream)]">
        <div className="w-full max-w-md mx-auto">
          {api.mode === "live" ? (
            <>
              <h2 className="os-title mb-2">Sign in</h2>
              <p className="text-[var(--ink-muted)] mb-7">We'll email you a 6-digit code — no password to remember. Use the email your branch invited.</p>
              {step === "email" ? (
                <form onSubmit={send} className="flex flex-col gap-4">
                  <Field label="Email address">
                    <input className={inputCls} type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                  </Field>
                  <ErrorNote error={error} />
                  <Button size="lg" disabled={busy}><Mail className="w-4 h-4" />{busy ? "Sending…" : "Email me a code"}</Button>
                </form>
              ) : (
                <form onSubmit={verify} className="flex flex-col gap-4">
                  <Field label={`Code sent to ${email}`} hint="Check spam if it hasn't arrived within a minute.">
                    <input className={`${inputCls} text-center text-2xl tracking-[0.4em] font-semibold`} inputMode="numeric" autoComplete="one-time-code"
                      maxLength={6} required value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} placeholder="000000" />
                  </Field>
                  <ErrorNote error={error} />
                  <Button size="lg" disabled={busy || code.length < 6}>{busy ? "Checking…" : "Sign in"}<ArrowRight className="w-4 h-4" /></Button>
                  <button type="button" className="text-sm font-semibold text-[var(--plum-700)]" onClick={() => setStep("email")}>Use a different email</button>
                </form>
              )}
              <p className="text-sm text-[var(--ink-muted)] mt-8">Just exploring? <a href="/app?demo=1" className="font-semibold text-[var(--orange-700)] underline underline-offset-4">Open the demo</a></p>
            </>
          ) : (
            <>
              <p className="os-eyebrow mb-1.5">Demo</p>
              <h2 className="os-title mb-2">Choose who you are</h2>
              <p className="text-[var(--ink-muted)] mb-6">Sample data only. Each person sees exactly what their role allows. Open two tabs — say a parent and the Kampala manager — and watch updates arrive live.</p>
              <div className="flex flex-col gap-5">
                {ROLE_ORDER.map((role) => {
                  const people = personas.filter((p) => p.role === role);
                  if (!people.length) return null;
                  return (
                    <div key={role}>
                      <p className="text-[13px] font-bold text-[var(--plum-900)]">{ROLE_LABEL[role]}</p>
                      <p className="text-[12.5px] text-[var(--ink-muted)] mb-2">{ROLE_BLURB[role]}</p>
                      <div className="flex flex-col gap-2">
                        {people.map((p) => (
                          <button key={p.id} onClick={() => pick(p.id)}
                            className="group flex items-center gap-3 text-left px-3.5 py-3 rounded-2xl bg-[var(--cream-raised)] border border-[var(--rule)] hover:border-[var(--orange)] hover:shadow-[0_6px_18px_rgba(234,90,45,0.12)] transition">
                            <Avatar name={p.name} size={38} />
                            <span className="min-w-0 flex-1">
                              <span className="block font-semibold text-[var(--plum-900)] truncate">{p.name}</span>
                              <span className="block text-[12.5px] text-[var(--ink-muted)] truncate">{p.detail}</span>
                            </span>
                            <ArrowRight className="w-4 h-4 text-[var(--orange-600)] opacity-0 group-hover:opacity-100 transition" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
