import { describe, expect, it } from 'vitest'
import {
  buildShieldReviewAdminStats,
  getShieldReviewAdminGuidance,
  resolveShieldReviewAdminActions,
} from './shield-review-admin.helpers.js'

describe('shield review admin helpers', () => {
  it('builds review stats from summary', () => {
    expect(
      buildShieldReviewAdminStats({
        totalCases: 4,
        passedCases: 4,
        falsePositiveCount: 0,
        falsePositiveRate: 0,
      }),
    ).toEqual({
      totalCases: 4,
      passedCases: 4,
      falsePositiveCount: 0,
      falsePositiveRate: 0,
    })
  })

  it('offers rerun review summary for owners', () => {
    expect(
      resolveShieldReviewAdminActions({
        stats: buildShieldReviewAdminStats({
          totalCases: 4,
          passedCases: 4,
          falsePositiveCount: 0,
          falsePositiveRate: 0,
        }),
      }),
    ).toEqual(['rerun_review_summary'])
  })

  it('guides admins when false positives exist', () => {
    expect(
      getShieldReviewAdminGuidance({
        stats: buildShieldReviewAdminStats({
          totalCases: 4,
          passedCases: 3,
          falsePositiveCount: 1,
          falsePositiveRate: 0.25,
        }),
      }),
    ).toContain('false-positive')
  })
})
