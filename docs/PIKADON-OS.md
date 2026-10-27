# Pikadon OS — study & blueprint

*October 2026. Replaces the "Amani OS" childcare app at
nextos.nextafrica.ai/childcare-app.html.*

## 1. What the old app was

`next os/web/os-childcare.jsx` — one 3,758-line file compiled in the
browser, branded "Amani OS", dark theme. It had a wide feature list
(child cards, UNEPI vaccine tracker, daily schedule, parent app with
gallery/curriculum/pickup QR, messages, staff rota, finance ledger and
wallets, inventory, expansion tracker, compliance list, live cameras) —
but almost all of it was **sample data held in the browser**. Only the
`children` and `global_messages` tables touched a database, and every
branch except the first ignored database data entirely.

### Security problems (fix before anything else)
| # | Problem | Risk |
|---|---|---|
| 1 | Camera login (`t92hudson@…` + password) hard-coded in the public JS and `camera-server/cameras.json` | Anyone can read the password; if reused, the email account is exposed |
| 2 | `#director`, `#investor`, `#manager/<id>`, `#parent/<id>` in the URL log you in with no password; `?r=<parent name>&t=charis-childcare` too | Anyone sees every child's health record and messages |
| 3 | Sign-up form lets anyone choose "Global Director" or "Investor"; the app trusts that choice | Instant full access |
| 4 | The `children` table is fetched before login | Child records are probably readable anonymously |
| 5 | Pickup QR encodes only the child's ID (`?pass=<id>`) | Anyone who sees one QR can forge any child's pass |

**Actions:** change the camera password today (and the Gmail password if
shared), take `childcare-app.html` offline, rotate the old Supabase
project's keys, and remove the credentials from the NEXT OS git history.

## 2. Compared with standard childcare platforms

Benchmarked against Brightwheel, Procare, Famly (all-in-one management)
and WatchMeGrow (parent video).

| Capability | Typical leaders | Old Amani OS | **New Pikadon OS** |
|---|---|---|---|
| Digital check-in / out | ✓ | Demo only | ✓ Real, per branch, who dropped off |
| **Verified pickup** | Authorised list | QR = child ID | ✓ Parent-approved list + manager ID check + one-time 6-digit code; refused attempts alert parents instantly |
| Daily report / timeline for parents | ✓ | Mock | ✓ Live timeline (meals, naps, activities, milestones, incidents) |
| Parent ↔ staff messaging | ✓ | Partial | ✓ Family, branch↔director, investor threads |
| Incident reports + parent sign-off | ✓ | ✗ | ✓ With "I've read this" acknowledgement and director review |
| Safe-sleep checks | Some (add-ons) | ✗ | ✓ Timed checks, overdue alarm, front-sleeping auto-flagged |
| Ratio monitoring | Some | ✗ | ✓ Live per room from staff clock-in |
| Name-to-face headcounts | Rare | ✗ | ✓ At every transition; missing child flagged |
| Visitor log | Some | ✗ | ✓ ID check + escort |
| Absence follow-up | Some | ✗ | ✓ Parent reports in app; unexplained after 9:30 → call list |
| Billing / payments | ✓ | Mock ledger | ✓ Invoices, MoMo/Airtel/bank refs (one use each), collection rate |
| Multi-site / enterprise view | ✓ | Hard-coded 2 branches | ✓ Unlimited branches; director adds them in-app |
| Admissions / enquiries | ✓ | ✗ | ✓ Website forms land in the right branch's list |
| Investor reporting | ✗ | Mixed into director view | ✓ Separate role; numbers only, never child data |
| Role security | Server-side | Client-side only | ✓ Enforced by the database (60 automated tests) |
| Live cameras for parents | WatchMeGrow-style add-on | Raw camera URL in code | Designed (§6), not switched on yet — your call |

## 3. Roles

| Role | Sees | Can do |
|---|---|---|
| **Global Director** | Every branch, every child, all money and safety | Add/open/pause branches, invite managers, investors, directors; review every serious incident; route enquiries |
| **Branch Manager** | One branch | Enrol children, invite caregivers & parents, approve pickup people, billing, team access |
| **Caregiver** | Their branch's children | Check-in/out at the gate, daily log, sleep checks, headcounts, incidents, visitors |
| **Parent** | Only their own child(ren) | Watch the day, approve/revoke pickup people, issue one-time codes, report absences, acknowledge incidents, see fees, message the branch |
| **Investor** | Network totals only | Occupancy, collections, overdue, expansion pipeline, demand by area; message the director |

Roles come only from invites tied to a verified email — never from
anything the user types or chooses.

## 4. How the ends meet

- **Parent → branch:** absence notice → manager's absence list; new pickup person → manager's approval queue; messages → branch inbox.
- **Branch → parent (live):** check-in/out, meals, naps, milestones, sleep checks → parent's timeline; incidents → "Please read" card until acknowledged; refused pickup → instant alert.
- **Branch → director:** serious incidents & refused pickups → network safety queue; ratios, attendance, money → Network dashboard.
- **Director → branch:** new branch with rooms + manager invite in one step; enquiries routed to a branch; access removal.
- **Website → OS:** "Prefer a call back?" (Visit page) → branch enquiries; "Request Pikadon in your area" → director's demand chart (also visible to investors).
- **Everything → investor:** aggregated numbers only.

## 5. Branches & expansion
`Add a branch` creates the branch, its rooms (with the licence ratio per
room) and the manager invite atomically. Status runs *Opening soon → Open
→ Paused/Closed*. Opening-soon branches show in the investor pipeline;
area requests from the website show where demand is.

## 6. Child safety ("surveillance")

### Built now (no cameras needed)
1. **Verified pickups** — parents on file, manager-approved people (ID
   noted), or a parent-issued one-time code (6 digits, today only, single
   use, never visible to staff). Anyone else is refused, recorded, and
   both parents and manager are alerted.
2. **Live ratios** — children present ÷ caregivers clocked into each room
   vs the room's licensed ratio; breaches top the Today board.
3. **Name-to-face headcounts** at every transition (outdoor, meals, room
   change, closing, drills). Untapped names are flagged as missing until
   resolved with a note.
4. **Safe-sleep checks** every 10 minutes (configurable) with an overdue
   alarm; front-sleeping or a breathing concern auto-creates a safety event.
5. **Incidents** with parent acknowledgement and director review.
6. **Visitor log** with ID check and escort.
7. **Absence follow-up** — unexplained absence after 9:30 triggers a call list.
8. **Audit trail** — sensitive actions (branch creation, invites, pickups
   approved/refused) are logged with who and when.

### Cameras — recommended design for when you switch them on
- Cameras and the recorder (NVR) stay on the branch network. **No camera
  password ever reaches a browser or the code.**
- A small box at each branch (e.g. MediaMTX on a mini-PC) converts the
  camera feed to WebRTC and connects *outward* through Cloudflare Tunnel —
  no open ports on the router.
- The app asks a server function for a **short-lived signed link**; the
  function checks the database rules first:
  - manager/caregiver: their branch's rooms;
  - director: all branches;
  - **parent: only their child's room, only while their child is checked
    in, only during opening hours;**
  - investors: never.
- Every view is logged (who, which camera, how long); the viewer's name is
  watermarked on the stream; one viewing session per account.
- **No cameras in toilets or nappy-change areas.** Recordings kept 30 days
  on the NVR; only the manager exports a clip, and only for an incident.
- Signed camera consent from every parent and staff member; a camera
  policy on the website. Uganda's Data Protection and Privacy Act (2019)
  applies — register with the Personal Data Protection Office and have
  counsel review the policy before launch.

## 7. What's in the repo
| Path | What |
|---|---|
| `supabase/migrations/20261027000000_pikadon_os.sql` | All tables, security rules, actions |
| `supabase/tests/` | 60 security checks (`run.sh`) |
| `lib/os/` | Data layer: `demo.ts` (sample data), `supabase.ts` (live), `api.ts` (contract) |
| `app/app/` | The app screens (`/app/…`) |
| `components/os/` | Shared app components (gate, timeline, incidents, network) |
| `docs/PIKADON-OS-SETUP.md` | Going live, step by step |

## 8. Suggested next steps
1. Go live with one branch (setup guide), keep demo mode for sales.
2. SMS/WhatsApp notifications for pickup alerts and incidents (parents
   without data still get them).
3. Photos in the daily log, with a consent register (no faces on the public site).
4. Staff rota & payroll inputs; compliance calendar (licences, fire
   certificate, staff certificates) — both carried over from the old app's ideas.
5. Cameras per §6, after the consent work.
