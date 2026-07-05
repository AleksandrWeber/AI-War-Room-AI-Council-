import { minimumPromptRegressionCaseCount } from '@ai-war-room/schemas'
import type { ApiEnv } from '../config/env.js'

export type PromptEvaluationRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type PromptEvaluationRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: PromptEvaluationRolloutCheck[]
  guidance: string
}

export type PromptEvaluationRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  datasetCaseCount: number
  totalCases: number
  passedCases: number
  failedCases: number
  promptVersionDriftCount: number
  schemaInvalidCount: number
}

export function evaluatePromptEvaluationRollout(
  input: PromptEvaluationRolloutInput,
): PromptEvaluationRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'

  const checks: PromptEvaluationRolloutCheck[] = [
    {
      name: 'regression_dataset_populated',
      label: 'Regression dataset populated',
      status: input.datasetCaseCount > 0 ? 'pass' : 'fail',
      detail:
        input.datasetCaseCount > 0
          ? `Regression dataset contains ${input.datasetCaseCount} cases.`
          : 'Prompt regression dataset is empty.',
    },
    {
      name: 'minimum_case_coverage',
      label: 'Minimum case coverage',
      status:
        input.datasetCaseCount >= minimumPromptRegressionCaseCount
          ? 'pass'
          : 'fail',
      detail:
        input.datasetCaseCount >= minimumPromptRegressionCaseCount
          ? `Regression dataset covers ${input.datasetCaseCount} prompt cases.`
          : `Prompt regression rollout requires at least ${minimumPromptRegressionCaseCount} cases.`,
    },
    {
      name: 'regression_passing',
      label: 'Regression passing',
      status:
        input.totalCases > 0 && input.failedCases === 0 ? 'pass' : 'fail',
      detail:
        input.totalCases === 0
          ? 'No prompt regression cases were evaluated.'
          : input.failedCases === 0
            ? `All ${input.totalCases} prompt regression cases passed.`
            : `${input.failedCases} prompt regression case(s) failed.`,
    },
    {
      name: 'prompt_version_drift',
      label: 'Prompt version drift',
      status: input.promptVersionDriftCount === 0 ? 'pass' : 'fail',
      detail:
        input.promptVersionDriftCount === 0
          ? 'No prompt version drift detected.'
          : `${input.promptVersionDriftCount} case(s) report prompt version drift.`,
    },
    {
      name: 'schema_validity',
      label: 'Schema validity',
      status: input.schemaInvalidCount === 0 ? 'pass' : 'fail',
      detail:
        input.schemaInvalidCount === 0
          ? 'All evaluated prompt outputs passed schema validation.'
          : `${input.schemaInvalidCount} case(s) failed schema validation.`,
    },
    {
      name: 'production_regression_budget',
      label: 'Production regression budget',
      status: !isProduction || input.failedCases === 0 ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'Production regression budget is only enforced in production.'
          : input.failedCases === 0
            ? 'Production prompt regression budget is clear.'
            : 'Production prompt evaluation rollout cannot proceed with failing regressions.',
    },
  ]

  const status = checks.every((check) => check.status === 'pass')
    ? 'ready'
    : 'not_ready'

  return {
    status,
    checks,
    guidance:
      status === 'ready'
        ? 'Prompt evaluation rollout checks passed. Regression dataset coverage and prompt version stability are ready for production.'
        : 'Prompt evaluation rollout is not ready. Resolve failed regressions before shipping prompt changes in production.',
  }
}
