import type {
  AthleteOnboardingFastStart,
  AthleteSportOption,
} from '@/forms/schemas/athleteOnboarding'
import type { AthleteDailyQuickInput } from '@/forms/schemas/athleteDaily'
import type { SportType } from '@/lib/constants'

type LegacyAthleteOnboardingPayload = import('@/lib/athlete-onboarding').AthleteOnboardingPayload
type LegacyAthleteDailyPayload = import('@/lib/athlete-checkin').AthleteDailyCheckInInput

type LegacyPlayingLevel = LegacyAthleteOnboardingPayload['playingLevel']
type LegacyTrainingFrequency = LegacyAthleteOnboardingPayload['trainingFrequency']
type LegacyAvgIntensity = LegacyAthleteOnboardingPayload['avgIntensity']
type LegacyBiologicalSex = LegacyAthleteOnboardingPayload['biologicalSex']
type LegacyTypicalSoreness = LegacyAthleteOnboardingPayload['typicalSoreness']
type LegacyTypicalEnergy = LegacyAthleteOnboardingPayload['typicalEnergy']

interface AthleteOnboardingMapperOptions {
  // The legacy payload still requires fullName and username. Both are pulled from
  // the existing profile (set at signup) and passed in by the action layer rather
  // than asked for again in the simplified V1 flow.
  fullName?: string
  username?: string
  userId?: string
}

function clampDomain(value: number) {
  return Math.max(1, Math.min(4, Math.round(value)))
}

function ageFromDateOfBirth(dateOfBirth: string) {
  const dob = new Date(dateOfBirth)
  if (Number.isNaN(dob.getTime())) return 18
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const beforeBirthdayThisYear =
    today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate())
  if (beforeBirthdayThisYear) age -= 1
  return Math.max(8, Math.min(80, age))
}

function mapPlayingLevel(level: AthleteOnboardingFastStart['playingLevel']): LegacyPlayingLevel {
  switch (level) {
    case 'National+':
      return 'National'
    case 'State+':
      return 'State'
    case 'Academy':
      return 'District'
    case 'Club':
      return 'School'
    case 'Recreational':
    default:
      return 'Recreational'
  }
}

function levelToDomainSeed(level: AthleteOnboardingFastStart['playingLevel']) {
  switch (level) {
    case 'National+':
      return 4
    case 'State+':
      return 3
    case 'Academy':
      return 3
    case 'Club':
      return 2
    case 'Recreational':
    default:
      return 2
  }
}

function inferTrainingFrequency(level: AthleteOnboardingFastStart['playingLevel']): LegacyTrainingFrequency {
  if (level === 'National+') return 'Daily'
  if (level === 'State+' || level === 'Academy') return '4-6 days'
  return '1-3 days'
}

function inferIntensity(level: AthleteOnboardingFastStart['playingLevel']): LegacyAvgIntensity {
  if (level === 'National+') return 'High'
  if (level === 'State+' || level === 'Academy') return 'Moderate'
  return 'Low'
}

function inferTypicalWeeklyHours(level: AthleteOnboardingFastStart['playingLevel']) {
  switch (level) {
    case 'National+':
      return 12
    case 'State+':
      return 8
    case 'Academy':
      return 6
    case 'Club':
      return 4
    case 'Recreational':
    default:
      return 3
  }
}

function inferTypicalRPE(level: AthleteOnboardingFastStart['playingLevel']) {
  if (level === 'National+') return 8
  if (level === 'State+' || level === 'Academy') return 7
  return 6
}

function inferSorenessBaseline(currentIssue: AthleteOnboardingFastStart['currentIssue']): LegacyTypicalSoreness {
  if (currentIssue === 'Active injury') return 'High'
  if (currentIssue === 'Niggle') return 'Moderate'
  return 'Low'
}

function inferEnergyBaseline(): LegacyTypicalEnergy {
  return 'Moderate'
}

function mapBiologicalSex(value: AthleteOnboardingFastStart['biologicalSex']): LegacyBiologicalSex {
  if (value === 'Male' || value === 'Female') return value
  return 'Other'
}

function legacyCurrentIssue(value: AthleteOnboardingFastStart['currentIssue']): 'Yes' | 'No' {
  return value === 'None' ? 'No' : 'Yes'
}

function inferInjurySeverity(value: AthleteOnboardingFastStart['currentIssue']) {
  if (value === 'Active injury') return 'high'
  if (value === 'Niggle') return 'mild'
  return 'mild'
}

// The four high-level sport buckets shown to users do not always map 1:1 to the
// legacy SPORTS_LIST enum. We expand based on the position/event the user picked
// so downstream engines that key off SPORTS_LIST get a sensible value.
function expandPrimarySport(
  sport: AthleteSportOption,
  position: AthleteOnboardingFastStart['position']
): SportType {
  if (sport === 'Cricket') return 'Cricket'
  if (sport === 'Football') return 'Football'
  if (sport === 'Athletics') {
    if (position === 'Sprint') return 'Athletics (Sprints)'
    if (position === 'Distance') return 'Athletics (Distance)'
    return 'Athletics (Jumps/Throws)'
  }
  return 'Other'
}

function mapActiveInjuries(input: AthleteOnboardingFastStart) {
  if (input.currentIssue === 'None' || input.injuryLocations.length === 0) return []

  const severity = inferInjurySeverity(input.currentIssue)

  return input.injuryLocations.map((region) => ({
    region,
    type: severity === 'high' ? 'Joint' : 'Muscle',
    side: 'N/A',
    recurring: severity === 'high',
  }))
}

function buildAutoUsername(fullName: string | undefined, userId: string | undefined) {
  const slug = (fullName ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 14)
  const base = slug.length >= 3 ? slug : 'athlete'
  const suffix = (userId ?? '').replace(/-/g, '').slice(0, 6) || Math.random().toString(36).slice(2, 8)
  return `${base}_${suffix}`.slice(0, 30)
}

export function mapAdaptiveAthleteOnboardingToLegacy(
  input: AthleteOnboardingFastStart,
  options: AthleteOnboardingMapperOptions = {}
): LegacyAthleteOnboardingPayload {
  const playingLevel = mapPlayingLevel(input.playingLevel)
  const domainSeed = levelToDomainSeed(input.playingLevel)
  const injuryPenalty = input.currentIssue === 'Active injury' ? 1 : 0
  const computedAge = ageFromDateOfBirth(input.dateOfBirth)
  const isMinor = computedAge < 18
  const fullName = (options.fullName ?? '').trim() || 'Athlete'
  const username = (options.username ?? '').trim() || buildAutoUsername(options.fullName, options.userId)

  return {
    fullName,
    username,
    primarySport: expandPrimarySport(input.primarySport, input.position),
    position: input.position || 'General',
    coachId: null,
    coachLockerCode: input.coachLockerCode.trim(),
    inviteToken: '',
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    avatar_url: null,
    minorGuardianConsent: isMinor ? Boolean(input.guardianEmail) : false,
    typicalWeeklyHours: inferTypicalWeeklyHours(input.playingLevel),
    typicalRPE: inferTypicalRPE(input.playingLevel),
    age: computedAge,
    biologicalSex: mapBiologicalSex(input.biologicalSex),
    dominantSide: 'Both',
    playingLevel,
    seasonPhase: 'In-season',
    trainingFrequency: inferTrainingFrequency(input.playingLevel),
    avgIntensity: inferIntensity(input.playingLevel),
    typicalSleep: '7-8 hours',
    usualWakeUpTime: '06:30',
    typicalSoreness: inferSorenessBaseline(input.currentIssue),
    typicalEnergy: inferEnergyBaseline(),
    currentIssue: legacyCurrentIssue(input.currentIssue),
    activeInjuries: mapActiveInjuries(input),
    pastMajorInjury: input.currentIssue === 'Active injury' ? 'Yes' : 'No',
    pastInjuries: [],
    hasIllness: 'No',
    illnesses: [],
    endurance_capacity: clampDomain(domainSeed),
    strength_capacity: clampDomain(domainSeed),
    explosive_power: clampDomain(domainSeed),
    agility_control: clampDomain(domainSeed - injuryPenalty),
    reaction_self_perception: clampDomain(domainSeed),
    recovery_efficiency: clampDomain(domainSeed - injuryPenalty),
    fatigue_resistance: clampDomain(domainSeed),
    load_tolerance: clampDomain(domainSeed - injuryPenalty),
    movement_robustness: clampDomain(domainSeed - injuryPenalty),
    coordination_control: clampDomain(domainSeed),
    reaction_time_ms: undefined,
    primaryGoal: 'Performance Enhancement',
    health_connection_preference: 'later',
    legalConsent: input.platformConsent,
    medicalDisclaimerConsent: input.platformConsent,
    dataProcessingConsent: input.platformConsent,
    aiAcknowledgementConsent: input.platformConsent,
    marketingConsent: false,
  }
}

function mapEnergyLevel(value: number): LegacyAthleteDailyPayload['energyLevel'] {
  if (value <= 1) return 'Drained'
  if (value === 2) return 'Low'
  if (value === 3) return 'Moderate'
  if (value === 4) return 'High'
  return 'Peak'
}

function mapSorenessLevel(value: number): LegacyAthleteDailyPayload['muscleSoreness'] {
  if (value <= 1) return 'None'
  if (value === 2) return 'Low'
  if (value === 3) return 'Moderate'
  return 'High'
}

function mapStressLevel(value: number): LegacyAthleteDailyPayload['lifeStress'] {
  if (value <= 2) return 'Low'
  if (value === 3) return 'Moderate'
  if (value === 4) return 'High'
  return 'Very High'
}

function mapSleepQuality(value?: number): LegacyAthleteDailyPayload['sleepQuality'] {
  if (!value || value <= 1) return 'Poor'
  if (value <= 3) return 'Okay'
  if (value === 4) return 'Good'
  return 'Excellent'
}

function inferSleepDuration(input: AthleteDailyQuickInput): LegacyAthleteDailyPayload['sleepDuration'] {
  if (input.sleepDuration) return input.sleepDuration
  if (input.energy <= 2 || input.stress >= 4) return '6-7'
  if (input.energy >= 4 && input.stress <= 2) return '8-9'
  return '7-8'
}

function inferSleepLatency(input: AthleteDailyQuickInput): LegacyAthleteDailyPayload['sleepLatency'] {
  if ((input.sleepQuality ?? 0) <= 1 || input.stress >= 5) return '>60 min'
  if ((input.sleepQuality ?? 0) === 2 || input.stress >= 4) return '30-60 min'
  if ((input.sleepQuality ?? 0) === 3) return '15-30 min'
  return '<15 min'
}

function inferPainStatus(input: AthleteDailyQuickInput): LegacyAthleteDailyPayload['painStatus'] {
  if (input.painLocation.length > 0 && input.soreness >= 5) return 'severe'
  if (input.painLocation.length > 0 || input.soreness >= 4) return 'moderate'
  if (input.soreness === 3) return 'mild'
  return 'none'
}

export function mapAdaptiveAthleteDailyToLegacy(input: AthleteDailyQuickInput): LegacyAthleteDailyPayload {
  const sessionCompletion = input.sessionCompletion ?? 'rest'
  const sessionOccurred = sessionCompletion === 'completed' || sessionCompletion === 'competition'

  return {
    sleepQuality: mapSleepQuality(input.sleepQuality),
    sleepDuration: inferSleepDuration(input),
    sleepLatency: inferSleepLatency(input),
    energyLevel: mapEnergyLevel(input.energy),
    muscleSoreness: mapSorenessLevel(input.soreness),
    lifeStress: mapStressLevel(input.stress),
    motivation: input.energy >= 4 ? 'High' : input.energy <= 2 ? 'Low' : 'Moderate',
    sessionCompletion,
    sessionType: '',
    yesterdayDemand: sessionOccurred ? input.sessionRPE ?? 6 : 0,
    yesterdayDuration: sessionOccurred ? input.sessionDuration ?? 45 : 0,
    painStatus: inferPainStatus(input),
    painLocation: input.painLocation,
    competitionToday: false,
    competitionTomorrow: false,
    competitionYesterday: sessionCompletion === 'competition',
    heatLevel: input.heatLevel ?? '',
    humidityLevel: input.humidityLevel ?? '',
    aqiBand: input.aqiBand ?? '',
    commuteMinutes: 0,
    examStressScore: input.stress >= 4 ? 2 : 0,
    fastingState: '',
    shiftWork: false,
    sessionNotes: input.sessionNotes ?? '',
  }
}
