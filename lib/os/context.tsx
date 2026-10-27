"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { OsApi } from "./api";
import type { Role, SessionUser } from "./types";
import { DemoApi } from "./demo";
import { SupabaseApi, supabaseClient } from "./supabase";

interface OsContextValue {
  api: OsApi;
  user: SessionUser | null;
  ready: boolean;
  version: number;
  setUser: (u: SessionUser | null) => void;
}

const OsContext = createContext<OsContextValue | null>(null);

function pickApi(): OsApi {
  const forceDemo = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("demo");
  const sb = supabaseClient();
  return sb && !forceDemo ? new SupabaseApi(sb) : new DemoApi();
}

export function OsProvider({ children }: { children: React.ReactNode }) {
  const [api, setApi] = useState<OsApi | null>(null);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const a = pickApi();
    setApi(a);
    a.getSession().then((u) => { setUser(u); setReady(true); }).catch(() => setReady(true));
    const off = a.subscribe(() => {
      setVersion((v) => v + 1);
      a.getSession().then(setUser).catch(() => undefined);
    });
    return off;
  }, []);

  const value = useMemo(() => (api ? { api, user, ready, version, setUser } : null), [api, user, ready, version]);
  if (!value) return null;
  return <OsContext.Provider value={value}>{children}</OsContext.Provider>;
}

export function useOs() {
  const ctx = useContext(OsContext);
  if (!ctx) throw new Error("useOs must be used inside OsProvider");
  return ctx;
}

// Load data and reload whenever anything changes (other tabs, other users).
export function useData<T>(load: (api: OsApi) => Promise<T>, deps: unknown[] = []) {
  const { api, version, user } = useOs();
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    if (!user) return;
    let live = true;
    loadRef.current(api)
      .then((d) => { if (live) { setData(d); setError(null); } })
      .catch((e: Error) => { if (live) setError(e.message); });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, version, tick, user?.id, ...deps]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, error, loading: data === undefined && !error, reload };
}

// Run an action, surface its error, and report success.
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | undefined> => {
    setBusy(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      setError((e as Error).message);
      return undefined;
    } finally {
      setBusy(false);
    }
  }, []);
  return { run, busy, error, setError };
}

const ROLE_ORDER: Role[] = ["director", "manager", "staff", "investor", "parent"];

export function primaryRole(user: SessionUser | null): Role | null {
  if (!user || !user.memberships.length) return null;
  return ROLE_ORDER.find((r) => user.memberships.some((m) => m.role === r)) ?? null;
}

export function homeFor(role: Role | null): string {
  switch (role) {
    case "director": return "/app/director";
    case "manager":
    case "staff": return "/app/branch";
    case "parent": return "/app/parent";
    case "investor": return "/app/investor";
    default: return "/app";
  }
}

// Which branch the branch screens act on: ?b= for the director,
// otherwise the user's own branch.
export function useBranchId(): string | null {
  const { user } = useOs();
  const [fromUrl, setFromUrl] = useState<string | null>(null);
  useEffect(() => {
    setFromUrl(new URLSearchParams(window.location.search).get("b"));
  }, []);
  if (!user) return null;
  const isDirector = user.memberships.some((m) => m.role === "director");
  if (isDirector) return fromUrl;
  const own = user.memberships.find((m) => (m.role === "manager" || m.role === "staff") && m.branch_id);
  return own?.branch_id ?? null;
}

export function branchRole(user: SessionUser | null, branchId: string | null): Role | null {
  if (!user) return null;
  if (user.memberships.some((m) => m.role === "director")) return "director";
  const m = user.memberships.find((x) => x.branch_id === branchId && (x.role === "manager" || x.role === "staff"));
  return m?.role ?? null;
}
