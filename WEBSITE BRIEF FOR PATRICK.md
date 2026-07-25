# Website Brief — [NAME] Child Development Network
**Handover for Patrick. Companion to the App Master Blueprint and Finance Module Spec. This is the PUBLIC website — the marketing site — not the operating system.**
Version 1.0 — 2026-07-23

**Name placeholder rule:** the company name is not yet final (candidates: Imara, Tulia, Amani, Taji). Build everything with a single site-wide variable `[NAME]` and one logo slot, so the final name drops in with a one-line change. Do not hardcode "Charis Childcare" anywhere — including the URL slug, page titles, and social links.

---

## 1. What This Website Is For (read this before designing anything)

This website has **one job: make an anxious parent in our estate book a visit.**

Not to impress investors. Not to win design awards. A mother in Najjera at 11pm, worried, on a cheap Android phone with expensive data, has just heard about us from a neighbour. Every page must move her one step closer to tapping one button: **"Book a Visit."** Every design decision is judged against her.

Secondary jobs, in order: answer her questions honestly (fees included — we publish prices, it is brand law), show our standards so visibly that competitors look opaque next to us, and collect her details so we follow up within one working day.

**The one metric Patrick optimizes:** WhatsApp conversations started / visits booked. Everything else is vanity.

---

## 2. Hard Rules (equivalent to the app's non-negotiables)

1. **Mobile-first, cheap-Android-first.** Page weight under ~1MB, loads under 3 seconds on 3G. No heavy sliders, no video backgrounds, no animation libraries.
2. **Every page has the same primary button: "Book a Visit"** — sticky on mobile — opening WhatsApp with a pre-filled message (see §5.1). Ugandan parents convert on WhatsApp, not contact forms. A short form exists as backup only.
3. **No children's faces. Ever.** Until we have signed media consents and a policy review, photography shows: hands and activities, the spaces, staff faces (with their consent), materials, food, the garden. This is a trust *feature* — we say so on the site (see Our Promise copy).
4. **No stock photos of any kind.** Hudson owns a media company; real photos of the real centre are the entire visual strategy. Placeholder builds may use grey blocks labelled with the shot list (§7.3) — never stock.
5. **Prices are published.** Full fee table on its own page. Non-negotiable.
6. **English first, Luganda greeting woven in** where warm (e.g., "Tukusanyukidde — welcome"). Full translation is a later phase.
7. **Static site.** No CMS, no database, no login on v1. Fast, cheap, unbreakable. The app (Next OS) is a separate product at a separate URL; the site links to it for existing parents ("Parent Login" in footer).

---

## 3. Site Map

**Launch (Phase W1 — one long homepage + 3 pages):**
1. **Home** — the whole story, scrollable
2. **Fees** — plans and prices
3. **Visit Us** — booking + map + what happens on a visit
4. **Our Promise** — standards, safeguarding, the covenant (the differentiation page)

**Phase W2 (within 2–3 months):**
5. **Our Day** — daily rhythm + curriculum
6. **Our People** — staff, vetting, the Mama Mentor story
7. **FAQ** (grows from real parent questions)
8. **Parent Library** — the Charis content engine's articles/videos live here

**Utility (footer, W1):** Privacy Notice · Safeguarding Statement (one-page summary of the covenant) · Contact · Parent Login (→ app URL)

---

## 4. Page-by-Page: Structure and the Actual Words

*(Copy below is final draft quality — Hudson may tune tone, but Patrick should build with these words, not lorem ipsum. [ESTATE] = the estate/neighbourhood name; [PHONE] = the business WhatsApp number.)*

### 4.1 HOME

**Hero (first screen, nothing else competes with it):**
- H1: **"Work in peace. Your child is safe, loved, and growing."**
- Sub: "[NAME] is a licensed child development centre in [ESTATE] for children aged 2–5 — where every caregiver is vetted and trained, every day is structured, and you hear from us every single day."
- Primary button: **Book a Visit** · Secondary link: "See our fees" (yes, in the hero — price transparency is the trust signal)
- Trust strip under hero (icons + short labels): *Licensed & inspected · First-aid certified staff · CCTV throughout · Daily WhatsApp updates · Christian values*

**Section: The problem we solve** (short, empathetic)
- H2: "Leaving your child is the hardest part of your day."
- Body: "Maybe the maid left again. Maybe grandmother is far away. Maybe the daycare you visited didn't feel right, and you couldn't say why. You're not asking for luxury. You're asking for one thing: to work without that knot in your stomach. That is exactly what we built."

**Section: What your child receives every day** (the Eight, from the Covenant — as a simple list with small icons)
- H2: "Every child. Every day."
- The eight items, shortened: Greeted by name · Kept safe, counted, watched · Fed well and rested well · Deep, real play · Something new learned · Truly seen by an adult · God's love, gently shared · Their day's story sent home to you.

**Section: How you stay connected**
- H2: "You'll never wonder how the day went."
- Body: "Every afternoon by 5pm, you receive your child's day on WhatsApp: what they ate, how they napped, what they learned, and one real moment — 'Sarah shared her blocks with Jonah today.' Not 'she was fine.' Never just 'she was fine.'"

**Section: Our standards, in the open** (3 cards linking to Our Promise)
- Card 1 — **Vetted people:** "Every adult near your child: police-checked, reference-called, medically cleared, first-aid certified. Including the founders."
- Card 2 — **Safe by system:** "Counted at every transition. No adult ever alone with a child. Authorized-pickup codes. These aren't habits — they're written rules we invite you to read."
- Card 3 — **Faith & character:** "We are openly Christian. Gratitude before meals, kindness as the classroom law, Bible stories told gently. Read exactly what we teach — no surprises."

**Section: Founding families** (launch period only — creates urgency honestly)
- H2: "We are opening with ten founding families."
- Body: "Founding families receive 20% off for their first year, direct access to the founders, and a voice in shaping the centre. In return we ask for honest feedback. [X] places remain."
- Button: **Book a Visit**

**Section: Who we are** (short founder block)
- H2: "Built by parents, run like it's our own children inside. Because they are."
- Body: "[NAME] was founded by Hudson and Patience Tumusiime — a systems builder and a centre director who believe childcare in Uganda deserves the same excellence as the best institutions anywhere. Our first centre runs on written standards, trained people, and a promise we publish on every wall: *Every child in our care is treated with the patience, dignity, protection, and love we would want for our own family.*"

**Footer (every page):** logo · one-line promise · Book a Visit · phone/WhatsApp · location line · hours (Mon–Fri 7:00–18:00, Sat by arrangement) · links: Fees, Our Promise, Visit Us, Safeguarding Statement, Privacy, Parent Login · "Licensed by [authority] — licence displayed at our gate."

### 4.2 FEES

- H1: **"Clear fees. No surprises."**
- Intro: "We publish our fees because trust begins with transparency. One registration fee, one monthly fee, everything included: meals, materials, and daily updates. No hidden charges, no negotiation at the gate — the same fair price for every family."
- Table: Full day (7:00–18:00) — UGX [amount]/month · Half day (7:00–13:00) — UGX [amount]/month · Registration (once) — UGX [amount] · Sibling discount — 15% off second child · Termly prepayment — 5% discount · Saturday care — UGX [amount]/day
- Under table: "Founding families: 20% off the first year — [X] places remaining."
- What's included list: all meals & healthy snacks · all learning materials · daily WhatsApp reports · termly development report & parent conference · first-aid-trained care all day.
- Payment: "Pay by MTN MoMo, Airtel Money, or bank transfer. We are a cashless centre — every payment gets an instant receipt."
- FAQ mini-block: what happens if I'm late to pick up / can I pay weekly (founding-family answer) / is there a waiting list.
- Button: **Book a Visit**

### 4.3 VISIT US

- H1: **"Come and see everything."**
- Body: "The best way to judge a childcare centre is to walk through it unannounced. We know — that's why our doors are open to enrolled parents at any time, no appointment. For your first visit, book below and bring your child. You'll see every room, including the kitchen. You'll meet every person who would care for your child. You'll watch how we log arrivals, meals, naps. And you'll get our Safeguarding Promise in writing to take home. Bring your hardest questions. Parents who ask hard questions become our favourite families."
- **What a visit looks like:** 30–45 minutes · your child plays while we talk · see the full day's routine · fees and enrollment explained, zero pressure · leave with the safeguarding one-pager.
- Booking: big WhatsApp button (§5.1) + backup form (name, phone, child's age, preferred day) + "We reply within one working day — usually within the hour."
- Map embed + written directions from the estate gate + parking note.
- Hours + "Emergency contact for enrolled families: [PHONE], answered during all care hours."

### 4.4 OUR PROMISE (the differentiation page — competitors cannot copy this without living it)

- H1: **"We don't ask for your trust. We show our work."**
- Intro: "Most childcare asks you to hope. We built [NAME] so you can verify. Below are the actual standards we run on — the same documents our staff sign and our inspectors see."
- **The Sentence on the Wall** (displayed large, styled like a plaque): "Every child in our care must be treated with the same patience, dignity, protection, and love we would want for our own family."
- **Blocks (each: heading, 2–3 sentences, plain language):**
  1. *Everyone is vetted. No exceptions.* Police clearance, three references called, medical checks, first-aid certification, 90-day supervised probation — for every person, including family of the founders.
  2. *No adult is ever alone with a child.* Two-adult rule, open sight-lines, CCTV recorded in every room. Enrolled parents may review footage of their child's incidents on request.
  3. *Your child is counted, always.* At every transition — room to garden, garden to lunch. And nobody unknown ever picks up a child: photo list + family code word, no exceptions, no matter the story.
  4. *If anything happens, you hear it from us first.* Within the hour. A written report within a day. We treat hiding as worse than the incident — it's in our founding covenant.
  5. *Health is a system.* Daily arrival health check, allergy boards, medication double-signature, a partner clinic on call, monthly emergency drills.
  6. *Faith, in the open.* What we teach: gratitude, kindness, honesty, simple prayers, Bible stories. Published in full so every family chooses knowingly. Every child of every family is equally safe, loved, and honoured here.
  7. *Why no children's photos on this website?* Because your child's image belongs to you. We post no child's face publicly — ever — without your specific, written, revocable consent. The protection you can see here is the protection your child gets everywhere.
- Download: **Safeguarding Promise (PDF, one page)**.
- Closing: "These standards are audited monthly, and our licence and latest inspection hang at the gate. Come read them." → **Book a Visit**

### 4.5 OUR DAY (Phase W2)
Daily rhythm timeline 7:00→18:00 with one warm sentence per block (from Blueprint §13); curriculum in plain words (play-based, Montessori-inspired independence, milestones tracked across 8 areas, termly development report); "what school readiness means and why play is how children learn — not desks and drilling."

### 4.6 OUR PEOPLE (Phase W2)
Patience as Founding Centre Director (photo, 3 sentences, her heart for children); each caregiver: photo, name, certification badges (First Aid, Level 1/2, Safeguarding) — the badge system makes training visible; the vetting ladder shown as a graphic; the Mama Mentor story.

### 4.7 FAQ (Phase W2 — seed with these, grow from real questions)
Ages? (2–5 now; younger children later — join the waiting list) · Meals & allergies? · Sick-child policy? (we publish exclusion rules — they protect every child) · Discipline? (never physical, never shaming — calm boundaries, explained) · Muslim/non-Christian families welcome? (fully — and here is exactly what faith content your child would experience, so you choose) · Potty training? (we partner with you) · What if my child cries at drop-off? (the settling programme, day-3 and day-10 calls) · Security? · How do I pay? · Can grandparents pick up? (only if on your authorized list with the code word).

---

## 5. Functionality Requirements

**5.1 WhatsApp CTA:** every "Book a Visit" button = `https://wa.me/[PHONE]?text=` pre-filled: *"Hello [NAME], I'd like to book a visit. My child is ___ years old. My name is ___."* Track taps (see 5.4).
**5.2 Backup form:** name, phone, child's age, preferred visit day, "how did you hear about us?" (dropdown: neighbour/friend · estate group · church · Facebook/Instagram · walked past · other) — this last field feeds the Blueprint's referral analytics and is required. Form posts to email + a Google Sheet (or Supabase table Patrick already has). Auto-reply confirms within seconds; human replies within one working day.
**5.3 SEO basics:** unique title + meta description per page (e.g., Home: "[NAME] — Licensed Childcare & Early Learning in [ESTATE], Kampala | Ages 2–5"); local keywords naturally in copy (daycare [ESTATE], childcare Kampala, early childhood centre); Google Business Profile created and linked; schema.org `ChildCare` markup; sitemap.xml.
**5.4 Analytics:** privacy-light analytics (e.g., Plausible-class or GA4 minimum config); track: Book-a-Visit taps, WhatsApp opens, form submits, fees-page views. UTM discipline on all social/estate-group links.
**5.5 Performance budget:** total page ≤1MB, images WebP + lazy-loaded, system-font fallback while brand fonts load, Lighthouse mobile ≥90.
**5.6 Accessibility:** real contrast (the palette passes), alt text everywhere, buttons ≥44px, no text in images.
**5.7 Hosting:** static hosting on the existing nextafrica/nextos infrastructure or any static host; custom domain when the name lands ([name].ug or [name]kids.com); SSL mandatory; the app stays on its own subdomain (e.g., app.[name].ug) — website and app must never share a deploy.

---

## 6. Design Direction

**Palette (from the brand documents):** deep forest green `#16352A` · antique gold `#B8934A` · cream `#FBF7EE` · ink `#28251D`. Green/cream dominant, gold only for accents and buttons — this brand is calm, not loud.
**Type:** Poppins (headings, buttons) + Lora (body). Generous whitespace; the site should *feel* like the Covenant PDF looks.
**Emblem:** the seedling-in-circle mark (in the project's PDFs) as favicon and logo slot until final identity.
**Tone of voice:** warm, plain, confident. Short sentences. First person plural. Never "premium/luxury/elite," never fear-mongering about other daycares — we state our standards, we don't attack theirs.
**7.3 Shot list for Hudson (Charis production, half a day):** the gate + latch detail · handwashing station · a caregiver's hands and a child's hands over blocks (no face) · the laminated checklist on a wall · food being prepared · the daily-report WhatsApp on a phone screen · staff portraits (consented) · the garden bed · sleeping mats laid out · the sentence-on-the-wall plaque. These ten photos ARE the website.

---

## 7. Build Phases & Acceptance

**W1 (build now, 1–2 weeks):** Home + Fees + Visit Us + Our Promise + footer/utility pages, WhatsApp CTA, form, analytics, SEO basics, [NAME] variable system. Launch behind a simple "coming soon" only until the founding-cohort presale begins — the site exists to serve step 17 of the Launch Dossier (presell founding families).
**W2 (month 2–3):** Our Day, Our People, FAQ, Parent Library shell, Luganda toggle groundwork.
**W3 (later):** careers/academy page, second-centre location pages (template-driven — the architecture should assume many centres, like everything Amani).

**Acceptance test (the only one that matters):** hand a phone to a real parent in the estate who has never heard of us. If, within three minutes, she can say what we are, what it costs, why we're different, and has found the Book a Visit button — the site works. If she has to pinch-zoom, wait on a spinner, or hunt for the price, it fails, whatever it looks like.

---

*All copy is draft-final: Hudson approves the words, Patrick must not paraphrase them, and legal/regulatory claims ("licensed," "insured") go live only when the certificate is actually at the gate — the website must never promise ahead of the paperwork. Where the name appears, use the [NAME] variable until the founders confirm the final name in writing.*
