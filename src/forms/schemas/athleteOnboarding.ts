import * as z from 'zod'

import type { FormFieldDefinition } from '@/forms/types'

// Simplified V1 athlete onboarding: 8 questions + a single consolidated consent.
// Frontend-only narrowing — the legacy DB schema is unchanged. Mapper layer
// expands these into the broader AthleteOnboardingPayload shape.

export const athleteSportOptions = ['Cricket', 'Football', 'Athletics', 'Gym'] as const
export type AthleteSportOption = (typeof athleteSportOptions)[number]

export const cricketPositionOptions = ['Bowler', 'Batter', 'Wicket-keeper', 'All-rounder'] as const
export const footballPositionOptions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'] as const
export const athleticsEventOptions = ['Sprint', 'Distance', 'Jumps', 'Throws'] as const
export const gymFocusOptions = ['Strength', 'Hypertrophy', 'General fitness'] as const

const allPositionValues = [
  ...cricketPositionOptions,
  ...footballPositionOptions,
  ...athleticsEventOptions,
  ...gymFocusOptions,
] as const

export const athleteLevelOptions = [
  'Recreational',
  'Club',
  'Academy',
  'State+',
  'National+',
] as const

export const biologicalSexOptions = ['Male', 'Female', 'Prefer not to say'] as const

export const currentIssueOptions = ['None', 'Niggle', 'Active injury'] as const

export const commonBodyRegions = [
  'Neck',
  'Shoulder',
  'Upper back',
  'Lower back',
  'Hip / groin',
  'Quadriceps',
  'Hamstring',
  'Knee',
  'Shin / calf',
  'Ankle',
  'Foot',
  'Wrist / hand',
] as const

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

export const athleteOnboardingFields: FormFieldDefinition[] = [
  {
    id: 'primarySport',
    label: 'What sport do you train for?',
    helper: 'Pick your primary sport. You can refine details next.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'primarySport',
    options: athleteSportOptions.map((sport) => ({ label: sport, value: sport })),
  },
  {
    id: 'position',
    label: 'Which role or event fits you best?',
    helper: 'This shapes your training focus from day one.',
    inputType: 'chips',
    category: 'conditional',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'position',
    triggerConditions: [
      {
        field: 'primarySport',
        operator: 'in',
        value: [...athleteSportOptions],
      },
    ],
    options: [
      ...cricketPositionOptions.map((value) => ({ label: value, value })),
      ...footballPositionOptions.map((value) => ({ label: value, value })),
      ...athleticsEventOptions.map((value) => ({ label: value, value })),
      ...gymFocusOptions.map((value) => ({ label: value, value })),
    ],
  },
  {
    id: 'playingLevel',
    label: 'How seriously do you compete or train?',
    helper: 'This helps us calibrate training density and intensity.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: ['playingLevel', 'trainingFrequency', 'avgIntensity'],
    options: athleteLevelOptions.map((value) => ({ label: value, value })),
  },
  {
    id: 'dateOfBirth',
    label: 'Date of birth',
    helper: 'Used for age-based training, recovery, and consent rules.',
    inputType: 'date',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'dateOfBirth',
    placeholder: 'YYYY-MM-DD',
  },
  {
    id: 'biologicalSex',
    label: 'Sex assigned at birth',
    helper: 'Used only for baseline physiology assumptions until we learn your real trends.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'biologicalSex',
    options: biologicalSexOptions.map((value) => ({ label: value, value })),
  },
  {
    id: 'heightCm',
    label: 'Height (cm)',
    helper: 'A quick body-size anchor improves training and fueling recommendations.',
    inputType: 'number',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'heightCm',
    min: 100,
    max: 250,
    unit: 'cm',
  },
  {
    id: 'weightKg',
    label: 'Weight (kg)',
    helper: 'Used for baseline load, readiness, and nutrition assumptions.',
    inputType: 'number',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'weightKg',
    min: 20,
    max: 200,
    unit: 'kg',
  },
  {
    id: 'currentIssue',
    label: 'Any pain or injury right now?',
    helper: 'A quick honesty check so early recommendations stay safe.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: ['currentIssue', 'activeInjuries'],
    options: [
      { label: 'None', value: 'None', emoji: '✅' },
      { label: 'Niggle', value: 'Niggle', emoji: '⚡' },
      { label: 'Active injury', value: 'Active injury', emoji: '⚠️' },
    ],
  },
  {
    id: 'injuryLocations',
    label: 'Where is the issue?',
    helper: 'Tap the main body area. We can refine later.',
    inputType: 'body-map',
    category: 'conditional',
    layer: 'layer1',
    required: false,
    backendMappingKey: 'activeInjuries.region',
    triggerConditions: [{ field: 'currentIssue', operator: 'in', value: ['Niggle', 'Active injury'] }],
    options: commonBodyRegions.map((value) => ({ label: value, value })),
    maxSelections: 1,
  },
  {
    id: 'coachLockerCode',
    label: 'Coach or academy code',
    helper: 'Optional — only add if a coach invited you.',
    inputType: 'text',
    category: 'baseline',
    layer: 'layer1',
    required: false,
    backendMappingKey: 'coachLockerCode',
    placeholder: '6-digit code',
  },
  {
    id: 'platformConsent',
    label:
      'I agree to the CREEDA terms, privacy and data use, the medical disclaimer (CREEDA is not a substitute for medical advice), and that AI-driven guidance is informational only.',
    helper: 'One quick acknowledgement covers terms, medical disclaimer, AI use, and data processing.',
    inputType: 'toggle',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: ['legalConsent', 'medicalDisclaimerConsent', 'dataProcessingConsent', 'aiAcknowledgementConsent'],
  },
  {
    id: 'guardianEmail',
    label: 'Guardian email',
    helper: 'Required for athletes under 18 — we email them a quick consent confirmation.',
    inputType: 'text',
    category: 'conditional',
    layer: 'layer1',
    required: false,
    backendMappingKey: 'guardianEmail',
    placeholder: 'guardian@example.com',
    triggerConditions: [{ field: 'isMinor', operator: 'truthy', source: 'context' }],
  },
]

export const athleteOnboardingFastStartSchema = z
  .object({
    primarySport: z.enum(athleteSportOptions),
    position: z.enum(allPositionValues),
    playingLevel: z.enum(athleteLevelOptions),
    dateOfBirth: z
      .string()
      .regex(ISO_DATE_PATTERN, 'Please enter a valid date of birth.')
      .refine((value) => {
        const parsed = new Date(value)
        if (Number.isNaN(parsed.getTime())) return false
        const now = new Date()
        const age =
          now.getFullYear() -
          parsed.getFullYear() -
          (now < new Date(now.getFullYear(), parsed.getMonth(), parsed.getDate()) ? 1 : 0)
        return age >= 8 && age <= 80
      }, 'Athlete age must be between 8 and 80.'),
    biologicalSex: z.enum(biologicalSexOptions),
    heightCm: z.number().min(100).max(250),
    weightKg: z.number().min(20).max(200),
    currentIssue: z.enum(currentIssueOptions),
    injuryLocations: z.array(z.enum(commonBodyRegions)).max(1).optional().default([]),
    coachLockerCode: z.string().optional().default(''),
    platformConsent: z.boolean().refine((value) => value === true, 'Please accept the consolidated agreement to continue.'),
    guardianEmail: z.string().email().optional().or(z.literal('')).default(''),
  })
  .superRefine((data, ctx) => {
    if (data.currentIssue !== 'None' && (!data.injuryLocations || data.injuryLocations.length === 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please tap the body area where you feel the issue.',
        path: ['injuryLocations'],
      })
    }

    const dob = new Date(data.dateOfBirth)
    if (!Number.isNaN(dob.getTime())) {
      const today = new Date()
      const computedAge =
        today.getFullYear() -
        dob.getFullYear() -
        (today < new Date(today.getFullYear(), dob.getMonth(), dob.getDate()) ? 1 : 0)

      if (computedAge < 18) {
        if (!data.guardianEmail || data.guardianEmail.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Guardian email is required for athletes under 18.',
            path: ['guardianEmail'],
          })
        }
      }
    }
  })

export type AthleteOnboardingFastStart = z.infer<typeof athleteOnboardingFastStartSchema>
