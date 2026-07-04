import { describe, expect, it } from 'vitest'
import type { ShieldRolloutInput } from './shield-rollout.helpers.js'
import { evaluateShieldRollout } from './shield-rollout.helpers.js'

function createInput(overrides: Partial<ShieldRolloutInput>): ShieldRolloutInput {
  return {
    nodeEnv: 'test',
    classifierId: 'deterministic-shield-fallback/v1',
    reviewSummary: {
      totalCases: 4,
      passedCases: 4,
      falsePositiveCount: 0,
      falsePositiveRate: 0,
    },
    reviewSetCaseCount: 4,
    adversarialCaseCount: 6,
    ...overrides,
  }
}

describe('evaluateShieldRollout', () => {
  it('passes when review regression and adversarial coverage are healthy', () => {
    const rollout = evaluateShieldRollout(createInput({}))

    expect(rollout.status).toBe('ready')
  })

  it('fails when review regression has failures', () => {
    const rollout = evaluateShieldRollout(
      createInput({
        reviewSummary: {
          totalCases: 4,
          passedCases: 3,
          falsePositiveCount: 1,
          falsePositiveRate: 0.25,
        },
      }),
    )

    expect(rollout.status).toBe('not_ready')
    expect(
      rollout.checks.find((check) => check.name === 'review_regression_passing')
        ?.status,
    ).toBe('fail')
  })

  it('fails in production when false positives are present', () => {
    const rollout = evaluateShieldRollout(
      createInput({
        nodeEnv: 'production',
        reviewSummary: {
          totalCases: 4,
          passedCases: 3,
          falsePositiveCount: 1,
          falsePositiveRate: 0.25,
        },
      }),
    )

    expect(
      rollout.checks.find(
        (check) => check.name === 'production_false_positive_budget',
      )?.status,
    ).toBe('fail')
  })
})
