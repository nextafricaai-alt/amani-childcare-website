"use client";

import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

// ─── formatting ─────────────────────────────────────────────────────────
export const ugx = (n: number) => `UGX ${Math.round(n).toLocaleString("en-UG")}`;
export const shortUgx = (n: number) =>
  n >= 1_000_000 ? `UGX ${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1)}M` : n >= 1000 ? `UGX ${Math.round(n / 1000)}k` : `UGX ${n}`;
export const time = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—";
export const dateLabel = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
export const minutesSince = (iso: string) => Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
export function age(dob: string | null) {
  if (!dob) return "";
  const months = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  return months < 24 ? `${months} months` : `${Math.floor(months / 12)} yrs ${months % 12 ? `${months % 12} mo` : ""}`.trim();
}
export const fullName = (c: { first_name: string; last_name: string }) => `${c.first_name} ${c.last_name}`;

// ─── layout ─────────────────────────────────────────────────────────────
export function PageHeader({ eyebrow, title, sub, actions }: { eyebrow?: string; title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-6">
      <div>
        {eyebrow && <p className="os-eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="os-title">{title}</h1>
        {sub && <p className="text-[15px] text-[var(--ink-muted)] mt-1.5 max-w-2xl">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ className, children, tone }: { className?: string; children: React.ReactNode; tone?: "plain" | "sun" | "plum" | "alert" }) {
  return <div className={cn("os-card", tone && `os-card--${tone}`, className)}>{children}</div>;
}

export function CardHead({ title, sub, right, icon }: { title: string; sub?: React.ReactNode; right?: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-2.5 min-w-0">
        {icon && <span className="mt-0.5 text-[var(--orange-600)] shrink-0">{icon}</span>}
        <div className="min-w-0">
          <h2 className="font-[var(--font-heading)] font-semibold text-[17px] leading-tight text-[var(--plum-900)]">{title}</h2>
          {sub && <p className="text-[13px] text-[var(--ink-muted)] mt-0.5">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "plain", icon }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: "plain" | "ok" | "warn" | "alert"; icon?: React.ReactNode }) {
  return (
    <div className={cn("os-stat", `os-stat--${tone}`)}>
      <div className="flex items-center justify-between gap-2">
        <span className="os-stat-label">{label}</span>
        {icon && <span className="opacity-70">{icon}</span>}
      </div>
      <div className="os-stat-value">{value}</div>
      {sub && <div className="text-[12.5px] text-[var(--ink-muted)] mt-1">{sub}</div>}
    </div>
  );
}

export function Chip({ children, tone = "plum", className }: { children: React.ReactNode; tone?: "plum" | "orange" | "sun" | "ok" | "alert" | "muted"; className?: string }) {
  return <span className={cn("os-chip", `os-chip--${tone}`, className)}>{children}</span>;
}

export function Button({ children, variant = "primary", size = "md", className, ...rest }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" | "plum"; size?: "sm" | "md" | "lg" }) {
  return (
    <button {...rest} className={cn("os-btn", `os-btn--${variant}`, `os-btn--${size}`, className)}>
      {children}
    </button>
  );
}

export function Empty({ icon, title, sub }: { icon?: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      {icon && <div className="w-12 h-12 rounded-2xl bg-[var(--sun-50)] text-[var(--orange-600)] grid place-items-center mb-3">{icon}</div>}
      <p className="font-semibold text-[var(--plum-900)]">{title}</p>
      {sub && <p className="text-sm text-[var(--ink-muted)] mt-1 max-w-sm">{sub}</p>}
    </div>
  );
}

export function Avatar({ name, size = 40, tone }: { name: string; size?: number; tone?: number }) {
  const palette = ["#FDEBAE", "#FBDCCF", "#EEDCE7", "#FFF7DE", "#FEF0E9"];
  const ink = ["#7A4A00", "#B83F17", "#802C5E", "#7A4A00", "#B83F17"];
  const i = tone ?? [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % palette.length;
  const initials = name.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w)).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";
  return (
    <span aria-hidden className="grid place-items-center rounded-full font-semibold shrink-0 font-[var(--font-heading)]"
      style={{ width: size, height: size, background: palette[i], color: ink[i], fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}

export function ErrorNote({ error }: { error: string | null | undefined }) {
  if (!error) return null;
  return <p role="alert" className="text-sm rounded-xl px-3 py-2 bg-[var(--alert-50)] text-[var(--alert)] border border-[var(--alert-100)]">{error}</p>;
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-[var(--ink-muted)] py-10 justify-center" aria-live="polite">
      <span className="os-spinner" /> {label}…
    </div>
  );
}

// ─── forms ──────────────────────────────────────────────────────────────
// `group` renders a fieldset-style block for chip/button pickers — a
// <label> must only wrap a single form control.
export function Field({ label, hint, children, className, group }: { label: string; hint?: string; children: React.ReactNode; className?: string; group?: boolean }) {
  if (group) {
    return (
      <div role="group" aria-label={label || undefined} className={cn("flex flex-col gap-1.5", className)}>
        {label && <span className="text-[13px] font-semibold text-[var(--plum-900)]">{label}</span>}
        {children}
        {hint && <span className="text-[12px] text-[var(--ink-muted)]">{hint}</span>}
      </div>
    );
  }
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[13px] font-semibold text-[var(--plum-900)]">{label}</span>
      {children}
      {hint && <span className="text-[12px] text-[var(--ink-muted)]">{hint}</span>}
    </label>
  );
}

export const inputCls = "os-input";

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="os-segmented" role="tablist">
      {options.map((o) => (
        <button key={o.value} type="button" role="tab" aria-selected={value === o.value}
          className={cn("os-segmented-item", value === o.value && "is-active")} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// Bottom sheet on phones, centred dialog on larger screens.
export function Sheet({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-[rgba(44,19,36,0.55)] backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn("relative w-full bg-[var(--cream-raised)] rounded-t-[28px] sm:rounded-[28px] shadow-2xl max-h-[92vh] overflow-y-auto os-sheet-in",
        wide ? "sm:max-w-2xl" : "sm:max-w-lg")}>
        <div className="sticky top-0 bg-[var(--cream-raised)] z-10 flex items-center justify-between px-5 sm:px-6 pt-5 pb-3 border-b border-[var(--rule)]">
          <h2 className="font-[var(--font-heading)] font-semibold text-lg text-[var(--plum-900)]">{title}</h2>
          <button onClick={onClose} className="w-10 h-10 grid place-items-center rounded-full hover:bg-[var(--plum-50)]" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-5 sm:px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
