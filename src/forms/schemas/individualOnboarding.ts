import * as z from 'zod'

import type { FormFieldDefinition } from '@/forms/types'

export const individualGoalOptions = [
  'lose_weight',
  'build_strength',
  'improve_cardio',
  'reduce_stress',
  'general_health',
] as const

export const individualActivityLevelOptions = [
  'sedentary',
  'lightly_active',
  'moderately_active',
  'very_active',
] as const

export const individualTimeHorizonOptions = ['3_months', '6_months', '1_year', 'long_term'] as const

export const individualEquipmentOptions = [
  'none',
  'bodyweight',
  'home_weights',
  'full_gym',
] as const

export const individualWorkoutPreferenceOptions = ['15_30_min', '30_45_min', '45_plus_min'] as const

export const individualLimitationStatusOptions = ['none', 'niggle', 'active_injury'] as const

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/
const timeRegex = /^\d{2}:\d{2}$/

export const individualOnboardingFields: FormFieldDefinition[] = [
  {
    id: 'dateOfBirth',
    label: 'When were you born?',
    helper: 'We use this to calibrate recovery and progression for your age.',
    inputType: 'date',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'basic.dateOfBirth',
    placeholder: 'YYYY-MM-DD',
  },
  {
    id: 'gender',
    label: 'Sex / Gender',
    helper: 'Used as an optional physiology anchor until real trend data replaces it.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'basic.gender',
    options: [
      { label: 'Male', value: 'Male' },
      { label: 'Female', value: 'Female' },
      { label: 'Non-binary', value: 'Non-binary' },
      { label: 'Prefer not to say', value: 'Prefer not to say' },
    ],
  },
  {
    id: 'heightCm',
    label: 'Height (cm)',
    helper: 'A quick body-size anchor improves personalization from day one.',
    inputType: 'number',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'basic.heightCm',
    min: 120,
    max: 230,
    unit: 'cm',
  },
  {
    id: 'weightKg',
    label: 'Weight (kg)',
    helper: 'Paired with height on the same screen for fewer taps.',
    inputType: 'number',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'basic.weightKg',
    min: 30,
    max: 220,
    unit: 'kg',
  },
  {
    id: 'activityLevel',
    label: 'How active are you most weeks?',
    helper: 'A starting point before we learn your real patterns.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'basic.activityLevel',
    options: [
      { label: 'Sedentary', value: 'sedentary' },
      { label: 'Lightly active', value: 'lightly_active' },
      { label: 'Moderately active', value: 'moderately_active' },
      { label: 'Very active', value: 'very_active' },
    ],
  },
  {
    id: 'primaryGoal',
    label: 'What is your primary goal?',
    helper: 'We optimize the first plan around this.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'goals.primaryGoal',
    options: [
      { label: 'Lose weight', value: 'lose_weight' },
      { label: 'Build strength', value: 'build_strength' },
      { label: 'Improve cardio', value: 'improve_cardio' },
      { label: 'Reduce stress', value: 'reduce_stress' },
      { label: 'General health', value: 'general_health' },
    ],
  },
  {
    id: 'timeHorizon',
    label: 'When do you want to feel a real change?',
    helper: 'A short time horizon creates a more focused first plan.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'goals.timeHorizon',
    options: [
      { label: '3 months', value: '3_months' },
      { label: '6 months', value: '6_months' },
      { label: '1 year', value: '1_year' },
      { label: 'Long-term (no specific date)', value: 'long_term' },
    ],
  },
  {
    id: 'equipmentAccess',
    label: 'What equipment can you reliably use?',
    helper: 'Pick the option that best matches your weekly reality.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'lifestyle.equipmentAccess',
    options: [
      { label: 'None', value: 'none' },
      { label: 'Bodyweight only', value: 'bodyweight' },
      { label: 'Some weights at home', value: 'home_weights' },
      { label: 'Full gym', value: 'full_gym' },
    ],
  },
  {
    id: 'workoutPreference',
    label: 'How long do you want each workout to be?',
    helper: 'We size each session to a window you can actually keep.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'goals.workoutPreference',
    options: [
      { label: '15–30 min', value: '15_30_min' },
      { label: '30–45 min', value: '30_45_min' },
      { label: '45+ min', value: '45_plus_min' },
    ],
  },
  {
    id: 'injuryStatus',
    label: 'Any current limitations?',
    helper: 'We only ask more if you say yes.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: ['physiology.injuryHistory', 'physiology.mobilityLimitations'],
    options: [
      { label: 'None', value: 'none' },
      { label: 'Niggle', value: 'niggle' },
      { label: 'Active injury', value: 'active_injury' },
    ],
  },
  {
    id: 'limitationArea',
    label: 'Where is it affecting you most?',
    helper: 'Choose the main area only.',
    inputType: 'body-map',
    category: 'conditional',
    layer: 'layer1',
    required: false,
    backendMappingKey: 'physiology.mobilityLimitationsArea',
    triggerConditions: [{ field: 'injuryStatus', operator: 'ne', value: 'none' }],
    options: [
      { label: 'Shoulder', value: 'Shoulder' },
      { label: 'Back', value: 'Back' },
      { label: 'Hip', value: 'Hip' },
      { label: 'Knee', value: 'Knee' },
      { label: 'Ankle', value: 'Ankle' },
    ],
    maxSelections: 2,
  },
  {
    id: 'bedtime',
    label: 'Typical bedtime',
    helper: 'Used with wake time to anchor recovery suggestions.',
    inputType: 'time',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'lifestyle.bedtime',
    placeholder: '22:30',
  },
  {
    id: 'wakeTime',
    label: 'Typical wake time',
    helper: 'Paired on the same screen as bedtime.',
    inputType: 'time',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'lifestyle.wakeTime',
    placeholder: '06:30',
  },
  {
    id: 'consent',
    label: 'I agree to Creeda’s terms, privacy policy, and use of my responses to personalize my plan.',
    helper: 'One consent for everything we need to start.',
    inputType: 'toggle',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'consent.accepted',
  },
]

export const individualOnboardingFastStartSchema = z.object({
  dateOfBirth: z
    .string()
    .regex(isoDateRegex, 'Use YYYY-MM-DD'),
  gender: z.string().min(1),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(30).max(220),
  activityLevel: z.enum(individualActivityLevelOptions),
  primaryGoal: z.enum(individualGoalOptions),
  timeHorizon: z.enum(individualTimeHorizonOptions),
  equipmentAccess: z.enum(individualEquipmentOptions),
  workoutPreference: z.enum(individualWorkoutPreferenceOptions),
  injuryStatus: z.enum(individualLimitationStatusOptions),
  limitationArea: z.array(z.string()).max(2).optional().default([]),
  bedtime: z.string().regex(timeRegex, 'Use HH:MM'),
  wakeTime: z.string().regex(timeRegex, 'Use HH:MM'),
  consent: z.literal(true),
})

export type IndividualOnboardingFastStart = z.infer<typeof individualOnboardingFastStartSchema>
