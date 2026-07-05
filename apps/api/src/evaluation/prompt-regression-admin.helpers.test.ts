import { describe, expect, it } from 'vitest'
import {
  buildPromptRegressionAdminStats,
  getPromptRegressionAdminGuidance,
  toPromptRegressionAdminCases,
} from './prompt-regression-admin.helpers.js'

describe('prompt regression admin helpers', () => {
  it('builds prompt regression stats', () => {
    expect(
      buildPromptRegressionAdminStats({
        totalCases: 2,
        passedCases: 1,
        failedCases: 1,
        results: [
          {
            caseId: 'a',
            taskName: 'triage/v1',
            expectedPromptVersion: 'triage/v1',
            actualPromptVersion: 'triage/v1',
            promptVersionChanged: false,
            schemaValid: true,
            clarityScore: 0.8,
            usefulnessScore: 0.8,
            passed: true,
            errors: [],
          },
          {
            caseId: 'b',
            taskName: 'triage/v2',
            expectedPromptVersion: 'triage/v1',
            actualPromptVersion: 'triage/v2',
            promptVersionChanged: true,
            schemaValid: false,
            clarityScore: 0.2,
            usefulnessScore: 0.2,
            passed: false,
            errors: ['Prompt version changed'],
          },
        ],
      }),
    ).toMatchObject({
      totalCases: 2,
      failedCases: 1,
      promptVersionDriftCount: 1,
      schemaInvalidCount: 1,
    })
  })

  it('maps admin cases from report', () => {
    expect(
      toPromptRegressionAdminCases({
        generatedAt: '2026-01-01T00:00:00.000Z',
        totalCases: 1,
        passedCases: 1,
        failedCases: 0,
        promptVersions: {},
        results: [
          {
            caseId: 'triage-standard-saas',
            taskName: 'triage/v1',
            expectedPromptVersion: 'triage/v1',
            actualPromptVersion: 'triage/v1',
            promptVersionChanged: false,
            schemaValid: true,
            clarityScore: 0.9,
            usefulnessScore: 0.9,
            passed: true,
            errors: [],
          },
        ],
      }),
    ).toHaveLength(1)
  })

  it('guides admins when regressions fail', () => {
    expect(
      getPromptRegressionAdminGuidance({
        stats: buildPromptRegressionAdminStats({
          totalCases: 1,
          passedCases: 0,
          failedCases: 1,
          results: [],
        }),
      }),
    ).toContain('failing prompt regression')
  })
})
