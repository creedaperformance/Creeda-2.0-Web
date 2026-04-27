import type { DailyAction, GoalPhase } from '@/lib/product/operating-system/types'

export type Persona = 'athlete' | 'individual' | 'coach'

export type SportContext =
  | 'cricket'
  | 'football'
  | 'badminton'
  | 'athletics'
  | 'strength'
  | 'general'

export interface DirectiveContext {
  persona: Persona
  action: DailyAction
  sport?: SportContext
  phase?: GoalPhase
  topReasonLabel?: string
  topReasonImpact?: number
  hasInjury?: boolean
  streakDays?: number
}

export interface Directive {
  headline: string
  whyLine: string
}

const ATHLETE_ACTION_HEADLINES: Record<DailyAction, string[]> = {
  train_hard: [
    'Body says go. Push the ceiling.',
    'Nervous system is primed. Take the hard reps.',
    'Green across the board. Build today.',
  ],
  train_light: [
    'Body says steady. Build, don\'t bury.',
    'Quality over volume today.',
    'Stay sharp. Skip the failure work.',
  ],
  mobility_only: [
    'Movement only. Save the load for tomorrow.',
    'Move well, finish fresh.',
    'Mobility is the work today.',
  ],
  recovery_focus: [
    'Recovery is the workout.',
    'Recover with intent. Tomorrow\'s ceiling depends on it.',
    'Easy walk, hydration, sleep — that\'s the plan.',
  ],
  deload: [
    'Deload day. Don\'t out-train the recovery debt.',
    'Pull the throttle. The body needs a step back.',
    'Deload locked. Protect the next cycle.',
  ],
  full_rest: [
    'Full rest. Training today costs more than it earns.',
    'Stand down. Eat, sleep, rebuild.',
    'No load today. Body comes first.',
  ],
}

const INDIVIDUAL_ACTION_HEADLINES: Record<DailyAction, string[]> = {
  train_hard: [
    'Great day for a session. Body is ready.',
    'Push a little today — you\'ve earned the green light.',
    'Energy is high. Make it count.',
  ],
  train_light: [
    'Move steady today. Light work is the win.',
    'Keep it moving. Don\'t force the intensity.',
    'A good day for a walk plus a short session.',
  ],
  mobility_only: [
    'Just stretch and move easy today.',
    'Mobility and breathing — that\'s the goal.',
    'Slow it down. Movement, not muscle.',
  ],
  recovery_focus: [
    'Recover today. That\'s the training.',
    'Easy walk, water, sleep — that\'s enough.',
    'Take the rest. Your body is asking for it.',
  ],
  deload: [
    'Step back today. Tomorrow will feel better.',
    'Lighter is smarter. The body needs a pause.',
    'Pulled back on purpose. Listen to it.',
  ],
  full_rest: [
    'Rest day. No guilt — this is the plan.',
    'Skip training. Eat well, sleep early.',
    'Body says off. Honor it.',
  ],
}

function pickStable(options: string[], seed: number): string {
  if (options.length === 0) return ''
  return options[seed % options.length]
}

// ---------------------------------------------------------------------------
// Sport-specific copy variants (additive layer)
// Pattern: persona × sport × state → 2 stable variants of {headline, whyLine}.
// When `ctx.sport` matches a key below, the sport-specific copy is preferred
// over the generic ATHLETE_/INDIVIDUAL_ headlines above. Selection stays
// deterministic via the same seed.
// ---------------------------------------------------------------------------

type SportCopyMap = Partial<Record<SportContext, Record<DailyAction, Directive[]>>>

const ATHLETE_SPORT_COPY: SportCopyMap = {
  cricket: {
    train_hard: [
      { headline: "Body's primed. Bowl with intent.", whyLine: 'Readiness is high — go after the hard reps in your bowling/batting work today.' },
      { headline: 'Green light. 6-over spell + plyo finisher today.', whyLine: 'Nervous system is sharp — high-intensity skill plus power work fits the score.' },
    ],
    train_light: [
      { headline: 'Recovered enough. Skill drills + light strength.', whyLine: 'You\'re workable but not peaked — keep the touch, skip the heavy spells.' },
      { headline: 'Steady day. Catching practice and core only.', whyLine: 'Quality reps over volume — protect the body for the next match-pace session.' },
    ],
    mobility_only: [
      { headline: 'Stiff today. 30-min mobility flow, skip bowling.', whyLine: 'Tightness will cost more than it earns — load on the shoulder/hip is off the table.' },
      { headline: 'Range-of-motion only. No load on the shoulder/hip.', whyLine: 'Body is asking for movement, not stress — keep the joints moving and finish fresh.' },
    ],
    recovery_focus: [
      { headline: 'Sleep was thin. Easy walk + stretch + sleep before 10pm.', whyLine: 'Recovery is the workout — tomorrow\'s ceiling depends on tonight.' },
      { headline: 'Active recovery. 20-min jog and foam roll.', whyLine: 'Light blood-flow work clears the backlog without adding load.' },
    ],
    deload: [
      { headline: 'Planned deload week. Half-volume on every session.', whyLine: 'Cumulative load is high — pulling back protects the next training block.' },
      { headline: 'Drop the intensity. Skill work only, no max efforts.', whyLine: 'Touch and timing stay sharp at low intensity — the body uses the dip to absorb.' },
    ],
    full_rest: [
      { headline: '24h off. No bowling, no batting, no gym. Re-check tomorrow.', whyLine: 'Training today costs more than it earns — full stop is the right call.' },
      { headline: "Body's flagging. Full rest day — don't negotiate.", whyLine: 'Signals are red across the board — eat, sleep, and rebuild.' },
    ],
  },
  football: {
    train_hard: [
      { headline: 'Green light. Match-pace work today.', whyLine: 'Readiness supports full-intensity running and contact volume.' },
      { headline: "Body's ready. Full session including high-speed runs.", whyLine: 'Nervous system is primed — push the sprint and finishing work.' },
    ],
    train_light: [
      { headline: 'Recovered enough. Tactical work + skill drills.', whyLine: 'Workable but not peaked — keep the brain on, ease the legs.' },
      { headline: 'Steady day. Possession drills, no sprints.', whyLine: 'Quality touches over high-speed volume protect tomorrow\'s session.' },
    ],
    mobility_only: [
      { headline: 'Stiff today. 30-min mobility + ball control work only.', whyLine: 'Running with this stiffness will cost more than it earns — keep it light.' },
      { headline: 'Tight hips. Mobility flow, skip the running.', whyLine: 'Open the hips first; the running comes back tomorrow.' },
    ],
    recovery_focus: [
      { headline: 'Active recovery. Easy 20-min jog + stretch + sleep early.', whyLine: 'Low-effort blood flow plus sleep clears the backlog.' },
      { headline: 'Sleep was thin. Foam roll + walk + early bedtime.', whyLine: 'Recovery is the priority — tonight\'s sleep drives tomorrow\'s ceiling.' },
    ],
    deload: [
      { headline: 'Deload week. Half-volume across all sessions.', whyLine: 'Recent load is high — a step back keeps the next block available.' },
      { headline: 'Drop intensity. Skill work, no full-pitch sprints.', whyLine: 'Skill stays sharp at low intensity; the body uses the dip to absorb.' },
    ],
    full_rest: [
      { headline: '24h off. No training. Re-check tomorrow.', whyLine: 'Today\'s session would cost more than it earns — full rest is the call.' },
      { headline: "Body's flagging. Full rest — don't push it.", whyLine: 'Signals are pointing at recovery, not work — honour them.' },
    ],
  },
  strength: {
    train_hard: [
      { headline: "Body's primed. Hit your prescribed loads today.", whyLine: 'Readiness supports your top sets — trust the program.' },
      { headline: 'Green light. Push your top sets.', whyLine: 'Nervous system is sharp — go after the heavy work cleanly.' },
    ],
    train_light: [
      { headline: 'Steady day. Drop intensity 10–15%, focus on form.', whyLine: 'You\'re workable but not peaked — quality reps beat chasing PRs today.' },
      { headline: 'Recovered enough. Submaximal work, no PRs today.', whyLine: 'Build volume at submax loads; save the max efforts for a green day.' },
    ],
    mobility_only: [
      { headline: 'Stiff today. Mobility flow + light bodyweight only.', whyLine: 'Loading on this stiffness raises injury risk more than it builds anything.' },
      { headline: 'Skip lifting. 30-min mobility and stretching.', whyLine: 'Joints need movement, not load — return to the bar fresh tomorrow.' },
    ],
    recovery_focus: [
      { headline: 'Easy day. 20-min walk + sauna/stretch if available.', whyLine: 'Active recovery clears soreness without adding to the load debt.' },
      { headline: 'Sleep was thin. Active recovery, sleep early.', whyLine: 'Tonight\'s sleep is the lever — recovery work supports it.' },
    ],
    deload: [
      { headline: 'Deload week. 50–60% of usual loads, half the volume.', whyLine: 'Cumulative fatigue is high — pulling back unlocks the next block.' },
      { headline: 'Drop intensity. Technique work and accessory only.', whyLine: 'Refining patterns at low load means stronger top sets next week.' },
    ],
    full_rest: [
      { headline: '24h off. No lifting, no cardio. Sleep + food + recover.', whyLine: 'Today\'s session would cost more than it earns — rest is the work.' },
      { headline: 'Full rest day. Body needs it — take it.', whyLine: 'Signals are red — eat, sleep, and let the adaptation happen.' },
    ],
  },
}

const INDIVIDUAL_SPORT_COPY: SportCopyMap = {
  general: {
    train_hard: [
      { headline: "Push day. You've got the green light for a full session.", whyLine: 'Body and sleep both look good — go for the workout you planned.' },
      { headline: "Body's recovered. Go for that workout you planned.", whyLine: 'Energy is high — make it count without overdoing it.' },
    ],
    train_light: [
      { headline: 'Steady day. 30–45 min, low-to-moderate effort.', whyLine: 'You\'re workable but not peaked — keep the rhythm, skip the intensity.' },
      { headline: 'Take it easy but stay moving. Walk, light strength, or yoga.', whyLine: 'Movement helps recovery — just don\'t force it today.' },
    ],
    mobility_only: [
      { headline: 'Stretch day. 20–30 min mobility, skip the workout.', whyLine: 'Body is stiff — gentle movement helps more than a session would.' },
      { headline: 'Stiff today. Foam roll, stretch, and rest.', whyLine: 'Save the workout for tomorrow when the joints are happier.' },
    ],
    recovery_focus: [
      { headline: 'Easy day. Walk, stretch, sleep early.', whyLine: 'Recovery is the goal today — tomorrow will feel much better for it.' },
      { headline: 'Active recovery. 20-min walk and lots of water.', whyLine: 'Light activity plus hydration clears the slow-burn fatigue.' },
    ],
    deload: [
      { headline: 'Lighter week. Cut intensity in half.', whyLine: 'Recent activity has stacked up — a quieter week keeps you moving forward.' },
      { headline: 'Take the foot off the gas — half intensity all week.', whyLine: 'A planned step back protects the next stretch of training.' },
    ],
    full_rest: [
      { headline: "Take today off. Body's asking for it.", whyLine: 'Pushing today would cost more than it earns — rest is the smart move.' },
      { headline: 'Full rest. Sleep, eat well, no workout today.', whyLine: 'The body is signalling recovery — honour it and come back fresh.' },
    ],
  },
}

const COACH_SPORT_COPY: SportCopyMap = {
  general: {
    train_hard: [
      { headline: 'Squad ready. Push training today.', whyLine: 'Group readiness supports a full-intensity session.' },
      { headline: 'Green across the board — full intensity.', whyLine: 'Most athletes are clear to go — hold the plan you wrote.' },
    ],
    train_light: [
      { headline: 'Squad needs steady work. Technical session.', whyLine: 'Group is workable but not peaked — keep the brain on, ease the legs.' },
      { headline: 'Mostly recovered. Skill drills and light conditioning.', whyLine: 'Touch stays sharp at low intensity — protect tomorrow\'s session.' },
    ],
    mobility_only: [
      { headline: "Squad's stiff. Mobility-focused session.", whyLine: 'Several athletes are flagging — load today raises injury risk.' },
      { headline: 'Recovery day for the group.', whyLine: 'Movement without load keeps the group fresh for the next high-intensity day.' },
    ],
    recovery_focus: [
      { headline: 'Squad needs recovery. Easy work + early finish.', whyLine: 'Recent load is high across the group — recovery is the priority.' },
      { headline: 'Light day — pool, walk, or stretch.', whyLine: 'Low-intensity work clears the backlog without adding to it.' },
    ],
    deload: [
      { headline: 'Deload week. Half-volume planning.', whyLine: 'Group fatigue has stacked — a step back protects the next block.' },
      { headline: 'Reduce intensity. Skill and tactical work only.', whyLine: 'Skill stays sharp at low intensity; absorb the gains.' },
    ],
    full_rest: [
      { headline: "Squad needs rest. Cancel today's session.", whyLine: 'Training today would cost more than it earns across the group.' },
      { headline: 'Full rest day for the group.', whyLine: 'Signals are red — eat, sleep, rebuild.' },
    ],
  },
}

function pickStableDirective(options: Directive[], seed: number): Directive | null {
  if (options.length === 0) return null
  return options[seed % options.length]
}

function lookupSportDirective(
  persona: Persona,
  sport: SportContext | undefined,
  action: DailyAction,
  seed: number,
): Directive | null {
  if (!sport) return null
  const map =
    persona === 'athlete' ? ATHLETE_SPORT_COPY :
    persona === 'individual' ? INDIVIDUAL_SPORT_COPY :
    persona === 'coach' ? COACH_SPORT_COPY :
    undefined
  if (!map) return null
  const variants = map[sport]?.[action]
  if (!variants || variants.length === 0) return null
  return pickStableDirective(variants, seed)
}

function buildAthleteWhyLine(ctx: DirectiveContext): string {
  const reason = ctx.topReasonLabel?.toLowerCase() ?? ''
  if (ctx.hasInjury) return 'Pain or injury flag is active — the plan is built around protecting it.'
  if (reason === 'sleep') {
    return ctx.topReasonImpact && ctx.topReasonImpact < 0
      ? 'Sleep is the limiter today. Volume drops, quality stays.'
      : 'Sleep is in your favour. Plan reflects it.'
  }
  if (reason === 'training load') {
    return ctx.topReasonImpact && ctx.topReasonImpact < 0
      ? 'Recent load is high. Today eases the throttle to keep tomorrow available.'
      : 'Load is balanced. Plan trusts the trend.'
  }
  if (reason === 'body status') {
    return ctx.topReasonImpact && ctx.topReasonImpact < 0
      ? 'Soreness is the bigger signal today than your check-in score.'
      : 'Body status is clean. Trust the score.'
  }
  if (reason === 'stress') {
    return 'Stress is high enough that hard work won\'t stick today.'
  }
  if (ctx.phase === 'taper') return 'You\'re in taper — recovery is the priority over volume.'
  if (ctx.phase === 'peak') return 'Peak window — every session counts. Plan reflects that.'
  return 'Plan blends your check-in, sleep, load, and history.'
}

function buildIndividualWhyLine(ctx: DirectiveContext): string {
  if (ctx.hasInjury) return 'There\'s a pain flag — the plan keeps things gentle.'
  const reason = ctx.topReasonLabel?.toLowerCase() ?? ''
  if (reason === 'sleep') return 'Sleep affected the score more than anything else today.'
  if (reason === 'training load') return 'Recent activity is the main signal — easing back is smart.'
  if (reason === 'body status') return 'Body soreness drove this. Light is enough today.'
  if (reason === 'stress') return 'Stress was the biggest input — exercise should help, not add to it.'
  if (ctx.streakDays && ctx.streakDays >= 14) return 'Two-week streak. Don\'t blow it on a hard day you don\'t need.'
  return 'Plan listens to today\'s check-in and your recent week.'
}

function buildCoachHeadline(redCount: number, amberCount: number, totalCount: number): string {
  if (totalCount === 0) return 'No athletes linked yet.'
  if (redCount === 0 && amberCount === 0) return `All ${totalCount} green. Go full intensity.`
  if (redCount >= Math.ceil(totalCount * 0.4)) return `Squad is loaded. Pull intensity back today.`
  if (redCount > 0) return `${redCount} red ${redCount === 1 ? 'flag' : 'flags'} — bench or modify before practice.`
  return `${amberCount} amber. Watch them in warm-up, plan B ready.`
}

function buildCoachWhyLine(redCount: number, amberCount: number, lowDataCount: number): string {
  if (lowDataCount > 0 && lowDataCount >= redCount + amberCount) {
    return `${lowDataCount} athletes haven\'t checked in today — chase before warm-up.`
  }
  if (redCount > 0) return 'Red athletes have either pain, low readiness, or a load spike. Drill into each before assigning.'
  if (amberCount > 0) return 'Amber athletes are workable but the margin is thin. Avoid contact volume.'
  return 'Squad readiness is clean. Hold the plan you wrote.'
}

export function buildDirective(ctx: DirectiveContext): Directive {
  const seed = (ctx.streakDays ?? 0) + ctx.action.length

  // Prefer sport-specific copy when we have a match for this persona × sport × state.
  const sportSpecific = lookupSportDirective(ctx.persona, ctx.sport, ctx.action, seed)
  if (sportSpecific) return sportSpecific

  if (ctx.persona === 'athlete') {
    return {
      headline: pickStable(ATHLETE_ACTION_HEADLINES[ctx.action], seed),
      whyLine: buildAthleteWhyLine(ctx),
    }
  }
  if (ctx.persona === 'individual') {
    return {
      headline: pickStable(INDIVIDUAL_ACTION_HEADLINES[ctx.action], seed),
      whyLine: buildIndividualWhyLine(ctx),
    }
  }
  return {
    headline: ctx.action ? ATHLETE_ACTION_HEADLINES[ctx.action]?.[0] ?? '' : '',
    whyLine: '',
  }
}

export function buildCoachDirective(args: {
  totalAthletes: number
  redCount: number
  amberCount: number
  lowDataCount: number
}): Directive {
  return {
    headline: buildCoachHeadline(args.redCount, args.amberCount, args.totalAthletes),
    whyLine: buildCoachWhyLine(args.redCount, args.amberCount, args.lowDataCount),
  }
}

export function actionTone(action: DailyAction): 'go' | 'steady' | 'slow' | 'stop' {
  if (action === 'train_hard') return 'go'
  if (action === 'train_light') return 'steady'
  if (action === 'mobility_only' || action === 'recovery_focus') return 'slow'
  return 'stop'
}

/**
 * Translate an engine `ReadinessReason` (which uses internal labels like "Sleep",
 * "Training load", "Body status", "Recovery debt", "Stress") into a short
 * plain-language hint suitable for "what's driving this" chips under the
 * directive's whyLine. Returns `null` when the reason has near-zero impact
 * (so callers can filter it before rendering chips).
 *
 * Examples:
 *   { label: 'Sleep', impact: -12 }       → "Sleep was lower than usual"
 *   { label: 'Body status', impact: -15 } → "Soreness is up — likely from yesterday"
 *   { label: 'Stress', impact: -8 }       → "Stress was high yesterday"
 */
export function reasonToHint(reason: { label: string; impact: number }): string | null {
  // Filter near-zero noise so we don't surface "Recovery debt: 0"-style chips.
  if (Math.abs(reason.impact) < 3) return null
  const label = (reason.label || '').toLowerCase()
  const negative = reason.impact < 0
  if (label === 'sleep') {
    return negative ? 'Sleep was lower than usual' : 'Sleep is in your favour today'
  }
  if (label === 'training load') {
    return negative
      ? "You've trained hard recently — body's earned a lighter day"
      : 'Recent load is balanced'
  }
  if (label === 'body status') {
    return negative ? 'Soreness is up — likely from yesterday' : 'Body feels clean today'
  }
  if (label === 'recovery debt') {
    return negative ? 'Recovery work is behind for the week' : 'Recovery is on track'
  }
  if (label === 'stress') {
    return negative ? 'Stress was high yesterday' : 'Stress is low — green light'
  }
  // Unknown label: drop it rather than surface engine jargon.
  return null
}
