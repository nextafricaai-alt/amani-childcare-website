"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { X, Menu, Sprout, ArrowUpRight } from "lucide-react";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

const links = [
  { href: "/", label: "Home" },
  { href: "/our-promise", label: "Our Promise" },
  { href: "/gallery", label: "Gallery" },
  { href: "/fees", label: "Fees" },
  { href: "/visit", label: "Visit Us" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* ── Floating pill nav ─────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4"
        style={{ pointerEvents: "none" }}
      >
        <nav
          className="navbar-pill flex items-center gap-1 px-3 py-2 w-full max-w-4xl"
          style={{
            pointerEvents: "auto",
            transition: "box-shadow 300ms cubic-bezier(0.23, 1, 0.32, 1)",
            boxShadow: scrolled
              ? "0 2px 40px oklch(18% 0.02 95 / 0.1), 0 1px 3px oklch(18% 0.02 95 / 0.06), inset 0 1px 0 oklch(99% 0 0 / 0.8)"
              : "0 1px 3px oklch(18% 0.02 95 / 0.04), inset 0 1px 0 oklch(99% 0 0 / 0.8)",
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-full group flex-shrink-0 whitespace-nowrap"
            style={{ transition: "background 200ms cubic-bezier(0.23, 1, 0.32, 1)" }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "oklch(22% 0.06 155)",
                transition: "transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <Sprout className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="font-sans font-semibold text-sm whitespace-nowrap"
              style={{ color: "oklch(22% 0.06 155)" }}
            >
              {SITE_CONFIG.name}
            </span>
          </Link>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="px-3.5 py-2 rounded-full font-sans text-sm font-medium whitespace-nowrap transition-colors duration-150"
                style={{
                  color: "oklch(30% 0.015 90)",
                  transition: "background 160ms cubic-bezier(0.23, 1, 0.32, 1), color 160ms",
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLElement).style.background = "oklch(22% 0.06 155 / 0.07)";
                  (e.target as HTMLElement).style.color = "oklch(22% 0.06 155)";
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLElement).style.background = "transparent";
                  (e.target as HTMLElement).style.color = "oklch(30% 0.015 90)";
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <a
            href={getWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold hidden md:inline-flex ml-1 !py-2 whitespace-nowrap flex-shrink-0"
            style={{ fontSize: "0.8125rem" }}
          >
            Book a Visit
            <span className="btn-arrow !w-6 !h-6">
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </a>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-full ml-1"
            style={{
              background: open ? "oklch(22% 0.06 155 / 0.08)" : "transparent",
              color: "oklch(22% 0.06 155)",
              transition: "background 200ms cubic-bezier(0.23, 1, 0.32, 1)",
              border: "none",
              cursor: "pointer",
            }}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {/* Morphing hamburger → X */}
            <span className="relative w-4 h-3 flex flex-col justify-between">
              <span
                className="block h-px rounded-full"
                style={{
                  background: "oklch(22% 0.06 155)",
                  transformOrigin: "center",
                  transition: "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
                  transform: open ? "translateY(6px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-px rounded-full"
                style={{
                  background: "oklch(22% 0.06 155)",
                  transition: "opacity 200ms, transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
                  opacity: open ? 0 : 1,
                }}
              />
              <span
                className="block h-px rounded-full"
                style={{
                  background: "oklch(22% 0.06 155)",
                  transformOrigin: "center",
                  transition: "transform 300ms cubic-bezier(0.32, 0.72, 0, 1)",
                  transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
                }}
              />
            </span>
          </button>
        </nav>
      </header>

      {/* ── Mobile overlay — full screen glass expansion ── */}
      <div
        className="fixed inset-0 z-40 md:hidden flex flex-col"
        style={{
          background: "oklch(97% 0.012 85 / 0.95)",
          backdropFilter: "blur(32px) saturate(1.4)",
          WebkitBackdropFilter: "blur(32px) saturate(1.4)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 350ms cubic-bezier(0.32, 0.72, 0, 1)",
        }}
        aria-hidden={!open}
      >
        <div className="flex-1 flex flex-col justify-center items-start px-8 gap-2 mt-20">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="font-display font-light text-5xl"
              style={{
                color: "oklch(22% 0.06 155)",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(16px)",
                transition: `opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) ${(i + 1) * 80}ms, transform 500ms cubic-bezier(0.23, 1, 0.32, 1) ${(i + 1) * 80}ms`,
                lineHeight: 1.1,
              }}
            >
              {l.label}
            </Link>
          ))}

          <div
            className="mt-8"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 400ms cubic-bezier(0.23, 1, 0.32, 1) 400ms, transform 500ms cubic-bezier(0.23, 1, 0.32, 1) 400ms",
            }}
          >
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold"
              onClick={() => setOpen(false)}
            >
              Book a Visit
              <span className="btn-arrow">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </a>
          </div>
        </div>

        {/* Subtle brand mark at bottom */}
        <div className="px-8 pb-10" style={{ opacity: 0.3 }}>
          <span className="label-xs" style={{ color: "oklch(22% 0.06 155)" }}>
            {SITE_CONFIG.name} · {SITE_CONFIG.estate} · {SITE_CONFIG.city}
          </span>
        </div>
      </div>
    </>
  );
}
