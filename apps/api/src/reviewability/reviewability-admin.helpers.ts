import type {
  ReviewabilityAdminAction,
  ReviewabilityAdminRecord,
  ReviewabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReviewabilityDomainInventory = {
  domain: ReviewabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReviewabilityAdminRecords(
  inventory: WorkspaceReviewabilityDomainInventory[],
): ReviewabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReviewabilityAdminStats(input: {
  records: ReviewabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReviewabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const reviewabilityPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((metricRecords / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    reviewabilityPercent,
  }
}

export function getReviewabilityAdminGuidance(input: {
  stats: ReviewabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect reviewability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial reviewability coverage and refresh the reviewability summary.'
  }

  if (input.stats.reviewabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact reviewability below the 95% target and refresh the reviewability summary.'
  }

  return 'Workspace owners and admins can inspect workspace reviewability coverage and refresh the reviewability summary.'
}

export function resolveReviewabilityAdminActions(): ReviewabilityAdminAction[] {
  return ['refresh_reviewability_summary']
}
