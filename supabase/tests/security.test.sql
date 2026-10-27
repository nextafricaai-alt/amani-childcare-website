-- PIKADON OS security tests.
-- Run on plain PostgreSQL:  supabase/tests/run.sh
-- Each check raises an exception (and stops the run) if a role can see or
-- do something it should not.
\set ON_ERROR_STOP on
\set QUIET on

-- ─── test helpers ──────────────────────────────────────────────────────
create schema if not exists t;
grant usage on schema t to anon, authenticated;

create or replace function t.ok(cond boolean, label text) returns void language plpgsql as $$
begin
  if not cond then raise exception 'FAIL: %', label; end if;
  raise notice 'pass  %', label;
end $$;

create or replace function t.fails(stmt text, label text) returns void language plpgsql as $$
begin
  begin
    execute stmt;
  exception when others then
    raise notice 'pass  % (blocked: %)', label, sqlerrm;
    return;
  end;
  raise exception 'FAIL: % — statement was allowed', label;
end $$;

create or replace function t.count(q text) returns bigint language plpgsql as $$
declare n bigint;
begin execute 'select count(*) from (' || q || ') x' into n; return n; end $$;

grant execute on all functions in schema t to anon, authenticated;

-- Act as a signed-in user (or anon when email is null).
create or replace function t.login(p_email text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claims',
    case when p_email is null then ''
         else json_build_object('sub', (select id from auth.users where email = p_email),
                                'email', p_email, 'role', 'authenticated')::text end, false);
end $$;

-- ─── users ─────────────────────────────────────────────────────────────
insert into auth.users (id, email) values
  (gen_random_uuid(), 'director@pikadon.test'),
  (gen_random_uuid(), 'investor@pikadon.test'),
  (gen_random_uuid(), 'manager.kampala@pikadon.test'),
  (gen_random_uuid(), 'manager.entebbe@pikadon.test'),
  (gen_random_uuid(), 'staff.kampala@pikadon.test'),
  (gen_random_uuid(), 'parent.aiden@pikadon.test'),
  (gen_random_uuid(), 'parent.bella@pikadon.test'),
  (gen_random_uuid(), 'stranger@pikadon.test');

-- Bootstrapping: the owner creates the first director invite in the
-- Supabase SQL editor (this is the only manual step).
insert into invites (email, role, full_name) values ('director@pikadon.test', 'director', 'Global Director');

-- ─── Director ──────────────────────────────────────────────────────────
select t.login('director@pikadon.test');
set role authenticated;
select t.ok(accept_invites() = 1, 'director accepts invite');
select t.ok(is_director(), 'director role active');

select add_branch('Pikadon Kampala', 'Kampala', 'Plot 1', '256700000001', 40, '07:00', '18:00', 'open',
  '[{"name":"Toddlers","age_band":"2-3","capacity":12,"ratio":5},{"name":"Preschool","age_band":"3-5","capacity":16,"ratio":8}]',
  'manager.kampala@pikadon.test', 'Grace (Kampala)');
select add_branch('Pikadon Entebbe', 'Entebbe', null, null, 30, '07:00', '18:00', 'planning',
  '[{"name":"Mixed","capacity":15,"ratio":6}]', 'manager.entebbe@pikadon.test', 'Joseph (Entebbe)');
select t.ok(t.count('select * from branches') = 2, 'director sees both branches');
select t.ok(t.count('select * from rooms') = 3, 'rooms created with branches');
insert into invites (email, role, full_name) values ('investor@pikadon.test', 'investor', 'Shalua');
reset role;

-- ─── Managers ──────────────────────────────────────────────────────────
select t.login('manager.kampala@pikadon.test');
set role authenticated;
select t.ok(accept_invites() = 1, 'Kampala manager accepts invite');
select t.ok(t.count('select * from branches') = 1, 'Kampala manager sees only own branch');
select t.fails($$select add_branch('Rogue', 'X', null, null, 10, '07:00', '18:00', 'open', '[]', null, null)$$,
  'manager cannot add a branch');
select t.fails($$insert into invites (email, role) values ('x@y.z', 'director')$$,
  'manager cannot invite a director');

insert into children (branch_id, room_id, first_name, last_name, date_of_birth, allergies)
select b.id, r.id, 'Aiden', 'Nakamya', '2023-05-14', 'Peanuts'
from branches b join rooms r on r.branch_id = b.id and r.name = 'Toddlers' where b.name = 'Pikadon Kampala';
insert into children (branch_id, room_id, first_name, last_name, date_of_birth)
select b.id, r.id, 'Bella', 'Okello', '2024-02-10'
from branches b join rooms r on r.branch_id = b.id and r.name = 'Toddlers' where b.name = 'Pikadon Kampala';

insert into invites (email, role, branch_id, full_name)
select 'staff.kampala@pikadon.test', 'staff', id, 'Ruth (Caregiver)' from branches where name = 'Pikadon Kampala';
insert into invites (email, role, branch_id, child_id, full_name, relationship)
select 'parent.aiden@pikadon.test', 'parent', branch_id, id, 'Mrs. Nakamya', 'Mother' from children where first_name = 'Aiden';
insert into invites (email, role, branch_id, child_id, full_name, relationship)
select 'parent.bella@pikadon.test', 'parent', branch_id, id, 'Ms. Okello', 'Mother' from children where first_name = 'Bella';
insert into invoices (branch_id, child_id, period, amount_ugx, due_on, status)
select branch_id, id, 'This month', 450000, current_date + 5, 'sent' from children where first_name = 'Aiden';
reset role;

select set_config('t.kampala', (select id::text from branches where name = 'Pikadon Kampala'), false);
select t.login('manager.entebbe@pikadon.test');
set role authenticated;
select t.ok(accept_invites() = 1, 'Entebbe manager accepts invite');
insert into children (branch_id, first_name, last_name)
select id, 'Cece', 'Achieng' from branches where name = 'Pikadon Entebbe';
select t.ok(t.count('select * from children') = 1, 'Entebbe manager sees only Entebbe children');
select t.fails($$insert into children (branch_id, first_name, last_name)
  values (current_setting('t.kampala')::uuid, 'Sneaky', 'Kid')$$, 'Entebbe manager cannot add a child to Kampala');
select t.ok(t.count('select * from branches where name = ''Pikadon Kampala''') = 0, 'Entebbe manager cannot even see Kampala');
reset role;

select t.login('manager.kampala@pikadon.test');
set role authenticated;
select t.ok(t.count('select * from children') = 2, 'Kampala manager sees only Kampala children');
reset role;

-- ─── Staff: check-in, logs, safety checks ──────────────────────────────
select t.login('staff.kampala@pikadon.test');
set role authenticated;
select t.ok(accept_invites() = 1, 'staff accepts invite');
select check_in((select id from children where first_name = 'Aiden'), 'Mrs. Nakamya');
select check_in((select id from children where first_name = 'Bella'), 'Ms. Okello');
select t.fails($$select check_in((select id from children where first_name = 'Aiden'), 'again')$$, 'cannot check in twice');
insert into daily_logs (child_id, branch_id, kind, detail, logged_by)
select id, branch_id, 'meal', 'Ate all of lunch: rice and beans', auth.uid() from children where first_name = 'Aiden';
insert into daily_logs (child_id, branch_id, kind, detail, logged_by, visible_to_parent)
select id, branch_id, 'note', 'Internal: watch for cough', auth.uid(), false from children where first_name = 'Aiden';
insert into sleep_checks (child_id, branch_id, checked_by, position)
select id, branch_id, auth.uid(), 'back' from children where first_name = 'Aiden';
insert into roll_calls (branch_id, room_id, taken_by, reason, expected, counted)
select branch_id, room_id, auth.uid(), 'outdoor', 2, 2 from children where first_name = 'Aiden';
select t.fails($$select add_branch('Rogue', 'X', null, null, 10, '07:00', '18:00', 'open', '[]', null, null)$$, 'staff cannot add a branch');
select t.fails($$insert into invites (email, role, branch_id, full_name)
  select 'x@y.z', 'staff', id, 'x' from branches limit 1$$, 'staff cannot invite people');
select t.ok(t.count('select * from invoices') = 0, 'staff cannot see fees');
reset role;

-- ─── Parents ───────────────────────────────────────────────────────────
select t.login('parent.aiden@pikadon.test');
set role authenticated;
select t.ok(accept_invites() = 1, 'parent accepts invite');
select t.ok(t.count('select * from children') = 1, 'parent sees only their own child');
select t.ok(t.count('select * from children where first_name = ''Bella''') = 0, 'parent cannot see another family''s child');
select t.ok(t.count('select * from daily_logs') = 1, 'parent sees parent-visible logs only (internal note hidden)');
select t.ok(t.count('select * from sleep_checks') = 1, 'parent sees their child''s sleep checks');
select t.ok(t.count('select * from roll_calls') = 0, 'parent cannot see roll calls');
select t.ok(t.count('select * from invoices') = 1, 'parent sees their own invoice');
select t.ok(t.count('select * from branches') = 1, 'parent sees their branch name');
select t.fails($$insert into daily_logs (child_id, branch_id, kind, detail, logged_by)
  select id, branch_id, 'note', 'fake', auth.uid() from children$$, 'parent cannot write daily logs');
with u as (update children set allergies = 'None' returning 1)
select t.ok((select count(*) from u) = 0, 'parent cannot edit the child record');
insert into authorized_pickups (child_id, full_name, relationship, phone, requested_by)
select id, 'Uncle Sam', 'Uncle', '256700000099', auth.uid() from children;
select t.fails($$insert into authorized_pickups (child_id, full_name, relationship, status, requested_by)
  select id, 'Self-approved', 'Friend', 'approved', auth.uid() from children$$, 'parent cannot self-approve a pickup person');
select t.ok(length(issue_pickup_code((select id from children))) = 6, 'parent issues a 6-digit pickup code');
insert into absences (child_id, branch_id, day, reason, source, reported_by)
select id, branch_id, current_date + 1, 'Doctor appointment', 'parent', auth.uid() from children;
reset role;

select t.login('parent.bella@pikadon.test');
set role authenticated;
select accept_invites();
select t.ok(t.count('select * from children') = 1, 'second parent sees only Bella');
select t.ok(t.count('select * from pickup_codes') = 0, 'second parent cannot read Aiden''s pickup code');
select t.fails($$select issue_pickup_code((select id from children where first_name = 'Aiden'))$$, 'parent cannot issue a code for another child');
reset role;

-- ─── Pickup verification at the gate ───────────────────────────────────
select t.login('staff.kampala@pikadon.test');
set role authenticated;
select t.ok(t.count('select * from pickup_codes') = 0, 'staff cannot read pickup codes');
select t.ok(
  check_out((select id from children where first_name = 'Aiden'), null, null, 'Unknown man', null) = 'refused',
  'unknown person is refused at pickup');
select t.ok(t.count($$select * from incidents where kind = 'pickup_alert'$$) = 1, 'refused pickup raises a pickup alert');
select t.ok(
  check_out((select id from children where first_name = 'Aiden'), null, null, 'Auntie Joy', '000000') = 'refused',
  'wrong code is refused');
reset role;

-- Correct code (read as superuser only to simulate the parent sharing it)
select set_config('t.code', (select code from pickup_codes limit 1), false);
select t.login('staff.kampala@pikadon.test');
set role authenticated;
select t.ok(
  check_out((select id from children where first_name = 'Aiden'), null, null, 'Auntie Joy', current_setting('t.code')) = 'pickup_code',
  'valid one-time code releases the child');
select t.ok(t.count('select * from attendance where checked_out_at is not null and pickup_verified = ''pickup_code''') = 1,
  'attendance records who collected and how');
select t.ok(
  check_out((select id from children where first_name = 'Bella'), (select id from guardians g where g.child_id = (select id from children where first_name = 'Bella')), null, null, null) = 'guardian',
  'guardian on file can collect');
reset role;

select t.login('parent.aiden@pikadon.test');
set role authenticated;
select t.ok(t.count($$select * from incidents where kind = 'pickup_alert'$$) = 2, 'parent sees both pickup alerts for their child');
select acknowledge_incident((select id from incidents order by occurred_at limit 1));
select t.ok(t.count('select * from incidents where parent_ack_at is not null') = 1, 'parent acknowledges an incident');
reset role;

select t.login('parent.bella@pikadon.test');
set role authenticated;
select t.ok(t.count('select * from incidents') = 0, 'other parent sees none of Aiden''s incidents');
reset role;

-- ─── Manager approves the pickup request ───────────────────────────────
select t.login('manager.kampala@pikadon.test');
set role authenticated;
select approve_pickup((select id from authorized_pickups where full_name = 'Uncle Sam'), true);
select t.ok(t.count($$select * from authorized_pickups where status = 'approved'$$) = 1, 'manager approves the pickup person');
select t.ok(t.count('select * from absences') = 1, 'manager sees the parent''s absence notice');
reset role;

select t.login('manager.entebbe@pikadon.test');
set role authenticated;
select t.fails($$select approve_pickup((select id from authorized_pickups limit 1), true)$$, 'other branch manager cannot approve');
select t.ok(t.count('select * from incidents') = 0, 'other branch manager cannot see Kampala incidents');
reset role;

-- ─── Investor ──────────────────────────────────────────────────────────
select t.login('investor@pikadon.test');
set role authenticated;
select t.ok(accept_invites() = 1, 'investor accepts invite');
select t.ok(t.count('select * from children') = 0, 'investor sees no child records');
select t.ok(t.count('select * from incidents') = 0, 'investor sees no incident details');
select t.ok(t.count('select * from network_summary()') = 2, 'investor sees network numbers for both branches');
select t.ok((select sum(enrolled) from network_summary()) = 3, 'network summary counts enrolled children');
reset role;

-- ─── Strangers & the public website ────────────────────────────────────
select t.login('stranger@pikadon.test');
set role authenticated;
select t.ok(accept_invites() = 0, 'stranger has no invites');
select t.ok(t.count('select * from branches') = 0, 'stranger sees no branches');
select t.ok(t.count('select * from children') = 0, 'stranger sees no children');
select t.ok(t.count('select * from network_summary()') = 0, 'stranger gets no numbers');
reset role;

select t.login(null);
set role anon;
insert into enquiries (parent_name, phone, child_age, message) values ('Website Parent', '256700111222', '3 years', 'Can we visit Friday?');
insert into location_requests (area, full_name, phone) values ('Mukono', 'Website Parent', '256700111222');
select t.ok(t.count('select * from public_branches') = 2, 'website can list branches (name and area only)');
select t.fails('select * from children', 'anonymous visitor cannot read children');
select t.fails('select * from enquiries', 'anonymous visitor cannot read enquiries');
select t.fails($$select add_branch('x','x',null,null,1,'07:00','18:00','open','[]',null,null)$$, 'anonymous visitor cannot call actions');
reset role;

select t.login('director@pikadon.test');
set role authenticated;
select t.ok(t.count('select * from enquiries') = 1, 'director sees website enquiries');
select t.ok(t.count('select * from location_requests') = 1, 'director sees location requests from the website');
select t.ok(t.count('select * from children') = 3, 'director sees every child in every branch');
select t.ok(t.count('select * from audit_log') >= 5, 'sensitive actions are in the audit log');
reset role;

\echo 'ALL SECURITY TESTS PASSED'
