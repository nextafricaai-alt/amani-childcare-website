import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Shield, Users, Heart, MessageSquare, Star } from "lucide-react";
import TrustStrip from "@/components/ui/trust-strip";
import Reveal from "@/components/ui/reveal";
import HeroWrapper from "@/components/ui/hero-wrapper";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} — Licensed Childcare in ${SITE_CONFIG.estate}, ${SITE_CONFIG.city}`,
  description: SITE_CONFIG.description,
};


// ─── Sections ────────────────────────────────────────────────────────────────

const theEight = [
  "Greeted by name, every morning",
  "Kept safe — counted at every transition",
  "Fed well, rested well",
  "Deep, real play every single day",
  "Something new learned",
  "Truly seen by a caring adult",
  "God's love gently shared",
  "Their day sent home to you by 5pm",
];

const standards = [
  {
    Icon: Users,
    eyebrow: "People",
    title: "Vetted at every level",
    body:
      "Every adult near your child: police-checked, reference-called, medically cleared, first-aid certified. Including the founders.",
    href: "/our-promise",
    rotate: "-1deg",
    delay: 0,
  },
  {
    Icon: Shield,
    eyebrow: "Systems",
    title: "Safe by written rule",
    body:
      "Counted at every transition. No adult ever alone with a child. Authorised-pickup codes. Written policies you can read before you enrol.",
    href: "/our-promise",
    rotate: "0.5deg",
    delay: 80,
  },
  {
    Icon: Heart,
    eyebrow: "Character",
    title: "Faith & values, in the open",
    body:
      "Openly Christian. Gratitude before meals, kindness as the classroom law. Read exactly what we teach — no surprises, ever.",
    href: "/our-promise",
    rotate: "-0.5deg",
    delay: 160,
  },
];

export default function HomePage() {
  return (
    <div className="pt-20">

      {/* ════════════════════════════════════════════════════════
          HERO — centered ring typography + interactive canvas
      ════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden"
        style={{ height: "100svh", minHeight: 640, maxHeight: 960 }}
      >
        {/* Interactive canvas with centered ring typography & CTAs */}
        <HeroWrapper />

        {/* Subtle gradient vignette at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-10"
          style={{
            background: "linear-gradient(to top, oklch(97% 0.012 85) 0%, transparent 100%)",
          }}
        />
      </section>

      {/* ════════════════════════════════════════════════════════
          TRUST STRIP
      ════════════════════════════════════════════════════════ */}
      <TrustStrip />

      {/* ════════════════════════════════════════════════════════
          THE PROBLEM — editorial pullquote layout
      ════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container-narrow">
          <Reveal>
            <span className="eyebrow mb-8 inline-flex">The problem we solve</span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="display-md mb-8" style={{ color: "oklch(22% 0.06 155)" }}>
              Leaving your child is the hardest part of your day.
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <div
              className="plaque body-lg"
              style={{ color: "oklch(30% 0.015 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              <p>
                Maybe the maid left again. Maybe grandmother is far away. Maybe the daycare you visited didn't feel right, and you couldn't say why. You're not asking for luxury.
              </p>
              <p className="mt-4">
                You're asking for one thing: to work without that knot in your stomach.{" "}
                <strong style={{ color: "oklch(22% 0.06 155)" }}>That is exactly what we built.</strong>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          EVERY CHILD EVERY DAY — dark section with checklist
      ════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: "oklch(22% 0.06 155)" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-start md:gap-20">

            {/* Left: headline */}
            <div className="md:w-2/5 mb-10 md:mb-0 md:sticky md:top-32">
              <Reveal>
                <span className="eyebrow eyebrow-light mb-6 inline-flex">Daily standard</span>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="display-md mb-4"
                  style={{ color: "oklch(97% 0.012 85)" }}
                >
                  Every child.<br />
                  <em style={{ color: "oklch(68% 0.12 75)" }}>Every day.</em>
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <p className="body-md" style={{ color: "oklch(97% 0.012 85 / 0.65)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  These eight outcomes are non-negotiable. Not on good days. Every day.
                </p>
              </Reveal>
            </div>

            {/* Right: staggered checklist */}
            <div className="md:w-3/5">
              <ul className="flex flex-col gap-3">
                {theEight.map((item, i) => (
                  <Reveal key={item} delay={i * 60}>
                    <li
                      className="card-shell-dark"
                    >
                      <div className="card-core-dark flex items-start gap-4 px-5 py-4">
                        <CheckCircle2
                          className="w-4 h-4 mt-0.5 flex-shrink-0"
                          style={{ color: "oklch(68% 0.12 75)" }}
                          aria-hidden
                        />
                        <span
                          className="body-sm"
                          style={{ color: "oklch(97% 0.012 85 / 0.85)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {item}
                        </span>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          DAILY UPDATES — editorial split
      ════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: "oklch(93% 0.016 82)" }}>
        <div className="container">
          <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">

            {/* Video slot */}
            <Reveal direction="scale" className="md:w-2/5 w-full flex-shrink-0">
              <div className="card-shell">
                <div className="card-core overflow-hidden">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                    <video
                      src="daily-update-video.mp4"
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-sans font-semibold tracking-wider uppercase flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live WhatsApp Preview
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Text */}
            <div className="flex-1">
              <Reveal>
                <span className="eyebrow mb-6 inline-flex">
                  <MessageSquare className="w-3 h-3" />
                  Daily updates
                </span>
              </Reveal>

              <Reveal delay={80}>
                <h2 className="display-md mb-6" style={{ color: "oklch(22% 0.06 155)" }}>
                  You'll never wonder how the day went.
                </h2>
              </Reveal>

              <Reveal delay={160}>
                <p className="body-lg mb-4" style={{ color: "oklch(30% 0.015 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Every afternoon by 5pm, you receive your child's day on WhatsApp — what they ate, how they napped, what they learned, and one real moment.
                </p>
              </Reveal>

              <Reveal delay={220}>
                <blockquote
                  className="border-l-2 pl-4 py-1 my-6 body-lg italic"
                  style={{
                    borderColor: "oklch(68% 0.12 75)",
                    color: "oklch(22% 0.06 155)",
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontWeight: 400,
                    fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
                  }}
                >
                  "Sarah shared her blocks with Jonah today."
                </blockquote>
              </Reveal>

              <Reveal delay={280}>
                <p className="body-sm mb-8" style={{ color: "oklch(50% 0.010 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Not "she was fine." Never just "she was fine."
                </p>
              </Reveal>

              <Reveal delay={340}>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold inline-flex"
                >
                  Book a Visit
                  <span className="btn-arrow">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </a>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          OUR STANDARDS — Z-cascade cards
      ════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">

          <div className="text-center mb-16">
            <Reveal>
              <span className="eyebrow mb-6 inline-flex">Transparency</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="display-md mx-auto max-w-2xl" style={{ color: "oklch(22% 0.06 155)" }}>
                Our standards, in the open.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p
                className="body-md mt-4 max-w-xl mx-auto"
                style={{ color: "oklch(50% 0.010 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Competitors ask you to hope. We built Amani so you can verify.
              </p>
            </Reveal>
          </div>

          {/* Z-axis cascade grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {standards.map(({ Icon, eyebrow, title, body, href, rotate, delay }) => (
              <Reveal key={title} delay={delay} direction="scale">
                <Link
                  href={href}
                  className="card-shell block group z-card"
                  style={{ transform: `rotate(${rotate})` }}
                >
                  <div className="card-core p-7 flex flex-col gap-5 min-h-[280px]">

                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "oklch(22% 0.06 155)",
                        transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    >
                      <Icon className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                    </div>

                    {/* Eyebrow */}
                    <span className="label-xs" style={{ color: "oklch(68% 0.12 75)" }}>
                      {eyebrow}
                    </span>

                    {/* Title */}
                    <h3
                      className="font-display font-medium"
                      style={{ fontSize: "clamp(1.25rem, 2vw, 1.625rem)", color: "oklch(22% 0.06 155)", lineHeight: 1.15 }}
                    >
                      {title}
                    </h3>

                    {/* Body */}
                    <p className="body-sm flex-1" style={{ color: "oklch(30% 0.015 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {body}
                    </p>

                    {/* Link row */}
                    <span
                      className="label-xs flex items-center gap-1.5 mt-auto"
                      style={{
                        color: "oklch(68% 0.12 75)",
                        transition: "gap 200ms cubic-bezier(0.23, 1, 0.32, 1)",
                      }}
                    >
                      Read our promise
                      <ArrowUpRight className="w-3 h-3 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FOUNDING FAMILIES CTA — dark editorial block
      ════════════════════════════════════════════════════════ */}
      <section className="section" style={{ background: "oklch(22% 0.06 155)" }}>
        <div className="container-narrow">
          <Reveal direction="scale">
            <div className="card-shell-dark">
              <div className="card-core-dark p-10 md:p-16 text-center">

                <Star
                  className="mx-auto mb-6 w-8 h-8"
                  style={{ color: "oklch(68% 0.12 75)" }}
                />

                <Reveal delay={80}>
                  <h2
                    className="display-md mb-4"
                    style={{ color: "oklch(97% 0.012 85)" }}
                  >
                    Ten founding families.
                  </h2>
                </Reveal>

                <Reveal delay={140}>
                  <p
                    className="body-lg mb-2"
                    style={{ color: "oklch(97% 0.012 85 / 0.75)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Founding families receive{" "}
                    <strong style={{ color: "oklch(97% 0.012 85)" }}>20% off for their first year</strong>,
                    direct access to the founders, and a voice in shaping the centre.
                  </p>
                </Reveal>

                <Reveal delay={200}>
                  <p
                    className="font-sans font-bold text-xl mb-10"
                    style={{ color: "oklch(68% 0.12 75)" }}
                  >
                    {SITE_CONFIG.foundingSpotsRemaining} places remain.
                  </p>
                </Reveal>

                <Reveal delay={260}>
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold"
                  >
                    Secure your place
                    <span className="btn-arrow">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                </Reveal>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHO WE ARE — editorial photo + manifesto
      ════════════════════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start gap-12 md:gap-20">

            {/* Photo */}
            <Reveal direction="scale" className="md:w-2/5 flex-shrink-0">
              <div className="card-shell">
                <div className="card-core">
                  <div
                    className="photo-slot aspect-[3/4]"
                    style={{ borderRadius: "calc(2rem - 0.375rem)", border: "none" }}
                  >
                    <div style={{ fontSize: "2rem" }}>📸</div>
                    <p style={{ fontWeight: 600, marginTop: "0.5rem" }}>PHOTO SLOT</p>
                    <p style={{ opacity: 0.7, marginTop: "0.25rem" }}>Founders portrait<br />(consented)</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Text */}
            <div className="flex-1">
              <Reveal>
                <span className="eyebrow mb-6 inline-flex">About us</span>
              </Reveal>

              <Reveal delay={80}>
                <h2 className="display-md mb-6" style={{ color: "oklch(22% 0.06 155)", lineHeight: 1.1 }}>
                  Built by parents, run like our own children are inside.
                </h2>
              </Reveal>

              <Reveal delay={160}>
                <p className="body-lg mb-4" style={{ color: "oklch(30% 0.015 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Amani was founded by Hudson and Patience Tumusiime — a systems builder and a centre director who believe childcare in Uganda deserves the same excellence as the best institutions anywhere.
                </p>
              </Reveal>

              <Reveal delay={220}>
                {/* Manifesto plaque */}
                <div className="plaque my-8">
                  <p
                    className="font-display italic"
                    style={{
                      fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
                      color: "oklch(22% 0.06 155)",
                      lineHeight: 1.5,
                    }}
                  >
                    "Every child in our care is treated with the patience, dignity, protection, and love we would want for our own family."
                  </p>
                  <p
                    className="label-xs mt-5"
                    style={{ color: "oklch(68% 0.12 75)", letterSpacing: "0.15em" }}
                  >
                    — The Amani Standard, displayed at our gate
                  </p>
                </div>
              </Reveal>

              <Reveal delay={300}>
                <Link href="/our-promise" className="btn-ghost inline-flex">
                  Read Our Promise
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FINAL CTA — editorial full-width
      ════════════════════════════════════════════════════════ */}
      <section
        className="section text-center"
        style={{ background: "oklch(22% 0.06 155)" }}
      >
        <div className="container-narrow">
          <Reveal>
            <span className="eyebrow eyebrow-light mb-8 inline-flex">Tukusanyukidde</span>
          </Reveal>

          <Reveal delay={80}>
            <h2
              className="display-md mx-auto max-w-2xl mb-6"
              style={{ color: "oklch(97% 0.012 85)" }}
            >
              Come and see<br />
              <em style={{ color: "oklch(68% 0.12 75)" }}>everything.</em>
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="body-lg max-w-xl mx-auto mb-10"
              style={{ color: "oklch(97% 0.012 85 / 0.7)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Bring your hardest questions. Parents who ask hard questions become our favourite families.
            </p>
          </Reveal>

          <Reveal delay={220}>
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
          </Reveal>
        </div>
      </section>

    </div>
  );
}
