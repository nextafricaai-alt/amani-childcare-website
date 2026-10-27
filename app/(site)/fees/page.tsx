import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ArrowUpRight, Banknote, Clock, HelpCircle, Star } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Fees & Pricing",
  description: `Transparent, published fees for ${SITE_CONFIG.name} childcare in ${SITE_CONFIG.city}. Full day, half day, founding family discounts. No hidden charges.`,
};

const fees = [
  { label: "Full day · 7:00 – 18:00", price: "UGX [amount]", period: "/ month" },
  { label: "Half day · 7:00 – 13:00", price: "UGX [amount]", period: "/ month" },
  { label: "Registration fee", price: "UGX [amount]", period: "once" },
  { label: "Sibling discount", price: "15% off", period: "2nd child" },
  { label: "Termly prepayment", price: "5% off", period: "per term" },
  { label: "Saturday care", price: "UGX [amount]", period: "/ day" },
];

const included = [
  "All meals & healthy snacks",
  "All learning materials & supplies",
  "Daily WhatsApp progress report",
  "Termly written development report",
  "Parent–teacher conference each term",
  "First-aid-trained care all day",
  "Sunscreen & basic medical kit",
  "Soft-play & outdoor equipment",
];

const faq = [
  {
    q: "What happens if I'm late to pick up?",
    a: "We understand emergencies happen — please call us on WhatsApp the moment you know. A grace period applies; repeated late pickups incur a small fee to fairly compensate staff who stay.",
  },
  {
    q: "Can I pay weekly or flexibly?",
    a: "For founding families we are happy to discuss flexible arrangements. Please raise this during your visit.",
  },
  {
    q: "Is there a waiting list?",
    a: `We have ${SITE_CONFIG.foundingSpotsRemaining} founding spots remaining. Once full we keep a waiting list — book a visit now to hold your place.`,
  },
  {
    q: "What if my child is sick?",
    a: "Sick days are not charged — we ask that unwell children stay home to protect the group. A doctor's note may be required for absences longer than 3 days.",
  },
  {
    q: "How do I pay?",
    a: "MTN MoMo, Airtel Money, or bank transfer. We are cashless — every payment receives an instant digital receipt.",
  },
];

export default function FeesPage() {
  return (
    <div className="relative pt-20 bg-[#2C1324] min-h-screen overflow-hidden">

      {/* ── Fixed Background Video Layer ──────────────────────────────── */}
      {/* Play playground sliding child video in background at full clarity */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-[0.24] scale-105"
        >
          <source src="/sliding-child.mp4" type="video/mp4" />
        </video>
        {/* Soft color overlay to integrate the video with Pikadon green design brand */}
        <div className="absolute inset-0 bg-[#2C1324]/70 mix-blend-multiply" />
      </div>

      {/* ── Header (Seen) ─────────────────────────────────────────── */}
      <section className="relative z-10 w-full min-h-[460px] sm:min-h-[520px] flex items-center bg-transparent pt-24 pb-16 px-4 sm:px-6 lg:px-12">
        <div className="container-narrow w-full max-w-5xl mx-auto text-left">
          <Reveal>
            <span className="eyebrow eyebrow-light mb-8 inline-flex">
              <Banknote className="w-3.5 h-3.5 text-[#F5BE14]" />
              Fees & Pricing
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className="display-lg mb-6 text-[#FFF9F2]"
            >
              Clear fees.<br />
              <em style={{ color: "oklch(82.8% 0.166 87.0)" }}>No surprises.</em>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="body-lg max-w-xl text-white/80"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              We publish our fees because trust begins with transparency. One registration fee. One monthly fee. Everything included. The same fair price for every family — no negotiation at the gate.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Fee table (Not Seen) ──────────────────────────────────────── */}
      {/* Opaque solid background blocks out the sliding video completely */}
      <section className="relative z-10 section" style={{ background: "oklch(95.6% 0.020 62.9)" }}>
        <div className="container-narrow">

          <Reveal direction="scale">
            <div className="card-shell">
              <div className="card-core overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr style={{ background: "oklch(29.9% 0.066 341.4)" }}>
                      <th
                        className="px-6 py-4 label-xs text-left"
                        style={{ color: "oklch(98.5% 0.011 71.9 / 0.6)" }}
                      >
                        Service
                      </th>
                      <th
                        className="px-6 py-4 label-xs text-right"
                        style={{ color: "oklch(98.5% 0.011 71.9 / 0.6)" }}
                      >
                        Price
                      </th>
                      <th
                        className="px-6 py-4 label-xs text-right hidden sm:table-cell"
                        style={{ color: "oklch(98.5% 0.011 71.9 / 0.7)" }}
                      >
                        Period
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map(({ label, price, period }, i) => (
                      <tr
                        key={label}
                        style={{
                          background: i % 2 === 0
                            ? "oklch(99.5% 0.003 67.8)"
                            : "oklch(98.5% 0.011 71.9)",
                          borderTop: "1px solid var(--rule)",
                        }}
                      >
                        <td
                          className="px-6 py-4 body-sm"
                          style={{ color: "oklch(37.1% 0.030 339.7)", fontFamily: "var(--font-heading)" }}
                        >
                          {label}
                        </td>
                        <td
                          className="px-6 py-4 text-right font-sans font-semibold"
                          style={{ color: "var(--orange-700)", fontSize: "0.9375rem" }}
                        >
                          {price}
                        </td>
                        <td
                          className="px-6 py-4 text-right hidden sm:table-cell label-xs"
                          style={{ color: "oklch(49.6% 0.029 338.4)", letterSpacing: "0.06em" }}
                        >
                          {period}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Reveal>

          {/* Founding note */}
          <Reveal delay={80}>
            <div
              className="mt-4 rounded-2xl px-5 py-4 flex items-start gap-3"
              style={{
                background: "var(--sun-50)",
                border: "1px solid var(--sun-100)",
              }}
            >
              <Star className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--orange)", fill: "var(--sun)" }} />
              <p className="body-sm font-sans font-semibold" style={{ color: "var(--orange-700)" }}>
                Founding families receive 20% off for the first year —{" "}
                <span style={{ color: "oklch(29.9% 0.066 341.4)" }}>
                  {SITE_CONFIG.foundingSpotsRemaining} founding places remain.
                </span>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── What's included (Seen) ────────────────────────────────── */}
      {/* Transparent background reveals the child sliding down in the background again */}
      <section className="relative z-10 section bg-transparent">
        <div className="container-narrow">
          <Reveal>
            <span className="eyebrow eyebrow-light mb-8 inline-flex">What's included</span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="display-md mb-10 text-[#FFF9F2]">
              Everything your child needs.<br />
              <em style={{ color: "oklch(82.8% 0.166 87.0)" }}>Already in the price.</em>
            </h2>
          </Reveal>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {included.map((item, i) => (
              <Reveal key={item} delay={i * 50}>
                <li className="rounded-2xl overflow-hidden border border-white/15 bg-white/[0.04] backdrop-blur-md shadow-lg">
                  <div className="flex items-start gap-3.5 px-5 py-4">
                    <CheckCircle2
                      className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#F5BE14]"
                    />
                    <span
                      className="body-sm text-[#FFF9F2] font-medium"
                      style={{ fontFamily: "var(--font-heading)" }}
                    >
                      {item}
                    </span>
                  </div>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How to pay (Seen) ─────────────────────────────────────── */}
      {/* Transparent background with premium glassmorphic payment card details overlay */}
      <section className="relative z-10 section bg-transparent pt-0">
        <div className="container-narrow">
          <Reveal direction="scale">
            <div className="rounded-3xl border border-white/20 bg-white/[0.04] backdrop-blur-xl shadow-2xl overflow-hidden">
              <div className="p-8 md:p-12 text-[#FFF9F2]">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 bg-[#F5BE14]/20 border border-[#F5BE14]/40"
                  >
                    <Banknote className="text-[#F5BE14]" style={{ width: 18, height: 18 }} />
                  </div>
                  <div>
                    <span className="label-xs block mb-1 text-white/60 tracking-wider uppercase font-bold">
                      Payment
                    </span>
                    <h2
                      className="font-display font-medium text-[#FFF9F2]"
                      style={{ fontSize: "clamp(1.375rem, 3vw, 1.875rem)", lineHeight: 1.2 }}
                    >
                      How to pay
                    </h2>
                  </div>
                </div>

                <p
                  className="body-lg mb-6 text-white/90"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  We accept <strong className="text-[#F5BE14] font-bold">MTN MoMo</strong>,{" "}
                  <strong className="text-[#F5BE14] font-bold">Airtel Money</strong>, and{" "}
                  <strong className="text-[#F5BE14] font-bold">bank transfer</strong>.
                  Pikadon is a cashless centre — every payment gets an instant digital receipt sent directly to your phone.
                </p>

                <div
                  className="rounded-2xl px-5 py-4 border border-white/10 bg-white/[0.02]"
                >
                  <p className="body-sm text-white/70" style={{ fontFamily: "var(--font-heading)" }}>
                    <Clock className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5 text-[#F5BE14]" />
                    Monthly fees are due on the <strong className="text-[#FFF9F2]">1st of each month</strong>. A 5% early-payment discount applies to termly payments made before the term begins.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ (Not Seen) ────────────────────────────────────────────── */}
      {/* Opaque solid background blocks out the sliding video completely */}
      <section className="relative z-10 section" style={{ background: "oklch(95.6% 0.020 62.9)" }}>
        <div className="container-narrow">
          <Reveal>
            <span className="eyebrow mb-8 inline-flex">
              <HelpCircle className="w-3 h-3" />
              Common questions
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="display-md mb-12" style={{ color: "oklch(29.9% 0.066 341.4)" }}>
              Everything you might want to know.
            </h2>
          </Reveal>

          <div className="flex flex-col gap-3">
            {faq.map(({ q, a }, i) => (
              <Reveal key={q} delay={i * 60}>
                <div className="card-shell">
                  <div className="card-core px-6 py-5">
                    <p
                      className="font-sans font-semibold mb-2"
                      style={{ fontSize: "0.9375rem", color: "oklch(29.9% 0.066 341.4)" }}
                    >
                      {q}
                    </p>
                    <p
                      className="body-sm"
                      style={{ color: "oklch(37.1% 0.030 339.7)", fontFamily: "var(--font-heading)" }}
                    >
                      {a}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA (Not Seen) ────────────────────────────────────────────── */}
      {/* Opaque solid color header blocks out the sliding video completely */}
      <section className="relative z-10 section text-center cta-sunny" >
        <div className="container-narrow">
          <Reveal>
            <span className="eyebrow mb-8 inline-flex">Ready to enrol</span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="display-md mb-6" style={{ color: "var(--plum-900)" }}>
              Come and see<br />
              <em style={{ color: "var(--orange-600)" }}>for yourself.</em>
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="body-lg max-w-md mx-auto mb-10"
              style={{ color: "var(--ink-body)", fontFamily: "var(--font-heading)" }}
            >
              Your visit is free, zero pressure. You'll leave with our safeguarding promise in writing.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                Book a Visit on WhatsApp
                <span className="btn-arrow">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </a>
              <Link href="/our-promise" className="btn-ghost">
                Read our promise
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
