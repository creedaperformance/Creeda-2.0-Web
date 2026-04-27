# CREEDA — Strategic Reset (2026-04-27)

> One document. Read this first. Everything else is reference.

---

## 0. Why this document exists

The founder's verdict on the current build: *"It's shit. Not deployable. We're building blindly."*

That verdict is harsh, but the diagnosis is mostly right. CREEDA has more good ideas than execution, more shipped code than shipped product, and three personas where it should have one. Strategic clarity existed in the docs. Execution splintered.

This document is a from-zero rebuild plan. It picks the wedge user, locks the daily promise, redesigns onboarding from scratch, audits the existing code (keep / kill / rebuild), and lays out a phased plan to get to a deployable, defensible product.

It is opinionated. Where there's a fork in the road, this doc picks one path and explains why. The founder can override any choice — but every override changes the timeline.

---

## 1. Executive Summary (read this if you read nothing else)

**The wedge user.** Stop building for "athletes, coaches, physios, fans, individuals." Build for ONE first user: **a 16–22 year old aspiring athlete in India** training cricket / football / athletics 4–6 days a week, no sport scientist, smartphone-only, ₹200–500/month willing to spend on something that helps them not get injured and not waste a year of training.

This is the only persona we serve in v1. Coach is built second (their athletes pull them in). Individual fitness/wellness is deferred to v2.

**The daily promise.** Every morning, in 10 seconds, CREEDA answers ONE question:

> **"Should I train hard, train light, or rest today — and exactly what should I do?"**

Not a number. Not a vibe. A verdict + a prescription, grounded in sports science, in language a 17-year-old in Pune actually understands.

**Why this works.** Nobody else does it for this user.
- WHOOP / Oura / Garmin tell you a recovery score but won't say what to *do*.
- Catapult / Kitman / Smartabase prescribe but cost ₹40 lakh/year and need a sport scientist.
- HealthifyMe / Cult.fit / FITTR are diet, group classes, and weight-loss transformations — not athlete readiness.
- Strava logs what you did. TrainingPeaks is for cyclists. Hudl is video review for teams.

**There is no app today that says "you're an academy cricket bowler in Bangalore — based on your last 7 days, today's session is X, here's why" at a price you can afford.**

That is CREEDA's wedge.

**The path forward (4 weeks, not 4 months).**
- **Week 1 (this week):** Lock the strategy. This document. ✅
- **Week 2:** Ship a deployable MVP. One persona (athlete), three sports (cricket, football, gym), 8-question onboarding, daily check-in, daily directive, one prescribed session per state.
- **Week 4:** Beta with 2 academies in India. Add wearable-optional layer (read from Apple Health / Google Fit / Mi Band — don't require). Add coach view as squad readiness grid (no intervention queue yet).
- **Week 8:** Production. Coach intervention queue. iOS app store. UPI payments. Movement scan polished for one fault per sport.

**What gets killed.** Individual persona for now. OnboardingV2 (the parallel full-form). intelligence_engine.ts (kitchen-sink, 73KB, abandoned rewrites). sport_dashboard_engine.ts (duplicate). 5 orphan onboarding fields. ~50 of the 79 migration files (consolidated). Promised features that never shipped — three objective tests, India-context UI, multi-team coach mode.

**What gets kept.** The 4-zone home screen. The 6-state directive engine. directives.ts. readiness.ts. The MediaPipe movement scan. The coach video feedback loop. The marketing site (it's coherent). The legal pages (they're real, not stale).

**The decision the founder needs to make:** approve this plan and let one path proceed, or pick a different wedge. We cannot serve all three personas in v1 and ship in 4 weeks. The biggest reason the past redesigns didn't land is that no one chose.

---

## 2. The Honest Diagnosis — what's actually broken

After reading every doc in `docs/`, every onboarding flow in `src/forms/`, every decision engine in `src/lib/`, every dashboard in `src/app/`, here's the unflattering truth:

### 2.1 Two onboarding flows compete in the same codebase

`src/components/form/AdaptiveFormWizard.tsx` (the minimal 13-question flow specced in `creeda-adaptive-onboarding-redesign-2026-04-16.md`) and `src/app/onboarding/OnboardingV2Client.tsx` (a parallel full-form with PARQ + squad setup + age gating) **both ship today.**

Athletes who hit `/athlete/onboarding` see one flow. Athletes who hit `/onboarding` see another. Both write to the database. Neither is the "real" one. This is the root cause of "the onboarding questions are wrong" — there are two sets of questions, and you're seeing whichever one you happened to land on.

This must be resolved before any new design ships.

### 2.2 The athlete onboarding has 5 orphan questions

Of the 21 questions athletes currently answer (long, by anyone's standards), **5 are stored in the database and never consumed by any decision engine:**

| Question | Status | Why kill |
|---|---|---|
| Primary goal | ORPHAN — stored, never read | Inferred from sport + level anyway |
| Marketing consent | ORPHAN — no email pipeline exists | Ask later, opt-in inside app |
| Movement robustness self-rating | ORPHAN — never used in any logic | Subjective, unreliable, replaced by scan data |
| Typical weekly hours | WEAK — analytics only, not readiness | Already implied by "playing level" |
| Typical sleep | WEAK — barely used | Daily check-in covers this |

Every one of these makes the user think *"why did you ask me that?"* — exactly the trust-erosion the founder is feeling.

### 2.3 The decision engine is three engines pretending to be one

| File | Size | Verdict |
|---|---|---|
| `src/lib/readiness.ts` | 71 lines | Real. Simple. Solid. Keep. |
| `src/components/performance-view/directives.ts` | 192 lines | Real. Pure copy library. Keep. |
| `src/lib/intelligence_engine.ts` | 73 KB | **Kitchen-sink. 400+ interface fields. Multiple "verdict" outputs that contradict each other (`readiness_score`, `score`, `status`, `compReadiness`, `athleteJudgement`, `coachJudgement`, `athleteWinBy`...). Buzzword fields ("Credibility Intelligence," "Felt Reality Bridge") with no implementation behind them.** Kill. |
| `src/lib/sport_dashboard_engine.ts` | 32 KB | Duplicates `intelligence_engine`. Kill. |
| `src/lib/sport_intelligence.ts` | 76 KB | Mixed. Sport models for cricket/football are real and useful. The rest is bloat. Extract the core (~10 KB), kill the rest. |
| `src/lib/dashboard_decisions.ts` | 117 KB | Orchestrates 5+ sub-engines, hard to trace. Rebuild — split into one file per persona, ≤30 KB each. |

**Same readiness number flows through 5 different field names before reaching the user.** That is why the directive feels generic and the founders can't trust what's on the screen.

### 2.4 The migrations folder is spaghetti

**79 SQL migration files** with naming like `00_CREEDA_MASTER_SCHEMA_V2.sql`, `01_FIX_SIGNUP_ROLES.sql`, `05_upgrade_performance_v3.sql`, `20260325_v4_unified_intelligence.sql`. Multiple schema rewrites (v2 → v3 → v4 → v5 → v8 → v15) with no canonical "current state."

Any new engineer touching the database will be terrified, slow, and will eventually break something. This is technical debt that compounds weekly.

### 2.5 Promised features that never shipped

The execution roadmap (April 2) and end-to-end journeys (April 25) promised, but the codebase doesn't deliver:

| Promise | Reality |
|---|---|
| **Three objective tests:** reaction time, balance, breathing | Only video analysis exists (squat, batting). No reaction/balance/breathing tests. Marketing implies they exist. |
| **India-context UI:** heat, AQI, exam stress, vegetarian diet, fasting | Database columns exist. Zero UI exposure. |
| **Coach intervention queue** | Schema referenced, no surface in `/coach/dashboard`. |
| **Trust layer in UI** (confidence, drivers, what changed) | Logic is wired in the engine. Users never see it. |
| **Six sport-specific directive variants** | All sports get the same "Body says steady, build" line. |
| **Wearable parity on web** | Web asks "do you have an Apple Watch?" then links to mobile. Awkward. |

### 2.6 Three personas, no wedge

The blueprint serves Athlete + Individual + Coach equally. The Individual journey explicitly tries to be calmer and softer; the Coach journey is a totally different surface; the Athlete journey is the hardest of all. Building three is why the team built none of them well.

**Pick one. Build it for one. Win one persona before adding the next.**

---

## 3. Competitive Landscape — who we're actually fighting

### 3.1 The market is split into 6 distinct categories

| Category | Examples | Price | What they do | What they miss |
|---|---|---|---|---|
| **Recovery wearables** | WHOOP, Oura, Athlytic, Garmin | ₹400–₹3,000/mo equiv | Give you a recovery score | Don't tell you what to *do* |
| **Activity logging** | Strava, Apple Fitness+, Nike Run Club | Free–₹800/mo | Log what you did | Zero readiness, retrospective only |
| **Endurance coaching** | TrainingPeaks | ₹1,600+/mo | Plan/track structured workouts (cyclists, triathletes) | Chart-heavy, intimidating, not for team-sport athletes |
| **Team video review** | Hudl, Hudl Assist | ₹30k–₹130k/team/yr | Coach reviews game film | No daily readiness, requires you film games |
| **Elite athlete management** | Catapult, Kitman Labs, Smartabase | ₹25 L–₹2 Cr/yr | Pro-team data unification | Needs sport scientist, priced out for academies |
| **Indian fitness apps** | HealthifyMe, Cult.fit, FITTR | ₹208–₹8,000/mo | Diet, group classes, weight-loss transformations | Not sports-science, not athlete-readiness |

### 3.2 Onboarding length — what users actually accept

| App | Onboarding questions | Time | Style |
|---|---|---|---|
| WHOOP | ~10–13 | 2–3 min | Goal-driven, then pair the band |
| Oura | ~10 (after sizing kit) | 2 min | Health focus picker → cycle data |
| Garmin Connect | ~9 | 2 min | Activity class slider |
| Strava | 5–6 + follow-people prompt | <90 sec | Sport + privacy + go |
| HealthifyMe | ~12–15 | 3–4 min | Goal + weight + height + diet preferences |
| Cult.fit | 4–5 | <60 sec | Buy a pack → walk into a gym |
| **CREEDA today** | **21 (athlete)** | **(target 90s, actual ~3–4 min)** | **Adaptive but bloated** |

CREEDA's athlete onboarding is the longest of any consumer-grade app in the market. Even Smartabase (an enterprise tool) doesn't ask 21 questions on day 1. **Cut to 8.**

### 3.3 Daily insight wording — what the user reads every morning

| App | Literal morning message |
|---|---|
| WHOOP | *"You're 87% recovered. Today's optimal strain: 14.2. Push yourself."* |
| Oura | *"Pay attention. Today, take it easy."* / *"Optimal. You're ready to go."* |
| Athlytic | *"Your Recovery is 64. Listen to your body."* |
| Garmin | *"Your body is primed to take on a challenging workout."* / *"Body Battery: charged at 78."* |
| Catapult/AMS | *"Player flagged: wellness Z-score below -1.5 — modify load today."* |
| HealthifyMe | *"You're 280 calories under your target. Try a paneer roll for dinner."* |
| **CREEDA today** | *"Body says steady. Build."* (generic across all sports and persons) |

Every successful insight has three things: a verdict, a number/state, and a directive. CREEDA's current line has only the verdict. **It must say *what to do*, in sport-specific language.**

### 3.4 The gap CREEDA can own — explicitly

Combining all of the above, the gap is precise:

> **An athlete-readiness + sport-specific prescription product, at an Indian price point (₹199/mo), for the 16–22 academy or self-trained athlete in cricket / football / athletics, that works phone-only and gets smarter if you connect a wearable.**

No one else is in that box. WHOOP is too expensive and not prescriptive. HealthifyMe is for diets. Catapult is for pros. Hudl is for coaches with film. Strava is for adults logging runs.

This is CREEDA's wedge. Everything in v1 must serve this user.

---

## 4. The Wedge User — one specific person

Build the product for ONE specific person. Everything else flows from them.

### 4.1 Meet Aarav (the persona)

**Aarav, 18, Mumbai.** State-level fast bowler in his cricket academy. Trains 6 days a week — 3 days net session, 2 days strength, 1 day match or recovery. His coach has 22 boys in the squad and one assistant. Aarav has a OnePlus Nord, no smartwatch (his older brother has a Mi Band 8), and a ₹500/month "fitness/health" budget mostly spent on protein powder. His Instagram has six WHOOP-influencer accounts and three Olympic athletes. He has had two stress-fracture scares in the last year and is terrified of one more, because his selection trial is in 8 months.

**Aarav's morning question:** *"My back was sore yesterday after 8 overs in the nets. Should I bowl heavy today, or skip? Coach won't tell me — he's busy."*

**Aarav's job-to-be-done:** *"Help me train hard enough to make selection without breaking my body."*

That is the customer. Everything else in the product serves him.

### 4.2 Why Aarav is the right wedge

1. **Massive addressable market.** ~1.4 million cricketers in formal academies + ~500K football academy players + ~300K athletics + ~600K serious gym-trainers in India. Conservatively, **3M+ Aaravs** in India alone.

2. **Real pain.** Injury fear is acute, sport stakes are real (academy → state → IPL/club is a single-track ladder), no affordable expert support exists. WHOOP costs more than his protein.

3. **Willingness to pay.** ₹200–500/mo is in the realm of "what teenagers pay for one-off coaching sessions." A monthly subscription replaces those one-offs and is cheaper than a single physio visit.

4. **Acquirable.** Cricket/football academies in India have ~50–200 athletes per club. Twenty academies = 1,000–4,000 users. The founder can call coaches directly.

5. **Defensible.** Once Aarav's data is in CREEDA — his sport, his position, his sleep curve, his sore-spot history, his bowling videos — switching costs are real. No competitor knows him this well.

6. **Aspirational halo.** When Aarav makes selection at 19 with a CREEDA t-shirt in his bag, his teammates download the app. This is how WHOOP grew in college sports in the US — peer signaling among serious athletes.

### 4.3 Who we are NOT for in v1 (to be very clear)

- **Casual gym-goers wanting to lose 10 kg.** That's HealthifyMe / Cult.fit / FITTR. Trying to compete with them on diet and group classes is suicide.
- **Pro athletes / IPL players.** They have full-time S&C staff. We can't out-Catapult Catapult.
- **Coaches without athletes on CREEDA.** The coach product is Aarav's coach, after Aarav exists.
- **Recreational runners / yogis / general wellness.** They are Apple Watch + Strava + Cult Live audiences. Not us.

These markets exist. They are not v1. Adding them in v2/v3 is the upside, not the wedge.

---

## 5. The Daily Promise — the one question CREEDA answers every morning

### 5.1 The promise, in one sentence

> **"Should I train hard, train light, or rest today — and exactly what should I do?"**

That is the only question CREEDA answers in 10 seconds every morning. Everything else (scan, plan, week, profile, settings, coach view) is one tap away from that screen, but not on it.

### 5.2 What the morning screen actually shows

```
┌─────────────────────────────────────┐
│  GOOD MORNING, AARAV                │
│                                     │
│      ┌────────┐                     │
│      │   72   │   READY TO TRAIN    │
│      │ /100   │                     │
│      └────────┘                     │
│                                     │
│  Train hard today.                  │
│  Body's recovered from yesterday's  │
│  net session. Sleep was solid       │
│  (7h 20m). Soreness is down.        │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  TODAY'S BOWLING SESSION    │   │
│  │  60 min • 6 over spell      │   │
│  │  + plyo finisher            │   │
│  │              [START →]      │   │
│  └─────────────────────────────┘   │
│                                     │
│  This week: 4/6 days · 2 streak     │
│                                     │
│  [Coach Anil sent feedback →]       │
└─────────────────────────────────────┘
```

Three things on this screen, in this order:
1. **Score + verdict** ("72 — READY TO TRAIN")
2. **Why-line** (one sentence, plain language, sport-specific)
3. **Today's prescription** (one specific session, START button)

**Then the contextual unlock** (coach feedback if coach left one; otherwise scan reminder, weekly review, or wearable connect — never two at once).

### 5.3 The 6 states (from existing directive engine — keep)

| State | What it means | Sample message (cricket bowler) |
|---|---|---|
| `train_hard` | Green light, push intensity | *"Body's primed. Today: 6-over spell + plyo finisher."* |
| `train_light` | Steady but watch load | *"Recovered enough. Skill work + light strength only."* |
| `mobility_only` | Maintain range, skip load | *"Body's stiff. 30 min mobility flow. No bowling today."* |
| `recovery_focus` | Active recovery | *"Sleep was thin. Easy walk + stretch + sleep early."* |
| `deload` | Planned drop in volume | *"Week 4 deload. Half volume across all sessions."* |
| `full_rest` | Off | *"Pain in lumbar zone — 24h rest. Re-check tomorrow."* |

The states are right. The copy is generic. **The fix is to write 6 sport+state lines for each of 3 sports = 18 specific lines, with 2–3 stable variants each, persona-tagged.** This is a copy task, not an engineering task. Half a day of work.

### 5.4 The why-line is the trust layer

Every recommendation has a *why-line* in plain language. Example:

> *"Train hard today. Your sleep was 7h 20m (above your 7-day average), HRV is up 8% from yesterday, and you've had 24h since your last bowling session. No pain reported. Confidence: high (5 of 5 inputs)."*

This is not new functionality. The data is in `readiness.ts`'s reasons array. It just needs to be exposed in the UI.

**The single screen that answers "should I train hard, train light, or rest — and what should I do?" with a why-line that builds trust = the entire product. Everything else is in service of that screen.**

---

## 6. Onboarding from Zero — every question must drive an engine decision

### 6.1 The 8 questions (athlete v1)

After 4 weeks of audit, the questions Aarav must answer to get a useful Day 1 directive are exactly these 8:

| # | Question | Drives | Why this question, why now |
|---|---|---|---|
| 1 | **What's your sport?** (Cricket / Football / Athletics / Gym) | Sport-specific session library, position list, load thresholds | The single most important answer. Everything else is conditional on it. |
| 2 | **What's your position / event?** (e.g. Bowler / Batsman / Wicket-keeper for cricket) | Position-specific load model, drill library, fault rules | Cricket bowlers and batsmen have completely different recovery curves. Mandatory. |
| 3 | **How serious are you?** (Recreational / Club / Academy / State+) | Intensity baselines, default training frequency, coach-eligibility | Same age, same sport, very different load tolerance. Aarav (academy) ≠ his weekend cricket friend. |
| 4 | **Date of birth** (one date picker) | Recovery curve assumptions, U-18 consent gate, age-appropriate progression | Replaces 2 questions (age + minor consent flag). |
| 5 | **Sex assigned at birth** (Male / Female / Prefer not to say) | HRV/RHR baselines, recovery assumptions, female athlete cycle module trigger | Real physiology. Not vanity. |
| 6 | **Height & weight** (single screen, two fields) | Load normalization, BMI guardrails for nutrition (if added later) | Two fields, one screen. |
| 7 | **Current pain or injury?** (None / Niggle / Active injury) — *if not None, body region tap* | Risk gate (suppresses load recommendations), "modify vs. rest" branch, return-to-play tracking | Without this, we will tell injured kids to train. Mandatory. |
| 8 | **Coach code (optional)** — *6-digit code from a coach* | Squad linkage, coach-side intake, parent-side alerts (later) | Optional but high-value. Skippable in 1 tap. |

**Total time: 60–90 seconds.** Time-tested by every successful consumer app from WHOOP to Strava.

**What's gone vs. today:**
- ❌ Username (auto-generated from name; user can change later)
- ❌ Primary goal (inferred from sport + level)
- ❌ Marketing consent (ask in-app after Day 7, only if engaged)
- ❌ Typical weekly hours (covered by "how serious")
- ❌ Typical sleep (covered by daily check-in)
- ❌ Typical RPE (covered by daily check-in)
- ❌ Movement robustness self-rating (orphan)
- ❌ Coach legal entity / structure (irrelevant for v1)
- ❌ Three legal/consent toggles (consolidated into one)

**What stays the same:** The legal disclaimer and medical warning are still present, but consolidated into a single readable consent screen at the end. PARQ-style safety screening lives inside Q7 (pain) — if you say "active injury," we route you to a "talk to a doctor before training" gate. We don't need to interrogate every athlete about their cardiac history on Day 1.

### 6.2 The daily check-in (after onboarding)

**4 questions, 10 seconds, every morning:**

1. **How well did you sleep?** (😴 Poor — Okay — Good — Great — 4-tap slider)
2. **How sore are you?** (5-tap slider, body-map appears if 4+)
3. **Energy?** (5-tap slider)
4. **Stress?** (5-tap slider)

That's it. Optional fifth: *"Anything else? (one tap to add a tag — alcohol, late meal, illness, etc.)"*

`readiness.ts` already accepts exactly these inputs. **No engine work needed. Just UI polish.**

### 6.3 Coach onboarding (kept, slimmed to 6)

Per the audit, current coach flow has 11 questions with 2 orphans. Strip to:

1. Full name
2. Mobile number (for WhatsApp coordination)
3. Sport coached
4. Team / academy name
5. Coaching level (academy / club / school / private)
6. Squad size (numeric)

Done. Generate the 6-digit squad code. Show how to share it. Let athletes start streaming in.

Multi-team / multi-age-group / structure questions only appear if coach taps *"add another team"* — never on Day 1.

### 6.4 Individual onboarding — DEFERRED

Don't ship Individual in v1. Don't onboard non-athletes. Tell them in marketing: *"CREEDA is currently in beta for academy and serious athletes. Join the waitlist for the wellness version (launching Q3 2026)."*

This single decision saves probably 30% of design and engineering capacity.

---

## 7. Code Audit — KEEP / KILL / REBUILD (file-level)

This section is ruthless on purpose. Every file has a verdict.

### 7.1 KEEP (these are the spine)

| File / Area | Size | Why keep |
|---|---|---|
| `src/components/performance-view/directives.ts` | 192 lines | Pure copy library, deterministic, well-tested. The directive engine's user-facing layer. Just needs more sport-specific variants written. |
| `src/lib/readiness.ts` | 71 lines | Simple, correct, transparent. Sleep 30% / energy 30% / soreness 20% / stress 20% with sensible thresholds. **Core readiness math.** |
| `src/components/form/AdaptiveFormWizard.tsx` + `src/forms/flows/athleteFlow.ts` | ~170 lines | Clean adaptive form pattern. The right path for onboarding. Just needs the question list trimmed. |
| `src/app/athlete/dashboard/` | — | 4-zone layout works. Data flow is real when source data exists. |
| `src/app/coach/dashboard/` | — | Squad aggregation logic is sound. |
| `src/components/video-analysis/` + MediaPipe pipeline | ~43 KB rules | Real computer vision. Substantive rule engine. Sport-personalization is weak but acceptable for MVP. |
| `src/app/page.tsx` (marketing home) | — | Coherent India-first three-persona pitch. Aligned with product. |
| Legal pages (privacy, terms, refund, AI transparency) | — | Real compliance work, not stale templates. |
| Coach ↔ athlete video feedback loop | — | Differentiator. Works end-to-end (per `migrations/20260425_video_analysis_comments.sql`). |

### 7.2 KILL (delete or aggressively shrink)

| File / Area | Size | Why kill |
|---|---|---|
| `src/lib/intelligence_engine.ts` | 73 KB | 400+ interface fields, contradictory verdicts, buzzword fields with no implementation. Kitchen-sink of abandoned rewrite attempts. **Highest priority kill.** |
| `src/lib/sport_dashboard_engine.ts` | 32 KB | Duplicates `intelligence_engine` logic. Consolidate. |
| `src/app/onboarding/OnboardingV2Client.tsx` and the entire `/onboarding` parallel route | — | Competes with `AdaptiveFormWizard`. **Pick one. Kill this one.** Migrate any users on this path to the adaptive flow. |
| `src/lib/athlete-onboarding.ts` (legacy) | 18 KB | Dead code from before AdaptiveFormWizard. Confirm no callers, then delete. |
| `src/lib/individual-journey-store.tsx` | 18 KB | UI state for Individual journey, but Individual is deferred. Mothball. |
| Orphan onboarding fields (athlete: primaryGoal, marketingConsent, movementRobustness, typicalWeeklyHours, typicalSleep) | — | Drop columns. Rewrite forms. Not "soft delete" — actually remove. |
| Orphan onboarding fields (coach: trainingFrequency, teamStructure) | — | Same. |
| `src/lib/research/bundles.ts` deprecated bundles | — | Marked deprecated in code; remove the deprecated entries. |
| Migrations folder (currently 79 files) | ~3 MB SQL | Squash to: 1 canonical `00_initial_schema_v1.sql` + ~5 targeted patches going forward. **Major cleanup, do this in week 2.** |

### 7.3 REBUILD (keep the goal, rewrite the implementation)

| File / Area | Current | Rebuild target |
|---|---|---|
| `src/lib/dashboard_decisions.ts` | 117 KB monolith | Split into 3 files (`athleteDashboard.ts`, `coachDashboard.ts`, `individualDashboard.ts` — last one parked). Each ≤30 KB. Single output schema per role. |
| `src/lib/sport_intelligence.ts` | 76 KB | Extract the real cricket / football / athletics models (~10 KB total). Discard the rest. Keep as a reference table, not an engine. |
| Daily directive copy library | Generic copy across sports | Write **18 sport+state lines** (3 sports × 6 states) with 2–3 stable variants each. Half-day of writing. |
| Movement scan reports | Raw rule violations only | Generate one prioritized "fix this first" per scan, not a list of every fault. |
| Health sync UI (Apple Health / Google Fit) | Web stub linking to mobile | Pick: either finish web sync OR drop the web claim and ship mobile-first beta. Stop pretending. |
| Coach intervention queue | Schema only, no UI | Build the surface in week 4, not before. Until then, coach view is just the squad readiness grid. |

### 7.4 Deployability blockers — what stops us from shipping today

| Blocker | Status | Action |
|---|---|---|
| Required env vars (`SUPABASE_*`, `DATABASE_URL`) | Validated by Zod, throws at build | OK. Make sure prod values are set on Hostinger. |
| Migrations folder | 79 files, 6 schema versions | **HIGH RISK.** Consolidate before any new feature work in week 2. |
| Two competing onboarding flows | Both ship today | **MUST FIX week 2.** Kill `/onboarding`, route everything through `/athlete/onboarding`. |
| CSP `'unsafe-inline'` for scripts | Security debt, not a blocker | Tighten in week 4. |
| Service worker `/sw.js` | Configured | OK. |
| Stripe webhooks | Optional, gracefully degrades | OK for v1. UPI integration in week 8. |
| Mobile / web parity | Mobile lives at `~/CREEDA-2.0-Android` (Expo) | **Decision required:** mobile-first beta (faster) or web+mobile parity (slower)? See §10. |

---

## 8. Phased Rebuild Plan — Week 2 / Week 4 / Week 8

### 8.1 Week 2 — Deployable MVP (athlete-only, web+mobile)

**Goal:** Aarav can sign up, finish onboarding in 90 seconds, complete a 10-second daily check-in, see today's directive with a real why-line, and tap into a prescribed session for his sport.

**Engineering work (in priority order):**

1. **Kill `/onboarding` (OnboardingV2)** — route everything through `/athlete/onboarding`. Migrate any test users.
2. **Trim athlete onboarding to 8 questions** — remove orphan fields from form, schema, and migrations.
3. **Squash migrations** — collapse 79 files to 1 canonical schema + a clean go-forward path. (Hostinger SQL editor or psql.)
4. **Write 18 sport+state directive lines** — cricket bowler / cricket batter / football outfield / football GK / athletics sprint / athletics endurance / gym strength / gym hypertrophy × 6 states. ~50 lines of copy.
5. **Build the "Today's session" prescription** — 10 prescribed sessions per sport per state (so 6 × 10 × 3 sports = 180 sessions, but most reuse drills from existing exercise library). Use the existing exercise-library seed (`scripts/seed:exercise-library`).
6. **Wire the why-line into the dashboard** — readiness.ts already returns `reasons[]`. Render top 2–3 in plain language.
7. **Daily check-in screen** — 4 sliders, 10 seconds, replaces existing multi-question check-in.
8. **Disable Individual route** (or hide behind a flag) — return a "join waitlist" page.
9. **Disable promised-but-not-built features** — hide "reaction test," "balance test," "breathing test," "India context" UI references on the marketing page until they actually work.
10. **Production deploy to Hostinger** — verify env vars, run squashed migration, smoke test the 8-question onboarding → check-in → directive → session loop.

**Definition of done:** Three founders can each, on a freshly installed phone, sign up cold and see a real, sport-specific directive with a session prescription in under 4 minutes total. No fake data. No "(coming soon)" buttons on the home screen.

### 8.2 Week 4 — Beta with 2 academies (still athlete-only)

**Goal:** 30–80 real Aaravs using CREEDA daily for 14 days from 2 cricket / football academies in India. Coaches see a squad readiness grid.

**Engineering work:**

1. **Wearable read-only integration** — read sleep, steps, HR from Apple Health / Google Fit / Mi Band export if granted. Don't write. Don't require. If absent, the daily check-in is the input.
2. **Coach view: squad readiness grid** — list of athletes, each with red/amber/green dot + reason tag. No intervention queue yet. ([src/app/coach/dashboard/](src/app/coach/dashboard/) already does most of this.)
3. **Coach video feedback loop polish** — the migration is shipped (`migrations/20260425_video_analysis_comments.sql`), but verify the end-to-end flow: athlete uploads → coach sees → coach comments → athlete reads → comment marked read.
4. **Movement scan: one fault per sport** — bowling action front-on (cricket), lunge form (football), squat depth (gym/athletics). Not 150 rules. One prioritized fault.
5. **Onboarding: coach version (6 questions)** — slimmed coach onboarding shipped.
6. **Pricing live** — ₹199/month, free for U-18, ₹999/year, accept payments via Stripe (UPI option flagged for week 8). India-first pricing, no "WHOOP-tier $30" anywhere.
7. **Marketing page rewrite** — single value prop ("Train hard. Train smart. Don't break."). Athlete-only language. Coach section deferred. Individual section removed.
8. **Beta onboarding kit** — printable PDF for coaches (how to invite athletes, share squad code, read the dashboard).

**Beta success criteria:**
- Day 7 retention ≥ 60% across 30+ users
- Daily check-in completion rate ≥ 40%
- 1 academy coach reports they "can't go back to spreadsheets"
- Zero "the app told me to train and I got injured" incidents
- 5+ qualitative testimonial sentences from athletes

### 8.3 Week 8 — Production

**Goal:** Public launch. App Store + Play Store. UPI payments. Coach intervention queue. 3 sports stable, 1 more in pilot.

**Engineering work:**

1. **iOS App Store submission** — current Expo project (`~/CREEDA-2.0-Android`) builds for iOS already (`BUILD_IOS.md` + `eas.json` confirm). Submit week 6, account for ~2-week review.
2. **Play Store submission** — same Expo project.
3. **UPI payments** — Razorpay or PhonePe integration. Stripe stays for international.
4. **Coach intervention queue** — the prioritized "who needs you to look at them today" list, filtered by red flags + low-data + injury return.
5. **Movement scan: second fault per sport** — additive.
6. **Sport #4 pilot** — pick from kabaddi, badminton, hockey based on academy partnerships.
7. **Tighten CSP** — remove `'unsafe-inline'`.
8. **India-context layer (basic)** — a single optional question in onboarding *"Are you fasting / following a vegetarian diet?"* and one daily contextual modifier *"It's 38°C today — drop session intensity by 15%."* Not the full backend's promised seven dimensions. Just one thing that proves we localize.
9. **Founder team weekly retro discipline** — Friday review of beta data, coach feedback, churn. No new features that don't have data signal.

**Production launch criteria:**
- 100+ users across 3+ academies
- ≥30% paid conversion among non-U18 users
- App store 4.5+ stars
- One coach champion willing to do a video testimonial

---

## 9. Risks — what could go wrong

| Risk | Likelihood | Mitigation |
|---|---|---|
| **Founder picks a different wedge** (e.g. wants to keep Individual) | Medium | This document forces the decision. Override is fine; just acknowledge it pushes the timeline by ~3 weeks. |
| **Migrations consolidation breaks something** | High | Do it in a worktree. Run a full DB snapshot before. Test the squashed migration on a clone before applying to prod. |
| **Killing OnboardingV2 strands existing users** | Low | Check user count on `/onboarding`. If non-zero, write a one-time migration that maps OnboardingV2 answers to AdaptiveFormWizard schema. |
| **Beta academies don't sign up** | Medium | Founder warm intros to 5–8 coaches before week 2 ends. Don't promise features that aren't shipped. |
| **Sport-specific session library is thin** | High | Reuse existing exercise library (`npm run seed:exercise-library`) and the existing video library. Don't try to film 180 new videos in 2 weeks. |
| **`intelligence_engine.ts` deletion breaks something subtle** | Medium | Grep for imports first. Most callers point to `dashboard_decisions.ts` which is being rebuilt anyway. Stage in a worktree. |
| **WHOOP / Oura builds a "for India" version** | Low this year, real long-term | Speed of execution is the moat. Ship in 4 weeks, not 6 months. |
| **Mobile vs. web parity question** | Medium | See §10 — needs founder decision. |

---

## 10. Decisions the founder needs to make (this week)

These cannot be made by AI. They are strategic founder calls.

### Decision 1 — APPROVE the wedge user

> Are we building exclusively for the 16–22 academy / serious-athlete in India for v1, with Individual deferred and Coach as a v1.5 add-on?

If **yes** → execute this plan.
If **no** → tell me which wedge instead, and I'll redo the plan.

### Decision 2 — APPROVE the daily promise

> Is "Should I train hard, train light, or rest today — and exactly what should I do?" the single question CREEDA answers every morning?

If yes, every screen and notification is judged against it.
If no, propose the alternative in one sentence.

### Decision 3 — Mobile-first beta or web+mobile parity?

The Expo mobile project at `~/CREEDA-2.0-Android` is real and builds for iOS + Android. The web app on Hostinger is more mature. For the beta, we can either:

- **(a) Mobile-first** — push the Expo app to TestFlight + Play internal testing for the beta. Faster (~3 weeks). Web is just marketing + auth + admin.
- **(b) Web+mobile parity** — both surfaces ship the same flows. Slower (~5 weeks). User can move between them.

**Recommendation: (a) mobile-first.** Aarav lives on his phone, not his laptop. Beta velocity matters more than parity.

### Decision 4 — Sports for v1

We've assumed cricket, football, athletics, and gym. Confirm or swap. Each sport adds ~2 days of content work (drills, sessions, sport+state copy). 4 sports is the cap for v1.

### Decision 5 — Pricing: ₹199/month or different?

The competitive analysis says ₹150–₹400/month is the band that converts in India for serious-athlete tools. ₹199 is mid-range. Free for U-18 captures the core audience and creates social signal. Confirm or counter.

### Decision 6 — Are you OK losing this much code?

The audit kills ~200 KB of source (intelligence_engine, sport_dashboard_engine, OnboardingV2, legacy onboarding, individual-journey, deprecated research bundles) and squashes 79 migrations to 1. This is months of past work. It is also the only way to ship in 4 weeks.

If the answer is "no, find a way to keep more," the timeline doubles.

---

## 11. What I will do as soon as decisions land

The moment the founder approves §10 decisions 1, 2, and 3:

1. Open a tracking issue with the §8.1 (Week 2 MVP) checklist.
2. Open a worktree for the migrations consolidation (high-risk; isolated).
3. Open a second worktree for the onboarding trim (medium-risk).
4. Write the 18 sport+state directive lines and commit them as `directives.ts` additions.
5. Disable `/onboarding` (OnboardingV2) behind a feature flag, then schedule the kill.
6. Disable the Individual route behind a "waitlist" page.
7. Hide "reaction test," "balance test," "breathing test," and "India context" claims from the marketing site until they're real.
8. Daily standup-style updates so this work doesn't disappear into a black hole again.

Estimated calendar time to deployable MVP from decision approval: **10–14 working days**, not 4 weeks of dithering.

---

## 12. Files referenced in this document

For the founder's reference, every file mentioned, with link:

**Strategic docs:**
- [docs/CREEDA_BLUEPRINT.md](docs/CREEDA_BLUEPRINT.md) — current product blueprint
- [docs/creeda-competitive-analysis-2026-04-01.md](docs/creeda-competitive-analysis-2026-04-01.md) — prior competitive doc
- [docs/creeda-adaptive-onboarding-redesign-2026-04-16.md](docs/creeda-adaptive-onboarding-redesign-2026-04-16.md) — the spec that didn't ship
- [docs/creeda-execution-roadmap-2026-04-02.md](docs/creeda-execution-roadmap-2026-04-02.md) — phase plan vs. reality
- [docs/creeda-six-month-end-to-end-user-journeys-2026-04-25.md](docs/creeda-six-month-end-to-end-user-journeys-2026-04-25.md) — journey spec

**Engines (KEEP / KILL / REBUILD):**
- [src/components/performance-view/directives.ts](src/components/performance-view/directives.ts) — KEEP
- [src/lib/readiness.ts](src/lib/readiness.ts) — KEEP
- [src/lib/intelligence_engine.ts](src/lib/intelligence_engine.ts) — KILL
- [src/lib/sport_dashboard_engine.ts](src/lib/sport_dashboard_engine.ts) — KILL
- [src/lib/sport_intelligence.ts](src/lib/sport_intelligence.ts) — REBUILD (extract core)
- [src/lib/dashboard_decisions.ts](src/lib/dashboard_decisions.ts) — REBUILD (split per persona)

**Onboarding:**
- [src/components/form/AdaptiveFormWizard.tsx](src/components/form/AdaptiveFormWizard.tsx) — KEEP
- [src/forms/](src/forms/) — KEEP, trim
- [src/app/onboarding/](src/app/onboarding/) (OnboardingV2) — KILL

**Surfaces:**
- [src/app/athlete/dashboard/](src/app/athlete/dashboard/) — KEEP
- [src/app/coach/dashboard/](src/app/coach/dashboard/) — KEEP
- [src/app/individual/dashboard/](src/app/individual/dashboard/) — DEFER
- [src/app/athlete/scan/](src/app/athlete/scan/) — KEEP, polish reports
- [src/components/video-analysis/](src/components/video-analysis/) — KEEP

**Marketing & legal:**
- [src/app/page.tsx](src/app/page.tsx) — KEEP, slim
- Legal pages — KEEP

**Mobile:**
- `~/CREEDA-2.0-Android` (Expo) — KEEP, this is the beta surface

---

## 13. One last note for the founder

You said *"we are just building blindly."* That was true — but the cause wasn't laziness or bad engineering. It was that no one ever forced a single answer to *"who is this for?"*. Three personas, two onboarding flows, six engines, seventy-nine migrations, twenty-one onboarding questions: those are the symptoms, not the disease. The disease is unmade decisions.

This document forces those decisions. Approve §10 and we ship in 14 working days. Override with a different wedge and we re-plan once. Refuse to choose and we'll be having this conversation again in three months.

You picked the right product. CREEDA's wedge is real — Aarav has no good option today. Build for him, win him, and the rest of the personas you imagined become roadmap, not blockers.

— Strategic reset, April 27, 2026
