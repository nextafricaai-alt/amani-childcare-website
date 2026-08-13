import type { Metadata } from "next";
import { ArrowUpRight, ShieldCheck, Users, Heart, BookOpen, Lock, Eye, AlertTriangle } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Our Promise",
  description: `${SITE_CONFIG.name}'s written safeguarding standards, staff vetting process, faith values, and daily care commitment. Everything in the open.`,
};

const sections = [
  {
    id: "people",
    Icon: Users,
    eyebrow: "01 · People",
    title: "Everyone is vetted. No exceptions.",
    color: "oklch(22% 0.06 155)",
    body: [
      "Every adult at Pikadon — including cleaners, cooks, and visiting trades — is background-checked before they set foot in the building. No exceptions.",
      "Full-time caregivers undergo: police/INTERPOL clearance, three reference calls (we speak to referees, not just receive letters), medical clearance including TB screening, and paediatric first-aid certification before their first shift.",
      "Trial periods are conducted with a senior staff member always present. Probation is 90 days. We dismiss immediately for any safeguarding breach — no second chances for the things that matter most.",
    ],
    items: [
      "Police / INTERPOL clearance",
      "Three verified reference calls",
      "Medical & TB screening",
      "Paediatric first-aid certified",
      "Signed safeguarding agreement",
      "90-day supervised probation",
    ],
  },
  {
    id: "safety",
    Icon: ShieldCheck,
    eyebrow: "02 · Safety",
    title: "No adult is ever alone with a child",
    color: "oklch(22% 0.06 155)",
    body: [
      "Safety at Pikadon is a system, not a mood. Every procedure is written down, every staff member is trained on it, and every parent can read it.",
      "Children are counted at every transition — arrival, moving between rooms, outdoor time, meals, nap time, departure. If numbers don't match, we stop everything until they do.",
      "No adult is ever alone with a child. The two-adult rule applies at all times, including in bathrooms and during outdoor play.",
      "Authorised pickup codes are set at enrolment. If we don't know you and you don't have the code, your child does not leave with you. We will call the parents — every time.",
    ],
    items: [
      "Child count at every transition",
      "Two-adult rule — no exceptions",
      "Authorised pickup codes",
      "CCTV recorded in all common rooms",
      "Locked perimeter gate",
      "Signed daily arrival / departure",
      "Written incident report for any injury",
      "Monthly fire & emergency drills",
    ],
  },
  {
    id: "faith",
    Icon: Heart,
    eyebrow: "03 · Faith & Character",
    title: "Faith, in the open",
    color: "oklch(22% 0.06 155)",
    body: [
      "Pikadon is openly and unapologetically Christian. We believe children are image-bearers of God — each one deserving of dignity, patience, and delight.",
      "In practice this means: gratitude before every meal, scripture stories told gently and age-appropriately, kindness as the classroom law, and our staff modelling what it looks like to treat people well.",
      "We do not force or shame. We teach by example, by repetition, and by the atmosphere we create. If your family does not share our faith, you are still warmly welcome — we ask only that you read this so there are no surprises.",
    ],
    items: [
      "Gratitude before meals",
      "Age-appropriate Bible stories",
      "Kindness as the classroom rule",
      "No shaming or harsh discipline",
      "Character traits taught explicitly",
      "Staff held to the same standard",
    ],
  },
  {
    id: "daily",
    Icon: BookOpen,
    eyebrow: "04 · Daily Life",
    title: "What a day looks like",
    color: "oklch(22% 0.06 155)",
    body: [
      "Every day follows a written schedule — not a rigid military timetable, but a predictable rhythm that lets children know what is coming next. Predictability is safety for young children.",
      "Each day includes: structured learning time, free play (indoors and out), two meals and two snacks, rest time for younger children, story time, and at least one new thing — a concept, a word, a skill.",
    ],
    items: [
      "Written daily schedule",
      "Structured learning + free play",
      "Outdoor time every day",
      "Two meals, two snacks",
      "Rest time for under-3s",
      "One new thing learned daily",
      "WhatsApp report by 5pm",
      "Termly written progress report",
    ],
  },
];

const safeguardingStatements = [
  {
    Icon: Lock,
    text: "No adult is ever alone with a child at Pikadon.",
  },
  {
    Icon: Eye,
    text: "All concerns are reported to the director the same day.",
  },
  {
    Icon: AlertTriangle,
    text: "Safeguarding breaches result in immediate dismissal.",
  },
  {
    Icon: ShieldCheck,
    text: "Parents may request our full policy in writing at any time.",
  },
];

export default function OurPromisePage() {
  return (
    <div className="pt-20">

      {/* ── Full-Bleed Edge-to-Edge Header Hero Section ─────────────────────────────── */}
      <section className="relative w-full min-h-[640px] sm:min-h-[700px] lg:min-h-[780px] flex items-center overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-24 lg:pt-52 lg:pb-28 px-4 sm:px-6 lg:px-12" style={{ background: "#0a1a11" }}>
        
        {/* Full-Bleed Edge-to-Edge Background Image with Headroom Framing */}
        <img
          src="/our-promise-hero.webp"
          alt="Children holding hands in unity and care at Pikadon Child Development Network"
          className="absolute inset-0 w-full h-full object-cover object-[center_25%] scale-105"
        />

        {/* Dark Vignette & Forest Green Gradient Overlays for High Legibility */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to right, rgba(10, 26, 17, 0.95) 0%, rgba(10, 26, 17, 0.82) 48%, rgba(10, 26, 17, 0.45) 80%, rgba(10, 26, 17, 0.25) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(to top, rgba(10, 26, 17, 0.92) 0%, transparent 50%, rgba(10, 26, 17, 0.75) 100%)",
          }}
        />

        {/* Hero Content Over Full-Bleed Image */}
        <div className="container relative z-10 max-w-5xl mx-auto mt-4 sm:mt-6 lg:mt-8">
          <div className="max-w-2xl">
            <Reveal>
              <span className="eyebrow eyebrow-light mb-6 inline-flex backdrop-blur-md px-3.5 py-1.5 rounded-full" style={{ background: "rgba(229, 169, 60, 0.15)", border: "1px solid rgba(229, 169, 60, 0.3)" }}>
                <ShieldCheck className="w-3.5 h-3.5 text-[#e5a93c]" />
                Our Written Safeguarding Promise
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1
                className="display-lg mb-6 leading-tight drop-shadow-lg"
                style={{ color: "#fcfaf4" }}
              >
                In the open.<br />
                <em style={{ color: "#e5a93c" }}>Always.</em>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p
                className="body-lg mb-8 max-w-xl font-sans"
                style={{ color: "rgba(252, 250, 244, 0.88)", lineHeight: 1.6 }}
              >
                Most childcare providers ask you to hope. We built Pikadon so you can verify. Below are the actual written safeguarding standards we run on — the exact commitments our staff sign and our founders uphold every single day.
              </p>
            </Reveal>

            <Reveal delay={220}>
              <div className="flex flex-wrap gap-4 items-center">
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold shadow-xl"
                >
                  Book a Visit
                  <span className="btn-arrow">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </a>
                <a
                  href="#people"
                  className="px-6 py-3.5 rounded-full font-sans text-sm font-semibold transition-all duration-200 backdrop-blur-md"
                  style={{
                    color: "#fcfaf4",
                    background: "rgba(255, 255, 255, 0.12)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                  }}
                >
                  Read Safeguarding Standards ↓
                </a>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Floating Handwritten Caption Badge in Bottom Right */}
        <div className="absolute bottom-6 right-6 lg:bottom-8 lg:right-12 z-10 hidden sm:block">
          <div
            className="px-5 py-3 rounded-2xl backdrop-blur-md shadow-2xl"
            style={{
              background: "rgba(10, 26, 17, 0.82)",
              border: "1px solid rgba(229, 169, 60, 0.4)",
            }}
          >
            <p className="font-handwriting text-lg sm:text-xl text-[#fcfaf4]">
              "Hand in hand · Built on trust, dignity & protection"
            </p>
          </div>
        </div>

      </section>

      {/* ── Manifesto plaque ────────────────────────────────── */}
      <section className="section" style={{ background: "oklch(93% 0.016 82)" }}>
        <div className="container-narrow">
          <Reveal direction="scale">
            <div className="plaque">
              <p
                className="font-handwriting text-2xl sm:text-3xl text-center"
                style={{
                  color: "oklch(22% 0.06 155)",
                  lineHeight: 1.5,
                }}
              >
                "Every child in our care is treated with the patience, dignity, protection, and love we would want for our own family."
              </p>
              <p
                className="label-xs text-center mt-6"
                style={{ color: "oklch(68% 0.12 75)", letterSpacing: "0.15em" }}
              >
                — The Pikadon Promise · Displayed at our gate · Signed by the founders
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Four pillars ────────────────────────────────────── */}
      {sections.map(({ id, Icon, eyebrow, title, body, items }, sIdx) => (
        <section
          key={id}
          id={id}
          className="section"
          style={{
            background: sIdx % 2 === 0 ? "oklch(97% 0.012 85)" : "oklch(93% 0.016 82)",
          }}
        >
          <div className="container">
            <div className="flex flex-col md:flex-row gap-12 md:gap-20">

              {/* Text side */}
              <div className="md:w-3/5">
                <Reveal>
                  <span className="eyebrow mb-6 inline-flex">
                    <Icon className="w-3 h-3" />
                    {eyebrow}
                  </span>
                </Reveal>

                <Reveal delay={80}>
                  <h2
                    className="display-md mb-8"
                    style={{ color: "oklch(22% 0.06 155)" }}
                  >
                    {title}
                  </h2>
                </Reveal>

                <div className="flex flex-col gap-4">
                  {body.map((para, i) => (
                    <Reveal key={i} delay={100 + i * 60}>
                      <p
                        className="body-lg"
                        style={{ color: "oklch(30% 0.015 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {para}
                      </p>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* Checklist card */}
              <Reveal direction="scale" delay={120} className="md:w-2/5">
                <div className="card-shell h-full">
                  <div className="card-core p-6 h-full flex flex-col justify-between">
                    <div>
                      <p className="label-xs mb-4" style={{ color: "oklch(68% 0.12 75)" }}>
                        At a glance
                      </p>

                      {/* Featured image fitting perfectly inside the At a Glance box for Section 01 */}
                      {id === "people" && (
                        <div className="mb-5 overflow-hidden rounded-2xl border border-[#e5a93c]/30 shadow-md relative group bg-[#0a1a11]">
                          <img
                            src="/black-vetted-nanny-pikadon.jpg"
                            alt="Pikadon certified vetted nanny reading storybook with toddlers"
                            className="w-full h-auto aspect-[4/3] object-cover object-center transform transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute bottom-2 left-2 right-2 bg-[#0a1a11]/90 backdrop-blur-md p-2.5 rounded-xl border border-white/20 text-[#fcfaf4]">
                            <p className="font-handwriting text-sm sm:text-base text-[#e5a93c] leading-tight">
                              "100% Background-Checked Caregivers"
                            </p>
                            <p className="text-[11px] text-white/80 mt-0.5 leading-tight">
                              INTERPOL cleared · TB screened · First-Aid Certified
                            </p>
                          </div>
                        </div>
                      )}

                      <ul className="flex flex-col gap-3">
                      {items.map((item, i) => (
                        <li
                          key={item}
                          className="flex items-start gap-3"
                          style={{
                            opacity: 0,
                            transform: "translateY(8px)",
                            animation: `fade-up 500ms cubic-bezier(0.23, 1, 0.32, 1) ${200 + i * 50}ms forwards`,
                          }}
                        >
                          <span
                            className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: "oklch(68% 0.12 75)" }}
                          />
                          <span
                            className="body-sm"
                            style={{ color: "oklch(30% 0.015 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      {/* ── Safeguarding statements ─────────────────────────── */}
      <section
        id="safeguarding"
        className="section"
        style={{ background: "oklch(22% 0.06 155)" }}
      >
        <div className="container">
          <div className="text-center mb-14">
            <Reveal>
              <span className="eyebrow eyebrow-light mb-6 inline-flex">
                <Lock className="w-3 h-3" />
                Safeguarding
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="display-md max-w-xl mx-auto"
                style={{ color: "oklch(97% 0.012 85)" }}
              >
                The lines we will never cross.
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {safeguardingStatements.map(({ Icon, text }, i) => (
              <Reveal key={text} delay={i * 70} direction="scale">
                <div className="card-shell-dark h-full">
                  <div className="card-core-dark flex items-start gap-4 px-6 py-5 h-full">
                    <Icon
                      className="w-5 h-5 mt-0.5 flex-shrink-0"
                      style={{ color: "oklch(68% 0.12 75)" }}
                    />
                    <p
                      className="body-sm font-sans font-medium"
                      style={{ color: "oklch(97% 0.012 85 / 0.85)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <div
              className="mt-10 max-w-3xl mx-auto rounded-2xl px-6 py-5 text-center"
              style={{
                background: "oklch(97% 0.012 85 / 0.05)",
                border: "1px solid oklch(97% 0.012 85 / 0.1)",
              }}
            >
              <p
                className="body-sm"
                style={{ color: "oklch(97% 0.012 85 / 0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Our full safeguarding policy is available in writing to any prospective or enrolled family. Request it at your visit or WhatsApp us and we will send it immediately.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="section" style={{ background: "oklch(93% 0.016 82)" }}>
        <div className="container-narrow">
          <Reveal direction="scale">
            <div className="card-shell">
              <div className="card-core p-10 md:p-16 text-center">
                <Reveal>
                  <span className="eyebrow mb-6 inline-flex">Ready?</span>
                </Reveal>

                <Reveal delay={80}>
                  <h2
                    className="display-md mb-5"
                    style={{ color: "oklch(22% 0.06 155)" }}
                  >
                    Come and ask us<br />
                    <em style={{ color: "oklch(68% 0.12 75)" }}>anything.</em>
                  </h2>
                </Reveal>

                <Reveal delay={160}>
                  <p
                    className="body-lg max-w-md mx-auto mb-10"
                    style={{ color: "oklch(30% 0.015 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Book a free visit. Bring your hardest questions — about safety, about faith, about what happens when something goes wrong. We will answer all of them.
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
                    <a
                      href={`/fees`}
                      className="btn-ghost"
                    >
                      See our fees
                    </a>
                  </div>
                </Reveal>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
