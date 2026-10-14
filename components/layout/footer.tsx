"use client";

import Link from "next/link";
import { MapPin, Clock, Phone, ArrowUpRight } from "lucide-react";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";
import Wordmark from "@/components/ui/wordmark";

const colOne = [
  ["Fees", "/fees"],
  ["Gallery", "/gallery"],
  ["Visit Us", "/visit"],
  ["Our Promise", "/our-promise"],
  ["Safeguarding", "/our-promise#safeguarding"],
  ["Privacy Notice", "/privacy"],
];

export default function Footer() {
  return (
    <footer style={{ background: "oklch(23.1% 0.049 340.6)" }}>
      <div className="brand-stripe" aria-hidden="true" />
      <div className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">

            {/* Brand */}
            <div className="flex flex-col gap-5">
              <Link href="/" className="flex items-center gap-2.5 group w-fit">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/brand/pikadon-icon.svg"
                  alt=""
                  aria-hidden="true"
                  width={30}
                  height={40}
                  className="h-10 w-auto flex-shrink-0 group-hover:-rotate-6"
                  style={{ transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                />
                <Wordmark className="h-[18px] w-auto" color="var(--cream)" title={SITE_CONFIG.name} />
              </Link>

              <p
                className="body-sm leading-relaxed font-handwriting text-lg"
                style={{ color: "oklch(82.8% 0.166 87.0)", maxWidth: "28ch" }}
              >
                Pikadon (פִּקָּדוֹן) — a deposit, a pledge, something entrusted to another's keeping, to be guarded and returned whole.
              </p>

              <p
                className="body-sm leading-relaxed"
                style={{ color: "oklch(98.5% 0.011 71.9 / 0.55)", maxWidth: "26ch" }}
              >
                Every child in our care is treated with the patience, dignity, protection, and love we would want for our own family.
              </p>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold w-fit !text-sm"
              >
                Book a Visit
                <span className="btn-arrow !w-6 !h-6">
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </a>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-3">
              <p className="label-xs mb-2" style={{ color: "oklch(98.5% 0.011 71.9 / 0.6)" }}>
                Pages
              </p>
              {colOne.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="body-sm w-fit"
                  style={{
                    color: "oklch(98.5% 0.011 71.9 / 0.55)",
                    transition: "color 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "oklch(98.5% 0.011 71.9)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "oklch(98.5% 0.011 71.9 / 0.55)")}
                >
                  {label}
                </Link>
              ))}
              <a
                href={SITE_CONFIG.appUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="body-sm w-fit mt-2 font-semibold"
                style={{
                  color: "oklch(82.8% 0.166 87.0)",
                  transition: "color 150ms",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "oklch(98.5% 0.011 71.9)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "oklch(82.8% 0.166 87.0)")}
              >
                Parent Login (App) →
              </a>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-4">
              <p className="label-xs mb-2" style={{ color: "oklch(98.5% 0.011 71.9 / 0.6)" }}>
                Find us
              </p>

              {[
                {
                  Icon: MapPin,
                  text: `${SITE_CONFIG.centreName}, ${SITE_CONFIG.estate}, ${SITE_CONFIG.city}`,
                },
                {
                  Icon: Clock,
                  text: SITE_CONFIG.hours,
                },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: "oklch(82.8% 0.166 87.0)" }}
                  />
                  <span
                    className="body-sm"
                    style={{ color: "oklch(98.5% 0.011 71.9 / 0.55)" }}
                  >
                    {text}
                  </span>
                </div>
              ))}

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--sun)" }} />
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="body-sm"
                  style={{
                    color: "oklch(98.5% 0.011 71.9 / 0.55)",
                    transition: "color 150ms",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "oklch(98.5% 0.011 71.9)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "oklch(98.5% 0.011 71.9 / 0.55)")}
                >
                  +{SITE_CONFIG.phone}
                </a>
              </div>

              <p
                className="body-sm mt-2"
                style={{
                  color: "oklch(98.5% 0.011 71.9 / 0.55)",
                  fontSize: "0.75rem",
                  lineHeight: 1.6,
                }}
              >
                Licensed by authority — licence displayed at our gate.
              </p>
            </div>
          </div>

          {/* Divider + copyright */}
          <div
            className="mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid oklch(98.5% 0.011 71.9 / 0.08)" }}
          >
            <p
              className="label-xs"
              style={{ color: "oklch(98.5% 0.011 71.9 / 0.55)", letterSpacing: "0.08em" }}
            >
              © {new Date().getFullYear()} {SITE_CONFIG.name} Child Development Network
            </p>
            <p
              className="label-xs"
              style={{ color: "oklch(98.5% 0.011 71.9 / 0.55)", letterSpacing: "0.08em" }}
            >
              {SITE_CONFIG.estate} · {SITE_CONFIG.city} · Uganda
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
