import type { CoachOnboardingPayload } from '@/lib/coach-onboarding'
import type { SportType } from '@/lib/constants'

import type { CoachOnboardingFastStart } from '@/forms/schemas/coachOnboarding'

// New simplified sport names map to entries in SPORTS_LIST. Multi-sport falls
// back to "Other" so the legacy enum remains satisfied.
function mapSportCoached(sport: CoachOnboardingFastStart['sportCoached']): SportType {
  switch (sport) {
    case 'Cricket':
      return 'Cricket'
    case 'Football':
      return 'Football'
    case 'Athletics':
      return 'Athletics (Sprints)'
    case 'Gym':
      return 'Powerlifting'
    case 'Multi-sport':
    default:
      return 'Other'
  }
}

// New coaching levels map to the legacy enum still required by the database
// schema. Private (1-on-1) and School both flow into the closest existing slot.
function mapCoachingLevel(
  level: CoachOnboardingFastStart['coachingLevel']
): CoachOnboardingPayload['coachingLevel'] {
  switch (level) {
    case 'Academy':
    case 'Club':
      return 'Academy / Club Coach'
    case 'School':
      return 'School / University Coach'
    case 'Private (1-on-1)':
    default:
      return 'Private Pro Coach'
  }
}

// Convert a numeric squad size into the legacy bucket the teams table expects.
function mapSquadSizeToBucket(
  squadSize: number
): CoachOnboardingPayload['numberOfAthletes'] {
  if (squadSize <= 5) return '1-5'
  if (squadSize <= 15) return '6-15'
  if (squadSize <= 30) return '16-30'
  return '30+'
}

// Build a legacy username from the coach's full name. The legacy schema still
// requires a username, but the v1 form no longer asks for one.
function deriveUsername(fullName: string): string {
  const slug = fullName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 18)
  const safeBase = slug.length >= 3 ? slug : `coach_${slug}`.slice(0, 18)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${safeBase}_${suffix}`
}

export function mapAdaptiveCoachOnboardingToLegacy(
  input: CoachOnboardingFastStart
): CoachOnboardingPayload {
  const trimmedName = input.fullName.trim()

  return {
    fullName: trimmedName,
    username: deriveUsername(trimmedName),
    mobileNumber: input.mobileNumber.trim(),
    teamName: input.teamName.trim(),
    sportCoached: mapSportCoached(input.sportCoached),
    coachingLevel: mapCoachingLevel(input.coachingLevel),
    // Single-team is the v1 scope. Multi-team coaches add more teams in-app.
    teamType: 'Single Team',
    // Coach configures their own priority focus inside the app post-onboarding.
    mainCoachingFocus: 'Injury Risk Reduction',
    numberOfAthletes: mapSquadSizeToBucket(input.squadSize),
    // Asked later as part of progressive profiling; safe default for now.
    trainingFrequency: '3-4x Weekly',
    // Risks default to a baseline; the coach picks real focus areas in-app.
    criticalRisks: ['General Fatigue'],
    avatarUrl: '',
  }
}
