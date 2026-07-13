import type { ApiEnv } from '../config/env.js'

/** Production false-positive rate ceiling on the Shield review set (locked product policy). */
export const SHIELD_PRODUCTION_FALSE_POSITIVE_BUDGET = 0.05

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
  const failuresAreOnlyFalsePositivesWithinBudget =
    reviewSummary.totalCases > 0 &&
    reviewSummary.passedCases + reviewSummary.falsePositiveCount ===
      reviewSummary.totalCases &&
    reviewSummary.falsePositiveRate <= SHIELD_PRODUCTION_FALSE_POSITIVE_BUDGET
  const reviewRegressionPassing =
    reviewSummary.totalCases > 0 &&
    (reviewSummary.passedCases === reviewSummary.totalCases ||
      (isProduction && failuresAreOnlyFalsePositivesWithinBudget))
  const productionFpBudgetPassing =
    !isProduction ||
    reviewSummary.falsePositiveRate <= SHIELD_PRODUCTION_FALSE_POSITIVE_BUDGET

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
      status: reviewRegressionPassing ? 'pass' : 'fail',
      detail:
        reviewSummary.totalCases === 0
          ? 'No review cases were evaluated.'
          : reviewSummary.passedCases === reviewSummary.totalCases
            ? `All ${reviewSummary.totalCases} review cases passed.`
            : failuresAreOnlyFalsePositivesWithinBudget
              ? `${reviewSummary.falsePositiveCount} false positive(s) within the ${(SHIELD_PRODUCTION_FALSE_POSITIVE_BUDGET * 100).toFixed(0)}% production budget.`
              : `${reviewSummary.totalCases - reviewSummary.passedCases} review case(s) failed outside the false-positive budget.`,
    },
    {
      name: 'production_false_positive_budget',
      label: 'Production false-positive budget',
      status: productionFpBudgetPassing ? 'pass' : 'fail',
      detail:
        !isProduction
          ? 'False-positive budget is only enforced in production.'
          : productionFpBudgetPassing
            ? `False-positive rate ${(reviewSummary.falsePositiveRate * 100).toFixed(1)}% is within the ${(SHIELD_PRODUCTION_FALSE_POSITIVE_BUDGET * 100).toFixed(0)}% budget.`
            : `False-positive rate ${(reviewSummary.falsePositiveRate * 100).toFixed(1)}% exceeds the ${(SHIELD_PRODUCTION_FALSE_POSITIVE_BUDGET * 100).toFixed(0)}% production budget.`,
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
