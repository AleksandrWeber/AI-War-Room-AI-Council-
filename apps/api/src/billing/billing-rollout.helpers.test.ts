import { describe, expect, it } from 'vitest'
import type { BillingRolloutInput } from './billing-rollout.helpers.js'
import { evaluateBillingRollout } from './billing-rollout.helpers.js'

function createInput(overrides: Partial<BillingRolloutInput>): BillingRolloutInput {
  return {
    nodeEnv: 'production',
    stripeEnabled: true,
    stripeBillingAdapter: 'stripe',
    stripeSecretKey: 'sk_live_test',
    stripeWebhookSecret: 'whsec_test',
    stripePriceIdPro: 'price_pro',
    stripePriceIdBusiness: 'price_business',
    stripeSuccessUrl: 'https://app.example.com/billing/success',
    stripeCancelUrl: 'https://app.example.com/billing/cancel',
    stripePortalReturnUrl: 'https://app.example.com/billing/portal',
    stripeMeteredUsageEnabled: false,
    billingNotificationAdapter: 'mock',
    ...overrides,
  }
}

describe('evaluateBillingRollout', () => {
  it('returns disabled rollout when billing is off', () => {
    const rollout = evaluateBillingRollout(
      createInput({
        stripeEnabled: false,
      }),
    )

    expect(rollout.status).toBe('disabled')
  })

  it('passes production stripe rollout checks', () => {
    const rollout = evaluateBillingRollout(createInput({}))

    expect(rollout.status).toBe('ready')
    expect(rollout.checks.every((check) => check.status === 'pass')).toBe(true)
  })

  it('fails production rollout when mock adapter is configured', () => {
    const rollout = evaluateBillingRollout(
      createInput({
        stripeBillingAdapter: 'mock',
      }),
    )

    expect(rollout.status).toBe('not_ready')
    expect(rollout.checks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: 'production_adapter',
          status: 'fail',
        }),
      ]),
    )
  })
})
