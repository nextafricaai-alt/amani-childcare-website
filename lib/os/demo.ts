// Demo mode: the whole OS running in the browser with sample data, so
// every role can be explored before the Supabase project exists.
// Access rules deliberately mirror the database's Row Level Security,
// and changes broadcast to other open tabs so the parent ↔ manager ↔
// director loop can be watched live.
import { OsApi, DemoPersona, today } from "./api";
import type {
  Absence, Attendance, AuthorizedPickup, Branch, BranchSummary, CheckoutBy, CheckoutResult, Child,
  DailyLog, Enquiry, Guardian, Incident, Invite, Invoice, LocationRequest, Membership, Message,
  NewBranchInput, NewChildInput, Role, RollCall, Room, SessionUser, SleepCheck, StaffShift,
  TeamMember, Thread, Visitor,
} from "./types";

interface DemoUser { id: string; email: string; name: string; detail: string }
interface PickupCode { child_id: string; valid_on: string; code: string }

interface Db {
  seededOn: string;
  users: DemoUser[];
  memberships: Membership[];
  invites: Invite[];
  branches: Branch[];
  rooms: Room[];
  children: Child[];
  guardians: Guardian[];
  pickups: AuthorizedPickup[];
  pickupCodes: PickupCode[];
  attendance: Attendance[];
  shifts: StaffShift[];
  logs: DailyLog[];
  sleep: SleepCheck[];
  rollCalls: RollCall[];
  incidents: Incident[];
  visitors: Visitor[];
  absences: Absence[];
  threads: Thread[];
  messages: Message[];
  invoices: Invoice[];
  enquiries: Enquiry[];
  locationRequests: LocationRequest[];
}

const KEY = "pikadon-os-demo-v2";
const SESSION_KEY = "pikadon-os-demo-session";
const CHANNEL = "pikadon-os-demo";

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

// Sample times for today are squeezed into "06:30 → now" so the demo day
// never contains events from the future, whatever time it is opened.
function at(hhmm: string, dayOffset = 0): string {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  if (dayOffset === 0) {
    const now = Date.now();
    const start = new Date(); start.setHours(6, 30, 0, 0);
    const end = new Date(); end.setHours(17, 30, 0, 0);
    const span = end.getTime() - start.getTime();
    const avail = Math.max(10 * 60000, now - 5 * 60000 - start.getTime());
    if (now < end.getTime()) {
      const t = start.getTime() + ((d.getTime() - start.getTime()) / span) * Math.min(span, avail);
      return new Date(Math.min(t, now - 60000)).toISOString();
    }
  }
  return d.toISOString();
}
function dayStr(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const dayOf = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const monthOf = (isoOrDay: string) => isoOrDay.slice(0, 7);

// ─── Sample network ────────────────────────────────────────────────────
function seed(): Db {
  const B1 = "b-kampala", B2 = "b-entebbe", B3 = "b-mukono";
  const R = { tod: "r-k-toddlers", pre: "r-k-preschool", ent: "r-e-mixed" };
  const U = {
    director: "u-director", investor: "u-investor",
    mgrK: "u-mgr-kampala", mgrE: "u-mgr-entebbe",
    ruth: "u-staff-ruth", faith: "u-staff-faith", brian: "u-staff-brian",
    pAiden: "u-parent-aiden", pBella: "u-parent-bella", pCaleb: "u-parent-caleb", pNia: "u-parent-nia",
  };
  const users: DemoUser[] = [
    { id: U.director, email: "director@pikadon.ug", name: "Hudson (Director)", detail: "Runs the whole network · adds branches" },
    { id: U.mgrK, email: "grace@pikadon.ug", name: "Grace Nansubuga", detail: "Branch Manager · Kampala Central" },
    { id: U.mgrE, email: "joseph@pikadon.ug", name: "Joseph Okello", detail: "Branch Manager · Entebbe" },
    { id: U.ruth, email: "ruth@pikadon.ug", name: "Ruth Kyomuhendo", detail: "Caregiver · Kampala Toddlers" },
    { id: U.faith, email: "faith@pikadon.ug", name: "Faith Atim", detail: "Caregiver · Kampala Preschool" },
    { id: U.brian, email: "brian@pikadon.ug", name: "Brian Ocen", detail: "Caregiver · Entebbe" },
    { id: U.pAiden, email: "sarah.nakamya@example.com", name: "Sarah Nakamya", detail: "Parent of Aiden · Kampala" },
    { id: U.pBella, email: "agnes.okello@example.com", name: "Agnes Okello", detail: "Parent of Bella · Kampala" },
    { id: U.pNia, email: "esther.namubiru@example.com", name: "Esther Namubiru", detail: "Parent of Nia · Entebbe" },
    { id: U.investor, email: "shalua@example.com", name: "Shalua (Investor)", detail: "Sees network numbers only" },
  ];
  const m = (user_id: string, role: Role, branch_id: string | null): Membership =>
    ({ id: uid(), user_id, role, branch_id, active: true });
  const memberships: Membership[] = [
    m(U.director, "director", null), m(U.investor, "investor", null),
    m(U.mgrK, "manager", B1), m(U.mgrE, "manager", B2),
    m(U.ruth, "staff", B1), m(U.faith, "staff", B1), m(U.brian, "staff", B2),
    m(U.pAiden, "parent", B1), m(U.pBella, "parent", B1), m(U.pNia, "parent", B2),
  ];

  const branches: Branch[] = [
    { id: B1, name: "Pikadon Kampala Central", area: "Kampala", address: "Plot 12, Kira Road", phone: "256706028899", capacity: 14, opens_at: "07:00", closes_at: "18:00", status: "open", opened_on: dayStr(-420), created_at: at("09:00", -430) },
    { id: B2, name: "Pikadon Entebbe", area: "Entebbe", address: "Church Road", phone: "256706028800", capacity: 10, opens_at: "07:00", closes_at: "18:00", status: "open", opened_on: dayStr(-60), created_at: at("09:00", -120) },
    { id: B3, name: "Pikadon Mukono", area: "Mukono", address: "Site secured, fit-out in progress", phone: null, capacity: 20, opens_at: "07:00", closes_at: "18:00", status: "planning", opened_on: null, created_at: at("09:00", -20) },
  ];
  const rooms: Room[] = [
    { id: R.tod, branch_id: B1, name: "Toddlers", age_band: "2–3 yrs", capacity: 6, ratio: 5 },
    { id: R.pre, branch_id: B1, name: "Preschool", age_band: "3–5 yrs", capacity: 8, ratio: 8 },
    { id: R.ent, branch_id: B2, name: "Sunflower Room", age_band: "2–5 yrs", capacity: 10, ratio: 6 },
  ];

  const kid = (id: string, branch_id: string, room_id: string, first: string, last: string, dob: string,
               allergies = "", medical = "", plan: Child["care_plan"] = "full_day"): Child =>
    ({ id, branch_id, room_id, first_name: first, last_name: last, date_of_birth: dob, allergies: allergies || null,
       medical_notes: medical || null, dietary_notes: null, care_plan: plan, status: "enrolled", enrolled_on: dayStr(-200) });
  const children: Child[] = [
    kid("c-aiden", B1, R.tod, "Aiden", "Nakamya", "2023-05-14", "Peanuts", "Mild asthma — inhaler in the medicine box"),
    kid("c-bella", B1, R.tod, "Bella", "Okello", "2024-02-10", "", "Prone to eczema"),
    kid("c-henry", B1, R.tod, "Henry", "Kato", "2024-03-05"),
    kid("c-grace", B1, R.tod, "Grace", "Wamala", "2023-04-18", "", "", "half_day"),
    kid("c-ethan", B1, R.tod, "Ethan", "Lubega", "2024-01-30", "Eggs", "Egg allergy causes hives — EpiPen at reception"),
    kid("c-caleb", B1, R.pre, "Caleb", "Ssemanda", "2022-11-05", "Dairy"),
    kid("c-fiona", B1, R.pre, "Fiona", "Atim", "2022-12-12"),
    kid("c-ivy", B1, R.pre, "Ivy", "Kyomuhendo", "2022-09-22", "Dust"),
    kid("c-joel", B1, R.pre, "Joel", "Byaruhanga", "2023-07-11"),
    kid("c-daisy", B1, R.pre, "Daisy", "Mutebe", "2023-08-20"),
    kid("c-nia", B2, R.ent, "Nia", "Namubiru", "2023-02-02"),
    kid("c-david", B2, R.ent, "David", "Ocen", "2023-01-14"),
    kid("c-sarah", B2, R.ent, "Sarah", "Laker", "2024-02-10", "Dust", "Asthma"),
    kid("c-tumi", B2, R.ent, "Tumi", "Mugisha", "2022-10-01"),
  ];

  const g = (child_id: string, full_name: string, relationship: string, phone: string, user_id: string | null = null, email: string | null = null): Guardian =>
    ({ id: uid(), child_id, user_id, full_name, relationship, phone, email, is_primary: true });
  const guardians: Guardian[] = [
    g("c-aiden", "Sarah Nakamya", "Mother", "256772001001", U.pAiden, "sarah.nakamya@example.com"),
    { ...g("c-aiden", "Robert Nakamya", "Father", "256772001101"), is_primary: false },
    g("c-bella", "Agnes Okello", "Mother", "256772001002", U.pBella, "agnes.okello@example.com"),
    g("c-henry", "Moses Kato", "Father", "256772001008"),
    g("c-grace", "Juliet Wamala", "Mother", "256772001007"),
    g("c-ethan", "Peter Lubega", "Father", "256772001005"),
    g("c-caleb", "David Ssemanda", "Father", "256772001003"),
    g("c-fiona", "Rose Atim", "Mother", "256772001006"),
    g("c-ivy", "Joan Kyomuhendo", "Mother", "256772001009"),
    g("c-joel", "Simon Byaruhanga", "Father", "256772001010"),
    g("c-daisy", "Ruth Mutebe", "Mother", "256772001004"),
    g("c-nia", "Esther Namubiru", "Mother", "256772001020", U.pNia, "esther.namubiru@example.com"),
    g("c-david", "Paul Ocen", "Father", "256772001021"),
    g("c-sarah", "Mary Laker", "Mother", "256772001022"),
    g("c-tumi", "Ivan Mugisha", "Father", "256772001023"),
  ];
  const pickups: AuthorizedPickup[] = [
    { id: uid(), child_id: "c-aiden", full_name: "Auntie Joy Nakato", relationship: "Aunt", phone: "256701112233", id_note: "National ID shown at gate", status: "approved", created_at: at("10:00", -30) },
    { id: uid(), child_id: "c-aiden", full_name: "Musa (driver)", relationship: "Family driver", phone: "256701445566", id_note: null, status: "pending", created_at: at("07:10") },
    { id: uid(), child_id: "c-bella", full_name: "Grandma Okello", relationship: "Grandmother", phone: "256701998877", id_note: "Known to staff", status: "approved", created_at: at("10:00", -90) },
  ];

  const att = (child_id: string, branch_id: string, room_id: string, inAt: string, by: string, outAt: string | null = null, out: string | null = null): Attendance =>
    ({ id: uid(), child_id, branch_id, room_id, day: today(), checked_in_at: at(inAt), dropped_by: by,
       checked_out_at: outAt ? at(outAt) : null, picked_up_by: out, pickup_verified: out ? "guardian" : null });
  const attendance: Attendance[] = [
    att("c-aiden", B1, R.tod, "07:42", "Sarah Nakamya"),
    att("c-bella", B1, R.tod, "07:55", "Agnes Okello"),
    att("c-henry", B1, R.tod, "08:05", "Moses Kato"),
    att("c-grace", B1, R.tod, "08:20", "Juliet Wamala"),
    att("c-caleb", B1, R.pre, "07:35", "David Ssemanda"),
    att("c-fiona", B1, R.pre, "07:48", "Rose Atim"),
    att("c-ivy", B1, R.pre, "08:12", "Joan Kyomuhendo"),
    att("c-nia", B2, R.ent, "07:50", "Esther Namubiru"),
    att("c-david", B2, R.ent, "08:02", "Paul Ocen"),
    att("c-tumi", B2, R.ent, "08:15", "Ivan Mugisha"),
  ];
  const shifts: StaffShift[] = [
    { id: uid(), user_id: U.ruth, branch_id: B1, room_id: R.tod, clocked_in_at: at("06:55"), clocked_out_at: null },
    { id: uid(), user_id: U.faith, branch_id: B1, room_id: R.pre, clocked_in_at: at("07:05"), clocked_out_at: null },
    { id: uid(), user_id: U.brian, branch_id: B2, room_id: R.ent, clocked_in_at: at("07:00"), clocked_out_at: null },
  ];
  const log = (child_id: string, branch_id: string, kind: DailyLog["kind"], detail: string, t: string, vis = true): DailyLog =>
    ({ id: uid(), child_id, branch_id, kind, detail, logged_at: at(t), visible_to_parent: vis });
  const logs: DailyLog[] = [
    log("c-aiden", B1, "mood", "Arrived smiling and went straight to the blocks corner", "07:50"),
    log("c-aiden", B1, "meal", "Breakfast: ate all of his porridge and half a banana", "08:30"),
    log("c-aiden", B1, "activity", "Morning circle: sang the days of the week and counted to 10", "09:15"),
    log("c-aiden", B1, "milestone", "Built a tower of 8 blocks on his own for the first time", "10:05"),
    log("c-aiden", B1, "meal", "Lunch: rice, beans and greens — finished everything", "12:10"),
    log("c-aiden", B1, "nap", "Fell asleep", "12:50"),
    log("c-aiden", B1, "note", "Slight cough after outdoor play — keep an eye on it", "11:40", false),
    log("c-bella", B1, "meal", "Breakfast: millet porridge, ate most of it", "08:35"),
    log("c-bella", B1, "nappy", "Nappy changed, all normal", "10:20"),
    log("c-bella", B1, "nap", "Fell asleep", "12:40"),
    log("c-caleb", B1, "activity", "Painted a family portrait in art time", "11:10"),
    log("c-nia", B2, "meal", "Breakfast: ate all of her porridge", "08:30"),
    log("c-nia", B2, "activity", "Story time: retold the story in her own words", "10:00"),
  ];
  const sleep: SleepCheck[] = [
    { id: uid(), child_id: "c-aiden", branch_id: B1, checked_at: at("13:00"), position: "back", breathing_ok: true, note: null },
    { id: uid(), child_id: "c-aiden", branch_id: B1, checked_at: at("13:10"), position: "back", breathing_ok: true, note: null },
    { id: uid(), child_id: "c-bella", branch_id: B1, checked_at: at("12:50"), position: "side", breathing_ok: true, note: "Gently rolled onto her back" },
  ];
  const rollCalls: RollCall[] = [
    { id: uid(), branch_id: B1, room_id: R.tod, taken_at: at("08:30"), reason: "opening", expected: 4, counted: 4, missing_ids: [], resolved: true, note: null },
    { id: uid(), branch_id: B1, room_id: R.pre, taken_at: at("10:30"), reason: "outdoor", expected: 3, counted: 3, missing_ids: [], resolved: true, note: null },
    { id: uid(), branch_id: B1, room_id: R.pre, taken_at: at("11:30"), reason: "transition", expected: 3, counted: 3, missing_ids: [], resolved: true, note: "Back inside from the garden" },
  ];
  const incidents: Incident[] = [
    { id: uid(), branch_id: B1, child_id: "c-caleb", occurred_at: at("10:45"), kind: "injury", severity: "minor",
      description: "Bumped his knee on the slide steps. Small graze, no swelling.", action_taken: "Cleaned and plaster applied. Comforted; back playing in 5 minutes.",
      parent_notified_at: at("10:55"), parent_ack_at: null, status: "open", director_reviewed_at: null },
    { id: uid(), branch_id: B2, child_id: "c-nia", occurred_at: at("17:05", -1), kind: "pickup_alert", severity: "serious",
      description: "Pickup refused: a man calling himself 'Uncle Tom' was not on the approved list and had no valid code.",
      action_taken: "Nia kept inside. Mum phoned — she had not sent anyone. Gate guard briefed.", parent_notified_at: at("17:06", -1),
      parent_ack_at: at("17:20", -1), status: "open", director_reviewed_at: null },
    { id: uid(), branch_id: B2, child_id: "c-david", occurred_at: at("09:30", -2), kind: "illness", severity: "moderate",
      description: "Temperature of 38.2°C at mid-morning.", action_taken: "Kept apart and cool; father collected at 10:15.",
      parent_notified_at: at("09:35", -2), parent_ack_at: at("09:40", -2), status: "closed", director_reviewed_at: at("16:00", -2) },
  ];
  const visitors: Visitor[] = [
    { id: uid(), branch_id: B1, full_name: "Okot James", purpose: "Plumber — kitchen sink", phone: "256703030303", id_checked: true, escorted_by: "Grace Nansubuga", signed_in_at: at("09:40"), signed_out_at: at("10:25") },
    { id: uid(), branch_id: B1, full_name: "Mrs. Kirabo", purpose: "Prospective parent tour", phone: "256704040404", id_checked: true, escorted_by: "Grace Nansubuga", signed_in_at: at("11:00"), signed_out_at: null },
  ];
  const absences: Absence[] = [
    { id: uid(), child_id: "c-daisy", branch_id: B1, day: today(), reason: "Mild fever — staying home to rest", source: "parent", reported_at: at("06:45"), followed_up_at: null, outcome: null },
  ];
  const T1 = uid(), T2 = uid(), T3 = uid(), T4 = uid();
  const threads: Thread[] = [
    { id: T1, kind: "family", branch_id: B1, child_id: "c-aiden", subject: "Aiden — pickup today", last_message_at: at("08:42") },
    { id: T2, kind: "branch", branch_id: B1, child_id: null, subject: "Kampala Central — weekly check-in", last_message_at: at("17:30", -1) },
    { id: T3, kind: "investor", branch_id: null, child_id: null, subject: "Q4 expansion: Mukono", last_message_at: at("15:00", -3) },
    { id: T4, kind: "family", branch_id: B2, child_id: "c-nia", subject: "Nia — welcome to Pikadon", last_message_at: at("16:00", -5) },
  ];
  const msg = (thread_id: string, sender_id: string, sender_name: string, sender_role: Role, body: string, t: string, off = 0): Message =>
    ({ id: uid(), thread_id, sender_id, sender_name, sender_role, body, created_at: at(t, off) });
  const messages: Message[] = [
    msg(T1, U.pAiden, "Sarah Nakamya", "parent", "Good morning! I'll pick Aiden up at 4pm today instead of 5.", "08:40"),
    msg(T1, U.mgrK, "Grace Nansubuga", "manager", "Noted, thank you Sarah. We'll have him ready at 4.", "08:42"),
    msg(T2, U.director, "Hudson (Director)", "director", "Grace, how is the new toddler ratio working this week?", "17:10", -1),
    msg(T2, U.mgrK, "Grace Nansubuga", "manager", "Good. Ruth and I cover toddlers at lunch so we never go above 1 to 5.", "17:30", -1),
    msg(T3, U.investor, "Shalua (Investor)", "investor", "What is the fit-out timeline for Mukono?", "14:30", -3),
    msg(T3, U.director, "Hudson (Director)", "director", "Fit-out finishes in 6 weeks; manager starts training in Kampala next month.", "15:00", -3),
    msg(T4, U.mgrE, "Joseph Okello", "manager", "Welcome to Pikadon Entebbe! Nia settled in beautifully today.", "16:00", -5),
  ];
  const month = new Date().toLocaleString("en-GB", { month: "long", year: "numeric" });
  const monthDay = (d: number) => `${today().slice(0, 8)}${String(d).padStart(2, "0")}`;
  const inv = (child_id: string, branch_id: string, amount: number, status: Invoice["status"], paidDaysAgo: number | null = null): Invoice =>
    ({ id: uid(), branch_id, child_id, period: month, amount_ugx: amount, due_on: status === "sent" ? monthDay(28) : monthDay(5),
       status, paid_at: paidDaysAgo === null ? null : at("10:00", -Math.min(paidDaysAgo, new Date().getDate() - 1)),
       method: paidDaysAgo === null ? null : "mtn_momo", reference: paidDaysAgo === null ? null : `MP${Math.floor(Math.random() * 1e9)}` });
  const invoices: Invoice[] = [
    inv("c-aiden", B1, 450000, "sent"), inv("c-bella", B1, 450000, "paid", 3), inv("c-henry", B1, 450000, "paid", 2),
    inv("c-grace", B1, 300000, "paid", 4), inv("c-ethan", B1, 450000, "overdue"), inv("c-caleb", B1, 450000, "paid", 1),
    inv("c-fiona", B1, 450000, "paid", 5), inv("c-ivy", B1, 450000, "sent"), inv("c-joel", B1, 450000, "paid", 2),
    inv("c-daisy", B1, 450000, "paid", 6), inv("c-nia", B2, 420000, "paid", 2), inv("c-david", B2, 420000, "sent"),
    inv("c-sarah", B2, 420000, "overdue"), inv("c-tumi", B2, 420000, "paid", 3),
  ];
  const enquiries: Enquiry[] = [
    { id: uid(), branch_id: B1, parent_name: "Doreen Akello", phone: "256779112233", child_age: "2 years", preferred_date: dayStr(2), message: "Can we visit on Thursday morning?", status: "new", created_at: at("07:15") },
    { id: uid(), branch_id: B2, parent_name: "Kenneth Mwesigwa", phone: "256775998877", child_age: "4 years", preferred_date: null, message: "Do you have space for January?", status: "contacted", created_at: at("18:20", -1) },
    { id: uid(), branch_id: null, parent_name: "Prossy Nabirye", phone: "256772334455", child_age: "3 years", preferred_date: null, message: "Which branch is closest to Bukoto?", status: "new", created_at: at("20:05", -1) },
  ];
  const locationRequests: LocationRequest[] = [
    { id: uid(), area: "Mukono", full_name: "Annet K.", phone: "256701000111", created_at: at("09:00", -12) },
    { id: uid(), area: "Mukono", full_name: "Brenda N.", phone: null, created_at: at("09:00", -8) },
    { id: uid(), area: "Wakiso", full_name: "Daniel S.", phone: "256701000333", created_at: at("09:00", -6) },
    { id: uid(), area: "Mukono", full_name: "Hellen A.", phone: null, created_at: at("09:00", -3) },
    { id: uid(), area: "Jinja", full_name: "Moses T.", phone: null, created_at: at("09:00", -1) },
  ];

  return {
    seededOn: today(), users, memberships, invites: [], branches, rooms, children, guardians, pickups,
    pickupCodes: [], attendance, shifts, logs, sleep, rollCalls, incidents, visitors, absences, threads,
    messages, invoices, enquiries, locationRequests,
  };
}

// ─── Demo implementation ───────────────────────────────────────────────
export class DemoApi implements OsApi {
  readonly mode = "demo" as const;
  private db: Db;
  private me: string | null = null;
  private listeners = new Set<() => void>();
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.db = this.load();
    try { this.me = sessionStorage.getItem(SESSION_KEY); } catch { /* private mode */ }
    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel(CHANNEL);
      this.channel.onmessage = () => { this.db = this.load(); this.emit(); };
    }
  }

  private load(): Db {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Db;
        if (parsed.seededOn === today()) return parsed;
      }
    } catch { /* storage blocked: fall back to memory */ }
    const fresh = seed();
    this.persist(fresh);
    return fresh;
  }
  private persist(db: Db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* memory only */ }
  }
  private commit() {
    this.persist(this.db);
    this.channel?.postMessage("changed");
    this.emit();
  }
  private emit() { this.listeners.forEach((l) => l()); }
  subscribe(onChange: () => void) {
    this.listeners.add(onChange);
    return () => { this.listeners.delete(onChange); };
  }
  resetDemo() {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    this.db = this.load();
    this.commit();
  }

  // ── access rules (mirror of the SQL policies) ─────────────────────
  private user() {
    const u = this.db.users.find((x) => x.id === this.me);
    if (!u) throw new Error("Please sign in");
    return u;
  }
  private roles(branchId: string | null = null): Role[] {
    return this.db.memberships
      .filter((m) => m.user_id === this.me && m.active && (branchId === null || m.branch_id === branchId || m.branch_id === null))
      .map((m) => m.role);
  }
  private isDirector() { return this.db.memberships.some((m) => m.user_id === this.me && m.active && m.role === "director"); }
  private isInvestor() { return this.db.memberships.some((m) => m.user_id === this.me && m.active && m.role === "investor"); }
  private has(branchId: string, roles: Role[]) {
    return this.isDirector() || this.db.memberships.some((m) => m.user_id === this.me && m.active && m.branch_id === branchId && roles.includes(m.role));
  }
  private team(branchId: string) { return this.has(branchId, ["manager", "staff"]); }
  private guardianOf(childId: string) { return this.db.guardians.some((g) => g.child_id === childId && g.user_id === this.me); }
  private childBranch(childId: string) { return this.db.children.find((c) => c.id === childId)?.branch_id ?? ""; }
  private canSeeChild(c: Child) { return this.team(c.branch_id) || this.guardianOf(c.id); }
  private need(cond: boolean, msg = "You don't have permission to do that") { if (!cond) throw new Error(msg); }
  private byScope<T extends { branch_id: string; child_id?: string | null }>(rows: T[], s: { branchId?: string; childId?: string }) {
    return rows.filter((r) => (!s.branchId || r.branch_id === s.branchId) && (!s.childId || r.child_id === s.childId));
  }
  private visibleChildRows<T extends { branch_id: string; child_id: string }>(rows: T[]) {
    return rows.filter((r) => this.team(r.branch_id) || this.guardianOf(r.child_id));
  }

  // ── session ───────────────────────────────────────────────────────
  private sessionUser(): SessionUser | null {
    const u = this.db.users.find((x) => x.id === this.me);
    if (!u) return null;
    return { id: u.id, email: u.email, name: u.name, memberships: this.db.memberships.filter((m) => m.user_id === u.id && m.active) };
  }
  async getSession() { return this.sessionUser(); }
  demoPersonas(): DemoPersona[] {
    return this.db.users.map((u) => {
      const m = this.db.memberships.find((x) => x.user_id === u.id);
      return { id: u.id, name: u.name, role: m?.role ?? "parent", detail: u.detail };
    });
  }
  async signInAs(personaId: string) {
    this.me = personaId;
    try { sessionStorage.setItem(SESSION_KEY, personaId); } catch { /* ignore */ }
    this.emit();
    return this.sessionUser()!;
  }
  async sendCode() { throw new Error("Demo mode: pick a demo person instead of signing in by email."); }
  async verifyCode(): Promise<SessionUser> { throw new Error("Demo mode has no email sign-in."); }
  async signOut() {
    this.me = null;
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    this.emit();
  }

  // ── branches ──────────────────────────────────────────────────────
  async listBranches() {
    this.user();
    if (this.isDirector() || this.isInvestor()) return [...this.db.branches];
    const mine = new Set(this.db.memberships.filter((m) => m.user_id === this.me && m.active).map((m) => m.branch_id));
    return this.db.branches.filter((b) => mine.has(b.id));
  }
  async addBranch(input: NewBranchInput) {
    this.need(this.isDirector(), "Only the global director can add a branch");
    const id = uid();
    this.db.branches.push({
      id, name: input.name, area: input.area, address: input.address || null, phone: input.phone || null,
      capacity: input.capacity, opens_at: input.opens_at, closes_at: input.closes_at, status: input.status,
      opened_on: input.status === "open" ? today() : null, created_at: new Date().toISOString(),
    });
    input.rooms.filter((r) => r.name.trim()).forEach((r) =>
      this.db.rooms.push({ id: uid(), branch_id: id, name: r.name, age_band: r.age_band || null, capacity: r.capacity, ratio: r.ratio }));
    if (input.manager_email.trim()) {
      this.db.invites.push({ id: uid(), email: input.manager_email.trim(), role: "manager", branch_id: id, child_id: null,
        full_name: input.manager_name || null, created_at: new Date().toISOString(), accepted_at: null });
    }
    this.commit();
    return id;
  }
  async updateBranch(id: string, patch: Partial<Branch>) {
    this.need(this.isDirector(), "Only the global director can change a branch");
    const b = this.db.branches.find((x) => x.id === id);
    if (b) {
      if (patch.status === "open" && !b.opened_on) b.opened_on = today();
      Object.assign(b, patch);
    }
    this.commit();
  }
  async listRooms(branchId?: string) {
    return this.db.rooms.filter((r) => (!branchId || r.branch_id === branchId) && this.has(r.branch_id, ["manager", "staff", "parent"]));
  }
  async addRoom(room: Omit<Room, "id">) {
    this.need(this.has(room.branch_id, ["manager"]));
    this.db.rooms.push({ ...room, id: uid() });
    this.commit();
  }
  async networkSummary(): Promise<BranchSummary[]> {
    this.user();
    const month = monthOf(today());
    return this.db.branches
      .filter((b) => this.isDirector() || this.isInvestor() || this.has(b.id, ["manager"]))
      .map((b) => {
        const inv = this.db.invoices.filter((i) => i.branch_id === b.id && i.status !== "void");
        return {
          branch_id: b.id, branch_name: b.name, area: b.area, status: b.status, capacity: b.capacity,
          enrolled: this.db.children.filter((c) => c.branch_id === b.id && c.status === "enrolled").length,
          present_today: this.db.attendance.filter((a) => a.branch_id === b.id && a.day === today() && !a.checked_out_at).length,
          staff_on_duty: this.db.shifts.filter((s) => s.branch_id === b.id && !s.clocked_out_at && dayOf(s.clocked_in_at) === today()).length,
          invoiced_month: inv.filter((i) => monthOf(i.due_on) === month).reduce((s, i) => s + i.amount_ugx, 0),
          collected_month: inv.filter((i) => i.status === "paid" && i.paid_at && monthOf(dayOf(i.paid_at)) === month).reduce((s, i) => s + i.amount_ugx, 0),
          overdue_ugx: inv.filter((i) => i.status === "overdue" || (i.status === "sent" && i.due_on < today())).reduce((s, i) => s + i.amount_ugx, 0),
          open_incidents: this.db.incidents.filter((x) => x.branch_id === b.id && x.status === "open").length,
          new_enquiries: this.db.enquiries.filter((e) => e.branch_id === b.id && e.status === "new").length,
        };
      });
  }

  // ── people ────────────────────────────────────────────────────────
  async listTeam(branchId?: string): Promise<TeamMember[]> {
    this.user();
    return this.db.memberships
      .filter((m) => (branchId ? m.branch_id === branchId : true))
      .filter((m) => m.user_id === this.me || this.isDirector() || (m.branch_id && this.has(m.branch_id, ["manager"])))
      .map((m) => {
        const u = this.db.users.find((x) => x.id === m.user_id);
        return { user_id: m.user_id, name: u?.name ?? "Unknown", email: u?.email ?? null, role: m.role, branch_id: m.branch_id, active: m.active, membership_id: m.id };
      });
  }
  async setMemberActive(membershipId: string, active: boolean) {
    const m = this.db.memberships.find((x) => x.id === membershipId);
    this.need(!!m && (this.isDirector() || (!!m.branch_id && ["staff", "parent"].includes(m.role) && this.has(m.branch_id, ["manager"]))));
    m!.active = active;
    this.commit();
  }
  async listInvites(branchId?: string) {
    return this.db.invites.filter((i) => !i.accepted_at && (!branchId || i.branch_id === branchId)
      && (this.isDirector() || (!!i.branch_id && this.has(i.branch_id, ["manager"]))));
  }
  async createInvite(input: { email: string; role: Role; branch_id: string | null; child_id?: string | null; full_name: string }) {
    const ok = this.isDirector() || (["staff", "parent"].includes(input.role) && !!input.branch_id && this.has(input.branch_id, ["manager"]));
    this.need(ok, "Managers can invite caregivers and parents for their own branch only");
    this.db.invites.push({ id: uid(), email: input.email, role: input.role, branch_id: input.branch_id, child_id: input.child_id ?? null,
      full_name: input.full_name, created_at: new Date().toISOString(), accepted_at: null });
    this.commit();
  }
  async deleteInvite(id: string) {
    this.db.invites = this.db.invites.filter((i) => i.id !== id);
    this.commit();
  }

  // ── children ──────────────────────────────────────────────────────
  async listChildren(branchId?: string) {
    this.user();
    return this.db.children.filter((c) => (!branchId || c.branch_id === branchId) && this.canSeeChild(c))
      .sort((a, b) => a.first_name.localeCompare(b.first_name));
  }
  async addChild(input: NewChildInput) {
    this.need(this.has(input.branch_id, ["manager"]), "Only the branch manager can enrol a child");
    const id = uid();
    this.db.children.push({
      id, branch_id: input.branch_id, room_id: input.room_id, first_name: input.first_name, last_name: input.last_name,
      date_of_birth: input.date_of_birth, allergies: input.allergies || null, medical_notes: input.medical_notes || null,
      dietary_notes: input.dietary_notes || null, care_plan: input.care_plan, status: "enrolled", enrolled_on: today(),
    });
    this.db.guardians.push({ id: uid(), child_id: id, user_id: null, full_name: input.guardian_name, relationship: input.guardian_relationship,
      phone: input.guardian_phone || null, email: input.guardian_email || null, is_primary: true });
    if (input.guardian_email) {
      this.db.invites.push({ id: uid(), email: input.guardian_email, role: "parent", branch_id: input.branch_id, child_id: id,
        full_name: input.guardian_name, created_at: new Date().toISOString(), accepted_at: null });
    }
    this.commit();
    return id;
  }
  async updateChild(id: string, patch: Partial<Child>) {
    const c = this.db.children.find((x) => x.id === id);
    this.need(!!c && this.has(c.branch_id, ["manager"]));
    Object.assign(c!, patch);
    this.commit();
  }
  async listGuardians(childId: string) {
    this.need(this.team(this.childBranch(childId)) || this.guardianOf(childId));
    return this.db.guardians.filter((g) => g.child_id === childId);
  }
  async listPickups(s: { childId?: string; branchId?: string }) {
    return this.db.pickups.filter((p) => (!s.childId || p.child_id === s.childId) && (!s.branchId || this.childBranch(p.child_id) === s.branchId)
      && (this.team(this.childBranch(p.child_id)) || this.guardianOf(p.child_id)));
  }
  async requestPickup(childId: string, input: { full_name: string; relationship: string; phone: string; id_note: string }) {
    const isMgr = this.has(this.childBranch(childId), ["manager"]);
    this.need(this.guardianOf(childId) || isMgr);
    this.db.pickups.push({ id: uid(), child_id: childId, full_name: input.full_name, relationship: input.relationship,
      phone: input.phone || null, id_note: input.id_note || null, status: isMgr ? "approved" : "pending", created_at: new Date().toISOString() });
    this.commit();
  }
  async decidePickup(pickupId: string, approve: boolean) {
    const p = this.db.pickups.find((x) => x.id === pickupId);
    this.need(!!p && this.has(this.childBranch(p.child_id), ["manager"]), "Only the branch manager can approve pickups");
    p!.status = approve ? "approved" : "revoked";
    this.commit();
  }
  async revokePickup(pickupId: string) {
    const p = this.db.pickups.find((x) => x.id === pickupId);
    this.need(!!p && (this.guardianOf(p.child_id) || this.has(this.childBranch(p.child_id), ["manager"])));
    p!.status = "revoked";
    this.commit();
  }
  async issuePickupCode(childId: string) {
    this.need(this.guardianOf(childId), "Only a parent can issue a pickup code");
    const code = String(Math.floor(Math.random() * 1e6)).padStart(6, "0");
    this.db.pickupCodes = this.db.pickupCodes.filter((p) => !(p.child_id === childId && p.valid_on === today()));
    this.db.pickupCodes.push({ child_id: childId, valid_on: today(), code });
    this.commit();
    return code;
  }

  // ── the day ───────────────────────────────────────────────────────
  async listAttendance(s: { branchId?: string; childId?: string; day?: string }) {
    return this.visibleChildRows(this.byScope(this.db.attendance, s)).filter((a) => !s.day || a.day === s.day)
      .filter((a) => s.day || s.childId ? true : a.day === today());
  }
  async checkIn(childId: string, droppedBy: string) {
    const c = this.db.children.find((x) => x.id === childId);
    this.need(!!c && c.status === "enrolled", "Child not enrolled");
    this.need(this.team(c!.branch_id), "Not on this branch team");
    this.need(!this.db.attendance.some((a) => a.child_id === childId && a.day === today()), "Already checked in today");
    this.db.attendance.push({ id: uid(), child_id: childId, branch_id: c!.branch_id, room_id: c!.room_id, day: today(),
      checked_in_at: new Date().toISOString(), dropped_by: droppedBy || null, checked_out_at: null, picked_up_by: null, pickup_verified: null });
    this.commit();
  }
  async checkOut(childId: string, by: CheckoutBy): Promise<CheckoutResult> {
    const c = this.db.children.find((x) => x.id === childId);
    this.need(!!c && this.team(c.branch_id), "Not on this branch team");
    const a = this.db.attendance.find((x) => x.child_id === childId && x.day === today() && !x.checked_out_at);
    this.need(!!a, "Child is not checked in");
    let verified: CheckoutResult | null = null;
    let who = "";
    if (by.kind === "guardian") {
      const g = this.db.guardians.find((x) => x.id === by.guardianId && x.child_id === childId);
      if (g) { verified = "guardian"; who = g.full_name; }
    } else if (by.kind === "pickup") {
      const p = this.db.pickups.find((x) => x.id === by.pickupId && x.child_id === childId && x.status === "approved");
      if (p) { verified = "approved_pickup"; who = p.full_name; }
    } else if (by.kind === "code") {
      const code = this.db.pickupCodes.find((x) => x.child_id === childId && x.valid_on === today() && x.code === by.code.trim());
      if (code) {
        verified = "pickup_code"; who = by.name || "Code holder";
        this.db.pickupCodes = this.db.pickupCodes.filter((x) => x !== code);
      }
    }
    if (!verified) {
      const name = by.kind === "code" || by.kind === "unlisted" ? by.name : "Unknown person";
      this.db.incidents.push({ id: uid(), branch_id: c!.branch_id, child_id: childId, occurred_at: new Date().toISOString(),
        kind: "pickup_alert", severity: "serious",
        description: `Pickup refused: ${name || "Unknown person"} was not on the approved list and had no valid code.`,
        action_taken: "Child kept inside. Parents notified.", parent_notified_at: new Date().toISOString(), parent_ack_at: null,
        status: "open", director_reviewed_at: null });
      this.commit();
      return "refused";
    }
    Object.assign(a!, { checked_out_at: new Date().toISOString(), picked_up_by: who, pickup_verified: verified });
    this.commit();
    return verified;
  }
  async moveRoom(attendanceId: string, roomId: string) {
    const a = this.db.attendance.find((x) => x.id === attendanceId);
    this.need(!!a && this.team(a.branch_id));
    a!.room_id = roomId;
    this.commit();
  }
  async listShifts(branchId: string) {
    this.need(this.team(branchId));
    return this.db.shifts.filter((s) => s.branch_id === branchId && dayOf(s.clocked_in_at) === today())
      .map((s) => ({ ...s, staff_name: this.db.users.find((u) => u.id === s.user_id)?.name ?? "Caregiver" }));
  }
  async clockIn(branchId: string, roomId: string | null) {
    this.need(this.team(branchId));
    this.db.shifts.push({ id: uid(), user_id: this.me!, branch_id: branchId, room_id: roomId, clocked_in_at: new Date().toISOString(), clocked_out_at: null });
    this.commit();
  }
  async clockOut(shiftId: string) {
    const s = this.db.shifts.find((x) => x.id === shiftId);
    this.need(!!s && (s.user_id === this.me || this.has(s.branch_id, ["manager"])));
    s!.clocked_out_at = new Date().toISOString();
    this.commit();
  }
  async listLogs(s: { branchId?: string; childId?: string; day?: string }) {
    return this.byScope(this.db.logs, s)
      .filter((l) => this.team(l.branch_id) || (l.visible_to_parent && this.guardianOf(l.child_id)))
      .filter((l) => dayOf(l.logged_at) === (s.day ?? today()))
      .sort((a, b) => a.logged_at.localeCompare(b.logged_at));
  }
  async addLog(input: { child_id: string; kind: DailyLog["kind"]; detail: string; visible_to_parent: boolean }) {
    const b = this.childBranch(input.child_id);
    this.need(this.team(b), "Only the branch team can write the daily log");
    this.db.logs.push({ id: uid(), branch_id: b, logged_at: new Date().toISOString(), ...input });
    this.commit();
  }

  // ── safety ────────────────────────────────────────────────────────
  async listSleepChecks(s: { branchId?: string; childId?: string; day?: string }) {
    return this.visibleChildRows(this.byScope(this.db.sleep, s)).filter((x) => dayOf(x.checked_at) === (s.day ?? today()))
      .sort((a, b) => b.checked_at.localeCompare(a.checked_at));
  }
  async addSleepCheck(input: { child_id: string; position: SleepCheck["position"]; breathing_ok: boolean; note: string }) {
    const b = this.childBranch(input.child_id);
    this.need(this.team(b));
    this.db.sleep.push({ id: uid(), branch_id: b, checked_at: new Date().toISOString(), child_id: input.child_id,
      position: input.position, breathing_ok: input.breathing_ok, note: input.note || null });
    if (!input.breathing_ok || input.position === "front") {
      this.db.incidents.push({ id: uid(), branch_id: b, child_id: input.child_id, occurred_at: new Date().toISOString(),
        kind: "near_miss", severity: input.breathing_ok ? "minor" : "serious",
        description: input.breathing_ok ? "Found sleeping on front during sleep check; repositioned onto back." : "Breathing concern found during sleep check.",
        action_taken: input.note || "Child repositioned and monitored.", parent_notified_at: null, parent_ack_at: null,
        status: "open", director_reviewed_at: null });
    }
    this.commit();
  }
  async listRollCalls(s: { branchId?: string; day?: string }) {
    return this.db.rollCalls.filter((r) => (!s.branchId || r.branch_id === s.branchId) && this.team(r.branch_id)
      && dayOf(r.taken_at) === (s.day ?? today())).sort((a, b) => b.taken_at.localeCompare(a.taken_at));
  }
  async addRollCall(input: Omit<RollCall, "id" | "taken_at" | "resolved">) {
    this.need(this.team(input.branch_id));
    const resolved = input.counted === input.expected && input.missing_ids.length === 0;
    this.db.rollCalls.push({ ...input, id: uid(), taken_at: new Date().toISOString(), resolved, note: input.note || null });
    this.commit();
  }
  async resolveRollCall(id: string, note: string) {
    const r = this.db.rollCalls.find((x) => x.id === id);
    this.need(!!r && this.team(r.branch_id));
    r!.resolved = true;
    r!.note = note || r!.note;
    this.commit();
  }
  async listIncidents(s: { branchId?: string; childId?: string }) {
    return this.byScope(this.db.incidents, s)
      .filter((i) => this.team(i.branch_id) || (!!i.child_id && this.guardianOf(i.child_id)))
      .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));
  }
  async addIncident(input: Parameters<OsApi["addIncident"]>[0]) {
    this.need(this.team(input.branch_id));
    const now = new Date().toISOString();
    this.db.incidents.push({ id: uid(), occurred_at: now, status: "open", parent_ack_at: null, director_reviewed_at: null,
      parent_notified_at: input.notify_parent && input.child_id ? now : null, branch_id: input.branch_id, child_id: input.child_id,
      kind: input.kind, severity: input.severity, description: input.description, action_taken: input.action_taken });
    this.commit();
  }
  async closeIncident(id: string) {
    const i = this.db.incidents.find((x) => x.id === id);
    this.need(!!i && this.has(i.branch_id, ["manager"]));
    i!.status = "closed";
    this.commit();
  }
  async reviewIncident(id: string) {
    this.need(this.isDirector());
    const i = this.db.incidents.find((x) => x.id === id);
    if (i) i.director_reviewed_at = new Date().toISOString();
    this.commit();
  }
  async acknowledgeIncident(id: string) {
    const i = this.db.incidents.find((x) => x.id === id);
    this.need(!!i && !!i.child_id && this.guardianOf(i.child_id), "Not your child");
    i!.parent_ack_at = i!.parent_ack_at ?? new Date().toISOString();
    this.commit();
  }
  async listVisitors(branchId: string) {
    this.need(this.team(branchId));
    return this.db.visitors.filter((v) => v.branch_id === branchId && dayOf(v.signed_in_at) === today())
      .sort((a, b) => b.signed_in_at.localeCompare(a.signed_in_at));
  }
  async signInVisitor(input: Omit<Visitor, "id" | "signed_in_at" | "signed_out_at">) {
    this.need(this.team(input.branch_id));
    this.db.visitors.push({ ...input, id: uid(), signed_in_at: new Date().toISOString(), signed_out_at: null });
    this.commit();
  }
  async signOutVisitor(id: string) {
    const v = this.db.visitors.find((x) => x.id === id);
    this.need(!!v && this.team(v.branch_id));
    v!.signed_out_at = new Date().toISOString();
    this.commit();
  }
  async listAbsences(s: { branchId?: string; childId?: string }) {
    return this.visibleChildRows(this.byScope(this.db.absences, s)).sort((a, b) => b.day.localeCompare(a.day));
  }
  async reportAbsence(input: { child_id: string; day: string; reason: string; source: "parent" | "staff" }) {
    const b = this.childBranch(input.child_id);
    this.need(input.source === "parent" ? this.guardianOf(input.child_id) : this.team(b));
    this.need(!this.db.absences.some((a) => a.child_id === input.child_id && a.day === input.day), "Already reported for that day");
    this.db.absences.push({ id: uid(), branch_id: b, reported_at: new Date().toISOString(), followed_up_at: null, outcome: null, ...input });
    this.commit();
  }
  async followUpAbsence(id: string, outcome: string) {
    const a = this.db.absences.find((x) => x.id === id);
    this.need(!!a && this.team(a.branch_id));
    a!.followed_up_at = new Date().toISOString();
    a!.outcome = outcome;
    this.commit();
  }

  // ── messages ──────────────────────────────────────────────────────
  private canSeeThread(t: Thread) {
    if (t.kind === "family") return this.team(t.branch_id!) || this.guardianOf(t.child_id!);
    if (t.kind === "branch") return this.has(t.branch_id!, ["manager"]);
    return this.isDirector() || this.isInvestor();
  }
  async listThreads() {
    this.user();
    return this.db.threads.filter((t) => this.canSeeThread(t)).sort((a, b) => b.last_message_at.localeCompare(a.last_message_at));
  }
  async listMessages(threadId: string) {
    const t = this.db.threads.find((x) => x.id === threadId);
    this.need(!!t && this.canSeeThread(t));
    return this.db.messages.filter((m) => m.thread_id === threadId).sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  private myRole(t: Thread): Role {
    if (t.kind === "family" && t.child_id && this.guardianOf(t.child_id)) return "parent";
    if (this.isDirector()) return "director";
    if (t.kind === "investor") return "investor";
    const r = this.roles(t.branch_id);
    return r.includes("manager") ? "manager" : r.includes("staff") ? "staff" : r[0] ?? "parent";
  }
  async startThread(input: { kind: Thread["kind"]; branch_id: string | null; child_id: string | null; subject: string; body: string }) {
    const t: Thread = { id: uid(), kind: input.kind, branch_id: input.branch_id, child_id: input.child_id, subject: input.subject, last_message_at: new Date().toISOString() };
    this.need(this.canSeeThread(t));
    this.db.threads.push(t);
    this.db.messages.push({ id: uid(), thread_id: t.id, sender_id: this.me!, sender_name: this.user().name, sender_role: this.myRole(t), body: input.body, created_at: t.last_message_at });
    this.commit();
    return t.id;
  }
  async sendMessage(threadId: string, body: string) {
    const t = this.db.threads.find((x) => x.id === threadId);
    this.need(!!t && this.canSeeThread(t));
    const now = new Date().toISOString();
    this.db.messages.push({ id: uid(), thread_id: threadId, sender_id: this.me!, sender_name: this.user().name, sender_role: this.myRole(t!), body, created_at: now });
    t!.last_message_at = now;
    this.commit();
  }

  // ── money ─────────────────────────────────────────────────────────
  async listInvoices(s: { branchId?: string; childId?: string }) {
    return this.byScope(this.db.invoices, s).filter((i) => this.has(i.branch_id, ["manager"]) || this.guardianOf(i.child_id))
      .map((i) => (i.status === "sent" && i.due_on < today() ? { ...i, status: "overdue" as const } : i))
      .sort((a, b) => b.due_on.localeCompare(a.due_on));
  }
  async createInvoice(input: Omit<Invoice, "id" | "paid_at" | "method" | "reference" | "status">) {
    this.need(this.has(input.branch_id, ["manager"]));
    this.db.invoices.push({ ...input, id: uid(), status: "sent", paid_at: null, method: null, reference: null });
    this.commit();
  }
  async markInvoicePaid(id: string, method: NonNullable<Invoice["method"]>, reference: string) {
    const i = this.db.invoices.find((x) => x.id === id);
    this.need(!!i && this.has(i.branch_id, ["manager"]));
    Object.assign(i!, { status: "paid", paid_at: new Date().toISOString(), method, reference: reference || null });
    this.commit();
  }

  // ── website ───────────────────────────────────────────────────────
  async listEnquiries(branchId?: string) {
    return this.db.enquiries.filter((e) => (!branchId || e.branch_id === branchId)
      && (this.isDirector() || (!!e.branch_id && this.has(e.branch_id, ["manager"]))))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
  async updateEnquiry(id: string, patch: Partial<Pick<Enquiry, "status" | "branch_id">>) {
    const e = this.db.enquiries.find((x) => x.id === id);
    this.need(!!e && (this.isDirector() || (!!e.branch_id && this.has(e.branch_id, ["manager"]))));
    Object.assign(e!, patch);
    this.commit();
  }
  async listLocationRequests() {
    this.need(this.isDirector() || this.isInvestor());
    return [...this.db.locationRequests].sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  // Website forms in demo mode land here (see lib/os/public.ts).
  static submitPublic(kind: "enquiry" | "location", row: Record<string, unknown>) {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const db = JSON.parse(raw) as Db;
      if (kind === "enquiry") db.enquiries.push({ id: uid(), status: "new", created_at: new Date().toISOString(), branch_id: null,
        child_age: null, preferred_date: null, message: null, ...(row as Partial<Enquiry>) } as Enquiry);
      else db.locationRequests.push({ id: uid(), created_at: new Date().toISOString(), phone: null, ...(row as Partial<LocationRequest>) } as LocationRequest);
      localStorage.setItem(KEY, JSON.stringify(db));
      new BroadcastChannel(CHANNEL).postMessage("changed");
    } catch { /* ignore */ }
  }
}
