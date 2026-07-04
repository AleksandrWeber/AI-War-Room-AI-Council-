import type { ApiEnv } from '../config/env.js'

export type ShieldRolloutCheck = {
  name: string
  label: string
  status: 'pass' | 'fail' | 'skip'
  detail: string
}

export type ShieldRolloutEvaluation = {
  status: 'ready' | 'not_ready'
  checks: ShieldRolloutCheck[]
  guidance: string
}

export type ShieldRolloutInput = {
  nodeEnv: ApiEnv['NODE_ENV']
  classifierId: string
  reviewSummary: {
    totalCases: number
    passedCases: number
    falsePositiveCount: number
    falsePositiveRate: number
  }
  reviewSetCaseCount: number
  adversarialCaseCount: number
}

export function evaluateShieldRollout(
  input: ShieldRolloutInput,
): ShieldRolloutEvaluation {
  const isProduction = input.nodeEnv === 'production'
  const { reviewSummary } = input

  const checks: ShieldRolloutCheck[] = [
    {
      name: 'classifier_configured',
      label: 'Shield classifier configured',
      status: input.classifierId.length > 0 ? 'pass' : 'fail',
      detail:
        input.classifierId.length > 0
          ? `Active classifier is ${input.classifierId}.`
          : 'No Shield classifier is configured.',
    },
    {
      name: 'review_set_populated',
      label: 'False-positive review set',
      status: input.reviewSetCaseCount > 0 ? 'pass' : 'fail',
      detail:
        input.reviewSetCaseCount > 0
          ? `Review set contains ${input.reviewSetCaseCount} cases.`
          : 'False-positive review set is empty.',
    },
    {
      name: 'review_regression_passing',
      label: 'Review regression passing',
      status:
        reviewSummary.totalCases > 0 &&
        reviewSummary.passedCases === reviewSummary.totalCases
          ? 'pass'
          : 'fail',
      detail:
        reviewSummary.totalCases === 0
          ? 'No review cases were evaluated.'
          : reviewSummary.passedCases === reviewSummary.totalCases
            ? `All ${reviewSummary.totalCases} review cases passed.`
            : `${reviewSummary.totalCases - reviewSummary.passedCases} review case(s) failed.`,
    },
    {
      name: 'production_false_positive_budget',
      label: 'Production false-positive budget',
      status:
        !isProduction || reviewSummary.falsePositiveCount === 0 ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'False-positive budget is only enforced in production.'
          : reviewSummary.falsePositiveCount === 0
            ? 'No false positives detected in the review set.'
            : `${reviewSummary.falsePositiveCount} false positive(s) detected in production review.`,
    },
    {
      name: 'adversarial_dataset_coverage',
      label: 'Adversarial dataset coverage',
      status: input.adversarialCaseCount >= 4 ? 'pass' : 'fail',
      detail:
        input.adversarialCaseCount >= 4
          ? `Adversarial dataset contains ${input.adversarialCaseCount} cases.`
          : 'Adversarial dataset needs at least 4 cases for production rollout.',
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
        ? 'Shield rollout checks passed. Classifier review regression and adversarial coverage are ready for production.'
        : 'Shield rollout is not ready. Resolve failed checks before relying on production Shield classification.',
  }
}
