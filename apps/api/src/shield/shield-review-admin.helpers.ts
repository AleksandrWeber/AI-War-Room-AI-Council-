import type {
  ShieldReviewAdminAction,
  ShieldReviewAdminCase,
  ShieldReviewAdminStats,
} from '@ai-war-room/schemas'

export type ShieldReviewSummary = {
  classifierId: string
  totalCases: number
  passedCases: number
  falsePositiveCount: number
  falsePositiveRate: number
  results: ShieldReviewAdminCase[]
}

export function buildShieldReviewAdminStats(
  reviewSummary: Pick<
    ShieldReviewSummary,
    | 'totalCases'
    | 'passedCases'
    | 'falsePositiveCount'
    | 'falsePositiveRate'
  >,
): ShieldReviewAdminStats {
  return {
    totalCases: reviewSummary.totalCases,
    passedCases: reviewSummary.passedCases,
    falsePositiveCount: reviewSummary.falsePositiveCount,
    falsePositiveRate: reviewSummary.falsePositiveRate,
  }
}

export function resolveShieldReviewAdminActions(input: {
  stats: ShieldReviewAdminStats
}) {
  const actions: ShieldReviewAdminAction[] = ['rerun_review_summary']

  if (input.stats.falsePositiveCount > 0) {
    return actions
  }

  return actions
}

export function getShieldReviewAdminGuidance(input: {
  stats: ShieldReviewAdminStats
}) {
  if (input.stats.falsePositiveCount > 0) {
    return 'Workspace owners and admins can inspect Shield review regressions and rerun the false-positive review set.'
  }

  return 'Workspace owners and admins can inspect Shield review metrics and rerun the false-positive review set locally.'
}

export function toShieldReviewAdminCases(
  reviewSummary: ShieldReviewSummary,
): ShieldReviewAdminCase[] {
  return reviewSummary.results
}
