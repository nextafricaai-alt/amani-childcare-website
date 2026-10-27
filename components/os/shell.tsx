"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, Baby, Building2, Inbox, LayoutDashboard, LogOut, MessageCircle, MoreHorizontal,
  QrCode, ShieldCheck, Sun, Users, Wallet, LineChart, RotateCcw,
} from "lucide-react";
import { useOs, primaryRole, homeFor, useData } from "@/lib/os/context";
import { ROLE_LABEL, type Role } from "@/lib/os/types";
import Wordmark from "@/components/ui/wordmark";
import { Sheet, Loading } from "./ui";
import { cn } from "@/lib/utils";

interface NavItem { href: string; label: string; icon: React.ReactNode }

function navFor(role: Role | null, branchParam: string | null, inBranch: boolean): NavItem[] {
  const q = branchParam ? `?b=${branchParam}` : "";
  const branchNav: NavItem[] = [
    { href: `/app/branch${q}`, label: "Today", icon: <Sun className="w-5 h-5" /> },
    { href: `/app/branch/children${q}`, label: "Children", icon: <Baby className="w-5 h-5" /> },
    { href: `/app/branch/safety${q}`, label: "Safety", icon: <ShieldCheck className="w-5 h-5" /> },
    { href: `/app/messages${q}`, label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
  ];
  const managerExtra: NavItem[] = [
    { href: `/app/branch/fees${q}`, label: "Fees", icon: <Wallet className="w-5 h-5" /> },
    { href: `/app/branch/team${q}`, label: "Team & families", icon: <Users className="w-5 h-5" /> },
    { href: `/app/branch/enquiries${q}`, label: "Enquiries", icon: <Inbox className="w-5 h-5" /> },
  ];
  switch (role) {
    case "director":
      if (inBranch) return [...branchNav, ...managerExtra];
      return [
        { href: "/app/director", label: "Network", icon: <LayoutDashboard className="w-5 h-5" /> },
        { href: "/app/director/branches", label: "Branches", icon: <Building2 className="w-5 h-5" /> },
        { href: "/app/director/safety", label: "Safety", icon: <ShieldCheck className="w-5 h-5" /> },
        { href: "/app/messages", label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
        { href: "/app/director/people", label: "People", icon: <Users className="w-5 h-5" /> },
        { href: "/app/director/enquiries", label: "Enquiries", icon: <Inbox className="w-5 h-5" /> },
      ];
    case "manager": return [...branchNav, ...managerExtra];
    case "staff": return branchNav;
    case "parent": return [
      { href: "/app/parent", label: "Today", icon: <Sun className="w-5 h-5" /> },
      { href: "/app/parent/pickup", label: "Pickup", icon: <QrCode className="w-5 h-5" /> },
      { href: "/app/parent/fees", label: "Fees", icon: <Wallet className="w-5 h-5" /> },
      { href: "/app/messages", label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
    ];
    case "investor": return [
      { href: "/app/investor", label: "Overview", icon: <LineChart className="w-5 h-5" /> },
      { href: "/app/messages", label: "Messages", icon: <MessageCircle className="w-5 h-5" /> },
    ];
    default: return [];
  }
}

function isActive(pathname: string, href: string) {
  const path = href.split("?")[0];
  const p = pathname.replace(/\/$/, "").replace(/\.html$/, "");
  if (path === "/app/branch" || path === "/app/director" || path === "/app/parent") return p === path;
  return p === path || p.startsWith(path + "/");
}

export default function OsShell({ children }: { children: React.ReactNode }) {
  const { api, user, ready } = useOs();
  const pathname = usePathname() || "/app";
  const router = useRouter();
  const role = primaryRole(user);
  const [branchParam, setBranchParam] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => { setBranchParam(new URLSearchParams(window.location.search).get("b")); }, [pathname]);

  const isLogin = pathname.replace(/\/$/, "") === "/app";
  const inBranch = pathname.startsWith("/app/branch") || (pathname.startsWith("/app/messages") && !!branchParam);
  const nav = useMemo(() => navFor(role, branchParam, inBranch && role === "director"), [role, branchParam, inBranch]);

  const { data: branches } = useData((a) => a.listBranches(), []);
  const branchName = useMemo(() => {
    if (!branches) return null;
    if (role === "director" && inBranch) return branches.find((b) => b.id === branchParam)?.name ?? null;
    if (role === "manager" || role === "staff" || role === "parent") {
      const id = user?.memberships.find((m) => m.branch_id)?.branch_id;
      return branches.find((b) => b.id === id)?.name ?? null;
    }
    return role === "investor" ? "Network overview" : "All branches";
  }, [branches, role, inBranch, branchParam, user]);

  // Gate: unauthenticated users can only see the sign-in page.
  useEffect(() => {
    if (!ready) return;
    if (!user && !isLogin) router.replace("/app");
  }, [ready, user, isLogin, router]);

  if (!ready) return <div className="os-root grid place-items-center"><Loading label="Opening Pikadon OS" /></div>;
  if (isLogin || !user) return <div className="os-root">{children}</div>;

  if (!role) {
    return (
      <div className="os-root grid place-items-center p-6">
        <div className="os-card max-w-md text-center">
          <img src="/brand/pikadon-icon.svg" alt="" className="h-14 mx-auto mb-4" />
          <h1 className="os-title text-2xl mb-2">You're signed in, but not invited yet</h1>
          <p className="text-[var(--ink-muted)] mb-5">Your branch manager (or the Pikadon director) needs to invite <strong>{user.email}</strong>. Once they do, sign in again and your space appears.</p>
          <button className="os-btn os-btn--secondary os-btn--md" onClick={() => api.signOut().then(() => router.replace("/app"))}>Sign out</button>
        </div>
      </div>
    );
  }

  const primary = nav.slice(0, 4);
  const overflow = nav.slice(4);
  const signOut = async () => { await api.signOut(); router.replace("/app"); };

  return (
    <div className="os-root lg:pl-[272px]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-[272px] flex-col bg-[var(--plum-900)] text-[var(--cream)] px-4 py-5">
        <Link href={homeFor(role)} className="flex items-center gap-2.5 px-2 mb-6">
          <img src="/brand/pikadon-icon.svg" alt="" className="h-9 w-auto" />
          <div>
            <Wordmark className="h-[15px] w-auto" color="var(--cream)" />
            <p className="text-[11px] font-bold tracking-[0.18em] text-[var(--sun)] mt-1">OS</p>
          </div>
        </Link>

        {role === "director" && inBranch && (
          <Link href="/app/director/branches" className="os-nav-link mb-2 !text-[var(--sun)]"><ArrowLeft className="w-4 h-4" /> All branches</Link>
        )}
        {branchName && (
          <div className="px-3 py-2.5 mb-4 rounded-2xl bg-[rgba(255,249,242,0.06)]">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[rgba(255,249,242,0.5)] font-bold">{role === "director" && !inBranch ? "Viewing" : "Branch"}</p>
            <p className="font-semibold text-[15px] leading-snug">{branchName}</p>
          </div>
        )}

        <nav className="flex flex-col gap-1" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={cn("os-nav-link", isActive(pathname, n.href) && "is-active")}>
              {n.icon}{n.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-[rgba(255,249,242,0.1)]">
          <p className="px-2 text-[14px] font-semibold truncate">{user.name}</p>
          <p className="px-2 text-[12px] text-[var(--sun)] mb-3">{ROLE_LABEL[role]}{api.mode === "demo" ? " · demo" : ""}</p>
          <button onClick={signOut} className="os-nav-link w-full"><LogOut className="w-4 h-4" /> {api.mode === "demo" ? "Switch person" : "Sign out"}</button>
          {api.mode === "demo" && api.resetDemo && (
            <button onClick={() => api.resetDemo!()} className="os-nav-link w-full text-[13px]"><RotateCcw className="w-4 h-4" /> Reset demo data</button>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[var(--plum-900)] text-[var(--cream)] px-4 py-3 flex items-center gap-3">
        {role === "director" && inBranch ? (
          <Link href="/app/director/branches" aria-label="All branches" className="w-9 h-9 grid place-items-center rounded-full bg-[rgba(255,249,242,0.08)]"><ArrowLeft className="w-4 h-4" /></Link>
        ) : (
          <img src="/brand/pikadon-icon.svg" alt="" className="h-8 w-auto" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-[15px] leading-tight truncate">{branchName ?? "Pikadon OS"}</p>
          <p className="text-[11.5px] text-[var(--sun)] truncate">{user.name} · {ROLE_LABEL[role]}</p>
        </div>
        <button onClick={signOut} aria-label="Sign out" className="w-10 h-10 grid place-items-center rounded-full bg-[rgba(255,249,242,0.08)]"><LogOut className="w-4 h-4" /></button>
      </header>

      {api.mode === "demo" && (
        <div className="bg-[var(--sun-100)] text-[#6B4500] text-[12.5px] font-semibold px-4 py-1.5 text-center">
          Demo mode — sample data only. Open another tab as a different person to see updates arrive live.
        </div>
      )}

      <main className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 pb-28 lg:pb-12 max-w-[1240px]">{children}</main>

      {/* Mobile tab bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--cream-raised)] border-t border-[var(--rule)] flex px-1 pb-[env(safe-area-inset-bottom)]" aria-label="Main">
        {primary.map((n) => (
          <Link key={n.href} href={n.href} className={cn("os-tab-link", isActive(pathname, n.href) && "is-active")}>{n.icon}{n.label}</Link>
        ))}
        {overflow.length > 0 && (
          <button className={cn("os-tab-link", overflow.some((n) => isActive(pathname, n.href)) && "is-active")} onClick={() => setMoreOpen(true)}>
            <MoreHorizontal className="w-5 h-5" />More
          </button>
        )}
      </nav>
      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title="More">
        <div className="flex flex-col gap-1">
          {overflow.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-[var(--plum-50)] font-semibold text-[var(--plum-900)]">
              {n.icon}{n.label}
            </Link>
          ))}
          {api.mode === "demo" && api.resetDemo && (
            <button onClick={() => { api.resetDemo!(); setMoreOpen(false); }} className="flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-[var(--plum-50)] font-semibold text-[var(--plum-900)]">
              <RotateCcw className="w-5 h-5" />Reset demo data
            </button>
          )}
        </div>
      </Sheet>
    </div>
  );
}

