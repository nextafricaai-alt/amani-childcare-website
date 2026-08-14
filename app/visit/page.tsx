import type { Metadata } from "next";
import { ArrowUpRight, MapPin, Clock, Car, Bus, Navigation } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";
import RequestLocationModal from "@/components/ui/request-location-modal";

export const metadata: Metadata = {
  title: "Visit Us",
  description: `Book a free visit to ${SITE_CONFIG.name} in ${SITE_CONFIG.estate}, ${SITE_CONFIG.city}. See the centre, meet the team, and ask your hardest questions. No pressure.`,
};

const visitSteps = [
  {
    step: "01",
    title: "Message us on WhatsApp",
    body: "Tell us your child's name, age, and two or three times that work for you. We'll confirm within a few hours.",
  },
  {
    step: "02",
    title: "Come and see everything",
    body: "A 30–45 minute tour. You'll see every room your child would use, meet the staff, and review our written policies.",
  },
  {
    step: "03",
    title: "Ask your hardest questions",
    body: "Safeguarding records, inspection results, staff credentials, CCTV footage policy — ask anything. We have nothing to hide.",
  },
  {
    step: "04",
    title: "Take your time",
    body: "No pressure, no expiry on the offer. We hold a place for one week after your visit while you decide.",
  },
];

const howToFind = [
  {
    Icon: Car,
    label: "By car",
    text: "From Kiwatule round-about, head towards Najjera. We are on the right side, 400m past the trading centre. Look for our green gate with the Pikadon sign.",
  },
  {
    Icon: Bus,
    label: "By taxi",
    text: "Take any matatu towards Najjera or Kira. Alight at Najjera stage, then it's a 5-minute walk. Tell the driver you're going to Najjera stage.",
  },
  {
    Icon: Navigation,
    label: "Google Maps",
    text: "Search 'Pikadon Child Development Najjera' or WhatsApp us for the pin. We'll send you the exact location link.",
  },
];

const whatToExpect = [
  "A warm greeting from staff who already know your name",
  "Full tour of all classrooms, outdoor space, bathrooms, kitchen",
  "Review of our safeguarding policy and daily schedule",
  "Introduction to the staff member who would care for your child",
  "A look at the CCTV system and how parent updates work",
  "Honest answers to every question you have",
];

export default function VisitPage() {
  return (
    <div className="pt-20">

      {/* ── Header ──────────────────────────────────────────── */}
      <section className="section" style={{ background: "oklch(22% 0.06 155)" }}>
        <div className="container-narrow">
          <Reveal>
            <span className="eyebrow eyebrow-light mb-8 inline-flex">
              <MapPin className="w-3 h-3" />
              Visit Us
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className="display-lg mb-6"
              style={{ color: "oklch(97% 0.012 85)" }}
            >
              Come and see<br />
              <em style={{ color: "oklch(68% 0.12 75)" }}>everything.</em>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="body-lg max-w-xl"
              style={{ color: "oklch(97% 0.012 85 / 0.65)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Your visit is free. Zero pressure. Bring your partner, bring your questions, bring your scepticism. Parents who ask hard questions become our favourite families.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-8">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex"
              >
                Book now on WhatsApp
                <span className="btn-arrow">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </a>
              <RequestLocationModal buttonText="Request Pikadon in your area" variant="ghost" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-14">
            <Reveal>
              <span className="eyebrow mb-6 inline-flex">How it works</span>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="display-md" style={{ color: "oklch(22% 0.06 155)" }}>
                Four simple steps.
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visitSteps.map(({ step, title, body }, i) => (
              <Reveal key={step} delay={i * 80} direction="scale">
                <div className="card-shell h-full">
                  <div className="card-core p-7 h-full flex flex-col gap-4">
                    {/* Step number */}
                    <span
                      className="font-display font-light"
                      style={{
                        fontSize: "clamp(3rem, 6vw, 5rem)",
                        color: "oklch(68% 0.12 75 / 0.25)",
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {step}
                    </span>

                    <h3
                      className="font-display font-medium"
                      style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)", color: "oklch(22% 0.06 155)", lineHeight: 1.2 }}
                    >
                      {title}
                    </h3>

                    <p
                      className="body-sm flex-1"
                      style={{ color: "oklch(30% 0.015 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    >
                      {body}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── What to expect ──────────────────────────────────── */}
      <section className="section" style={{ background: "oklch(93% 0.016 82)" }}>
        <div className="container-narrow">
          <Reveal>
            <span className="eyebrow mb-8 inline-flex">During your visit</span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="display-md mb-10" style={{ color: "oklch(22% 0.06 155)" }}>
              What you'll see<br />
              <em style={{ color: "oklch(68% 0.12 75)" }}>when you arrive.</em>
            </h2>
          </Reveal>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {whatToExpect.map((item, i) => (
              <Reveal key={item} delay={i * 50}>
                <li className="card-shell">
                  <div className="card-core flex items-start gap-3.5 px-5 py-4">
                    <span
                      className="mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: "oklch(68% 0.12 75 / 0.15)", border: "1px solid oklch(68% 0.12 75 / 0.4)" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "oklch(68% 0.12 75)" }}
                      />
                    </span>
                    <span
                      className="body-sm"
                      style={{ color: "oklch(30% 0.015 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
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

      {/* ── Opening hours + map placeholder ─────────────────── */}
      <section className="section">
        <div className="container">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-stretch">

            {/* Hours card */}
            <Reveal direction="scale" className="md:w-2/5">
              <div className="card-shell h-full">
                <div className="card-core p-7 h-full flex flex-col gap-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "oklch(22% 0.06 155)" }}
                    >
                      <Clock className="text-white" style={{ width: 18, height: 18 }} />
                    </div>
                    <div>
                      <span className="label-xs block mb-1" style={{ color: "oklch(68% 0.12 75)" }}>
                        Opening hours
                      </span>
                      <h3
                        className="font-display font-medium"
                        style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", color: "oklch(22% 0.06 155)" }}
                      >
                        When we're open
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {[
                      ["Monday – Friday", "7:00 AM – 6:00 PM"],
                      ["Saturday", "By arrangement"],
                      ["Sunday", "Closed"],
                      ["Public Holidays", "Closed"],
                    ].map(([day, hours]) => (
                      <div
                        key={day}
                        className="flex items-center justify-between py-3 border-b"
                        style={{ borderColor: "oklch(68% 0.12 75 / 0.1)" }}
                      >
                        <span
                          className="body-sm font-medium"
                          style={{ color: "oklch(22% 0.06 155)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {day}
                        </span>
                        <span
                          className="body-sm"
                          style={{ color: "oklch(50% 0.010 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        >
                          {hours}
                        </span>
                      </div>
                    ))}
                  </div>

                  <p
                    className="body-sm mt-auto"
                    style={{ color: "oklch(50% 0.010 90)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "0.8125rem" }}
                  >
                    Visit tours are available weekday mornings 8:00–10:00 and Saturday by prior arrangement.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Map + directions */}
            <div className="md:w-3/5 flex flex-col gap-5">

              {/* Map placeholder */}
              <Reveal direction="scale">
                <div className="card-shell">
                  <div className="card-core">
                    <div
                      className="photo-slot"
                      style={{ borderRadius: "calc(2rem - 0.375rem)", border: "none", aspectRatio: "16/7" }}
                    >
                      <div style={{ fontSize: "2rem" }}>🗺️</div>
                      <p style={{ fontWeight: 600, marginTop: "0.5rem" }}>MAP EMBED</p>
                      <p style={{ opacity: 0.6, marginTop: "0.25rem", fontSize: "0.75rem" }}>
                        Replace with Google Maps embed<br />or Mapbox tile
                      </p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Directions */}
              <div className="flex flex-col gap-3">
                {howToFind.map(({ Icon, label, text }, i) => (
                  <Reveal key={label} delay={i * 70}>
                    <div className="card-shell">
                      <div className="card-core flex items-start gap-4 px-5 py-4">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: "oklch(22% 0.06 155 / 0.08)" }}
                        >
                          <Icon className="w-4 h-4" style={{ color: "oklch(68% 0.12 75)" }} />
                        </div>
                        <div>
                          <p className="label-xs mb-1" style={{ color: "oklch(68% 0.12 75)" }}>
                            {label}
                          </p>
                          <p
                            className="body-sm"
                            style={{ color: "oklch(30% 0.015 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                          >
                            {text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="section text-center" style={{ background: "oklch(22% 0.06 155)" }}>
        <div className="container-narrow">
          <Reveal>
            <span className="eyebrow eyebrow-light mb-8 inline-flex">
              <Clock className="w-3 h-3" />
              {SITE_CONFIG.foundingSpotsRemaining} places remaining
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="display-md mb-6" style={{ color: "oklch(97% 0.012 85)" }}>
              We're ready when<br />
              <em style={{ color: "oklch(68% 0.12 75)" }}>you are.</em>
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="body-lg max-w-md mx-auto mb-10"
              style={{ color: "oklch(97% 0.012 85 / 0.65)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Message us on WhatsApp right now. We'll respond within a few hours and confirm your tour time.
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
