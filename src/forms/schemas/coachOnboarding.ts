import * as z from 'zod'

import type { FormFieldDefinition } from '@/forms/types'

export const coachSportOptions = [
  'Cricket',
  'Football',
  'Athletics',
  'Gym',
  'Multi-sport',
] as const

export const coachingLevelOptions = [
  'Academy',
  'Club',
  'School',
  'Private (1-on-1)',
] as const

export const coachOnboardingFields: FormFieldDefinition[] = [
  {
    id: 'fullName',
    label: 'What should athletes see as your name?',
    helper: 'Usually your professional coaching name.',
    inputType: 'text',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'fullName',
    placeholder: 'Coach Anil Kumar',
  },
  {
    id: 'mobileNumber',
    label: 'WhatsApp or mobile number',
    helper: 'Used for verification and squad coordination over WhatsApp.',
    inputType: 'phone',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'mobileNumber',
    placeholder: '+91 98XXXX XXXXX',
  },
  {
    id: 'sportCoached',
    label: 'What sport do you coach?',
    helper: 'This anchors the intelligence model and risk language.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'sportCoached',
    options: coachSportOptions.map((sport) => ({ label: sport, value: sport })),
  },
  {
    id: 'teamName',
    label: 'What is your main team or academy called?',
    helper: 'You can add more teams from the dashboard later.',
    inputType: 'text',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'teamName',
    placeholder: 'Haryana U-19 Fast Bowling Unit',
  },
  {
    id: 'coachingLevel',
    label: 'What best describes your setup?',
    helper: 'This influences how much structure and automation you need.',
    inputType: 'chips',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'coachingLevel',
    options: coachingLevelOptions.map((level) => ({ label: level, value: level })),
  },
  {
    id: 'squadSize',
    label: 'How many athletes are in your squad right now?',
    helper: 'Enough to size the first dashboard correctly. You can change this later.',
    inputType: 'number',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: 'squadSize',
    min: 1,
    max: 200,
    step: 1,
    placeholder: '12',
  },
  {
    id: 'platformConsent',
    label:
      'I agree to the CREEDA terms, privacy, AI guidance, and medical disclaimer, and I confirm consent to manage my squad data.',
    helper: 'One tap covers legal, medical, AI, and data-handling acknowledgements.',
    inputType: 'toggle',
    category: 'baseline',
    layer: 'layer1',
    required: true,
    backendMappingKey: ['legalConsent', 'medicalDisclaimerConsent', 'dataProcessingConsent', 'aiAcknowledgementConsent'],
  },
]

export const coachOnboardingFastStartSchema = z.object({
  fullName: z.string().min(2),
  mobileNumber: z.string().min(10),
  sportCoached: z.enum(coachSportOptions),
  teamName: z.string().min(2),
  coachingLevel: z.enum(coachingLevelOptions),
  squadSize: z.coerce.number().int().min(1).max(200),
  platformConsent: z.boolean().refine((value) => value === true),
})

export type CoachOnboardingFastStart = z.infer<typeof coachOnboardingFastStartSchema>
