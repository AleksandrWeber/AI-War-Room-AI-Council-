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
  fullScanRetainEnabled?: boolean
}) {
  const actions: ShieldReviewAdminAction[] = ['rerun_review_summary']

  if (input.fullScanRetainEnabled) {
    actions.push('purge_expired_full_scans')
  }

  if (input.stats.falsePositiveCount > 0) {
    return actions
  }

  return actions
}

export function getShieldReviewAdminGuidance(input: {
  stats: ShieldReviewAdminStats
  fullScanRetainEnabled?: boolean
  retainHours?: number
}) {
  const retainNote =
    input.fullScanRetainEnabled && input.retainHours
      ? ` Business-tier full-scan retain keeps unredacted secrets/PII quotes for ${input.retainHours}h for dispute/debug; purge expired retains from admin actions.`
      : ''

  if (input.stats.falsePositiveCount > 0) {
    return `Workspace owners and admins can inspect Shield review regressions and rerun the false-positive review set.${retainNote}`
  }

  return `Workspace owners and admins can inspect Shield review metrics and rerun the false-positive review set locally.${retainNote}`
}

export function toShieldReviewAdminCases(
  reviewSummary: ShieldReviewSummary,
): ShieldReviewAdminCase[] {
  return reviewSummary.results
}
