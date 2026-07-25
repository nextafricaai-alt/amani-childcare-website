"use client";

import Link from "next/link";
import { Sprout, MapPin, Clock, Phone, ArrowUpRight } from "lucide-react";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

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
    <footer style={{ background: "oklch(14% 0.018 95)" }}>
      <div className="section">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">

            {/* Brand */}
            <div className="flex flex-col gap-5">
              <Link href="/" className="flex items-center gap-2.5 group w-fit">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(68% 0.12 75)",
                    transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                >
                  <Sprout className="w-4 h-4 text-white" />
                </div>
                <span
                  className="font-sans font-semibold text-base"
                  style={{ color: "oklch(97% 0.012 85)" }}
                >
                  {SITE_CONFIG.name}
                </span>
              </Link>

              <p
                className="body-sm leading-relaxed"
                style={{ color: "oklch(97% 0.012 85 / 0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: "26ch" }}
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
              <p className="label-xs mb-2" style={{ color: "oklch(97% 0.012 85 / 0.35)" }}>
                Pages
              </p>
              {colOne.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="body-sm w-fit"
                  style={{
                    color: "oklch(97% 0.012 85 / 0.55)",
                    transition: "color 150ms cubic-bezier(0.23, 1, 0.32, 1)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "oklch(97% 0.012 85)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "oklch(97% 0.012 85 / 0.55)")}
                >
                  {label}
                </Link>
              ))}
              <a
                href="#"
                className="body-sm w-fit mt-2"
                style={{
                  color: "oklch(68% 0.12 75 / 0.8)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: "color 150ms",
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "oklch(68% 0.12 75)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "oklch(68% 0.12 75 / 0.8)")}
              >
                Parent Login →
              </a>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-4">
              <p className="label-xs mb-2" style={{ color: "oklch(97% 0.012 85 / 0.35)" }}>
                Find us
              </p>

              {[
                {
                  Icon: MapPin,
                  text: `${SITE_CONFIG.estate}, ${SITE_CONFIG.city}, ${SITE_CONFIG.country}`,
                },
                {
                  Icon: Clock,
                  text: SITE_CONFIG.hours,
                },
              ].map(({ Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <Icon
                    className="w-4 h-4 mt-0.5 flex-shrink-0"
                    style={{ color: "oklch(68% 0.12 75)" }}
                  />
                  <span
                    className="body-sm"
                    style={{ color: "oklch(97% 0.012 85 / 0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {text}
                  </span>
                </div>
              ))}

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "oklch(68% 0.12 75)" }} />
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="body-sm"
                  style={{
                    color: "oklch(97% 0.012 85 / 0.55)",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    transition: "color 150ms",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "oklch(97% 0.012 85)")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "oklch(97% 0.012 85 / 0.55)")}
                >
                  +{SITE_CONFIG.phone}
                </a>
              </div>

              <p
                className="body-sm mt-2"
                style={{
                  color: "oklch(97% 0.012 85 / 0.3)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: "0.75rem",
                  lineHeight: 1.6,
                }}
              >
                Licensed by the Ministry of Education & Sports —<br />
                licence displayed at our gate.
              </p>
            </div>
          </div>

          {/* Divider + copyright */}
          <div
            className="mt-16 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderTop: "1px solid oklch(97% 0.012 85 / 0.08)" }}
          >
            <p
              className="label-xs"
              style={{ color: "oklch(97% 0.012 85 / 0.25)", letterSpacing: "0.08em" }}
            >
              © {new Date().getFullYear()} {SITE_CONFIG.name} Child Development Network
            </p>
            <p
              className="label-xs"
              style={{ color: "oklch(97% 0.012 85 / 0.2)", letterSpacing: "0.08em" }}
            >
              {SITE_CONFIG.estate} · {SITE_CONFIG.city} · Uganda
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
