import type { SaveFitStartPayload } from '@/lib/fitstart'
import type { IndividualSignalPayload } from '@/lib/individual-logging'

import type { IndividualDailyQuickInput } from '@/forms/schemas/individualDaily'
import type { IndividualOnboardingFastStart } from '@/forms/schemas/individualOnboarding'

type LegacyFitStartPayload = SaveFitStartPayload
type LegacyIndividualDailyPayload = IndividualSignalPayload

function clampDomain(value: number) {
  return Math.max(1, Math.min(4, Math.round(value)))
}

function computeAgeFromDob(dob: string): number {
  const dobDate = new Date(`${dob}T00:00:00Z`)
  if (Number.isNaN(dobDate.getTime())) return 30
  const now = new Date()
  let age = now.getUTCFullYear() - dobDate.getUTCFullYear()
  const monthDiff = now.getUTCMonth() - dobDate.getUTCMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < dobDate.getUTCDate())) {
    age -= 1
  }
  return Math.max(13, Math.min(90, age))
}

function mapActivityLevelToLegacy(
  value: IndividualOnboardingFastStart['activityLevel']
): 'sedentary' | 'moderate' | 'active' {
  switch (value) {
    case 'sedentary':
      return 'sedentary'
    case 'lightly_active':
    case 'moderately_active':
      return 'moderate'
    case 'very_active':
      return 'active'
    default:
      return 'moderate'
  }
}

function mapPrimaryGoalToLegacy(
  value: IndividualOnboardingFastStart['primaryGoal']
): 'fat_loss' | 'muscle_gain' | 'endurance' | 'general_fitness' | 'sport_specific' {
  switch (value) {
    case 'lose_weight':
      return 'fat_loss'
    case 'build_strength':
      return 'muscle_gain'
    case 'improve_cardio':
      return 'endurance'
    case 'reduce_stress':
    case 'general_health':
    default:
      return 'general_fitness'
  }
}

function mapTimeHorizonToLegacy(
  value: IndividualOnboardingFastStart['timeHorizon']
): '4_weeks' | '8_weeks' | '12_weeks' | 'long_term' {
  switch (value) {
    case '3_months':
      return '12_weeks'
    case '6_months':
    case '1_year':
    case 'long_term':
    default:
      return 'long_term'
  }
}

function mapEquipmentAccessToLegacy(
  value: IndividualOnboardingFastStart['equipmentAccess']
): string[] {
  switch (value) {
    case 'none':
      return ['bodyweight']
    case 'bodyweight':
      return ['bodyweight']
    case 'home_weights':
      return ['home_dumbbells']
    case 'full_gym':
      return ['gym']
    default:
      return ['bodyweight']
  }
}

function mapInjuryStatusToLegacy(
  value: IndividualOnboardingFastStart['injuryStatus']
): 'none' | 'minor' | 'moderate' | 'major' | 'chronic' {
  switch (value) {
    case 'none':
      return 'none'
    case 'niggle':
      return 'minor'
    case 'active_injury':
      return 'moderate'
    default:
      return 'none'
  }
}

function mapMobility(
  injuryStatus: IndividualOnboardingFastStart['injuryStatus']
): 'none' | 'mild' | 'moderate' | 'severe' {
  switch (injuryStatus) {
    case 'niggle':
      return 'mild'
    case 'active_injury':
      return 'moderate'
    case 'none':
    default:
      return 'none'
  }
}

function inferTrainingExperience(
  activityLevel: IndividualOnboardingFastStart['activityLevel']
): 'beginner' | 'novice' | 'intermediate' | 'advanced' | 'experienced' {
  switch (activityLevel) {
    case 'very_active':
      return 'intermediate'
    case 'moderately_active':
      return 'novice'
    case 'lightly_active':
    case 'sedentary':
    default:
      return 'beginner'
  }
}

function inferIntensityFromActivity(
  activityLevel: IndividualOnboardingFastStart['activityLevel']
): 'low' | 'moderate' | 'high' {
  switch (activityLevel) {
    case 'very_active':
      return 'high'
    case 'moderately_active':
    case 'lightly_active':
      return 'moderate'
    case 'sedentary':
    default:
      return 'low'
  }
}

function inferPathway(legacyGoal: ReturnType<typeof mapPrimaryGoalToLegacy>) {
  switch (legacyGoal) {
    case 'fat_loss':
      return { selectedSport: 'Lean Build', selectedPathwayId: 'pathway_fat_loss', title: 'Lean Build' }
    case 'muscle_gain':
      return { selectedSport: 'Strength Build', selectedPathwayId: 'pathway_muscle_gain', title: 'Strength Build' }
    case 'endurance':
      return { selectedSport: 'Engine Build', selectedPathwayId: 'pathway_endurance', title: 'Engine Build' }
    case 'sport_specific':
      return { selectedSport: 'Sport Return', selectedPathwayId: 'pathway_sport_specific', title: 'Sport Return' }
    case 'general_fitness':
    default:
      return { selectedSport: 'General Fitness', selectedPathwayId: 'pathway_general_fitness', title: 'General Fitness' }
  }
}

function inferPhysiologySeed(legacyActivity: 'sedentary' | 'moderate' | 'active') {
  if (legacyActivity === 'active') return 3
  if (legacyActivity === 'moderate') return 2.5
  return 2
}

export function mapAdaptiveIndividualOnboardingToLegacy(
  input: IndividualOnboardingFastStart
): LegacyFitStartPayload {
  const age = computeAgeFromDob(input.dateOfBirth)
  const legacyActivity = mapActivityLevelToLegacy(input.activityLevel)
  const legacyGoal = mapPrimaryGoalToLegacy(input.primaryGoal)
  const legacyTimeHorizon = mapTimeHorizonToLegacy(input.timeHorizon)
  const legacyEquipment = mapEquipmentAccessToLegacy(input.equipmentAccess)
  const legacyInjuryStatus = mapInjuryStatusToLegacy(input.injuryStatus)
  const pathway = inferPathway(legacyGoal)
  const physiologySeed = inferPhysiologySeed(legacyActivity)

  return {
    basic: {
      age,
      gender: input.gender,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      occupation: 'hybrid',
      activityLevel: legacyActivity,
    },
    physiology: {
      sleepQuality: 3,
      energyLevels: 3,
      stressLevels: 3,
      recoveryRate: 3,
      injuryHistory: legacyInjuryStatus,
      mobilityLimitations: mapMobility(input.injuryStatus),
      trainingExperience: inferTrainingExperience(input.activityLevel),
      endurance_capacity: clampDomain(physiologySeed + (legacyGoal === 'endurance' ? 1 : 0)),
      strength_capacity: clampDomain(physiologySeed + (legacyGoal === 'muscle_gain' ? 1 : 0)),
      explosive_power: clampDomain(physiologySeed),
      agility_control: clampDomain(physiologySeed),
      reaction_self_perception: clampDomain(physiologySeed),
      recovery_efficiency: clampDomain(physiologySeed),
      fatigue_resistance: clampDomain(physiologySeed),
      load_tolerance: clampDomain(physiologySeed),
      movement_robustness: clampDomain(physiologySeed - (input.injuryStatus === 'none' ? 0 : 1)),
      coordination_control: clampDomain(physiologySeed),
      reaction_time_ms: undefined,
    },
    lifestyle: {
      scheduleConstraints: ['after_work'],
      equipmentAccess: legacyEquipment,
      nutritionHabits: 'basic',
      sedentaryHours: legacyActivity === 'sedentary' ? 9 : legacyActivity === 'active' ? 5 : 7,
    },
    goals: {
      primaryGoal: legacyGoal,
      timeHorizon: legacyTimeHorizon,
      intensityPreference: inferIntensityFromActivity(input.activityLevel),
    },
    sport: {
      selectedSport: pathway.selectedSport,
      selectedPathwayId: pathway.selectedPathwayId,
      selectedPathwayType: 'training',
      selectedRecommendationTitle: pathway.title,
      selectionRationale: 'Auto-selected from the user’s primary goal during fast start.',
    },
    timeTakenMs: 45000,
    health_connection_preference: 'later',
  }
}

export function mapAdaptiveIndividualDailyToLegacy(
  input: IndividualDailyQuickInput
): LegacyIndividualDailyPayload {
  return {
    sleep_quality: input.sleepQuality ?? (input.energy <= 2 ? 2 : 3),
    energy_level: input.energy,
    stress_level: input.stress,
    recovery_feel: Math.max(1, 6 - input.soreness),
    soreness_level: input.soreness,
    session_completion: input.sessionCompletion ?? 'missed',
    training_minutes: input.trainingMinutes ?? 0,
    session_rpe: input.sessionRPE ?? 0,
    steps: input.steps ?? 0,
    hydration_liters: input.hydrationLiters ?? 0,
    heat_level: input.heatLevel ?? '',
    humidity_level: input.humidityLevel ?? '',
    aqi_band: input.aqiBand ?? '',
    commute_minutes: 0,
    exam_stress_score: input.stress >= 4 ? 2 : 0,
    fasting_state: '',
    shift_work: false,
    session_notes: '',
  }
}
