// The single contract every screen talks to. Two implementations:
//   demo.ts      — in-browser sample data (works with no database)
//   supabase.ts  — the live Pikadon Supabase project
import type {
  Absence, Attendance, AuthorizedPickup, Branch, BranchSummary, CheckoutBy, CheckoutResult,
  Child, DailyLog, DayScope, Enquiry, Guardian, Incident, Invite, Invoice, LocationRequest,
  LogKind, Message, NewBranchInput, NewChildInput, Role, RollCall, RollReason, Room,
  SessionUser, SleepCheck, StaffShift, TeamMember, Thread, Visitor,
} from "./types";

export interface DemoPersona {
  id: string;
  name: string;
  role: Role;
  detail: string;
}

export interface OsApi {
  readonly mode: "demo" | "live";

  // ── Session ────────────────────────────────────────────────────────
  getSession(): Promise<SessionUser | null>;
  sendCode(email: string): Promise<void>;
  verifyCode(email: string, code: string): Promise<SessionUser>;
  signOut(): Promise<void>;
  demoPersonas?(): DemoPersona[];
  signInAs?(personaId: string): Promise<SessionUser>;
  resetDemo?(): void;

  // ── Network & branches ─────────────────────────────────────────────
  listBranches(): Promise<Branch[]>;
  addBranch(input: NewBranchInput): Promise<string>;
  updateBranch(id: string, patch: Partial<Pick<Branch, "status" | "capacity" | "phone" | "address" | "opens_at" | "closes_at">>): Promise<void>;
  listRooms(branchId?: string): Promise<Room[]>;
  addRoom(room: Omit<Room, "id">): Promise<void>;
  networkSummary(): Promise<BranchSummary[]>;

  // ── People ─────────────────────────────────────────────────────────
  listTeam(branchId?: string): Promise<TeamMember[]>;
  setMemberActive(membershipId: string, active: boolean): Promise<void>;
  listInvites(branchId?: string): Promise<Invite[]>;
  createInvite(input: { email: string; role: Role; branch_id: string | null; child_id?: string | null; full_name: string; relationship?: string }): Promise<void>;
  deleteInvite(id: string): Promise<void>;

  // ── Children & families ────────────────────────────────────────────
  listChildren(branchId?: string): Promise<Child[]>;
  addChild(input: NewChildInput): Promise<string>;
  updateChild(id: string, patch: Partial<Child>): Promise<void>;
  listGuardians(childId: string): Promise<Guardian[]>;
  listPickups(scope: { childId?: string; branchId?: string }): Promise<AuthorizedPickup[]>;
  requestPickup(childId: string, input: { full_name: string; relationship: string; phone: string; id_note: string }): Promise<void>;
  decidePickup(pickupId: string, approve: boolean): Promise<void>;
  revokePickup(pickupId: string): Promise<void>;
  issuePickupCode(childId: string): Promise<string>;

  // ── The day ────────────────────────────────────────────────────────
  listAttendance(scope: DayScope): Promise<Attendance[]>;
  checkIn(childId: string, droppedBy: string): Promise<void>;
  checkOut(childId: string, by: CheckoutBy): Promise<CheckoutResult>;
  moveRoom(attendanceId: string, roomId: string): Promise<void>;
  listShifts(branchId: string): Promise<StaffShift[]>;
  clockIn(branchId: string, roomId: string | null): Promise<void>;
  clockOut(shiftId: string): Promise<void>;
  listLogs(scope: DayScope & { since?: string }): Promise<DailyLog[]>;
  addLog(input: { child_id: string; kind: LogKind; detail: string; visible_to_parent: boolean }): Promise<void>;

  // ── Safety ─────────────────────────────────────────────────────────
  listSleepChecks(scope: DayScope): Promise<SleepCheck[]>;
  addSleepCheck(input: { child_id: string; position: SleepCheck["position"]; breathing_ok: boolean; note: string }): Promise<void>;
  listRollCalls(scope: DayScope): Promise<RollCall[]>;
  addRollCall(input: { branch_id: string; room_id: string | null; reason: RollReason; expected: number; counted: number; missing_ids: string[]; note: string }): Promise<void>;
  resolveRollCall(id: string, note: string): Promise<void>;
  listIncidents(scope: { branchId?: string; childId?: string }): Promise<Incident[]>;
  addIncident(input: Omit<Incident, "id" | "occurred_at" | "parent_ack_at" | "status" | "director_reviewed_at" | "parent_notified_at"> & { notify_parent: boolean }): Promise<void>;
  closeIncident(id: string): Promise<void>;
  reviewIncident(id: string): Promise<void>;
  acknowledgeIncident(id: string): Promise<void>;
  listVisitors(branchId: string): Promise<Visitor[]>;
  signInVisitor(input: Omit<Visitor, "id" | "signed_in_at" | "signed_out_at">): Promise<void>;
  signOutVisitor(id: string): Promise<void>;
  listAbsences(scope: { branchId?: string; childId?: string }): Promise<Absence[]>;
  reportAbsence(input: { child_id: string; day: string; reason: string; source: "parent" | "staff" }): Promise<void>;
  followUpAbsence(id: string, outcome: string): Promise<void>;

  // ── Messages ───────────────────────────────────────────────────────
  listThreads(): Promise<Thread[]>;
  listMessages(threadId: string): Promise<Message[]>;
  startThread(input: { kind: Thread["kind"]; branch_id: string | null; child_id: string | null; subject: string; body: string }): Promise<string>;
  sendMessage(threadId: string, body: string): Promise<void>;

  // ── Money ──────────────────────────────────────────────────────────
  listInvoices(scope: { branchId?: string; childId?: string }): Promise<Invoice[]>;
  createInvoice(input: Omit<Invoice, "id" | "paid_at" | "method" | "reference" | "status">): Promise<void>;
  markInvoicePaid(id: string, method: NonNullable<Invoice["method"]>, reference: string): Promise<void>;

  // ── From the website ───────────────────────────────────────────────
  listEnquiries(branchId?: string): Promise<Enquiry[]>;
  updateEnquiry(id: string, patch: Partial<Pick<Enquiry, "status" | "branch_id">>): Promise<void>;
  listLocationRequests(): Promise<LocationRequest[]>;

  // Re-run the caller whenever data changes (other tabs, other users).
  subscribe(onChange: () => void): () => void;
}

export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
