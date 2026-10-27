# Pikadon OS — going live

The app lives at **pikadon.ug/app** inside this repo. With no database
configured it runs in **demo mode** (sample data, pick any person). These
steps switch it to the real Pikadon database. Allow about 30 minutes.

## 1. Create the Supabase project
1. supabase.com → New project → name it `pikadon-os`, region **closest to
   Uganda** (e.g. `eu-central`/Frankfurt or `af-south`/Cape Town if offered).
2. Save the database password in the company password manager.

## 2. Create the tables and security rules
SQL Editor → New query → paste all of
`supabase/migrations/20261027000000_pikadon_os.sql` → **Run**.
It creates every table with Row Level Security switched on.

## 3. Make yourself the first director
Still in the SQL editor (this is the only manual role you ever create):

```sql
insert into invites (email, role, full_name)
values ('your.email@pikadon.ug', 'director', 'Your Name');
```

Everyone else is invited from inside the app.

## 4. Sign-in by 6-digit code (no passwords)
1. Authentication → Providers → **Email**: enabled. Turn **off**
   "Confirm email" (the code itself confirms the address).
2. Authentication → Email Templates → **Magic Link**: replace the body with
   ```html
   <h2>Your Pikadon sign-in code</h2>
   <p>Enter this code in the app: <strong style="font-size:24px">{{ .Token }}</strong></p>
   <p>It expires in 1 hour. If you didn't ask for it, ignore this email.</p>
   ```
3. Authentication → URL Configuration → Site URL: `https://pikadon.ug/app`.
4. For real volumes, set up custom SMTP (Authentication → SMTP) — Supabase's
   built-in mailer is rate-limited.

## 5. Connect the website build
Project Settings → API → copy **Project URL** and the **anon public** key
into `.env.local` (never commit it):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

The anon key is safe in the browser — the database rules decide what each
person can see. **Never** put the `service_role` key in this repo or app.

## 6. Build and deploy
```
npm run build      # builds website + app and prepares the Hostinger folder
npm run deploy     # uploads out/ by FTP (needs FTP_* in .env.local)
```

## 7. First day
1. Sign in at pikadon.ug/app with your email → you land on **Network**.
2. **Branches → Add a branch** for each centre, with its manager's email.
3. Each manager signs in, invites caregivers (Team & families) and enrols
   children with a parent's email — parents are invited automatically.
4. Print the one-page gate procedure: every pickup goes through the app.

## Testing the security rules
`supabase/tests/run.sh` runs the migration plus 60 checks (each role sees
only what it should) against any PostgreSQL 16 server:
```
PGHOST=localhost PGPORT=5432 supabase/tests/run.sh
```
Run it after any change to the SQL.
