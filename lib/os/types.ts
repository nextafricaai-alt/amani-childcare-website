// PIKADON OS — shared types. Field names mirror the Supabase tables in
// supabase/migrations/20261027000000_pikadon_os.sql.

export type Role = "director" | "manager" | "staff" | "parent" | "investor";

export const ROLE_LABEL: Record<Role, string> = {
  director: "Global Director",
  manager: "Branch Manager",
  staff: "Caregiver",
  parent: "Parent",
  investor: "Investor",
};

export interface Membership {
  id: string;
  user_id: string;
  role: Role;
  branch_id: string | null;
  active: boolean;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  memberships: Membership[];
}

export interface Branch {
  id: string;
  name: string;
  area: string;
  address: string | null;
  phone: string | null;
  capacity: number;
  opens_at: string;
  closes_at: string;
  status: "planning" | "open" | "paused" | "closed";
  opened_on: string | null;
  created_at: string;
}

export interface Room {
  id: string;
  branch_id: string;
  name: string;
  age_band: string | null;
  capacity: number;
  ratio: number;
}

export interface Child {
  id: string;
  branch_id: string;
  room_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  allergies: string | null;
  medical_notes: string | null;
  dietary_notes: string | null;
  care_plan: "full_day" | "half_day" | "hourly";
  status: "enrolled" | "waitlist" | "withdrawn" | "graduated";
  enrolled_on: string | null;
}

export interface Guardian {
  id: string;
  child_id: string;
  user_id: string | null;
  full_name: string;
  relationship: string;
  phone: string | null;
  email: string | null;
  is_primary: boolean;
}

export interface AuthorizedPickup {
  id: string;
  child_id: string;
  full_name: string;
  relationship: string;
  phone: string | null;
  id_note: string | null;
  status: "pending" | "approved" | "revoked";
  created_at: string;
}

export interface Attendance {
  id: string;
  child_id: string;
  branch_id: string;
  room_id: string | null;
  day: string;
  checked_in_at: string;
  dropped_by: string | null;
  checked_out_at: string | null;
  picked_up_by: string | null;
  pickup_verified: "guardian" | "approved_pickup" | "pickup_code" | null;
}

export interface StaffShift {
  id: string;
  user_id: string;
  branch_id: string;
  room_id: string | null;
  clocked_in_at: string;
  clocked_out_at: string | null;
  staff_name?: string;
}

export type LogKind = "meal" | "nap" | "nappy" | "activity" | "mood" | "medication" | "milestone" | "note";

export interface DailyLog {
  id: string;
  child_id: string;
  branch_id: string;
  kind: LogKind;
  detail: string;
  logged_at: string;
  visible_to_parent: boolean;
}

export interface SleepCheck {
  id: string;
  child_id: string;
  branch_id: string;
  checked_at: string;
  position: "back" | "side" | "front";
  breathing_ok: boolean;
  note: string | null;
}

export type RollReason = "opening" | "transition" | "outdoor" | "outing" | "meal" | "nap" | "closing" | "drill";

export interface RollCall {
  id: string;
  branch_id: string;
  room_id: string | null;
  taken_at: string;
  reason: RollReason;
  expected: number;
  counted: number;
  missing_ids: string[];
  resolved: boolean;
  note: string | null;
}

export type IncidentKind = "injury" | "illness" | "behaviour" | "safeguarding" | "pickup_alert" | "near_miss" | "property";

export interface Incident {
  id: string;
  branch_id: string;
  child_id: string | null;
  occurred_at: string;
  kind: IncidentKind;
  severity: "minor" | "moderate" | "serious";
  description: string;
  action_taken: string | null;
  parent_notified_at: string | null;
  parent_ack_at: string | null;
  status: "open" | "closed";
  director_reviewed_at: string | null;
}

export interface Visitor {
  id: string;
  branch_id: string;
  full_name: string;
  purpose: string;
  phone: string | null;
  id_checked: boolean;
  escorted_by: string | null;
  signed_in_at: string;
  signed_out_at: string | null;
}

export interface Absence {
  id: string;
  child_id: string;
  branch_id: string;
  day: string;
  reason: string;
  source: "parent" | "staff";
  reported_at: string;
  followed_up_at: string | null;
  outcome: string | null;
}

export interface Thread {
  id: string;
  kind: "family" | "branch" | "investor";
  branch_id: string | null;
  child_id: string | null;
  subject: string;
  last_message_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: Role;
  body: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  branch_id: string;
  child_id: string;
  period: string;
  amount_ugx: number;
  due_on: string;
  status: "draft" | "sent" | "paid" | "overdue" | "void";
  paid_at: string | null;
  method: "mtn_momo" | "airtel_money" | "bank" | "cash" | null;
  reference: string | null;
}

export interface Enquiry {
  id: string;
  branch_id: string | null;
  parent_name: string;
  phone: string;
  child_age: string | null;
  preferred_date: string | null;
  message: string | null;
  status: "new" | "contacted" | "toured" | "enrolled" | "lost";
  created_at: string;
}

export interface LocationRequest {
  id: string;
  area: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

export interface Invite {
  id: string;
  email: string;
  role: Role;
  branch_id: string | null;
  child_id: string | null;
  full_name: string | null;
  created_at: string;
  accepted_at: string | null;
}

export interface TeamMember {
  user_id: string;
  name: string;
  email: string | null;
  role: Role;
  branch_id: string | null;
  active: boolean;
  membership_id: string;
}

export interface BranchSummary {
  branch_id: string;
  branch_name: string;
  area: string;
  status: Branch["status"];
  capacity: number;
  enrolled: number;
  present_today: number;
  staff_on_duty: number;
  invoiced_month: number;
  collected_month: number;
  overdue_ugx: number;
  open_incidents: number;
  new_enquiries: number;
}

export interface NewBranchInput {
  name: string;
  area: string;
  address: string;
  phone: string;
  capacity: number;
  opens_at: string;
  closes_at: string;
  status: Branch["status"];
  rooms: { name: string; age_band: string; capacity: number; ratio: number }[];
  manager_email: string;
  manager_name: string;
}

export interface NewChildInput {
  branch_id: string;
  room_id: string | null;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  allergies: string;
  medical_notes: string;
  dietary_notes: string;
  care_plan: Child["care_plan"];
  guardian_name: string;
  guardian_relationship: string;
  guardian_phone: string;
  guardian_email: string;
}

export type CheckoutBy =
  | { kind: "guardian"; guardianId: string }
  | { kind: "pickup"; pickupId: string }
  | { kind: "code"; code: string; name: string }
  | { kind: "unlisted"; name: string };

export type CheckoutResult = "guardian" | "approved_pickup" | "pickup_code" | "refused";

export interface DayScope {
  branchId?: string;
  childId?: string;
  day?: string; // YYYY-MM-DD, defaults to today
}
