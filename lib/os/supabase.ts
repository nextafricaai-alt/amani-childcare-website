// Live mode: the same OsApi backed by the Pikadon Supabase project.
// Permissions are enforced by the database (RLS + RPC checks); this file
// only shapes queries.
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { OsApi, today } from "./api";
import type {
  Absence, Attendance, AuthorizedPickup, Branch, BranchSummary, CheckoutBy, CheckoutResult, Child,
  DailyLog, Enquiry, Guardian, Incident, Invite, Invoice, LocationRequest, Membership, Message,
  NewBranchInput, NewChildInput, Role, RollCall, Room, SessionUser, SleepCheck, StaffShift,
  TeamMember, Thread, Visitor,
} from "./types";

function dayBounds(day = today()) {
  const start = new Date(`${day}T00:00:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return [start.toISOString(), end.toISOString()] as const;
}

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? ([] as unknown)) as T;
}

const LIVE_URL = "https://eztgwiujujaxswlslqbf.supabase.co";
const LIVE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6dGd3aXVqdWpheHN3bHNscWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNzE5NjEsImV4cCI6MjA5ODc0Nzk2MX0.mzyC4DLlC-s3YznfQLTfNxa227_hQlLAt0VhL_dGxr0";

let client: SupabaseClient | null = null;
export function supabaseClient(): SupabaseClient | null {
  // Public project address + browser key (safe to ship: the database's row
  // security decides what each person sees). Env vars override them; set
  // NEXT_PUBLIC_SUPABASE_URL=demo to build the sample-data version.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || LIVE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || LIVE_KEY;
  if (url === "demo") return null;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } });
  return client;
}

export class SupabaseApi implements OsApi {
  readonly mode = "live" as const;
  constructor(private sb: SupabaseClient) {}

  // ── session ───────────────────────────────────────────────────────
  private async loadUser(): Promise<SessionUser | null> {
    const { data } = await this.sb.auth.getUser();
    const u = data.user;
    if (!u) return null;
    const memberships = must<Membership[]>(await this.sb.from("memberships").select("*").eq("user_id", u.id).eq("active", true));
    const { data: profile } = await this.sb.from("profiles").select("full_name").eq("id", u.id).maybeSingle();
    return { id: u.id, email: u.email ?? "", name: profile?.full_name || u.email || "Pikadon user", memberships };
  }
  async getSession() {
    const { data } = await this.sb.auth.getSession();
    if (!data.session) return null;
    return this.loadUser();
  }
  async sendCode(email: string) {
    const { error } = await this.sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw new Error(error.message);
  }
  async verifyCode(email: string, code: string) {
    const { error } = await this.sb.auth.verifyOtp({ email, token: code.trim(), type: "email" });
    if (error) throw new Error(error.message);
    // Turn any invites for this verified email into roles.
    await this.sb.rpc("accept_invites");
    const user = await this.loadUser();
    if (!user) throw new Error("Could not load your account");
    return user;
  }
  async signOut() { await this.sb.auth.signOut(); }

  // ── branches ──────────────────────────────────────────────────────
  async listBranches() { return must<Branch[]>(await this.sb.from("branches").select("*").order("created_at")); }
  async addBranch(i: NewBranchInput) {
    return must<string>(await this.sb.rpc("add_branch", {
      p_name: i.name, p_area: i.area, p_address: i.address || null, p_phone: i.phone || null,
      p_capacity: i.capacity, p_opens: i.opens_at, p_closes: i.closes_at, p_status: i.status,
      p_rooms: i.rooms.filter((r) => r.name.trim()), p_manager_email: i.manager_email || null, p_manager_name: i.manager_name || null,
    }));
  }
  async updateBranch(id: string, patch: Partial<Branch>) {
    const extra = patch.status === "open" ? { opened_on: today() } : {};
    must(await this.sb.from("branches").update({ ...patch, ...extra }).eq("id", id));
  }
  async listRooms(branchId?: string) {
    let q = this.sb.from("rooms").select("*").order("name");
    if (branchId) q = q.eq("branch_id", branchId);
    return must<Room[]>(await q);
  }
  async addRoom(room: Omit<Room, "id">) { must(await this.sb.from("rooms").insert(room)); }
  async networkSummary() {
    const rows = must<BranchSummary[]>(await this.sb.rpc("network_summary"));
    return rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v])) as unknown as BranchSummary);
  }

  // ── people ────────────────────────────────────────────────────────
  async listTeam(branchId?: string) {
    let q = this.sb.from("memberships").select("id, user_id, role, branch_id, active");
    if (branchId) q = q.eq("branch_id", branchId);
    const rows = must<Membership[]>(await q);
    const ids = Array.from(new Set(rows.map((r) => r.user_id)));
    const profiles = ids.length ? must<{ id: string; full_name: string | null }[]>(await this.sb.from("profiles").select("id, full_name").in("id", ids)) : [];
    return rows.map<TeamMember>((r) => ({
      user_id: r.user_id, membership_id: r.id, role: r.role, branch_id: r.branch_id, active: r.active, email: null,
      name: profiles.find((p) => p.id === r.user_id)?.full_name ?? "Team member",
    }));
  }
  async setMemberActive(membershipId: string, active: boolean) { must(await this.sb.from("memberships").update({ active }).eq("id", membershipId)); }
  async listInvites(branchId?: string) {
    let q = this.sb.from("invites").select("*").is("accepted_at", null).order("created_at", { ascending: false });
    if (branchId) q = q.eq("branch_id", branchId);
    return must<Invite[]>(await q);
  }
  async createInvite(i: { email: string; role: Role; branch_id: string | null; child_id?: string | null; full_name: string; relationship?: string }) {
    const { data: u } = await this.sb.auth.getUser();
    must(await this.sb.from("invites").insert({ ...i, child_id: i.child_id ?? null, invited_by: u.user?.id }));
  }
  async deleteInvite(id: string) { must(await this.sb.from("invites").delete().eq("id", id)); }

  // ── children ──────────────────────────────────────────────────────
  async listChildren(branchId?: string) {
    let q = this.sb.from("children").select("*").order("first_name");
    if (branchId) q = q.eq("branch_id", branchId);
    return must<Child[]>(await q);
  }
  async addChild(i: NewChildInput) {
    const child = must<Child>(await this.sb.from("children").insert({
      branch_id: i.branch_id, room_id: i.room_id, first_name: i.first_name, last_name: i.last_name,
      date_of_birth: i.date_of_birth, allergies: i.allergies || null, medical_notes: i.medical_notes || null,
      dietary_notes: i.dietary_notes || null, care_plan: i.care_plan,
    }).select().single());
    must(await this.sb.from("guardians").insert({ child_id: child.id, full_name: i.guardian_name, relationship: i.guardian_relationship,
      phone: i.guardian_phone || null, email: i.guardian_email || null, is_primary: true }));
    if (i.guardian_email) {
      await this.createInvite({ email: i.guardian_email, role: "parent", branch_id: i.branch_id, child_id: child.id,
        full_name: i.guardian_name, relationship: i.guardian_relationship });
    }
    return child.id;
  }
  async updateChild(id: string, patch: Partial<Child>) { must(await this.sb.from("children").update(patch).eq("id", id)); }
  async listGuardians(childId: string) { return must<Guardian[]>(await this.sb.from("guardians").select("*").eq("child_id", childId)); }
  async listPickups(s: { childId?: string; branchId?: string }) {
    let q = this.sb.from("authorized_pickups").select("*, children!inner(branch_id)").order("created_at");
    if (s.childId) q = q.eq("child_id", s.childId);
    if (s.branchId) q = q.eq("children.branch_id", s.branchId);
    return must<AuthorizedPickup[]>(await q);
  }
  async requestPickup(childId: string, i: { full_name: string; relationship: string; phone: string; id_note: string }) {
    const { data: u } = await this.sb.auth.getUser();
    must(await this.sb.from("authorized_pickups").insert({ child_id: childId, ...i, phone: i.phone || null, id_note: i.id_note || null, status: "pending", requested_by: u.user?.id }));
  }
  async decidePickup(pickupId: string, approve: boolean) { must(await this.sb.rpc("approve_pickup", { p_pickup: pickupId, p_approve: approve })); }
  async revokePickup(pickupId: string) { must(await this.sb.from("authorized_pickups").update({ status: "revoked" }).eq("id", pickupId)); }
  async issuePickupCode(childId: string) { return must<string>(await this.sb.rpc("issue_pickup_code", { p_child: childId })); }

  // ── the day ───────────────────────────────────────────────────────
  async listAttendance(s: { branchId?: string; childId?: string; day?: string }) {
    let q = this.sb.from("attendance").select("*").order("checked_in_at");
    if (s.branchId) q = q.eq("branch_id", s.branchId);
    if (s.childId) q = q.eq("child_id", s.childId);
    if (s.day || !s.childId) q = q.eq("day", s.day ?? today());
    return must<Attendance[]>(await q);
  }
  async checkIn(childId: string, droppedBy: string) { must(await this.sb.rpc("check_in", { p_child: childId, p_dropped_by: droppedBy || null })); }
  async checkOut(childId: string, by: CheckoutBy) {
    return must<CheckoutResult>(await this.sb.rpc("check_out", {
      p_child: childId,
      p_guardian: by.kind === "guardian" ? by.guardianId : null,
      p_pickup: by.kind === "pickup" ? by.pickupId : null,
      p_name: by.kind === "code" || by.kind === "unlisted" ? by.name : null,
      p_code: by.kind === "code" ? by.code : null,
    }));
  }
  async moveRoom(attendanceId: string, roomId: string) { must(await this.sb.from("attendance").update({ room_id: roomId }).eq("id", attendanceId)); }
  async listShifts(branchId: string) {
    const [from, to] = dayBounds();
    const rows = must<StaffShift[]>(await this.sb.from("staff_shifts").select("*").eq("branch_id", branchId).gte("clocked_in_at", from).lt("clocked_in_at", to));
    const team = await this.listTeam(branchId);
    return rows.map((r) => ({ ...r, staff_name: team.find((t) => t.user_id === r.user_id)?.name ?? "Caregiver" }));
  }
  async clockIn(branchId: string, roomId: string | null) {
    const { data: u } = await this.sb.auth.getUser();
    must(await this.sb.from("staff_shifts").insert({ user_id: u.user?.id, branch_id: branchId, room_id: roomId }));
  }
  async clockOut(shiftId: string) { must(await this.sb.from("staff_shifts").update({ clocked_out_at: new Date().toISOString() }).eq("id", shiftId)); }
  async listLogs(s: { branchId?: string; childId?: string; day?: string }) {
    const [from, to] = dayBounds(s.day);
    let q = this.sb.from("daily_logs").select("*").gte("logged_at", from).lt("logged_at", to).order("logged_at");
    if (s.branchId) q = q.eq("branch_id", s.branchId);
    if (s.childId) q = q.eq("child_id", s.childId);
    return must<DailyLog[]>(await q);
  }
  async addLog(i: { child_id: string; kind: DailyLog["kind"]; detail: string; visible_to_parent: boolean }) {
    const { data: u } = await this.sb.auth.getUser();
    const child = must<{ branch_id: string }>(await this.sb.from("children").select("branch_id").eq("id", i.child_id).single());
    must(await this.sb.from("daily_logs").insert({ ...i, branch_id: child.branch_id, logged_by: u.user?.id }));
  }

  // ── safety ────────────────────────────────────────────────────────
  async listSleepChecks(s: { branchId?: string; childId?: string; day?: string }) {
    const [from, to] = dayBounds(s.day);
    let q = this.sb.from("sleep_checks").select("*").gte("checked_at", from).lt("checked_at", to).order("checked_at", { ascending: false });
    if (s.branchId) q = q.eq("branch_id", s.branchId);
    if (s.childId) q = q.eq("child_id", s.childId);
    return must<SleepCheck[]>(await q);
  }
  async addSleepCheck(i: { child_id: string; position: SleepCheck["position"]; breathing_ok: boolean; note: string }) {
    const { data: u } = await this.sb.auth.getUser();
    const child = must<{ branch_id: string }>(await this.sb.from("children").select("branch_id").eq("id", i.child_id).single());
    must(await this.sb.from("sleep_checks").insert({ ...i, note: i.note || null, branch_id: child.branch_id, checked_by: u.user?.id }));
    if (!i.breathing_ok || i.position === "front") {
      await this.addIncident({
        branch_id: child.branch_id, child_id: i.child_id, kind: "near_miss", severity: i.breathing_ok ? "minor" : "serious",
        description: i.breathing_ok ? "Found sleeping on front during sleep check; repositioned onto back." : "Breathing concern found during sleep check.",
        action_taken: i.note || "Child repositioned and monitored.", notify_parent: false,
      });
    }
  }
  async listRollCalls(s: { branchId?: string; day?: string }) {
    const [from, to] = dayBounds(s.day);
    let q = this.sb.from("roll_calls").select("*").gte("taken_at", from).lt("taken_at", to).order("taken_at", { ascending: false });
    if (s.branchId) q = q.eq("branch_id", s.branchId);
    return must<RollCall[]>(await q);
  }
  async addRollCall(i: Omit<RollCall, "id" | "taken_at" | "resolved">) {
    const { data: u } = await this.sb.auth.getUser();
    must(await this.sb.from("roll_calls").insert({ ...i, note: i.note || null, taken_by: u.user?.id,
      resolved: i.counted === i.expected && i.missing_ids.length === 0 }));
  }
  async resolveRollCall(id: string, note: string) { must(await this.sb.from("roll_calls").update({ resolved: true, note }).eq("id", id)); }
  async listIncidents(s: { branchId?: string; childId?: string }) {
    let q = this.sb.from("incidents").select("*").order("occurred_at", { ascending: false }).limit(200);
    if (s.branchId) q = q.eq("branch_id", s.branchId);
    if (s.childId) q = q.eq("child_id", s.childId);
    return must<Incident[]>(await q);
  }
  async addIncident(i: Parameters<OsApi["addIncident"]>[0]) {
    const { data: u } = await this.sb.auth.getUser();
    const { notify_parent, ...row } = i;
    must(await this.sb.from("incidents").insert({ ...row, reported_by: u.user?.id,
      parent_notified_at: notify_parent && i.child_id ? new Date().toISOString() : null }));
  }
  async closeIncident(id: string) { must(await this.sb.from("incidents").update({ status: "closed" }).eq("id", id)); }
  async reviewIncident(id: string) { must(await this.sb.from("incidents").update({ director_reviewed_at: new Date().toISOString() }).eq("id", id)); }
  async acknowledgeIncident(id: string) { must(await this.sb.rpc("acknowledge_incident", { p_incident: id })); }
  async listVisitors(branchId: string) {
    const [from, to] = dayBounds();
    return must<Visitor[]>(await this.sb.from("visitors").select("*").eq("branch_id", branchId).gte("signed_in_at", from).lt("signed_in_at", to).order("signed_in_at", { ascending: false }));
  }
  async signInVisitor(i: Omit<Visitor, "id" | "signed_in_at" | "signed_out_at">) {
    const { data: u } = await this.sb.auth.getUser();
    must(await this.sb.from("visitors").insert({ ...i, logged_by: u.user?.id }));
  }
  async signOutVisitor(id: string) { must(await this.sb.from("visitors").update({ signed_out_at: new Date().toISOString() }).eq("id", id)); }
  async listAbsences(s: { branchId?: string; childId?: string }) {
    let q = this.sb.from("absences").select("*").order("day", { ascending: false }).limit(100);
    if (s.branchId) q = q.eq("branch_id", s.branchId);
    if (s.childId) q = q.eq("child_id", s.childId);
    return must<Absence[]>(await q);
  }
  async reportAbsence(i: { child_id: string; day: string; reason: string; source: "parent" | "staff" }) {
    const { data: u } = await this.sb.auth.getUser();
    const child = must<{ branch_id: string }>(await this.sb.from("children").select("branch_id").eq("id", i.child_id).single());
    must(await this.sb.from("absences").insert({ ...i, branch_id: child.branch_id, reported_by: u.user?.id }));
  }
  async followUpAbsence(id: string, outcome: string) {
    must(await this.sb.from("absences").update({ followed_up_at: new Date().toISOString(), outcome }).eq("id", id));
  }

  // ── messages ──────────────────────────────────────────────────────
  async listThreads() { return must<Thread[]>(await this.sb.from("message_threads").select("*").order("last_message_at", { ascending: false })); }
  async listMessages(threadId: string) {
    return must<Message[]>(await this.sb.from("messages").select("*").eq("thread_id", threadId).order("created_at"));
  }
  private async senderRole(t: Pick<Thread, "kind" | "branch_id" | "child_id">): Promise<Role> {
    const me = await this.loadUser();
    const roles = me?.memberships ?? [];
    if (t.kind === "family" && t.child_id) {
      const { data } = await this.sb.from("guardians").select("id").eq("child_id", t.child_id).eq("user_id", me?.id ?? "").maybeSingle();
      if (data) return "parent";
    }
    if (roles.some((m) => m.role === "director")) return "director";
    if (t.kind === "investor") return "investor";
    const here = roles.filter((m) => m.branch_id === t.branch_id).map((m) => m.role);
    return here.includes("manager") ? "manager" : here.includes("staff") ? "staff" : "parent";
  }
  async startThread(i: { kind: Thread["kind"]; branch_id: string | null; child_id: string | null; subject: string; body: string }) {
    const me = await this.loadUser();
    const t = must<Thread>(await this.sb.from("message_threads").insert({
      kind: i.kind, branch_id: i.branch_id, child_id: i.child_id, subject: i.subject, created_by: me?.id,
    }).select().single());
    must(await this.sb.from("messages").insert({ thread_id: t.id, sender_id: me?.id, sender_name: me?.name, sender_role: await this.senderRole(t), body: i.body }));
    return t.id;
  }
  async sendMessage(threadId: string, body: string) {
    const me = await this.loadUser();
    const t = must<Thread>(await this.sb.from("message_threads").select("*").eq("id", threadId).single());
    must(await this.sb.from("messages").insert({ thread_id: threadId, sender_id: me?.id, sender_name: me?.name, sender_role: await this.senderRole(t), body }));
    await this.sb.from("message_threads").update({ last_message_at: new Date().toISOString() }).eq("id", threadId);
  }

  // ── money ─────────────────────────────────────────────────────────
  async listInvoices(s: { branchId?: string; childId?: string }) {
    let q = this.sb.from("invoices").select("*").order("due_on", { ascending: false });
    if (s.branchId) q = q.eq("branch_id", s.branchId);
    if (s.childId) q = q.eq("child_id", s.childId);
    const rows = must<Invoice[]>(await q);
    return rows.map((i) => (i.status === "sent" && i.due_on < today() ? { ...i, status: "overdue" as const } : i));
  }
  async createInvoice(i: Omit<Invoice, "id" | "paid_at" | "method" | "reference" | "status">) { must(await this.sb.from("invoices").insert(i)); }
  async markInvoicePaid(id: string, method: NonNullable<Invoice["method"]>, reference: string) {
    must(await this.sb.from("invoices").update({ status: "paid", paid_at: new Date().toISOString(), method, reference: reference || null }).eq("id", id));
  }

  // ── website ───────────────────────────────────────────────────────
  async listEnquiries(branchId?: string) {
    let q = this.sb.from("enquiries").select("*").order("created_at", { ascending: false });
    if (branchId) q = q.eq("branch_id", branchId);
    return must<Enquiry[]>(await q);
  }
  async updateEnquiry(id: string, patch: Partial<Pick<Enquiry, "status" | "branch_id">>) { must(await this.sb.from("enquiries").update(patch).eq("id", id)); }
  async listLocationRequests() {
    return must<LocationRequest[]>(await this.sb.from("location_requests").select("*").order("created_at", { ascending: false }));
  }

  subscribe(onChange: () => void) {
    let timer: ReturnType<typeof setTimeout> | null = null;
    const bump = () => { if (timer) clearTimeout(timer); timer = setTimeout(onChange, 250); };
    const ch = this.sb.channel(`pikadon-os-${Math.random().toString(36).slice(2)}`);
    for (const table of ["attendance", "daily_logs", "sleep_checks", "incidents", "absences", "messages", "authorized_pickups"]) {
      ch.on("postgres_changes", { event: "*", schema: "public", table }, bump);
    }
    ch.subscribe();
    return () => { if (timer) clearTimeout(timer); this.sb.removeChannel(ch); };
  }
}
