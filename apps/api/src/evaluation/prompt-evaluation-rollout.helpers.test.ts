import { describe, expect, it } from 'vitest'
import { evaluatePromptEvaluationRollout } from './prompt-evaluation-rollout.helpers.js'

describe('evaluatePromptEvaluationRollout', () => {
  it('passes when regression dataset and results are healthy', () => {
    const rollout = evaluatePromptEvaluationRollout({
      nodeEnv: 'test',
      datasetCaseCount: 6,
      totalCases: 6,
      passedCases: 6,
      failedCases: 0,
      promptVersionDriftCount: 0,
      schemaInvalidCount: 0,
    })

    expect(rollout.status).toBe('ready')
  })

  it('fails when regressions fail', () => {
    const rollout = evaluatePromptEvaluationRollout({
      nodeEnv: 'test',
      datasetCaseCount: 6,
      totalCases: 6,
      passedCases: 5,
      failedCases: 1,
      promptVersionDriftCount: 1,
      schemaInvalidCount: 0,
    })

    expect(rollout.status).toBe('not_ready')
  })

  it('fails in production when regressions fail', () => {
    const rollout = evaluatePromptEvaluationRollout({
      nodeEnv: 'production',
      datasetCaseCount: 6,
      totalCases: 6,
      passedCases: 4,
      failedCases: 2,
      promptVersionDriftCount: 0,
      schemaInvalidCount: 2,
    })

    expect(
      rollout.checks.find((check) => check.name === 'production_regression_budget')
        ?.status,
    ).toBe('fail')
  })
})
