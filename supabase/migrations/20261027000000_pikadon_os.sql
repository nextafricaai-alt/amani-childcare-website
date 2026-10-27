-- ═══════════════════════════════════════════════════════════════════════
-- PIKADON OS — core schema
-- Multi-branch childcare operating system.
--
-- Roles
--   director  Global manager. Sees and runs every branch. Adds branches.
--   manager   Runs one branch: children, staff, parents, safety, money.
--   staff     Caregiver in one branch: check-in/out, logs, safety checks.
--   parent    Sees only their own child(ren): day, pickups, incidents, fees.
--   investor  Network-level numbers only. Never sees child records.
--
-- Security model: every table has Row Level Security. Access is derived
-- from `memberships` (who holds which role in which branch) and
-- `guardians` (which parent account belongs to which child). Role
-- claims in user metadata are ignored — roles come only from invites
-- accepted by a verified email address.
-- ═══════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ─── Types ──────────────────────────────────────────────────────────────
do $$ begin
  create type app_role as enum ('director', 'manager', 'staff', 'parent', 'investor');
exception when duplicate_object then null; end $$;

-- ─── Branches & rooms ───────────────────────────────────────────────────
create table if not exists branches (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  area         text not null,
  address      text,
  phone        text,
  capacity     int  not null default 30 check (capacity > 0),
  opens_at     time not null default '07:00',
  closes_at    time not null default '18:00',
  status       text not null default 'open'
               check (status in ('planning', 'open', 'paused', 'closed')),
  opened_on    date,
  created_at   timestamptz not null default now(),
  created_by   uuid references auth.users(id)
);

create table if not exists rooms (
  id           uuid primary key default gen_random_uuid(),
  branch_id    uuid not null references branches(id) on delete cascade,
  name         text not null,
  age_band     text,
  capacity     int  not null default 12 check (capacity > 0),
  -- maximum children per caregiver in this room (set from the licence)
  ratio        int  not null default 6 check (ratio > 0),
  created_at   timestamptz not null default now()
);
create index if not exists rooms_branch_idx on rooms(branch_id);

-- ─── People, roles, invites ─────────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  full_name    text,
  phone        text,
  created_at   timestamptz not null default now()
);

create table if not exists memberships (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         app_role not null,
  -- null branch = network-wide (director, investor)
  branch_id    uuid references branches(id) on delete cascade,
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  constraint membership_scope check (
    (role in ('director', 'investor') and branch_id is null) or
    (role in ('manager', 'staff', 'parent') and branch_id is not null)
  )
);
create unique index if not exists memberships_unique
  on memberships(user_id, role, coalesce(branch_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index if not exists memberships_user_idx on memberships(user_id);

-- ─── Children & families ────────────────────────────────────────────────
create table if not exists children (
  id            uuid primary key default gen_random_uuid(),
  branch_id     uuid not null references branches(id),
  room_id       uuid references rooms(id) on delete set null,
  first_name    text not null,
  last_name     text not null,
  date_of_birth date,
  allergies     text,
  medical_notes text,
  dietary_notes text,
  care_plan     text not null default 'full_day'
                check (care_plan in ('full_day', 'half_day', 'hourly')),
  status        text not null default 'enrolled'
                check (status in ('enrolled', 'waitlist', 'withdrawn', 'graduated')),
  enrolled_on   date default current_date,
  created_at    timestamptz not null default now()
);
create index if not exists children_branch_idx on children(branch_id);

create table if not exists invites (
  id            uuid primary key default gen_random_uuid(),
  email         text not null check (email = lower(email)),
  role          app_role not null,
  branch_id     uuid references branches(id) on delete cascade,
  child_id      uuid references children(id) on delete cascade,
  full_name     text,
  relationship  text,
  invited_by    uuid references auth.users(id),
  created_at    timestamptz not null default now(),
  accepted_at   timestamptz,
  expires_at    timestamptz not null default now() + interval '30 days',
  constraint invite_scope check (
    (role in ('director', 'investor') and branch_id is null) or
    (role in ('manager', 'staff') and branch_id is not null) or
    (role = 'parent' and branch_id is not null and child_id is not null)
  )
);
create index if not exists invites_email_idx on invites(email) where accepted_at is null;

create table if not exists guardians (
  id            uuid primary key default gen_random_uuid(),
  child_id      uuid not null references children(id) on delete cascade,
  user_id       uuid references auth.users(id) on delete set null,
  full_name     text not null,
  relationship  text not null default 'Parent',
  phone         text,
  email         text check (email = lower(email)),
  is_primary    boolean not null default false,
  created_at    timestamptz not null default now()
);
create index if not exists guardians_child_idx on guardians(child_id);
create index if not exists guardians_user_idx on guardians(user_id);

-- People allowed to collect a child. Parents request; managers approve.
create table if not exists authorized_pickups (
  id            uuid primary key default gen_random_uuid(),
  child_id      uuid not null references children(id) on delete cascade,
  full_name     text not null,
  relationship  text not null,
  phone         text,
  id_note       text,            -- e.g. "NIN ends 4F2K, shown at gate"
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'revoked')),
  requested_by  uuid references auth.users(id),
  approved_by   uuid references auth.users(id),
  created_at    timestamptz not null default now()
);
create index if not exists pickups_child_idx on authorized_pickups(child_id);

-- One-time pickup code a parent generates for the day. Staff never read
-- it — check_out() compares it server-side.
create table if not exists pickup_codes (
  child_id      uuid not null references children(id) on delete cascade,
  valid_on      date not null default current_date,
  code          text not null,
  issued_by     uuid references auth.users(id),
  issued_at     timestamptz not null default now(),
  primary key (child_id, valid_on)
);

-- ─── The day: attendance, logs, safety checks ───────────────────────────
create table if not exists attendance (
  id               uuid primary key default gen_random_uuid(),
  child_id         uuid not null references children(id) on delete cascade,
  branch_id        uuid not null references branches(id),
  room_id          uuid references rooms(id) on delete set null,
  day              date not null default current_date,
  checked_in_at    timestamptz not null default now(),
  checked_in_by    uuid references auth.users(id),
  dropped_by       text,
  checked_out_at   timestamptz,
  checked_out_by   uuid references auth.users(id),
  picked_up_by     text,
  pickup_id        uuid references authorized_pickups(id),
  pickup_verified  text check (pickup_verified in ('guardian', 'approved_pickup', 'pickup_code')),
  unique (child_id, day)
);
create index if not exists attendance_branch_day_idx on attendance(branch_id, day);

create table if not exists staff_shifts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id),
  branch_id      uuid not null references branches(id),
  room_id        uuid references rooms(id) on delete set null,
  clocked_in_at  timestamptz not null default now(),
  clocked_out_at timestamptz
);
create index if not exists shifts_branch_idx on staff_shifts(branch_id, clocked_in_at);

create table if not exists daily_logs (
  id                uuid primary key default gen_random_uuid(),
  child_id          uuid not null references children(id) on delete cascade,
  branch_id         uuid not null references branches(id),
  kind              text not null check (kind in
                    ('meal', 'nap', 'nappy', 'activity', 'mood', 'medication', 'milestone', 'note')),
  detail            text not null,
  logged_at         timestamptz not null default now(),
  logged_by         uuid references auth.users(id),
  visible_to_parent boolean not null default true
);
create index if not exists logs_child_idx on daily_logs(child_id, logged_at desc);

-- Safe-sleep checks while a child naps (position + breathing).
create table if not exists sleep_checks (
  id           uuid primary key default gen_random_uuid(),
  child_id     uuid not null references children(id) on delete cascade,
  branch_id    uuid not null references branches(id),
  checked_at   timestamptz not null default now(),
  checked_by   uuid references auth.users(id),
  position     text not null check (position in ('back', 'side', 'front')),
  breathing_ok boolean not null default true,
  note         text
);
create index if not exists sleep_checks_child_idx on sleep_checks(child_id, checked_at desc);

-- Name-to-face headcounts at every transition.
create table if not exists roll_calls (
  id            uuid primary key default gen_random_uuid(),
  branch_id     uuid not null references branches(id),
  room_id       uuid references rooms(id) on delete set null,
  taken_at      timestamptz not null default now(),
  taken_by      uuid references auth.users(id),
  reason        text not null check (reason in
                ('opening', 'transition', 'outdoor', 'outing', 'meal', 'nap', 'closing', 'drill')),
  expected      int not null,
  counted       int not null,
  missing_ids   uuid[] not null default '{}',
  resolved      boolean not null default false,
  note          text
);
create index if not exists roll_calls_branch_idx on roll_calls(branch_id, taken_at desc);

create table if not exists incidents (
  id                  uuid primary key default gen_random_uuid(),
  branch_id           uuid not null references branches(id),
  child_id            uuid references children(id) on delete set null,
  occurred_at         timestamptz not null default now(),
  kind                text not null check (kind in
                      ('injury', 'illness', 'behaviour', 'safeguarding', 'pickup_alert', 'near_miss', 'property')),
  severity            text not null default 'minor' check (severity in ('minor', 'moderate', 'serious')),
  description         text not null,
  action_taken        text,
  reported_by         uuid references auth.users(id),
  parent_notified_at  timestamptz,
  parent_ack_at       timestamptz,
  parent_ack_by       uuid references auth.users(id),
  status              text not null default 'open' check (status in ('open', 'closed')),
  director_reviewed_at timestamptz
);
create index if not exists incidents_branch_idx on incidents(branch_id, occurred_at desc);

create table if not exists visitors (
  id             uuid primary key default gen_random_uuid(),
  branch_id      uuid not null references branches(id),
  full_name      text not null,
  purpose        text not null,
  phone          text,
  id_checked     boolean not null default false,
  escorted_by    text,
  signed_in_at   timestamptz not null default now(),
  signed_out_at  timestamptz,
  logged_by      uuid references auth.users(id)
);

create table if not exists absences (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid not null references children(id) on delete cascade,
  branch_id      uuid not null references branches(id),
  day            date not null default current_date,
  reason         text not null,
  source         text not null check (source in ('parent', 'staff')),
  reported_by    uuid references auth.users(id),
  reported_at    timestamptz not null default now(),
  followed_up_at timestamptz,
  outcome        text,
  unique (child_id, day)
);

-- ─── Communication ──────────────────────────────────────────────────────
create table if not exists message_threads (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('family', 'branch', 'investor')),
  -- family: guardians of child_id ↔ branch team (+ director)
  -- branch: branch managers ↔ director
  -- investor: investors ↔ director
  branch_id   uuid references branches(id) on delete cascade,
  child_id    uuid references children(id) on delete cascade,
  subject     text not null,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  constraint thread_scope check (
    (kind = 'family'   and branch_id is not null and child_id is not null) or
    (kind = 'branch'   and branch_id is not null and child_id is null) or
    (kind = 'investor' and branch_id is null and child_id is null)
  )
);

create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  thread_id   uuid not null references message_threads(id) on delete cascade,
  sender_id   uuid not null references auth.users(id),
  sender_name text not null,
  sender_role app_role not null,
  body        text not null check (length(body) between 1 and 4000),
  created_at  timestamptz not null default now()
);
create index if not exists messages_thread_idx on messages(thread_id, created_at);

-- ─── Money ──────────────────────────────────────────────────────────────
create table if not exists invoices (
  id          uuid primary key default gen_random_uuid(),
  branch_id   uuid not null references branches(id),
  child_id    uuid not null references children(id) on delete cascade,
  period      text not null,               -- e.g. "November 2026"
  amount_ugx  bigint not null check (amount_ugx >= 0),
  due_on      date not null,
  status      text not null default 'sent'
              check (status in ('draft', 'sent', 'paid', 'overdue', 'void')),
  paid_at     timestamptz,
  method      text check (method in ('mtn_momo', 'airtel_money', 'bank', 'cash')),
  reference   text unique,
  created_at  timestamptz not null default now()
);
create index if not exists invoices_branch_idx on invoices(branch_id, due_on);

-- ─── From the website ───────────────────────────────────────────────────
create table if not exists enquiries (
  id             uuid primary key default gen_random_uuid(),
  branch_id      uuid references branches(id) on delete set null,
  parent_name    text not null check (length(parent_name) between 2 and 120),
  phone          text not null check (length(phone) between 7 and 20),
  child_age      text,
  preferred_date date,
  message        text check (length(message) <= 1000),
  source         text not null default 'website',
  status         text not null default 'new'
                 check (status in ('new', 'contacted', 'toured', 'enrolled', 'lost')),
  created_at     timestamptz not null default now()
);

create table if not exists location_requests (
  id          uuid primary key default gen_random_uuid(),
  area        text not null check (length(area) between 2 and 120),
  full_name   text not null check (length(full_name) between 2 and 120),
  phone       text check (length(phone) <= 20),
  created_at  timestamptz not null default now()
);

-- ─── Audit trail for sensitive actions ──────────────────────────────────
create table if not exists audit_log (
  id         bigint generated always as identity primary key,
  actor      uuid,
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  branch_id  uuid,
  detail     jsonb,
  at         timestamptz not null default now()
);

-- Emails are stored lower-case so invites match however people type them.
create or replace function lower_email() returns trigger language plpgsql as $$
begin
  if new.email is not null then new.email := lower(trim(new.email)); end if;
  return new;
end $$;
drop trigger if exists invites_lower_email on invites;
create trigger invites_lower_email before insert or update on invites for each row execute function lower_email();
drop trigger if exists guardians_lower_email on guardians;
create trigger guardians_lower_email before insert or update on guardians for each row execute function lower_email();

-- ═══════════════════════════════════════════════════════════════════════
-- Access helpers (security definer so policies don't recurse)
-- ═══════════════════════════════════════════════════════════════════════
create or replace function is_director() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships
                 where user_id = auth.uid() and role = 'director' and active);
$$;

create or replace function is_investor() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from memberships
                 where user_id = auth.uid() and role = 'investor' and active);
$$;

-- Director, or holds one of `roles` in `branch`.
create or replace function has_branch_role(branch uuid, roles app_role[]) returns boolean
language sql stable security definer set search_path = public as $$
  select is_director() or exists (
    select 1 from memberships
    where user_id = auth.uid() and branch_id = branch and role = any(roles) and active);
$$;

create or replace function is_branch_team(branch uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select has_branch_role(branch, array['manager', 'staff']::app_role[]);
$$;

create or replace function is_guardian(child uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from guardians where child_id = child and user_id = auth.uid());
$$;

create or replace function child_branch(child uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select branch_id from children where id = child;
$$;

create or replace function my_name() returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select full_name from profiles where id = auth.uid()),
                  auth.jwt() ->> 'email', 'Pikadon user');
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════════════
alter table branches           enable row level security;
alter table rooms              enable row level security;
alter table profiles           enable row level security;
alter table memberships        enable row level security;
alter table invites            enable row level security;
alter table children           enable row level security;
alter table guardians          enable row level security;
alter table authorized_pickups enable row level security;
alter table pickup_codes       enable row level security;
alter table attendance         enable row level security;
alter table staff_shifts       enable row level security;
alter table daily_logs         enable row level security;
alter table sleep_checks       enable row level security;
alter table roll_calls         enable row level security;
alter table incidents          enable row level security;
alter table visitors           enable row level security;
alter table absences           enable row level security;
alter table message_threads    enable row level security;
alter table messages           enable row level security;
alter table invoices           enable row level security;
alter table enquiries          enable row level security;
alter table location_requests  enable row level security;
alter table audit_log          enable row level security;

-- Branches: everyone attached to the network can see branch names; only
-- the director changes them.
create policy branches_read on branches for select to authenticated using (
  is_director() or is_investor()
  or exists (select 1 from memberships m where m.user_id = auth.uid() and m.branch_id = branches.id and m.active)
);
create policy branches_write on branches for all to authenticated
  using (is_director()) with check (is_director());

create policy rooms_read on rooms for select to authenticated using (
  has_branch_role(branch_id, array['manager', 'staff', 'parent']::app_role[])
);
create policy rooms_write on rooms for all to authenticated
  using (has_branch_role(branch_id, array['manager']::app_role[]))
  with check (has_branch_role(branch_id, array['manager']::app_role[]));

create policy profiles_self on profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_team_read on profiles for select to authenticated using (
  is_director() or exists (
    select 1 from memberships mine join memberships theirs on theirs.branch_id = mine.branch_id
    where mine.user_id = auth.uid() and mine.role in ('manager', 'staff') and theirs.user_id = profiles.id)
);

-- Memberships are created only by accept_invites() or the director.
create policy memberships_read on memberships for select to authenticated using (
  user_id = auth.uid() or is_director()
  or (branch_id is not null and has_branch_role(branch_id, array['manager']::app_role[]))
);
create policy memberships_director on memberships for all to authenticated
  using (is_director()) with check (is_director());
create policy memberships_manager_deactivate on memberships for update to authenticated
  using (branch_id is not null and role in ('staff', 'parent') and has_branch_role(branch_id, array['manager']::app_role[]))
  with check (branch_id is not null and role in ('staff', 'parent') and has_branch_role(branch_id, array['manager']::app_role[]));

create policy invites_read on invites for select to authenticated using (
  is_director() or (branch_id is not null and has_branch_role(branch_id, array['manager']::app_role[]))
);
create policy invites_create on invites for insert to authenticated with check (
  is_director()
  or (role in ('staff', 'parent') and branch_id is not null
      and has_branch_role(branch_id, array['manager']::app_role[]))
);
create policy invites_delete on invites for delete to authenticated using (
  is_director() or (role in ('staff', 'parent') and branch_id is not null
                    and has_branch_role(branch_id, array['manager']::app_role[]))
);

-- Children: branch team + director + the child's own guardians.
-- Investors never see child records.
create policy children_read on children for select to authenticated using (
  is_branch_team(branch_id) or is_guardian(id)
);
create policy children_write on children for all to authenticated
  using (has_branch_role(branch_id, array['manager']::app_role[]))
  with check (has_branch_role(branch_id, array['manager']::app_role[]));

create policy guardians_read on guardians for select to authenticated using (
  is_branch_team(child_branch(child_id)) or is_guardian(child_id)
);
create policy guardians_write on guardians for all to authenticated
  using (has_branch_role(child_branch(child_id), array['manager']::app_role[]))
  with check (has_branch_role(child_branch(child_id), array['manager']::app_role[]));

create policy pickups_read on authorized_pickups for select to authenticated using (
  is_branch_team(child_branch(child_id)) or is_guardian(child_id)
);
-- Parents can request (pending) or revoke — never approve.
create policy pickups_parent_request on authorized_pickups for insert to authenticated with check (
  is_guardian(child_id) and status = 'pending' and requested_by = auth.uid()
);
create policy pickups_parent_revoke on authorized_pickups for update to authenticated
  using (is_guardian(child_id)) with check (is_guardian(child_id) and status = 'revoked');
create policy pickups_manager on authorized_pickups for all to authenticated
  using (has_branch_role(child_branch(child_id), array['manager']::app_role[]))
  with check (has_branch_role(child_branch(child_id), array['manager']::app_role[]));

-- Pickup codes: only the child's guardians can read their own code.
create policy pickup_codes_guardian on pickup_codes for select to authenticated using (is_guardian(child_id));

-- Attendance changes go through check_in()/check_out(); team and
-- guardians can read.
create policy attendance_read on attendance for select to authenticated using (
  is_branch_team(branch_id) or is_guardian(child_id)
);
create policy attendance_room_move on attendance for update to authenticated
  using (is_branch_team(branch_id)) with check (is_branch_team(branch_id));

create policy shifts_read on staff_shifts for select to authenticated using (
  user_id = auth.uid() or has_branch_role(branch_id, array['manager', 'staff']::app_role[])
);
create policy shifts_self on staff_shifts for insert to authenticated with check (
  user_id = auth.uid() and is_branch_team(branch_id)
);
create policy shifts_self_close on staff_shifts for update to authenticated
  using (user_id = auth.uid() or has_branch_role(branch_id, array['manager']::app_role[]))
  with check (user_id = auth.uid() or has_branch_role(branch_id, array['manager']::app_role[]));

create policy logs_read on daily_logs for select to authenticated using (
  is_branch_team(branch_id) or (visible_to_parent and is_guardian(child_id))
);
create policy logs_write on daily_logs for insert to authenticated with check (
  is_branch_team(branch_id) and branch_id = child_branch(child_id) and logged_by = auth.uid()
);
create policy logs_fix on daily_logs for update to authenticated
  using (is_branch_team(branch_id)) with check (is_branch_team(branch_id));

create policy sleep_read on sleep_checks for select to authenticated using (
  is_branch_team(branch_id) or is_guardian(child_id)
);
create policy sleep_write on sleep_checks for insert to authenticated with check (
  is_branch_team(branch_id) and branch_id = child_branch(child_id) and checked_by = auth.uid()
);

create policy roll_read on roll_calls for select to authenticated using (is_branch_team(branch_id));
create policy roll_write on roll_calls for insert to authenticated with check (
  is_branch_team(branch_id) and taken_by = auth.uid()
);
create policy roll_resolve on roll_calls for update to authenticated
  using (is_branch_team(branch_id)) with check (is_branch_team(branch_id));

create policy incidents_read on incidents for select to authenticated using (
  is_branch_team(branch_id) or (child_id is not null and is_guardian(child_id))
);
create policy incidents_write on incidents for insert to authenticated with check (
  is_branch_team(branch_id) and reported_by = auth.uid()
);
create policy incidents_manage on incidents for update to authenticated
  using (has_branch_role(branch_id, array['manager']::app_role[]))
  with check (has_branch_role(branch_id, array['manager']::app_role[]));

create policy visitors_team on visitors for all to authenticated
  using (is_branch_team(branch_id)) with check (is_branch_team(branch_id));

create policy absences_read on absences for select to authenticated using (
  is_branch_team(branch_id) or is_guardian(child_id)
);
create policy absences_parent on absences for insert to authenticated with check (
  is_guardian(child_id) and source = 'parent' and reported_by = auth.uid()
  and branch_id = child_branch(child_id)
);
create policy absences_team on absences for all to authenticated
  using (is_branch_team(branch_id)) with check (is_branch_team(branch_id));

-- Threads: who can see each kind of conversation.
create or replace function can_see_thread(t message_threads) returns boolean
language sql stable security definer set search_path = public as $$
  select case t.kind
    when 'family'   then is_branch_team(t.branch_id) or is_guardian(t.child_id)
    when 'branch'   then has_branch_role(t.branch_id, array['manager']::app_role[])
    when 'investor' then is_director() or is_investor()
  end;
$$;

create policy threads_read on message_threads for select to authenticated using (can_see_thread(message_threads));
create policy threads_create on message_threads for insert to authenticated with check (
  created_by = auth.uid() and can_see_thread(message_threads)
);
create policy threads_touch on message_threads for update to authenticated
  using (can_see_thread(message_threads)) with check (can_see_thread(message_threads));

create policy messages_read on messages for select to authenticated using (
  exists (select 1 from message_threads t where t.id = messages.thread_id and can_see_thread(t))
);
create policy messages_send on messages for insert to authenticated with check (
  sender_id = auth.uid()
  and exists (select 1 from message_threads t where t.id = messages.thread_id and can_see_thread(t))
);

create policy invoices_read on invoices for select to authenticated using (
  has_branch_role(branch_id, array['manager']::app_role[]) or is_guardian(child_id)
);
create policy invoices_write on invoices for all to authenticated
  using (has_branch_role(branch_id, array['manager']::app_role[]))
  with check (has_branch_role(branch_id, array['manager']::app_role[]));

-- Public website forms: anyone may submit, only the team may read.
create policy enquiries_submit on enquiries for insert to anon, authenticated with check (status = 'new');
create policy enquiries_read on enquiries for select to authenticated using (
  is_director() or (branch_id is not null and has_branch_role(branch_id, array['manager']::app_role[]))
);
create policy enquiries_update on enquiries for update to authenticated
  using (is_director() or (branch_id is not null and has_branch_role(branch_id, array['manager']::app_role[])))
  with check (is_director() or (branch_id is not null and has_branch_role(branch_id, array['manager']::app_role[])));

create policy location_requests_submit on location_requests for insert to anon, authenticated with check (true);
create policy location_requests_read on location_requests for select to authenticated using (is_director() or is_investor());

create policy audit_read on audit_log for select to authenticated using (
  is_director() or (branch_id is not null and has_branch_role(branch_id, array['manager']::app_role[]))
);

-- The public website needs the list of open branches (name/area only).
-- Column grant keeps anon away from address/phone/capacity; the view runs
-- with the caller's rights so row security still applies.
create policy branches_public on branches for select to anon
  using (status in ('open', 'planning'));
grant select (id, name, area, opens_at, closes_at, status) on branches to anon;
create or replace view public_branches with (security_invoker = true) as
  select id, name, area, opens_at, closes_at, status from branches where status in ('open', 'planning');
grant select on public_branches to anon, authenticated;

-- ═══════════════════════════════════════════════════════════════════════
-- Actions (RPCs). Each checks permission itself and writes the audit log.
-- ═══════════════════════════════════════════════════════════════════════

-- Called right after sign-in: turns every pending invite for this verified
-- email into a membership (and links parents to their child).
create or replace function accept_invites() returns int
language plpgsql security definer set search_path = public as $$
declare
  inv invites;
  n int := 0;
  me_email text := lower(auth.jwt() ->> 'email');
begin
  if auth.uid() is null or me_email is null then
    raise exception 'Not signed in';
  end if;

  for inv in select * from invites
             where email = me_email and accepted_at is null and expires_at > now()
  loop
    insert into memberships (user_id, role, branch_id)
    values (auth.uid(), inv.role, inv.branch_id)
    on conflict do nothing;

    if inv.role = 'parent' then
      update guardians set user_id = auth.uid()
       where child_id = inv.child_id and email = me_email and user_id is null;
      if not found then
        insert into guardians (child_id, user_id, full_name, relationship, email, is_primary)
        values (inv.child_id, auth.uid(), coalesce(inv.full_name, me_email::text),
                coalesce(inv.relationship, 'Parent'), me_email,
                not exists (select 1 from guardians where child_id = inv.child_id));
      end if;
    end if;

    insert into profiles (id, full_name) values (auth.uid(), inv.full_name)
    on conflict (id) do update set full_name = coalesce(profiles.full_name, excluded.full_name);

    update invites set accepted_at = now() where id = inv.id;
    insert into audit_log (actor, action, entity, entity_id, branch_id, detail)
    values (auth.uid(), 'invite.accepted', 'membership', inv.id, inv.branch_id,
            jsonb_build_object('role', inv.role));
    n := n + 1;
  end loop;
  return n;
end $$;

-- Director opens a new branch: branch + rooms + manager invite, atomically.
create or replace function add_branch(
  p_name text, p_area text, p_address text, p_phone text,
  p_capacity int, p_opens time, p_closes time, p_status text,
  p_rooms jsonb, p_manager_email text, p_manager_name text
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  b uuid;
  r jsonb;
begin
  if not is_director() then raise exception 'Only the global director can add a branch'; end if;

  insert into branches (name, area, address, phone, capacity, opens_at, closes_at, status, opened_on, created_by)
  values (p_name, p_area, p_address, p_phone, p_capacity, p_opens, p_closes, p_status,
          case when p_status = 'open' then current_date end, auth.uid())
  returning id into b;

  for r in select * from jsonb_array_elements(coalesce(p_rooms, '[]'::jsonb)) loop
    insert into rooms (branch_id, name, age_band, capacity, ratio)
    values (b, r ->> 'name', r ->> 'age_band',
            coalesce((r ->> 'capacity')::int, 12), coalesce((r ->> 'ratio')::int, 6));
  end loop;

  if p_manager_email is not null and length(trim(p_manager_email)) > 3 then
    insert into invites (email, role, branch_id, full_name, invited_by)
    values (lower(trim(p_manager_email)), 'manager', b, p_manager_name, auth.uid());
  end if;

  insert into audit_log (actor, action, entity, entity_id, branch_id, detail)
  values (auth.uid(), 'branch.created', 'branch', b, b, jsonb_build_object('name', p_name, 'area', p_area));
  return b;
end $$;

create or replace function check_in(p_child uuid, p_dropped_by text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  c children;
  a uuid;
begin
  select * into c from children where id = p_child;
  if c.id is null or c.status <> 'enrolled' then raise exception 'Child not enrolled'; end if;
  if not is_branch_team(c.branch_id) then raise exception 'Not on this branch team'; end if;

  insert into attendance (child_id, branch_id, room_id, checked_in_by, dropped_by)
  values (c.id, c.branch_id, c.room_id, auth.uid(), p_dropped_by)
  on conflict (child_id, day) do nothing
  returning id into a;
  if a is null then raise exception 'Already checked in today'; end if;
  return a;
end $$;

-- Check-out only succeeds for a guardian, an approved pickup, or with the
-- parent's one-time code. A refused attempt raises a pickup alert incident
-- the manager and the parents both see.
create or replace function check_out(
  p_child uuid, p_guardian uuid, p_pickup uuid, p_name text, p_code text
) returns text
language plpgsql security definer set search_path = public as $$
declare
  c children;
  att attendance;
  verified text;
  who text;
begin
  select * into c from children where id = p_child;
  if c.id is null then raise exception 'Unknown child'; end if;
  if not is_branch_team(c.branch_id) then raise exception 'Not on this branch team'; end if;

  select * into att from attendance where child_id = p_child and day = current_date and checked_out_at is null;
  if att.id is null then raise exception 'Child is not checked in'; end if;

  if p_guardian is not null then
    select full_name into who from guardians where id = p_guardian and child_id = p_child;
    if who is not null then verified := 'guardian'; end if;
  elsif p_pickup is not null then
    select full_name into who from authorized_pickups
     where id = p_pickup and child_id = p_child and status = 'approved';
    if who is not null then verified := 'approved_pickup'; end if;
  elsif p_code is not null then
    if exists (select 1 from pickup_codes where child_id = p_child and valid_on = current_date and code = p_code) then
      verified := 'pickup_code';
      who := coalesce(nullif(trim(p_name), ''), 'Code holder');
      delete from pickup_codes where child_id = p_child and valid_on = current_date;
    end if;
  end if;

  if verified is null then
    insert into incidents (branch_id, child_id, kind, severity, description, action_taken, reported_by, parent_notified_at)
    values (c.branch_id, c.id, 'pickup_alert', 'serious',
            format('Pickup refused: %s was not on the approved list and had no valid code.',
                   coalesce(nullif(trim(p_name), ''), 'Unknown person')),
            'Child kept inside. Parents notified.', auth.uid(), now());
    insert into audit_log (actor, action, entity, entity_id, branch_id, detail)
    values (auth.uid(), 'pickup.refused', 'child', c.id, c.branch_id, jsonb_build_object('name', p_name));
    return 'refused';
  end if;

  update attendance
     set checked_out_at = now(), checked_out_by = auth.uid(),
         picked_up_by = who, pickup_id = p_pickup, pickup_verified = verified
   where id = att.id;
  return verified;
end $$;

-- Parent generates today's 6-digit pickup code for someone collecting
-- on their behalf.
create or replace function issue_pickup_code(p_child uuid) returns text
language plpgsql security definer set search_path = public as $$
declare code text;
begin
  if not is_guardian(p_child) then raise exception 'Not your child'; end if;
  code := lpad((floor(random() * 1000000))::int::text, 6, '0');
  insert into pickup_codes (child_id, code, issued_by) values (p_child, code, auth.uid())
  on conflict (child_id, valid_on) do update set code = excluded.code, issued_at = now(), issued_by = auth.uid();
  return code;
end $$;

create or replace function acknowledge_incident(p_incident uuid) returns void
language plpgsql security definer set search_path = public as $$
declare ch uuid;
begin
  select child_id into ch from incidents where id = p_incident;
  if ch is null or not is_guardian(ch) then raise exception 'Not your child'; end if;
  update incidents set parent_ack_at = now(), parent_ack_by = auth.uid()
   where id = p_incident and parent_ack_at is null;
end $$;

create or replace function approve_pickup(p_pickup uuid, p_approve boolean) returns void
language plpgsql security definer set search_path = public as $$
declare ch uuid;
begin
  select child_id into ch from authorized_pickups where id = p_pickup;
  if ch is null or not has_branch_role(child_branch(ch), array['manager']::app_role[]) then
    raise exception 'Only the branch manager can approve pickups';
  end if;
  update authorized_pickups
     set status = case when p_approve then 'approved' else 'revoked' end, approved_by = auth.uid()
   where id = p_pickup;
  insert into audit_log (actor, action, entity, entity_id, branch_id)
  values (auth.uid(), case when p_approve then 'pickup.approved' else 'pickup.declined' end,
          'authorized_pickup', p_pickup, child_branch(ch));
end $$;

-- Network numbers for the director, investors and (own branch) managers.
-- Aggregates only — no child names or health data leave this function.
create or replace function network_summary() returns table (
  branch_id uuid, branch_name text, area text, status text, capacity int,
  enrolled bigint, present_today bigint, staff_on_duty bigint,
  invoiced_month bigint, collected_month bigint, overdue_ugx bigint,
  open_incidents bigint, new_enquiries bigint
)
language sql stable security definer set search_path = public as $$
  select b.id, b.name, b.area, b.status, b.capacity,
    (select count(*) from children c where c.branch_id = b.id and c.status = 'enrolled'),
    (select count(*) from attendance a where a.branch_id = b.id and a.day = current_date and a.checked_out_at is null),
    (select count(*) from staff_shifts s where s.branch_id = b.id and s.clocked_out_at is null
                                             and s.clocked_in_at::date = current_date),
    (select coalesce(sum(amount_ugx), 0) from invoices i where i.branch_id = b.id and i.status <> 'void'
                                             and date_trunc('month', i.due_on) = date_trunc('month', current_date)),
    (select coalesce(sum(amount_ugx), 0) from invoices i where i.branch_id = b.id and i.status = 'paid'
                                             and date_trunc('month', i.paid_at) = date_trunc('month', now())),
    (select coalesce(sum(amount_ugx), 0) from invoices i where i.branch_id = b.id
                                             and (i.status = 'overdue' or (i.status = 'sent' and i.due_on < current_date))),
    (select count(*) from incidents x where x.branch_id = b.id and x.status = 'open'),
    (select count(*) from enquiries e where e.branch_id = b.id and e.status = 'new')
  from branches b
  where is_director() or is_investor()
     or has_branch_role(b.id, array['manager']::app_role[])
  order by b.created_at;
$$;

-- ─── Grants ─────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
-- Anon (the public website) gets nothing except: list open branches, send
-- an enquiry, request a new area. Supabase's defaults grant more; remove it.
revoke all on all tables in schema public from anon;
grant select (id, name, area, opens_at, closes_at, status) on branches to anon;
grant select on public_branches to anon;
grant insert on enquiries, location_requests to anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke execute on functions from anon, public;
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated;

-- ─── Realtime: parents see the day as it happens ────────────────────────
do $$ begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table attendance, daily_logs, sleep_checks,
      incidents, absences, messages, authorized_pickups;
  end if;
end $$;
