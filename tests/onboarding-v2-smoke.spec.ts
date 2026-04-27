import { expect, test } from '@playwright/test'

test.describe('Onboarding v2 journey guards', () => {
  // Note: the legacy /onboarding, /onboarding/phase-2, /onboarding/daily-ritual web
  // routes were removed when the parallel OnboardingV2 surface was deleted. Users
  // now flow through the persona-specific /athlete/onboarding, /coach/onboarding,
  // /individual/onboarding routes. The v2 write APIs below remain in place for the
  // mobile app and any internal callers.

  test('rejects unauthenticated onboarding v2 write APIs', async ({ request }) => {
    const phase2 = await request.post('/api/onboarding/v2/phase2', {
      data: {
        phase: 2,
        persona: 'athlete',
        day: 'day1_aerobic',
        resting_hr_bpm: 62,
        completion_seconds: 24,
      },
    })
    expect(phase2.status()).toBe(401)

    const dailyRitual = await request.post('/api/onboarding/v2/daily-ritual', {
      data: {
        phase: 3,
        persona: 'athlete',
        date: '2026-04-26',
        energy: 4,
        body_feel: 4,
        mental_load: 2,
        completion_seconds: 18,
      },
    })
    expect(dailyRitual.status()).toBe(401)
  })
})
